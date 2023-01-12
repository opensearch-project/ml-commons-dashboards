/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useState } from 'react';

import { APIProvider } from '../../apis/api_provider';
import { ModelDeploymentProfile } from '../../apis/profile';
import { useFetcher } from '../../hooks/use_fetcher';

type ModelDeployStatus = 'responding' | 'not-responding' | 'partial-responding';

interface Params {
  nameOrId?: string;
  status?: ModelDeployStatus[];
  currentPage: number;
  pageSize: number;
  sort: { field: 'name'; direction: 'asc' | 'desc' };
}

const convertModelStatus = (
  model: Pick<ModelDeploymentProfile, 'target_node_ids' | 'deployed_node_ids'>
): ModelDeployStatus => {
  if (model.target_node_ids.length === model.deployed_node_ids.length) {
    return 'responding';
  }
  if (model.deployed_node_ids.length === 0) {
    return 'not-responding';
  }
  return 'partial-responding';
};

const statusFilterOrder = {
  responding: 0,
  'partial-responding': 1,
  'not-responding': 2,
} as const;

const isValidNameOrIdFilter = (nameOrId: string | undefined): nameOrId is string => !!nameOrId;
const isValidStatusFilter = (
  status: ModelDeployStatus[] | undefined
): status is ModelDeployStatus[] => !!status && status.length > 0;

const checkFilterExists = (params: Params) =>
  isValidNameOrIdFilter(params.nameOrId) || isValidStatusFilter(params.status);

const fetchAllDeployedModels = async (params: Params) => {
  const { status: statusFilter, nameOrId: nameOrIdFilter } = params;
  const allData = await APIProvider.getAPI('profile').getAllDeployedModels();

  const allConvertedData = allData.map((item) => ({ ...item, status: convertModelStatus(item) }));

  // Results after applying nameOrId filter
  const dataAfterNameOrIdFilter = isValidNameOrIdFilter(nameOrIdFilter)
    ? allConvertedData.filter(
        ({ name, id }) =>
          name.toLowerCase().includes(nameOrIdFilter.toLowerCase()) || id.includes(nameOrIdFilter)
      )
    : allConvertedData;

  // Results after applying all filters
  const filteredData = isValidStatusFilter(statusFilter)
    ? dataAfterNameOrIdFilter.filter((item) => statusFilter.includes(item.status))
    : dataAfterNameOrIdFilter;

  // Results of current page
  const pageData = filteredData
    .sort(
      (a, b) =>
        a[params.sort.field].localeCompare(b[params.sort.field]) *
        (params.sort.direction === 'asc' ? 1 : -1)
    )
    .slice((params.currentPage - 1) * params.pageSize, params.currentPage * params.pageSize);

  const allStatuses = Object.keys(
    dataAfterNameOrIdFilter.reduce(
      (previousData, { status }) => ({ ...previousData, [status]: true }),
      {}
    )
  ) as ModelDeployStatus[];

  return {
    allStatuses,
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
  const statusFilterOptions = useMemo(
    () =>
      (data?.allStatuses ?? [])
        .sort((a, b) => statusFilterOrder[a] - statusFilterOrder[b])
        .map((status) => ({
          value: status,
          checked: params.status?.includes(status) ? ('on' as const) : undefined,
        })),
    [data, params.status]
  );

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
              return { ...model, status: convertModelStatus(model) };
            }
            return item;
          }),
        };
      });
    },
    [mutate]
  );

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
    statusFilterOptions,
    /**
     * Data of the current page
     */
    deployedModels,
    reload,
    searchByStatus,
    searchByNameOrId,
    updateDeployedModel,
    resetSearch,
    handleTableChange,
  };
};
