/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiSpacer,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFilterGroup,
} from '@elastic/eui';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FormattedMessage } from '@osd/i18n/react';

import { ModelDeploymentProfile } from '../../apis/profile';
import { PreviewPanel } from '../preview_panel';
import { ApplicationStart, ChromeStart } from '../../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { InnerHttpProvider } from '../../apis/inner_http_provider';
import { SecurityDashboardsProvider } from '../../apis/security_dashboards_provider';

import {
  ML_MODEL_GROUP_RESOURCE_TYPE,
  ModelDeploymentItem,
  ModelDeploymentTable,
} from './model_deployment_table';
import { useMonitoring } from './use_monitoring';

/**
 * Resource-sharing types available on the given data source. Combines the
 * feature-flag gate (`/api/v1/auth/resource_sharing_enabled`, evaluated per
 * data source) with the registered/protected type list (`/api/resource/types`).
 * Returns [] when disabled or on error (fails closed).
 *
 * These backend checks alone are not sufficient: the Share button is mounted
 * by security-dashboards-plugin's client-side DOM-marker SPI, which only runs
 * when resource sharing is enabled on the *local* cluster. In a multi-data-source
 * deployment where the local cluster has it disabled but the *selected* data
 * source has it enabled, the checks above would say "available" even though no
 * Share button can ever mount, rendering an Access column that is permanently
 * empty. So each candidate type is re-confirmed against
 * `securityDashboards.ui.isResourceSharingAvailable`, which is gated on the
 * local SPI. If security-dashboards-plugin isn't installed, this fails closed
 * to [] as well: with no plugin, no Share button can mount either.
 */
export const getResourceSharingAvailableTypes = async (
  resourceDataSourceId?: string
): Promise<string[]> => {
  const securityDashboards = SecurityDashboardsProvider.getSecurityDashboards();
  if (!securityDashboards) {
    return [];
  }
  try {
    const http = InnerHttpProvider.getHttp();
    const query = resourceDataSourceId ? { dataSourceId: resourceDataSourceId } : {};
    // Global gate: resource sharing must be enabled on the selected data source.
    const info: any = await http.get('/api/v1/auth/resource_sharing_enabled', { query });
    if (!info?.enabled) {
      return [];
    }
    // Per-type gate: the registered/protected shareable types on that source.
    const typesResp: any = await http.get('/api/resource/types', { query });
    const rawTypes = Array.isArray(typesResp) ? typesResp : (typesResp?.types ?? []);
    const candidateTypes: string[] = rawTypes
      .map((entry: { type: string }) => entry?.type)
      .filter((type: string | undefined): type is string => Boolean(type));

    // Local-SPI gate: re-confirm each candidate can actually get a Share
    // button, rather than trusting the selected data source's response alone.
    const confirmations = await Promise.all(
      candidateTypes.map((type) =>
        securityDashboards.ui
          .isResourceSharingAvailable(type, resourceDataSourceId)
          .catch(() => false)
      )
    );
    return candidateTypes.filter((_, index) => confirmations[index]);
  } catch (e) {
    return [];
  }
};
import { ModelStatusFilter } from './model_status_filter';
import { SearchBar } from './search_bar';
import { ModelSourceFilter } from './model_source_filter';
import { ModelConnectorFilter } from './model_connector_filter';
import { MonitoringPageHeader } from './monitoring_page_header';

interface MonitoringProps {
  chrome: ChromeStart;
  navigation: NavigationPublicPluginStart;
  application: ApplicationStart;
  useNewPageHeader: boolean;
}

