/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { EuiComboBox } from '@elastic/eui';

interface TagValueSelectorProps {
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  singleSelection?: boolean;
}

export const TagValueSelector = ({ value, onChange, singleSelection }: TagValueSelectorProps) => {
  // TODO: Change to fetch value options via API
  const [valueOptions] = useState([
    {
      label: 'Computer vision',
    },
    {
      label: 'Image classification',
    },
  ]);
  const selectedValueOptions = useMemo(
    () => valueOptions.filter((item) => item.label === value || value?.includes(item.label)),
    [value, valueOptions]
  );
  const handleChange = useCallback(
    (options) => {
      onChange(singleSelection ? options[0].label : options.map((item) => item.label));
    },
    [onChange, singleSelection]
  );
  return (
    <EuiComboBox
      fullWidth
      options={valueOptions}
      selectedOptions={selectedValueOptions}
      onChange={handleChange}
      placeholder="Select a value"
      singleSelection={singleSelection ? { asPlainText: true } : false}
      isClearable={false}
    />
  );
};
