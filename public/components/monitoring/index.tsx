/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer } from '@elastic/eui';
import React from 'react';
import { Banner } from '../banner';
export const Monitoring = () => {
  return (
    <div>
      <Banner />
      <EuiPageHeader pageTitle="Monitoring" />
      <EuiSpacer size="m" />
      <EuiPanel>
        <EuiTitle size="s">
          <h3>Deployed models</h3>
        </EuiTitle>
      </EuiPanel>
    </div>
  );
};
