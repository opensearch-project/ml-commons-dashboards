/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { EuiFieldSearch } from '@elastic/eui';
import { debounce } from 'lodash';
interface SearchBarProps {
  onSearch: (value: string) => void;
  value: string;
}
export const SearchBar = ({ onSearch, value: valueInProps }: SearchBarProps) => {
  const [value, setValue] = useState(valueInProps);
  const onSearchDebounce = useMemo(() => debounce(onSearch, 200), [onSearch]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    setValue(valueInProps);
  }, [valueInProps]);
  return (
    <EuiFieldSearch
      placeholder="Search by name or ID"
      value={value}
      incremental={true}
      onSearch={onSearchDebounce}
      onChange={onChange}
      aria-label="Search by name or ID"
      fullWidth
    />
  );
};
