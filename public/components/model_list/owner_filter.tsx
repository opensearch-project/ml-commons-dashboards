/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModelFilter, ModelFilterProps } from './model_filter';

export const OwnerFilter = ({ value, onChange }: Pick<ModelFilterProps, 'value' | 'onChange'>) => {
  return (
    <ModelFilter
      searchPlaceholder="Search"
      options={[]}
      value={value}
      name="Owner"
      onChange={onChange}
    />
  );
};