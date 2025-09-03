/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef } from 'react';
import {
  EuiFilterGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiIcon,
  EuiSpacer,
} from '@elastic/eui';

import {
  TagFilterValue,
  TagFilter,
  OptionsFilter,
  SelectedTagFiltersPanel,
  DebouncedSearchBar,
} from '../../common';
import { useModelTagKeys } from '../../model_list/model_list.hooks';

const statusOptions = [
  {
    name: 'In progress...',
    value: 'InProgress' as const,
    prepend: <EuiIcon type="dot" color="#AFB0B3" />,
  },
  { name: 'Success', value: 'Success' as const, prepend: <EuiIcon type="dot" color="success" /> },
  { name: 'Warning', value: 'Warning' as const, prepend: <EuiIcon type="dot" color="warning" /> },
  { name: 'Error', value: 'Error' as const, prepend: <EuiIcon type="dot" color="danger" /> },
];

const stateOptions = ['Not deployed', 'Deployed'];

const removeDuplicateTag = (tagFilters: TagFilterValue[]) => {
  const existsTagMap: { [key: string]: boolean } = {};
  return tagFilters.filter((tagFilter) => {
    const key = `${tagFilter.name}${tagFilter.operator}${tagFilter.value.toString()}`;
    if (!existsTagMap[key]) {
      existsTagMap[key] = true;
      return true;
    }

    return false;
  });
};

export interface ModelVersionListFilterValue {
  status: Array<typeof statusOptions[number]['value']>;
  state: Array<typeof stateOptions[number]>;
  tag: TagFilterValue[];
  search?: string;
}

interface ModelVersionListFilterProps {
  searchInputRef?: (input: HTMLInputElement | null) => void;
  value: Omit<ModelVersionListFilterValue, 'search'>;
  onChange: (value: ModelVersionListFilterValue) => void;
}

export const ModelVersionListFilter = ({
  searchInputRef,
  value,
  onChange,
}: ModelVersionListFilterProps) => {
  // TODO: Change to model tags API and pass model group id here
  const [tagKeysLoading, tagKeys] = useModelTagKeys();
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleStateChange = useCallback(
    (state: ModelVersionListFilterValue['state']) => {
      onChange({ ...valueRef.current, state });
    },
    [onChange]
  );

  const handleStatusChange = useCallback(
    (status: ModelVersionListFilterValue['status']) => {
      onChange({ ...valueRef.current, status });
    },
    [onChange]
  );

  const handleTagChange = useCallback(
    (tag: ModelVersionListFilterValue['tag']) => {
      onChange({ ...valueRef.current, tag: removeDuplicateTag(tag) });
    },
    [onChange]
  );

  const handleSearch = useCallback(
    (search: string) => {
      onChange({ ...valueRef.current, search });
    },
    [onChange]
  );

  return (
    <>
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem>
          <DebouncedSearchBar
            placeholder="Search by version number, or keyword"
            onSearch={handleSearch}
            inputRef={searchInputRef}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFilterGroup>
            <OptionsFilter
              searchPlaceholder="Search"
              options={stateOptions}
              value={value.state}
              name="State"
              onChange={handleStateChange}
              searchWidth={146}
            />
            <OptionsFilter
              searchPlaceholder="Search"
              options={statusOptions}
              value={value.status}
              name="Status"
              onChange={handleStatusChange}
              searchWidth={146}
            />
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
