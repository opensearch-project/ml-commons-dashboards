/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPanel, EuiTitle } from '@elastic/eui';

export const ModelGroupVersionsPanel = () => {
  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiTitle size="s">
        <h3>Versions</h3>
      </EuiTitle>
    </EuiPanel>
  );
};
