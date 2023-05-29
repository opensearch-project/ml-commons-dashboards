/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel, EuiTextColor } from '@elastic/eui';

import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { MODEL_VERSION_STATE } from '../../../common';

import { ModelTable, ModelTableCriteria, ModelTableSort } from './model_table';
import { ModelListFilter, ModelListFilterFilterValue } from './model_list_filter';
import { RegisterNewModelButton } from './register_new_model_button';
import { ModelListEmpty } from './model_list_empty';

const getStatesParam = (deployed?: boolean) => {
  if (deployed) {
    return [MODEL_VERSION_STATE.deployed];
  }
  if (deployed === false) {
    return [
      MODEL_VERSION_STATE.deployFailed,
      MODEL_VERSION_STATE.deploying,
      MODEL_VERSION_STATE.partiallyDeployed,
      MODEL_VERSION_STATE.registerFailed,
      MODEL_VERSION_STATE.undeployed,
      MODEL_VERSION_STATE.registered,
      MODEL_VERSION_STATE.registering,
    ];
  }
  return undefined;
};

export const ModelList = () => {
  const [params, setParams] = useState<{
    sort: ModelTableSort;
    currentPage: number;
    pageSize: number;
    filterValue: ModelListFilterFilterValue;
  }>({
    currentPage: 1,
    pageSize: 15,
    filterValue: { tag: [], owner: [] },
    sort: { field: 'last_updated_time', direction: 'desc' },
  });
  const searchInputRef = useRef<HTMLInputElement | null>();

  const setSearchInputRef = useCallback((node: HTMLInputElement | null) => {
    searchInputRef.current = node;
  }, []);

  const { data, loading, error } = useFetcher(APIProvider.getAPI('modelAggregate').search, {
    from: (params.currentPage - 1) * params.pageSize,
    size: params.pageSize,
    sort: params.sort ? `${params.sort.field}-${params.sort.direction}` : undefined,
    states: getStatesParam(params.filterValue.deployed),
    queryString: params.filterValue.search
      ? `name:*${params.filterValue.search}* OR *${params.filterValue.search}* OR owner.name.keyword:*${params.filterValue.search}*`
      : undefined,
  });
  const models = useMemo(() => data?.data || [], [data]);
  const totalModelCounts = data?.total_models;

  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalModelCounts || 0,
    }),
    [totalModelCounts, params.currentPage, params.pageSize]
  );
  const showEmptyScreen =
    !loading &&
    totalModelCounts === 0 &&
    !params.filterValue.search &&
    params.filterValue.deployed === undefined &&
    params.filterValue.tag.length === 0 &&
    params.filterValue.owner.length === 0;

  const handleTableChange = useCallback((criteria: ModelTableCriteria) => {
    const { pagination: newPagination, sort } = criteria;
    setParams((previousValue) => {
      const criteriaConsistent =
        newPagination?.currentPage === previousValue.currentPage &&
        newPagination?.pageSize === previousValue.pageSize &&
        (!sort || sort === previousValue.sort);

      if (criteriaConsistent) {
        return previousValue;
      }
      return {
        ...previousValue,
        ...(newPagination
          ? { currentPage: newPagination.currentPage, pageSize: newPagination.pageSize }
          : {}),
        ...(sort ? { sort } : {}),
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setParams((prevParams) => ({
      ...prevParams,
      filterValue: { tag: [], owner: [] },
    }));
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, [setParams]);

  const handleFilterChange = useCallback((filterValue: ModelListFilterFilterValue) => {
    setParams((prevValue) => ({ ...prevValue, filterValue, currentPage: 1 }));
  }, []);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={
          <>
            Models&nbsp;
            {typeof totalModelCounts === 'number' && (
              <EuiTextColor data-test-subj="modelTotalCount" color="subdued" component="span">
                ({totalModelCounts})
              </EuiTextColor>
            )}
          </>
        }
        description="Discover, manage, and track machine learning models across your organization."
        rightSideItems={[<RegisterNewModelButton />]}
      />
      <EuiSpacer />
      {!showEmptyScreen && (
        <>
          <ModelListFilter
            value={params.filterValue}
            onChange={handleFilterChange}
            searchInputRef={setSearchInputRef}
          />
          <EuiSpacer />
          <ModelTable
            loading={loading}
            sort={params.sort}
            models={models}
            pagination={pagination}
            onChange={handleTableChange}
            onResetClick={handleReset}
            error={!!error}
          />
        </>
      )}
      {showEmptyScreen && <ModelListEmpty />}
    </EuiPanel>
  );
};
