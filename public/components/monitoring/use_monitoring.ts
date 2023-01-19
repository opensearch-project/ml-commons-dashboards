/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useState } from 'react';

import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import { MODEL_STATE } from '../../../common';

import { ModelDeployStatus } from './types';

interface Params {
  nameOrId?: string;
  status?: ModelDeployStatus[];
  currentPage: number;
  pageSize: number;
  sort: { field: 'name'; direction: 'asc' | 'desc' };
}

const isValidNameOrIdFilter = (nameOrId: string | undefined): nameOrId is string => !!nameOrId;
const isValidStatusFilter = (
  status: ModelDeployStatus[] | undefined
): status is ModelDeployStatus[] => !!status && status.length > 0;

const checkFilterExists = (params: Params) =>
  isValidNameOrIdFilter(params.nameOrId) || isValidStatusFilter(params.status);

const fetchDeployedModels = async (params: Params) => {
  const states = params.status?.map((status) => {
    switch (status) {
      case 'not-responding':
        return MODEL_STATE.loadFailed;
      case 'responding':
        return MODEL_STATE.loaded;
      case 'partial-responding':
        return MODEL_STATE.partialLoaded;
    }
  });
  const result = await APIProvider.getAPI('model').search({
    currentPage: params.currentPage,
    pageSize: params.pageSize,
    nameOrId: params.nameOrId,
    states:
      !states || states.length === 0
        ? [MODEL_STATE.loadFailed, MODEL_STATE.loaded, MODEL_STATE.partialLoaded]
        : states,
    sort: [`${params.sort.field}-${params.sort.direction}`],
  });
  return {
    ...result,
    data: result.data.map(
      ({
        id,
        name,
        current_worker_node_count: workerCount,
        planning_worker_node_count: planningCount,
      }) => {
        return {
          id,
          name,
          respondingNodesCount: workerCount,
          planingNodesCount: planningCount,
          notRespondingNodesCount:
            workerCount !== undefined && planningCount !== undefined
              ? planningCount - workerCount
              : undefined,
        };
      }
    ),
  };
};

export const useMonitoring = () => {
  const [params, setParams] = useState<Params>({
    currentPage: 1,
    pageSize: 10,
    sort: { field: 'name', direction: 'asc' },
  });
  const { data, loading, reload } = useFetcher(fetchDeployedModels, params);
  const filterExists = checkFilterExists(params);
  const totalRecords = data?.pagination.totalRecords;
  const deployedModels = useMemo(() => data?.data ?? [], [data]);

  /**
   * The pageStatus represents the different statuses in the monitoring page,
   * "loading" is for data loading,
   * "normal" is for data load completed,
   * "reset-filter" is for no deployed models after filter applied,
   * "empty" is for no deployed models in current system
   */
  const pageStatus = useMemo(() => {
    if (loading) {
      return 'loading' as const;
    }
    if (totalRecords) {
      return 'normal' as const;
    }
    return filterExists ? ('reset-filter' as const) : ('empty' as const);
  }, [loading, totalRecords, filterExists]);

  const resetSearch = useCallback(() => {
    setParams((previousValue) => ({
      currentPage: previousValue.currentPage,
      pageSize: previousValue.pageSize,
      sort: previousValue.sort,
    }));
  }, []);

  const searchByNameOrId = useCallback((nameOrId: string) => {
    setParams((previousValue) => ({
      ...previousValue,
      nameOrId,
    }));
  }, []);

  const searchByStatus = useCallback((status: ModelDeployStatus[]) => {
    setParams((previousValue) => ({
      ...previousValue,
      status,
    }));
  }, []);

  const handleTableChange = useCallback(
    (criteria: {
      pagination?: { currentPage: number; pageSize: number };
      sort?: { field: 'name'; direction: 'asc' | 'desc' };
    }) => {
      setParams((previousValue) => {
        if (
          criteria.pagination?.currentPage === previousValue.currentPage &&
          criteria.pagination?.pageSize === previousValue.pageSize &&
          criteria.sort?.field === previousValue.sort.field &&
          criteria.sort?.direction === previousValue.sort.direction
        ) {
          return previousValue;
        }
        return {
          ...previousValue,
          ...(criteria.pagination ? criteria.pagination : {}),
          ...(criteria.sort ? { sort: criteria.sort } : {}),
        };
      });
    },
    []
  );

  return {
    params,
    pageStatus,
    pagination: data?.pagination,
    /**
     * Data of the current page
     */
    deployedModels,
    reload,
    searchByStatus,
    searchByNameOrId,
    resetSearch,
    handleTableChange,
  };
};
