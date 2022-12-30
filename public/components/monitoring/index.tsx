import { EuiPageHeader } from '@elastic/eui';
import React from 'react';
import { StatusFilter } from '../status_filter';

export const Monitoring = () => {
  return (
    <div>
      <EuiPageHeader pageTitle="Monitoring" />
      <StatusFilter onUpdateFilters={() => {}} />
    </div>
  );
};
