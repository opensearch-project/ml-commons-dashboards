/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OptionsFilter, OptionsFilterProps } from '../common/options_filter';

type SourceOptionValue = 'local' | 'external';

const SOURCE_OPTIONS = [
  {
    name: 'Local',
    value: 'local' as const,
  },
  {
    name: 'External',
    value: 'external' as const,
  },
];

export const ModelSourceFilter = (
  props: Omit<OptionsFilterProps<SourceOptionValue>, 'name' | 'options' | 'searchPlaceholder'>
) => {
  return (
    <OptionsFilter<SourceOptionValue>
      id="modelSourceFilter"
      name="Source"
      searchPlaceholder="Search"
      options={SOURCE_OPTIONS}
      {...props}
    />
  );
};
