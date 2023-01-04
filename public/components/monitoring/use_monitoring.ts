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
  name?: string;
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
  !!params.name || (!!params.state && params.state.length > 0);

const fetchAllDeployedModels = async (params: Params) => {
  const deployedModels = await APIProvider.getAPI('profile').getAllDeployedModels();
  const allData = deployedModels
    .map((item) => ({ ...item, state: convertModelState(item) }))
    .filter((item) => {
      if (!checkFilterExists(params)) {
        return true;
      }
      if (params.name && !item.name.toLowerCase().includes(params.name.toLowerCase())) {
        return false;
      }
      if (params.state && !params.state.includes(item.state)) {
        return false;
      }
      return true;
    });
  const data = allData
    .sort(
      (a, b) =>
        a[params.sort.field].localeCompare(b[params.sort.field]) *
        (params.sort.direction === 'asc' ? 1 : -1)
    )
    .slice((params.currentPage - 1) * params.pageSize, params.currentPage * params.pageSize);
  return {
    data,
    pagination: {
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: allData.length,
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

  const searchByName = useCallback((name: string) => {
    setParams((previousValue) => ({
      ...previousValue,
      name,
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
    deployedModels,
    reload,
    searchByName,
    searchByState,
    updateDeployedModel,
    clearNameStateFilter,
    handleTableChange,
  };
};
