/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiButton,
} from '@elastic/eui';
import React from 'react';

export const ModelVersionTags = () => {
  return (
    <EuiPanel style={{ padding: 20 }}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Tags</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: 'auto', flexGrow: 0 }}>
          <EuiButton>Edit</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiHorizontalRule margin="none" />
    </EuiPanel>
  );
};
