/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiPageHeader,
  EuiSpacer,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import React, { useState, useRef, useCallback } from 'react';

import { RefreshInterval } from '../common/refresh_interval';
import { PreviewPanel } from '../preview_panel';
import { ModelDeploymentItem, ModelDeploymentTable } from './model_deployment_table';
import { useMonitoring } from './use_monitoring';
import { ModelStatusFilter } from './model_status_filter';
import { SearchBar } from './search_bar';
import { ModelDeploymentProfile } from '../../apis/profile';

export const Monitoring = () => {
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
  } = useMonitoring();
  const [previewModel, setPreviewModel] = useState<ModelDeploymentItem | null>(null);
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

  const handleViewDetail = useCallback((modelPreviewItem: ModelDeploymentItem) => {
    setPreviewModel(modelPreviewItem);
  }, []);

  const onCloseModelPreview = useCallback(
    (modelProfile: ModelDeploymentProfile | null) => {
      if (
        modelProfile !== null &&
        (previewModel?.planningNodesCount !== modelProfile.target_worker_nodes?.length ||
          previewModel?.respondingNodesCount !== modelProfile.worker_nodes?.length)
      ) {
        reload();
      }
      setPreviewModel(null);
    },
    [previewModel, reload]
  );

  return (
    <div>
      <EuiSpacer size="s" />
      <EuiSpacer size="xs" />
      <EuiPageHeader
        pageTitle="Overview"
        rightSideItems={[
          <div style={{ backgroundColor: '#fff' }}>
            <RefreshInterval onRefresh={reload} />
          </div>,
        ]}
      />
      <EuiSpacer size="m" />
      <EuiPanel>
        <EuiText size="s">
          <h2>
            Deployed models{' '}
            {pageStatus !== 'empty' && (
              <EuiTextColor aria-label="total number of results" color="subdued">
                ({pagination?.totalRecords ?? 0})
              </EuiTextColor>
            )}
          </h2>
        </EuiText>

        <EuiSpacer size="m" />
        {pageStatus !== 'empty' && (
          <>
            <EuiFlexGroup gutterSize="l">
              <EuiFlexItem>
                <SearchBar inputRef={setInputRef} onSearch={searchByNameOrId} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <ModelStatusFilter selection={params.status} onChange={searchByStatus} />
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
        {previewModel && <PreviewPanel model={previewModel} onClose={onCloseModelPreview} />}
      </EuiPanel>
    </div>
  );
};
