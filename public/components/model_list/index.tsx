/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel, EuiButton } from '@elastic/eui';

import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { ModelDrawer } from '../model_drawer';
import { ModelTable, ModelTableSort } from './model_table';
import { ModelListFilter, ModelListFilterFilterValue } from './model_list_filter';
import { RegisterModelTypeModal } from '../register_model_type_modal';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
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

  const { data, reload } = useFetcher(APIProvider.getAPI('modelAggregate').search, {
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

  const handleFilterChange = useCallback((filterValue: ModelListFilterFilterValue) => {
    setParams((prevValue) => ({ ...prevValue, filterValue, currentPage: 1 }));
  }, []);
  let modal;

  function handle() {
    closeModal();
  }
  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={<>Models</>}
        rightSideItems={[
          <EuiButton onClick={showModal}>Register new model</EuiButton>,
          isModalVisible && <RegisterModelTypeModal getMsg={handle} />,
        ]}
      />
      <EuiSpacer />
      <ModelListFilter value={params.filterValue} onChange={handleFilterChange} />
      <EuiSpacer />
      <ModelTable
        sort={params.sort}
        models={models}
        pagination={pagination}
        onChange={handleTableChange}
        onModelNameClick={handleViewModelDrawer}
      />
      <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
      {drawerModelName && (
        <ModelDrawer onClose={() => setDrawerModelName('')} name={drawerModelName} />
      )}
    </EuiPanel>
  );
};
