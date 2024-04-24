/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useState, useContext, useEffect } from 'react';

import { APIProvider } from '../../apis/api_provider';
import { GetAllConnectorResponse } from '../../apis/connector';
import { DO_NOT_FETCH, useFetcher } from '../../hooks/use_fetcher';
import { MODEL_STATE } from '../../../common';
import { DataSourceContext } from '../../contexts';
import { ModelDeployStatus } from './types';
import { DATA_SOURCE_FETCHING_ID, DataSourceId, getDataSourceId } from '../../utils/data_source';

interface Params {
  nameOrId?: string;
  status?: ModelDeployStatus[];
  source: Array<'local' | 'external'>;
  connector: string[];
  currentPage: number;
  pageSize: number;
  sort: { field: 'name' | 'model_state' | 'id'; direction: 'asc' | 'desc' };
  dataSourceId?: DataSourceId;
}

const generateExtraQuery = ({
  source,
  connector,
}: Pick<Params, 'source'> & { connector: Array<{ name: string; ids: string[] }> }) => {
  if (connector.length === 0 && source.length === 0) {
    return undefined;
  }
  const must: Array<Record<string, any>> = [];
  const mustNot: Array<Record<string, any>> = [];

  if (source.length === 1) {
    (source[0] === 'external' ? must : mustNot).push({
      term: {
        algorithm: { value: 'REMOTE' },
      },
    });
  }

  if (connector.length > 0) {
    const should: Array<Record<string, any>> = [];
    connector.forEach(({ name, ids }) => {
      should.push({
        wildcard: {
          'connector.name.keyword': { value: `*${name}*`, case_insensitive: true },
        },
      });
      if (ids.length > 0) {
        should.push({
          terms: {
            'connector_id.keyword': ids,
          },
        });
      }
    });
    must.push({ bool: { should } });
  }

  if (must.length === 0 && mustNot.length === 0) {
    return undefined;
  }

  return {
    bool: {
      ...(must.length > 0 ? { must } : {}),
      ...(mustNot.length > 0 ? { must_not: mustNot } : {}),
    },
  };
};

const isValidNameOrIdFilter = (nameOrId: string | undefined): nameOrId is string => !!nameOrId;
const isValidStatusFilter = (
  status: ModelDeployStatus[] | undefined
): status is ModelDeployStatus[] => !!status && status.length > 0;

const checkFilterExists = (params: Params) =>
  isValidNameOrIdFilter(params.nameOrId) ||
  isValidStatusFilter(params.status) ||
  params.connector.length > 0 ||
  params.source.length > 0;

const fetchDeployedModels = async (
  params: Omit<Params, 'dataSourceId'> & { dataSourceId?: string }
) => {
  const states = params.status?.map((status) => {
    switch (status) {
      case 'not-responding':
        return MODEL_STATE.loadFailed;
      case 'responding':
        return MODEL_STATE.loaded;
      case 'partial-responding':
        return MODEL_STATE.partiallyLoaded;
    }
  });
  let externalConnectorsData: GetAllConnectorResponse;
  try {
    externalConnectorsData = await APIProvider.getAPI('connector').getAll({
      dataSourceId: params.dataSourceId,
    });
  } catch (_e) {
    externalConnectorsData = { data: [], total_connectors: 0 };
  }
  const result = await APIProvider.getAPI('model').search({
    from: (params.currentPage - 1) * params.pageSize,
    size: params.pageSize,
    nameOrId: params.nameOrId,
    states:
      !states || states.length === 0
        ? [MODEL_STATE.loadFailed, MODEL_STATE.loaded, MODEL_STATE.partiallyLoaded]
        : states,
    sort: [`${params.sort.field}-${params.sort.direction}`],
    extraQuery: generateExtraQuery({
      ...params,
      connector:
        params.connector.length > 0
          ? params.connector.map((connectorItem) => ({
              name: connectorItem,
              ids: externalConnectorsData.data
                .filter((item) => item.name === connectorItem)
                .map(({ id }) => id),
            }))
          : [],
    }),
    dataSourceId: params.dataSourceId,
  });
  const externalConnectorMap = externalConnectorsData.data.reduce<{
    [key: string]: {
      id: string;
      name: string;
      description?: string;
    };
  }>((previousValue, currentValue) => ({ ...previousValue, [currentValue.id]: currentValue }), {});

  const totalPages = Math.ceil(result.total_models / params.pageSize);
  return {
    pagination: {
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: result.total_models,
      totalPages,
    },
    data: result.data.map(
      ({
        id,
        name,
        current_worker_node_count: workerCount,
        planning_worker_node_count: planningCount,
        planning_worker_nodes: planningWorkerNodes,
        algorithm,
        ...rest
      }) => {
        return {
          id,
          name,
          respondingNodesCount: workerCount,
          planningNodesCount: planningCount,
          notRespondingNodesCount:
            workerCount !== undefined && planningCount !== undefined
              ? planningCount - workerCount
              : undefined,
          planningWorkerNodes,
          connector: rest.connector_id
            ? externalConnectorMap[rest.connector_id] || {}
            : rest.connector,
        };
      }
    ),
    allExternalConnectors: externalConnectorsData.data,
  };
};

