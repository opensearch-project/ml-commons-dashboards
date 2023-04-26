/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiHorizontalRule, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';

export const ModelGroupDetailsPanel = () => {
  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiTitle size="s">
        <h3>Details</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiHorizontalRule margin="none" />
    </EuiPanel>
  );
};
