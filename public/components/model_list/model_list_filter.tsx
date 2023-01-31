/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexItem, EuiFlexGroup, EuiFieldSearch, EuiFilterGroup } from '@elastic/eui';
import React, { useCallback, useRef } from 'react';

import { TagFilter } from './tag_filter';
import { OwnerFilter } from './owner_filter';
import { StageFilter } from './stage_filter';

export interface ModelListFilterFilterValue {
  search?: string;
  tag: string[];
  owner: string[];
  stage: string[];
}

export const ModelListFilter = ({
  value,
  onChange,
  defaultSearch,
}: {
  defaultSearch?: string;
  value: Omit<ModelListFilterFilterValue, 'search'>;
  onChange: (value: ModelListFilterFilterValue) => void;
}) => {
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleSearch = useCallback((search) => {
    onChangeRef.current({ ...valueRef.current, search });
  }, []);

  const handleTagChange = useCallback((tag: string[]) => {
    onChangeRef.current({ ...valueRef.current, tag });
  }, []);

  const handleOwnerChange = useCallback((owner: string[]) => {
    onChangeRef.current({ ...valueRef.current, owner });
  }, []);

  const handleStageChange = useCallback((stage: string[]) => {
    onChangeRef.current({ ...valueRef.current, stage });
  }, []);

  return (
    <>
      <EuiFlexGroup gutterSize="xs">
        <EuiFlexItem grow={1}>
          <EuiFieldSearch
            defaultValue={defaultSearch}
            fullWidth
            placeholder="Search by name, person, or keyword"
            onSearch={handleSearch}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFilterGroup>
            <TagFilter value={value.tag} onChange={handleTagChange} />
            <OwnerFilter value={value.owner} onChange={handleOwnerChange} />
            <StageFilter value={value.stage} onChange={handleStageChange} />
          </EuiFilterGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
