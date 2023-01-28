/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiPageHeader,
  EuiTitle,
  EuiSpacer,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import React, { useState, useRef, useCallback } from 'react';

import { RefreshInterval } from '../common/refresh_interval';
import { PreviewPanel, PreviewModel } from '../preview_panel';
import { ExperimentalWarning } from '../experiment_warning';
import { ModelDeploymentTable } from './model_deployment_table';
import { useMonitoring } from './use_monitoring';
import { ModelStatusFilter } from './model_status_filter';
import { SearchBar } from './search_bar';

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
  const [previewModel, setPreviewModel] = useState<PreviewModel | null>(null);
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

  const handleViewDetail = useCallback((id, name) => {
    setPreviewModel({ id, name });
  }, []);

  const handlePreviewPanelClose = useCallback(() => {
    setPreviewModel(null);
    reload();
  }, [reload]);

  return (
    <div>
      <ExperimentalWarning />
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
        <EuiTitle size="s">
          <h3>
            Deployed models{' '}
            {pageStatus !== 'empty' && (
              <EuiTextColor
                aria-label="total number of results"
                style={{ fontWeight: 'normal' }}
                color="subdued"
              >
                ({pagination?.totalRecords ?? 0})
              </EuiTextColor>
            )}
          </h3>
        </EuiTitle>

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
        {previewModel ? (
          <PreviewPanel model={previewModel} onClose={handlePreviewPanelClose} />
        ) : null}
      </EuiPanel>
    </div>
  );
};
