/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiCallOut, EuiBasicTable } from '@elastic/eui';

interface Props {
  rows: number;
  columns: number;
}
export const ResultOverview = ({ rows, columns }: Props) => {
  const columnsOption = [
    {
      field: 'rows',
      name: 'Rows',
    },
    {
      field: 'columns',
      name: 'Columns',
    },
  ];
  return (
    <>
      <EuiSpacer />
      <EuiCallOut title="Prediction Success" iconType="search" size="s" />
      <EuiBasicTable
        tableCaption="Result Overview"
        items={[{ columns, rows }]}
        columns={columnsOption}
      />
    </>
  );
};
