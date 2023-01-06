/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer } from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RefreshInterval } from '../common/refresh_interval';
import { StatusFilter } from '../status_filter';
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
    handleTableChange,
    clearNameStateFilter,
  } = useMonitoring();
  const onRefresh = useCallback(() => {
    // TODO call profile API to reload the model list
  }, []);

  const [previewModel, setPreviewModel] = useState<PreviewModel | null>(null);
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
          <h3>Deployed models</h3>
        </EuiTitle>
        <StatusFilter onUpdateFilters={() => {}} />
        <ModelDeploymentTable
          noTable={pageStatus === 'empty'}
          loading={pageStatus === 'loading'}
          items={deployedModels}
          sort={params.sort}
          pagination={pagination}
          onChange={handleTableChange}
          onResetSearchClick={clearNameStateFilter}
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
