/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useState } from 'react';

import { APIProvider } from '../../apis/api_provider';
import { ProfileDeployedModel } from '../../apis/profile';
import { useFetcher } from '../../hooks/use_fetcher';

type ModelDeployState = 'responding' | 'not-responding' | 'partial-responding';

interface Params {
  name?: string;
  state?: ModelDeployState[];
  currentPage: number;
  pageSize: number;
  sort: 'name-asc' | 'name-desc';
}

const convertModelState = (
  model: Pick<ProfileDeployedModel, 'target_node_ids' | 'deployed_node_ids'>
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

const fetchAllDeployedModels = (params: Params) => {
  return APIProvider.getAPI('profile')
    .getAllDeployedModels()
    .then((models) => {
      const allData = models
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
        .sort((a, b) => a.name.localeCompare(b.name) * (params.sort === 'name-asc' ? 1 : -1))
        .slice((params.currentPage - 1) * params.pageSize, params.currentPage * params.pageSize);
      return {
        data,
        pagination: {
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          totalCounts: allData.length,
        },
      };
    });
};

export const useMonitoring = () => {
  const [params, setParams] = useState<Params>({
    currentPage: 1,
    pageSize: 15,
    sort: 'name-asc',
  });
  const { data, mutate, loading, reload } = useFetcher(fetchAllDeployedModels, params);
  const filterExists = checkFilterExists(params);
  const totalCounts = data?.pagination.totalCounts;

  const deployedModels = useMemo(() => data?.data ?? [], [data]);

  const pageStatus = useMemo(() => {
    if (loading) {
      return 'loading' as const;
    }
    if (totalCounts === 0 && filterExists) {
      return filterExists ? ('reset-filter' as const) : ('empty' as const);
    }
    return 'normal' as const;
  }, [loading, totalCounts, filterExists]);

  const updateDeployedModel = useCallback(
    (model: ProfileDeployedModel) => {
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
