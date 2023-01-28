/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useCallback } from 'react';
import { EuiFieldSearch } from '@elastic/eui';
import { debounce } from 'lodash';
interface SearchBarProps {
  onSearch: (value: string) => void;
  inputRef?: (node: HTMLInputElement | null) => void;
}
export const SearchBar = ({ onSearch, inputRef }: SearchBarProps) => {
  const onSearchDebounce = useMemo(() => debounce(onSearch, 400), [onSearch]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchDebounce(e.target.value);
    },
    [onSearchDebounce]
  );

  return (
    <EuiFieldSearch
      autoFocus
      inputRef={inputRef}
      placeholder="Search by name or ID"
      incremental={true}
      onSearch={onSearchDebounce}
      onChange={onChange}
      aria-label="Search by name or ID"
      fullWidth
    />
  );
};