export const Monitoring = (props: MonitoringProps) => {
  const { useNewPageHeader, chrome, application, navigation } = props;
  const {
    pageStatus,
    params,
    pagination,
    deployedModels,
    handleTableChange,
    resetSearch,
    searchByNameOrId,
    reload,
    searchByStatus,
    searchBySource,
    searchByConnector,
    allExternalConnectors,
  } = useMonitoring();
  const [preview, setPreview] = useState<{
    model: ModelDeploymentItem;
    dataSourceId: string | undefined;
  } | null>(null);
  const [resourceSharingAvailableTypes, setResourceSharingAvailableTypes] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>();

  // Probe the shareable resource types on mount and whenever the selected
  // data source changes, so the Access column reflects the selected source.
  useEffect(() => {
    // Skip while the data source id is still being resolved or is invalid.
    if (typeof params.dataSourceId === 'symbol') {
      return;
    }
    let ignore = false;
    getResourceSharingAvailableTypes(params.dataSourceId).then((types) => {
      if (!ignore) {
        setResourceSharingAvailableTypes((previousTypes) =>
          previousTypes.length === 0 && types.length === 0 ? previousTypes : types
        );
      }
    });
    return () => {
      ignore = true;
    };
  }, [params.dataSourceId]);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    searchInputRef.current = node;
  }, []);

  const onResetSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    resetSearch();
  }, [resetSearch]);

  const handleViewDetail = useCallback(
    (modelPreviewItem: ModelDeploymentItem) => {
      // This check is for type safe, the data source id won't be invalid or fetching if model can be previewed.
      if (typeof params.dataSourceId !== 'symbol') {
        setPreview({ model: modelPreviewItem, dataSourceId: params.dataSourceId });
      }
    },
    [params.dataSourceId]
  );

  const onCloseModelPreview = useCallback(
    (modelProfile: ModelDeploymentProfile | null) => {
      if (
        modelProfile !== null &&
        (preview?.model?.planningNodesCount !== modelProfile.target_worker_nodes?.length ||
          preview?.model?.respondingNodesCount !== modelProfile.worker_nodes?.length)
      ) {
        reload();
      }
      setPreview(null);
    },
    [preview, reload]
  );

  return (
    <>
      <MonitoringPageHeader
        onRefresh={reload}
        navigation={navigation}
        setBreadcrumbs={chrome.setBreadcrumbs}
        recordsCount={pagination?.totalRecords}
        application={application}
        useNewPageHeader={useNewPageHeader}
      />
      <EuiPanel>
        {!useNewPageHeader && (
          <>
            <EuiText size="s">
              <h2>
                <FormattedMessage
                  id="machineLearning.aiModels.table.header.title"
                  defaultMessage="Models {records}"
                  values={{
                    records:
                      pageStatus === 'normal' ? (
                        <EuiTextColor aria-label="total number of results" color="subdued">
                          ({pagination?.totalRecords ?? 0})
                        </EuiTextColor>
                      ) : undefined,
                  }}
                />
              </h2>
            </EuiText>
            <EuiSpacer size="m" />
          </>
        )}
        {pageStatus !== 'empty' && (
          <>
            <EuiFlexGroup gutterSize={useNewPageHeader ? 's' : 'l'}>
              <EuiFlexItem>
                <SearchBar inputRef={setInputRef} onSearch={searchByNameOrId} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFilterGroup>
                  <ModelSourceFilter value={params.source} onChange={searchBySource} />
                  <ModelConnectorFilter
                    value={params.connector}
                    onChange={searchByConnector}
                    allExternalConnectors={allExternalConnectors}
                    dataSourceId={params.dataSourceId}
                  />
                  <ModelStatusFilter selection={params.status} onChange={searchByStatus} />
                </EuiFilterGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />
          </>
        )}

        <ModelDeploymentTable
          noTable={pageStatus === 'empty'}
          loading={pageStatus === 'loading'}
          items={deployedModels}
          sort={params.sort}
          pagination={pagination}
          onChange={handleTableChange}
          onViewDetail={handleViewDetail}
          onResetSearchClick={onResetSearch}
          resourceSharingEnabled={resourceSharingAvailableTypes.includes(
            ML_MODEL_GROUP_RESOURCE_TYPE
          )}
        />
        {preview && (
          <PreviewPanel
            model={preview.model}
            onClose={onCloseModelPreview}
            dataSourceId={preview.dataSourceId}
          />
        )}
      </EuiPanel>
    </>
  );
};
