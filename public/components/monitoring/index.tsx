/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer } from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RefreshInterval } from '../common/refresh_interval';
import { StatusFilter } from '../status_filter';
import { PreviewPanel, PreviewModel } from '../preview_panel';

export const Monitoring = () => {
  const onRefresh = useCallback(() => {
    // TODO call profile API to reload the model list
  }, []);

  const [previewModel, setPreviewModel] = useState<PreviewModel | null>({
    // TODO: set preview model to open panel
    id: 'BbjM0YQBjgpeQQ_RYyA2',
    name: 'test',
  });
  return (
    <div>
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
