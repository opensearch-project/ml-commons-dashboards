import { EuiPanel, EuiPageHeader, EuiTitle, EuiSpacer } from '@elastic/eui';
import React from 'react';
import { StatusFilter } from '../status_filter';

export const Monitoring = () => {
  return (
    <div>
      <EuiPageHeader pageTitle="Monitoring" />
      <EuiSpacer size="m" />
      <EuiPanel>
        <EuiTitle size="s">
          <h3>Deployed models</h3>
        </EuiTitle>
        <StatusFilter onUpdateFilters={() => {}} />
      </EuiPanel>
    </div>
  );
};
