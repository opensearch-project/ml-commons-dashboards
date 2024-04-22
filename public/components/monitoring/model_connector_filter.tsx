/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { OptionsFilter, OptionsFilterProps } from '../common/options_filter';
import { DO_NOT_FETCH, useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';
import { DataSourceId } from '../../utils/data_source';

interface ModelConnectorFilterProps
  extends Omit<
    OptionsFilterProps,
    'name' | 'options' | 'searchPlaceholder' | 'loading' | 'value' | 'onChange'
  > {
  allExternalConnectors?: Array<{ id: string; name: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  dataSourceId: DataSourceId;
}

export const ModelConnectorFilter = ({
  dataSourceId,
  allExternalConnectors,
  ...restProps
}: ModelConnectorFilterProps) => {
  const { data: internalConnectorsResult } = useFetcher(
    APIProvider.getAPI('connector').getAllInternal,
    typeof dataSourceId === 'symbol' ? DO_NOT_FETCH : { dataSourceId }
  );
  const options = useMemo(
    () =>
      Array.from(
        new Set(
          (allExternalConnectors ?? [])
            ?.map(({ name }) => name)
            .concat(internalConnectorsResult?.data ?? [])
        )
      ),
    [internalConnectorsResult?.data, allExternalConnectors]
  );

  return (
    <OptionsFilter
      id="modelConnectorNameFilter"
      name="Connector name"
      searchPlaceholder="Search"
      options={options}
      {...restProps}
    />
  );
};
