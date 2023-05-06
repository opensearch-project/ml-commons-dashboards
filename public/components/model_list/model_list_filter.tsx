/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiFilterGroup,
  EuiFilterButton,
  EuiSpacer,
} from '@elastic/eui';
import React, { useCallback, useRef } from 'react';

import { TagFilterValue, SelectedTagFiltersPanel, DebouncedSearchBar } from '../common';

import { TagFilter } from './tag_filter';
import { OwnerFilter } from './owner_filter';
import { useModelTagKeys } from './model_list.hooks';

const removeDuplicateTag = (tagFilters: TagFilterValue[]) => {
  const generateTagKey = (tagFilter: TagFilterValue) =>
    `${tagFilter.name}${tagFilter.operator}${tagFilter.value.toString()}`;
  const existsTagMap: { [key: string]: boolean } = {};
  return tagFilters.filter((tagFilter) => {
    const key = generateTagKey(tagFilter);
    if (!existsTagMap[key]) {
      existsTagMap[key] = true;
      return true;
    }

    return false;
  });
};

export interface ModelListFilterFilterValue {
  search?: string;
  tag: TagFilterValue[];
  owner: string[];
  deployed?: boolean;
}

export const ModelListFilter = ({
  value,
  onChange,
  searchInputRef,
}: {
  searchInputRef?: (node: HTMLInputElement | null) => void;
  value: Omit<ModelListFilterFilterValue, 'search'>;
  onChange: (value: ModelListFilterFilterValue) => void;
}) => {
  // TODO: Change to model tags API
  const [tagKeysLoading, tagKeys] = useModelTagKeys();
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleSearch = useCallback((search) => {
    onChangeRef.current({ ...valueRef.current, search });
  }, []);

  const handleTagChange = useCallback((tag: TagFilterValue[]) => {
    onChangeRef.current({ ...valueRef.current, tag: removeDuplicateTag(tag) });
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
          <DebouncedSearchBar
            placeholder="Search by name, person, or keyword"
            onSearch={handleSearch}
            inputRef={searchInputRef}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFilterGroup>
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
            <TagFilter
              tagKeysLoading={tagKeysLoading}
              tagKeys={tagKeys}
              value={value.tag}
              onChange={handleTagChange}
            />
          </EuiFilterGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      {value.tag.length > 0 && (
        <>
          <EuiSpacer size="m" />
          <SelectedTagFiltersPanel
            tagKeys={tagKeys}
            tagFilters={value.tag}
            onTagFiltersChange={handleTagChange}
          />
        </>
      )}
    </>
  );
};
