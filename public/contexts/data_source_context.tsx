/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Dispatch, SetStateAction, createContext, useMemo, useState } from 'react';
import type { DataSourceSelectableConfig } from '../../../../src/plugins/data_source_management/public';

export type DataSourceOption = Parameters<
  DataSourceSelectableConfig['onSelectedDataSources']
>[0][0];

export const DataSourceContext = createContext<{
  /**
   * null for default state
   * undefined for invalid state
   * DataSourceOption for valid state
   */
  selectedDataSourceOption: DataSourceOption | null | undefined;
  setSelectedDataSourceOption: Dispatch<SetStateAction<DataSourceOption | null | undefined>>;
  dataSourceEnabled: boolean | null;
  setDataSourceEnabled: Dispatch<SetStateAction<boolean | null>>;
}>({
  selectedDataSourceOption: null,
  setSelectedDataSourceOption: () => null,
  dataSourceEnabled: null,
  setDataSourceEnabled: () => null,
});

const { Provider, Consumer } = DataSourceContext;

export type DataSourceContextProviderProps = React.PropsWithChildren<{
  initialValue?: {
    selectedDataSourceOption?: DataSourceOption | null | undefined;
    dataSourceEnabled?: boolean;
  };
}>;

export const DataSourceContextProvider = ({
  children,
  initialValue,
}: DataSourceContextProviderProps) => {
  const [selectedDataSourceOption, setSelectedDataSourceOption] = useState<
    DataSourceOption | undefined | null
  >(initialValue?.selectedDataSourceOption ?? null);
  const [dataSourceEnabled, setDataSourceEnabled] = useState<boolean | null>(
    initialValue?.dataSourceEnabled ?? null
  );
  const value = useMemo(
    () => ({
      selectedDataSourceOption,
      setSelectedDataSourceOption,
      dataSourceEnabled,
      setDataSourceEnabled,
    }),
    [selectedDataSourceOption, setSelectedDataSourceOption, dataSourceEnabled, setDataSourceEnabled]
  );
  return <Provider value={value}>{children}</Provider>;
};

export const DataSourceContextConsumer = Consumer;
