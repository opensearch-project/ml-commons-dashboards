/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel } from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { ModelDrawer } from '../model_drawer';
import { ModelTable, ModelTableSort } from './model_table';
import { ModelListFilter, ModelListFilterFilterValue } from './model_list_filter';
import { RegisterNewModelButton } from './register_new_model_button';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';
import { ModelVersionUndeployedModal } from './model_version_undeployed_modal';
import { UploadCallout } from './upload_callout';
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
    filterValue: { tag: [], owner: [] },
    sort: { field: 'created_time', direction: 'desc' },
  });
  const [drawerModelName, setDrawerModelName] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>();
  const setSearchInputRef = useCallback((node: HTMLInputElement | null) => {
    searchInputRef.current = node;
  }, []);
  const { data, reload, loading, error } = useFetcher(APIProvider.getAPI('modelAggregate').search, {
    currentPage: params.currentPage,
    pageSize: params.pageSize,
    sort: params.sort?.field,
    order: params.sort?.direction,
    name: params.filterValue.search,
  });
  const models = useMemo(() => data?.data || [], [data]);
  const totalModelCounts = data?.pagination.totalRecords || 0;
  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalModelCounts,
    }),
    [totalModelCounts, params.currentPage, params.pageSize]
  );
  const handleModelDelete = useCallback((modelId: string, deployedVersions: string[]) => {
    confirmModelDeleteRef.current?.show(modelId, deployedVersions);
  }, []);
  const handleModelDeleted = useCallback(async () => {
    reload();
    notifications.toasts.addSuccess('Model has been deleted.');
  }, [reload, notifications.toasts]);
  const handleViewModelDrawer = useCallback((name: string) => {
    setDrawerModelName(name);
  }, []);
  const handleTableChange = useCallback((criteria) => {
    const {
      pagination: { currentPage, pageSize },
      sort,
    } = criteria;
    setParams((previousValue) => {
      if (
        currentPage === previousValue.currentPage &&
        pageSize === previousValue.pageSize &&
        (!sort || sort === previousValue.sort)
      ) {
        return previousValue;
      }
      return {
        ...previousValue,
        currentPage,
        pageSize,
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
  const deployedVersion: string[] = [];
  const handleFilterChange = useCallback((filterValue: ModelListFilterFilterValue) => {
    setParams((prevValue) => ({ ...prevValue, filterValue, currentPage: 1 }));
  }, []);
  return (
    <EuiPanel>
      <EuiPageHeader pageTitle={<>Models</>} rightSideItems={[<RegisterNewModelButton />]} />
      <EuiSpacer />
      <ModelListFilter value={params.filterValue} onChange={handleFilterChange} />
      <EuiSpacer />
      <UploadCallout models={['image-classifier']} />
      <EuiSpacer />
      <ModelTable
        loading={loading}
        sort={params.sort}
        models={models}
        pagination={pagination}
        onChange={handleTableChange}
        onModelNameClick={handleViewModelDrawer}
        onModelDeleteClick={handleModelDelete}
        onResetClick={handleReset}
        error={!!error}
      />
      {deployedVersion.length === 0 ? (
        <ModelVersionUndeployedModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
      ) : (
        <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
      )}
      {drawerModelName && (
        <ModelDrawer onClose={() => setDrawerModelName('')} name={drawerModelName} />
      )}
    </EuiPanel>
  );
};