export const useMonitoring = () => {
  const { dataSourceEnabled, selectedDataSourceOption } = useContext(DataSourceContext);
  const [params, setParams] = useState<Params>({
    currentPage: 1,
    pageSize: 10,
    sort: { field: 'model_state', direction: 'asc' },
    source: [],
    connector: [],
    dataSourceId: getDataSourceId(dataSourceEnabled, selectedDataSourceOption),
  });
  const { data, loading, reload } = useFetcher(
    fetchDeployedModels,
    typeof params.dataSourceId === 'symbol'
      ? DO_NOT_FETCH
      : { ...params, dataSourceId: params.dataSourceId }
  );
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
    if (loading || params.dataSourceId === DATA_SOURCE_FETCHING_ID) {
      return 'loading' as const;
    }
    if (totalRecords) {
      return 'normal' as const;
    }
    return filterExists ? ('reset-filter' as const) : ('empty' as const);
  }, [loading, totalRecords, filterExists, params.dataSourceId]);

  const resetSearch = useCallback(() => {
    setParams((previousValue) => ({
      ...previousValue,
      currentPage: previousValue.currentPage,
      pageSize: previousValue.pageSize,
      sort: previousValue.sort,
      nameOrId: '',
      source: [],
      connector: [],
      status: undefined,
    }));
  }, []);

  const searchByNameOrId = useCallback((nameOrId: string) => {
    setParams((previousValue) => ({
      ...previousValue,
      nameOrId,
      currentPage: 1,
    }));
  }, []);

  const searchByStatus = useCallback((status: ModelDeployStatus[]) => {
    setParams((previousValue) => ({
      ...previousValue,
      status,
      currentPage: 1,
    }));
  }, []);

  const searchBySource = useCallback((source: Params['source']) => {
    setParams((previousValue) => ({
      ...previousValue,
      source,
      currentPage: 1,
    }));
  }, []);

  const searchByConnector = useCallback((connector: Params['connector']) => {
    setParams((previousValue) => ({
      ...previousValue,
      connector,
      currentPage: 1,
    }));
  }, []);

  const handleTableChange = useCallback(
    (criteria: {
      pagination?: { currentPage: number; pageSize: number };
      sort?: { field: 'name' | 'model_state' | 'id'; direction: 'asc' | 'desc' };
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

  useEffect(() => {
    if (!dataSourceEnabled) {
      return;
    }
    setParams((previousParams) => {
      const dataSourceId = getDataSourceId(dataSourceEnabled, selectedDataSourceOption);
      if (previousParams.dataSourceId === dataSourceId) {
        return previousParams;
      }
      return {
        ...previousParams,
        currentPage: 1,
        dataSourceId,
        connector: [],
      };
    });
  }, [dataSourceEnabled, selectedDataSourceOption]);

  return {
    params,
    pageStatus,
    pagination: data?.pagination,
    /**
     * Data of the current page
     */
    deployedModels,
    allExternalConnectors: data?.allExternalConnectors,
    reload,
    searchByStatus,
    searchByNameOrId,
    searchBySource,
    searchByConnector,
    resetSearch,
    handleTableChange,
  };
};
