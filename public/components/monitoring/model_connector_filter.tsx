/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import { OptionsFilter, OptionsFilterProps } from '../common/options_filter';
import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';

export interface ModelConnectorFilterValue {
  name: string;
  ids: string[];
}

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
  value: ModelConnectorFilterValue[];
  onChange: (value: ModelConnectorFilterValue[]) => void;
}

export const ModelConnectorFilter = ({
  allExternalConnectors,
  value: valueInProps,
  onChange: onChangeInProps,
  ...restProps
}: ModelConnectorFilterProps) => {
  const { data: internalConnectorsResult } = useFetcher(
    APIProvider.getAPI('connector').getAllInternal
  );
  const allConnectors = useMemo(
    () => generateAllConnectors(allExternalConnectors, internalConnectorsResult?.data),
    [internalConnectorsResult?.data, allExternalConnectors]
  );
  const options = useMemo(() => allConnectors.map(({ name }) => name), [allConnectors]);
  const value = useMemo(() => valueInProps.map(({ name }) => name), [valueInProps]);
  const onChange = useCallback(
    (newValue: string[]) => {
      onChangeInProps(allConnectors.filter((item) => newValue.includes(item.name)));
    },
    [allConnectors, onChangeInProps]
  );

  return (
    <OptionsFilter
      name="Connector"
      searchPlaceholder="Search"
      options={options}
      value={value}
      onChange={onChange}
      {...restProps}
    />
  );
};
