/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useState } from 'react';

import { APIProvider } from '../../apis/api_provider';
import { ModelDeploymentProfile } from '../../apis/profile';
import { useFetcher } from '../../hooks/use_fetcher';

type ModelDeployState = 'responding' | 'not-responding' | 'partial-responding';

interface Params {
  nameOrId?: string;
  state?: ModelDeployState[];
  currentPage: number;
  pageSize: number;
  sort: { field: 'name'; direction: 'asc' | 'desc' };
}

const convertModelState = (
  model: Pick<ModelDeploymentProfile, 'target_node_ids' | 'deployed_node_ids'>
): ModelDeployState => {
  if (model.target_node_ids.length === model.deployed_node_ids.length) {
    return 'responding';
  }
  if (model.deployed_node_ids.length === 0) {
    return 'not-responding';
  }
  return 'partial-responding';
};

const checkFilterExists = (params: Params) =>
  !!params.nameOrId || (!!params.state && params.state.length > 0);

const fetchAllDeployedModels = async (params: Params) => {
  const allData = await APIProvider.getAPI('profile').getAllDeployedModels();
  // Results after applying filters
  const filteredData = allData
    .map((item) => ({ ...item, state: convertModelState(item) }))
    .filter((item) => {
      if (!checkFilterExists(params)) {
        return true;
      }
      if (
        params.nameOrId &&
        !item.name.toLowerCase().includes(params.nameOrId.toLowerCase()) &&
        !item.id.includes(params.nameOrId)
      ) {
        return false;
      }
      if (params.state && !params.state.includes(item.state)) {
        return false;
      }
      return true;
    });

  // Results of current page
  const pageData = filteredData
    .sort(
      (a, b) =>
        a[params.sort.field].localeCompare(b[params.sort.field]) *
        (params.sort.direction === 'asc' ? 1 : -1)
    )
    .slice((params.currentPage - 1) * params.pageSize, params.currentPage * params.pageSize);

  return {
    data: pageData,
    pagination: {
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: filteredData.length,
    },
  };
};

export const useMonitoring = () => {
  const [params, setParams] = useState<Params>({
    currentPage: 1,
    pageSize: 10,
    sort: { field: 'name', direction: 'asc' },
  });
  const { data, mutate, loading, reload } = useFetcher(fetchAllDeployedModels, params);
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
    if (totalRecords === 0) {
      return filterExists ? ('reset-filter' as const) : ('empty' as const);
    }
    return 'normal' as const;
  }, [loading, totalRecords, filterExists]);

  const updateDeployedModel = useCallback(
    (model: ModelDeploymentProfile) => {
      mutate((previousValue) => {
        if (!previousValue) {
          return previousValue;
        }
        return {
          ...previousValue,
          data: previousValue.data.map((item) => {
            if (item.id === model.id) {
              return { ...model, state: convertModelState(model) };
            }
            return item;
          }),
        };
      });
    },
    [mutate]
  );

  const clearNameStateFilter = useCallback(() => {
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

  const searchByState = useCallback((state: ModelDeployState[]) => {
    setParams((previousValue) => ({
      ...previousValue,
      state,
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
    searchByState,
    searchByNameOrId,
    updateDeployedModel,
    clearNameStateFilter,
    handleTableChange,
  };
};
