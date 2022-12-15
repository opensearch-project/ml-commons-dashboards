/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiButton, EuiSpacer, EuiPanel } from '@elastic/eui';
import { Link } from 'react-router-dom';

import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';

import { ModelTable } from './model_table';
import { ModelListFilter, ModelListFilterFilterValue } from './model_list_filter';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';
import { ModelDrawer } from '../model_drawer';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const confirmModelDeleteRef = useRef<ModelConfirmDeleteModalInstance>(null);
  const [params, setParams] = useState<{
    sort: 'trainTime-desc' | 'trainTime-asc';
    currentPage: number;
    pageSize: number;
    filterValue: ModelListFilterFilterValue;
  }>({
    currentPage: 1,
    pageSize: 15,
    sort: 'trainTime-desc',
    filterValue: { tag: [], owner: [], stage: [] },
  });
  const [drawerModelName, setDrawerModelName] = useState('');
  const { data, reload } = useFetcher(APIProvider.getAPI('model').search, {
    pageSize: params.pageSize,
    currentPage: params.currentPage,
    name: params.filterValue.search,
    sort: undefined,
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

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={
          <>
            Models
            {totalModelCounts !== undefined && (
              <span style={{ fontSize: '0.6em', verticalAlign: 'middle', paddingLeft: 4 }}>
                ({totalModelCounts})
              </span>
            )}
          </>
        }
        rightSideItems={[
          <Link to={routerPaths.train}>
            <EuiButton fill>Train new model</EuiButton>
          </Link>,
        ]}
        bottomBorder
      />
      <EuiSpacer />
      <ModelListFilter value={params.filterValue} onChange={handleFilterChange} />
      <EuiSpacer />
      <ModelTable
        models={models}
        sort={params.sort}
        pagination={pagination}
        onModelDelete={handleModelDelete}
        onChange={handleTableChange}
        onViewModelDrawer={handleViewModelDrawer}
      />
      <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
      {drawerModelName && (
        <ModelDrawer onClose={() => setDrawerModelName('')} name={drawerModelName} />
      )}
    </EuiPanel>
  );
};
