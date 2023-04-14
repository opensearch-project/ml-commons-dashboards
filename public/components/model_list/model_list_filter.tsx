/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldSearch,
  EuiFilterGroup,
  EuiFilterButton,
} from '@elastic/eui';
import React, { useCallback, useRef } from 'react';

import { TagFilterValue } from '../common';

import { TagFilter } from './tag_filter';
import { OwnerFilter } from './owner_filter';

export interface ModelListFilterFilterValue {
  search?: string;
  tag: TagFilterValue[];
  owner: string[];
  deployed?: boolean;
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

  const handleTagChange = useCallback((tag: TagFilterValue[]) => {
    onChangeRef.current({ ...valueRef.current, tag });
  }, []);

  const handleOwnerChange = useCallback((owner: string[]) => {
    onChangeRef.current({ ...valueRef.current, owner });
  }, []);

  const handleDeployedClick = useCallback(() => {
    onChangeRef.current({
      ...valueRef.current,
      deployed: valueRef.current.deployed ? undefined : true,
    });
  }, []);

  const handleUnDeployedClick = useCallback(() => {
    onChangeRef.current({
      ...valueRef.current,
      deployed: valueRef.current.deployed === false ? undefined : false,
    });
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
            <EuiFilterButton
              withNext
              hasActiveFilters={value.deployed === true}
              onClick={handleDeployedClick}
            >
              Deployed
            </EuiFilterButton>
            <EuiFilterButton
              hasActiveFilters={value.deployed === false}
              onClick={handleUnDeployedClick}
            >
              Undeployed
            </EuiFilterButton>
          </EuiFilterGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
