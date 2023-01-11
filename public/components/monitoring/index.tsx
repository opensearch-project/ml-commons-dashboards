/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer, EuiTextColor } from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RefreshInterval } from '../common/refresh_interval';
import { StatusFilter, IOption } from '../status_filter';
import { PreviewPanel, PreviewModel } from '../preview_panel';
import { ExperimentalWarning } from '../experiment_warning';

import { ModelDeploymentTable } from './model_deployment_table';
import { useMonitoring } from './use_monitoring';

export const Monitoring = () => {
  const {
    pageStatus,
    params,
    pagination,
    deployedModels,
    statusFilterOptions,
    handleTableChange,
    clearNameStatusFilter,
    reload,
    searchByStatus,
  } = useMonitoring();
  const [previewModel, setPreviewModel] = useState<PreviewModel | null>(null);

  const onRefresh = useCallback(() => {
    reload();
  }, [reload]);

  const handleFilterUpdate = useCallback(
    (newOptions: IOption[]) => {
      searchByStatus(
        newOptions.filter(({ checked }) => checked === 'on').map(({ value }) => value)
      );
    },
    [searchByStatus]
  );

  return (
    <div>
      <ExperimentalWarning />
      <EuiSpacer size="s" />
      <EuiSpacer size="xs" />
      <EuiPageHeader
        pageTitle="Monitoring"
        rightSideItems={[
          <div style={{ backgroundColor: '#fff' }}>
            <RefreshInterval onRefresh={onRefresh} />
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
            <StatusFilter options={statusFilterOptions} onUpdateFilters={handleFilterUpdate} />
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
          onResetSearchClick={clearNameStatusFilter}
          onViewDetail={(id, name) => {
            setPreviewModel({ id, name });
          }}
        />
        {previewModel ? (
          <PreviewPanel
            model={previewModel}
            onClose={() => {
              setPreviewModel(null);
            }}
            onUpdateData={(data) => {
              // TODO:update latest data
            }}
          />
        ) : null}
      </EuiPanel>
    </div>
  );
};
