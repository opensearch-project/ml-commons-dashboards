/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourceOption } from '../contexts';

export const DATA_SOURCE_FETCHING_ID = Symbol('DATA_SOURCE_FETCHING_ID');
export const DATA_SOURCE_INVALID_ID = Symbol('DATA_SOURCE_INVALID_ID');

export const getDataSourceId = (
  dataSourceEnabled: boolean | null,
  selectedDataSourceOption: DataSourceOption | null | undefined
) => {
  if (!dataSourceEnabled) {
    return undefined;
  }
  if (selectedDataSourceOption === null) {
    return DATA_SOURCE_FETCHING_ID;
  }
  if (selectedDataSourceOption === undefined) {
    return DATA_SOURCE_INVALID_ID;
  }
  // If selected data source is local cluster, the data source id should be undefined
  if (selectedDataSourceOption.id === '') {
    return undefined;
  }
  return selectedDataSourceOption.id;
};

export type DataSourceId = ReturnType<typeof getDataSourceId>;
