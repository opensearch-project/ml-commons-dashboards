/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel, EuiTextColor } from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { ModelDrawer } from '../model_drawer';
import { ModelTable, ModelTableSort } from './model_table';
import { ModelListFilter, ModelListFilterFilterValue } from './model_list_filter';
import { RegisterNewModelButton } from './regsister_new_model_button';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';
import { ModelListEmpty } from './model_list_empty';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const confirmModelDeleteRef = useRef<ModelConfirmDeleteModalInstance>(null);
  const [params, setParams] = useState<{
    sort: ModelTableSort;
    currentPage: number;
    pageSize: number;
    filterValue: ModelListFilterFilterValue;
  }>({
    currentPage: 1,
    pageSize: 15,
    filterValue: { tag: [], owner: [], stage: [] },
    sort: { field: 'created_time', direction: 'desc' },
  });
  const [drawerModelName, setDrawerModelName] = useState('');

  const { data, reload, loading, error } = useFetcher(APIProvider.getAPI('modelAggregate').search, {
    currentPage: params.currentPage,
    pageSize: params.pageSize,
    sort: params.sort?.field,
    order: params.sort?.direction,
    name: params.filterValue.search,
  });
  const models = useMemo(() => data?.data || [], [data]);
  const totalModelCounts = data?.pagination.totalRecords;

  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalModelCounts || 0,
    }),
    [totalModelCounts, params.currentPage, params.pageSize]
  );
  const showEmptyScreen = !loading && totalModelCounts === 0 && !params.filterValue.search;

  const handleModelDeleted = useCallback(async () => {
    reload();
    notifications.toasts.addSuccess('Model has been deleted.');
  }, [reload, notifications.toasts]);

  const handleModelDelete = useCallback((modelId: string) => {
    confirmModelDeleteRef.current?.show(modelId);
  }, []);

  const handleViewModelDrawer = useCallback((name: string) => {
    setDrawerModelName(name);
  }, []);

  const handleTableChange = useCallback((criteria) => {
    const { pagination: newPagination, sort } = criteria;
    setParams((previousValue) => {
      if (
        newPagination?.currentPage === previousValue.currentPage &&
        newPagination?.pageSize === previousValue.pageSize &&
        (!sort || sort === previousValue.sort)
      ) {
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
      filterValue: { tag: [], owner: [], stage: [] },
    }));
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
            {totalModelCounts && (
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
          <ModelListFilter value={params.filterValue} onChange={handleFilterChange} />
          <EuiSpacer />
          <ModelTable
            loading={loading}
            sort={params.sort}
            models={models}
            pagination={pagination}
            onChange={handleTableChange}
            onModelNameClick={handleViewModelDrawer}
            onResetClick={handleReset}
            errored={!!error}
          />
          <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
          {drawerModelName && (
            <ModelDrawer onClose={() => setDrawerModelName('')} name={drawerModelName} />
          )}
        </>
      )}
      {showEmptyScreen && <ModelListEmpty />}
    </EuiPanel>
  );
};
