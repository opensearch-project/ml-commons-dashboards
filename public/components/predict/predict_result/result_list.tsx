/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiAccordion, EuiBasicTable, EuiCallOut } from '@elastic/eui';
import { convertPredictionToTable } from '../../../utils';
import type { InputData } from '../../../types';

interface Props {
  data: InputData;
}
export const ResultList = ({ data }: Props) => {
  const { columns, items } = convertPredictionToTable(data);
  return (
    <>
      <EuiAccordion
        id="ml-train-predict-result-accordion"
        buttonContent="View full data"
        paddingSize="none"
      >
        <EuiCallOut
          size="s"
          title="Only display the first 150 data when too much data"
          iconType="pin"
        />
        <EuiBasicTable tableCaption="List Data" items={items} columns={columns} />
      </EuiAccordion>
    </>
  );
};
