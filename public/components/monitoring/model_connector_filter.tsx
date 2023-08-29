/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { OptionsFilter, OptionsFilterProps } from '../common/options_filter';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

const generateAllConnectors = (
  allExternalConnectors: Array<{ id: string; name: string }> = [],
  internalConnectorNames: string[] = []
) => {
  const uniqueExternalConnectors = allExternalConnectors.reduce<{
    [key: string]: string[];
  }>(
    (previousValue, { id, name }) => ({
      ...previousValue,
      [name]: (previousValue[name] || []).concat(id),
    }),
    {}
  );

  for (const connectorName of internalConnectorNames) {
    if (!uniqueExternalConnectors[connectorName]) {
      uniqueExternalConnectors[connectorName] = [];
    }
  }
  return Object.keys(uniqueExternalConnectors).map((key) => ({
    name: key,
    ids: uniqueExternalConnectors[key],
  }));
};

interface ModelConnectorFilterProps
  extends Omit<
    OptionsFilterProps,
    'name' | 'options' | 'searchPlaceholder' | 'loading' | 'value' | 'onChange'
  > {
  allExternalConnectors?: Array<{ id: string; name: string }>;
  value: string[];
  onChange: (value: string[]) => void;
}

export const ModelConnectorFilter = ({
  allExternalConnectors,
  ...restProps
}: ModelConnectorFilterProps) => {
  const { data: internalConnectorsResult } = useFetcher(
    APIProvider.getAPI('connector').getAllInternal
  );
  const options = useMemo(
    () =>
      generateAllConnectors(allExternalConnectors, internalConnectorsResult?.data).map(
        ({ name }) => name
      ),
    [internalConnectorsResult?.data, allExternalConnectors]
  );

  return (
    <OptionsFilter
      name="Connector name"
      searchPlaceholder="Search"
      options={options}
      {...restProps}
    />
  );
};
