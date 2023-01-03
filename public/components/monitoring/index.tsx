/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer } from '@elastic/eui';
import React, { useCallback } from 'react';
import { RefreshInterval } from '../common/refresh_interval';

export const Monitoring = () => {
  const onRefresh = useCallback(() => {
    // TODO call profile API to reload the model list
  }, []);

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
      </EuiPanel>
    </div>
  );
};
