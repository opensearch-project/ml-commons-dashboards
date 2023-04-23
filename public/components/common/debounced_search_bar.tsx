/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useCallback } from 'react';
import { EuiFieldSearch, EuiFieldSearchProps } from '@elastic/eui';
import { debounce } from 'lodash';

interface DebouncedSearchBarProps extends Pick<EuiFieldSearchProps, 'placeholder' | 'aria-label'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
  inputRef?: (node: HTMLInputElement | null) => void;
}
export const DebouncedSearchBar = ({
  onSearch,
  inputRef,
  debounceMs = 400,
  ...resetProps
}: DebouncedSearchBarProps) => {
  const onSearchDebounce = useMemo(() => debounce(onSearch, debounceMs), [onSearch, debounceMs]);

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
      incremental={true}
      onSearch={onSearchDebounce}
      onChange={onChange}
      fullWidth
      {...resetProps}
    />
  );
};
