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
import React, { useState, useRef, useCallback } from 'react';
import { FormattedMessage } from '@osd/i18n/react';

import { ModelDeploymentProfile } from '../../apis/profile';
import { PreviewPanel } from '../preview_panel';
import { ApplicationStart, ChromeStart } from '../../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';

import { ModelDeploymentItem, ModelDeploymentTable } from './model_deployment_table';
import { useMonitoring } from './use_monitoring';
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
  const searchInputRef = useRef<HTMLInputElement | null>();

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
