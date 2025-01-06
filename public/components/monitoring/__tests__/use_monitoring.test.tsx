/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import { ModelVersion, ModelVersionSearchResponse } from '../../../apis/model_version';
import { Connector } from '../../../apis/connector';
import { useMonitoring } from '../use_monitoring';
import {
  DataSourceContext,
  DataSourceContextProvider,
  DataSourceContextProviderProps,
  DataSourceOption,
} from '../../../contexts';

const setup = ({
  initDataSourceContextValue,
}: {
  initDataSourceContextValue?: Partial<DataSourceContextProviderProps['initialValue']>;
} = {}) => {
  let setSelectedDataSourceOption: (
    dataSourceOption: DataSourceOption | null | undefined
  ) => void = () => {};
  const DataSourceConsumer = () => {
    const context = useContext(DataSourceContext);
    setSelectedDataSourceOption = context.setSelectedDataSourceOption;
    return null;
  };
  const renderHookResult = renderHook(() => useMonitoring(), {
    wrapper: ({ children }) => (
      <DataSourceContextProvider
        initialValue={{
          dataSourceEnabled: false,
          selectedDataSourceOption: null,
          ...initDataSourceContextValue,
        }}
      >
        {children}
        <DataSourceConsumer />
      </DataSourceContextProvider>
    ),
  });

  return {
    renderHookResult,
    setSelectedDataSourceOption,
  };
};

jest.mock('../../../apis/connector');

const mockEmptyRecords = () =>
  jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValueOnce({
    data: [],
    total_model_versions: 0,
  });

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValue({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: '',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
        },
      ],
      total_model_versions: 500,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call search API with consistent nameOrId and states after filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');

    act(() => {
      result.current.searchByNameOrId('foo');
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['DEPLOY_FAILED', 'DEPLOYED', 'PARTIALLY_DEPLOYED'],
        })
      )
    );

    act(() => {
      result.current.searchByStatus(['responding']);
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['DEPLOYED'],
        })
      )
    );

    act(() => {
      result.current.resetSearch();
    });
    await waitFor(() => result.current.pageStatus === 'normal');

    act(() => {
      result.current.searchByStatus(['partial-responding']);
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          states: ['PARTIALLY_DEPLOYED'],
        })
      )
    );
  });

  it('should call search API with consistent sort and pagination after table change', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ['model_state-asc'],
          from: 0,
          size: 10,
        })
      )
    );

    act(() => {
      result.current.handleTableChange({
        sort: { field: 'name', direction: 'desc' },
        pagination: { currentPage: 2, pageSize: 10 },
      });
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ['name-desc'],
          from: 10,
          size: 10,
        })
      )
    );
  });

  it('should call search API twice after reload called', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(2));
  });

  it('should return consistent deployedModels', async () => {
    jest.spyOn(ModelVersion.prototype, 'search').mockRestore();
    const searchMock = jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValue({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: 'TEXT_EMBEDDING',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
        },
        {
          id: 'model-2-id',
          name: 'model-2-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: 'REMOTE',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
          connector_id: 'external-connector-1-id',
        },
        {
          id: 'model-3-id',
          name: 'model-3-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: 'REMOTE',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
          connector: {
            name: 'Internal Connector 1',
          },
        },
      ],
      total_model_versions: 3,
    });
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => {
      expect(result.current.deployedModels).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'model-1-id',
            name: 'model-1-name',
            respondingNodesCount: 1,
            notRespondingNodesCount: 2,
            planningNodesCount: 3,
            planningWorkerNodes: ['node1', 'node2', 'node3'],
          }),
          expect.objectContaining({
            connector: expect.objectContaining({
              name: 'External Connector 1',
            }),
          }),
          expect.objectContaining({
            connector: expect.objectContaining({
              name: 'Internal Connector 1',
            }),
          }),
        ])
      );
    });

    searchMock.mockRestore();
  });

  it('should return empty connector if connector id not exists in all connectors', async () => {
    jest.spyOn(ModelVersion.prototype, 'search').mockRestore();
    const searchMock = jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValue({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: 'REMOTE',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
          connector_id: 'not-exists-external-connector-id',
        },
      ],
      total_model_versions: 1,
    });
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => {
      expect(result.current.deployedModels).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            connector: {},
          }),
        ])
      );
    });

    searchMock.mockRestore();
  });

  it('should return empty connector if failed to load all external connectors', async () => {
    jest.spyOn(ModelVersion.prototype, 'search').mockRestore();
    const getAllExternalConnectorsMock = jest
      .spyOn(Connector.prototype, 'getAll')
      .mockImplementation(async () => {
        throw new Error();
      });
    const searchMock = jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValue({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: 'REMOTE',
          model_state: '',
          model_version: '',
          planning_worker_nodes: ['node1', 'node2', 'node3'],
          connector_id: 'not-exists-external-connector-id',
        },
      ],
      total_model_versions: 1,
    });
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => {
      expect(result.current.deployedModels).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            connector: {},
          }),
        ])
      );
    });

    searchMock.mockRestore();
    getAllExternalConnectorsMock.mockRestore();
  });

  it('should call searchByNameOrId with from 0 after page changed', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    act(() => {
      result.current.handleTableChange({
        pagination: {
          currentPage: 2,
          pageSize: 15,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.pagination?.currentPage).toBe(2);
    });

    act(() => {
      result.current.searchByNameOrId('foo');
    });

    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(3);
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: 0,
        })
      );
    });
  });

  it('should call searchByStatus with from 0 after page changed', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    act(() => {
      result.current.handleTableChange({
        pagination: {
          currentPage: 2,
          pageSize: 15,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.pagination?.currentPage).toBe(2);
    });

    act(() => {
      result.current.searchByStatus(['responding']);
    });

    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(3);
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: 0,
        })
      );
    });
  });

  it('should call search API with consistent extraQuery after source filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');

    act(() => {
      result.current.searchBySource(['local']);
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: {
            bool: {
              must_not: [
                {
                  term: {
                    algorithm: {
                      value: 'REMOTE',
                    },
                  },
                },
              ],
            },
          },
        })
      )
    );

    act(() => {
      result.current.searchBySource(['external']);
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: {
            bool: {
              must: [
                {
                  term: {
                    algorithm: {
                      value: 'REMOTE',
                    },
                  },
                },
              ],
            },
          },
        })
      )
    );

    act(() => {
      result.current.searchBySource(['external', 'local']);
    });
    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: undefined,
        })
      )
    );
  });

  it('should call search API with consistent extraQuery after connector filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');
    act(() => {
      result.current.searchByConnector(['External Connector 1']);
    });

    await waitFor(() =>
      expect(ModelVersion.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: {
            bool: {
              must: [
                {
                  bool: {
                    should: [
                      {
                        wildcard: {
                          'connector.name.keyword': {
                            value: '*External Connector 1*',
                            case_insensitive: true,
                          },
                        },
                      },
                      {
                        terms: {
                          'connector_id.keyword': ['external-connector-1-id'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
      )
    );

    await waitFor(() => result.current.pageStatus === 'normal');
  });

  it('should not call model search if selected data source is null', async () => {
    const {
      renderHookResult: { waitFor },
    } = setup({
      initDataSourceContextValue: {
        dataSourceEnabled: true,
        selectedDataSourceOption: null,
      },
    });
    await waitFor(() => {
      expect(ModelVersion.prototype.search).not.toHaveBeenCalled();
    });
  });

  it('should call model search and connector get all with data source id', async () => {
    const getAllConnectorMock = jest.spyOn(Connector.prototype, 'getAll');
    const {
      renderHookResult: { waitFor },
    } = setup({
      initDataSourceContextValue: {
        dataSourceEnabled: true,
        selectedDataSourceOption: { id: 'foo' },
      },
    });
    const dataSourceIdExpect = expect.objectContaining({
      dataSourceId: 'foo',
    });
    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalledWith(dataSourceIdExpect);
      expect(getAllConnectorMock).toHaveBeenCalledWith(dataSourceIdExpect);
    });
  });

  it('should reset connector filter and current page after data source change', async () => {
    const {
      renderHookResult: { result, waitFor },
      setSelectedDataSourceOption,
    } = setup({
      initDataSourceContextValue: {
        dataSourceEnabled: true,
        selectedDataSourceOption: { id: 'foo' },
      },
    });
    act(() => {
      result.current.searchByConnector(['connector-1']);
      result.current.handleTableChange({
        pagination: {
          currentPage: 2,
          pageSize: 50,
        },
      });
    });
    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(2);
      expect(result.current.params).toEqual(
        expect.objectContaining({
          currentPage: 2,
          connector: ['connector-1'],
        })
      );
    });
    act(() => {
      setSelectedDataSourceOption({ id: 'bar' });
    });
    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(3);
      expect(result.current.params.connector).toEqual([]);
      expect(result.current.params.currentPage).toEqual(1);
    });
  });

  it('should reset connectors, status, source and nameOrId filter after resetSearch called', async () => {
    const {
      renderHookResult: { result, waitFor },
    } = setup();
    act(() => {
      result.current.searchByNameOrId('foo');
      result.current.searchByConnector(['connector-1']);
      result.current.searchBySource(['local']);
      result.current.searchByStatus(['responding']);
    });
    expect(result.current.params).toEqual(
      expect.objectContaining({
        nameOrId: 'foo',
        connector: ['connector-1'],
        source: ['local'],
        status: ['responding'],
      })
    );
    act(() => {
      result.current.resetSearch();
    });
    await waitFor(() => {
      expect(result.current.params).toEqual(
        expect.objectContaining({
          nameOrId: '',
          connector: [],
          source: [],
          status: undefined,
        })
      );
      expect(ModelVersion.prototype.search).toHaveBeenCalledTimes(3);
    });
  });

  it('should reset to max page when current page greater than max page', async () => {
    const {
      renderHookResult: { result, waitFor },
    } = setup();
    await waitFor(() => {
      expect(ModelVersion.prototype.search).toHaveBeenCalled();
    });
    jest.spyOn(ModelVersion.prototype, 'search').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: [
                {
                  id: 'model-1-id',
                  name: 'model-1-name',
                  algorithm: 'TEXT_EMBEDDING',
                  model_state: 'DEPLOYED',
                  model_version: '1.0.0',
                  current_worker_node_count: 1,
                  planning_worker_node_count: 3,
                  planning_worker_nodes: ['node1', 'node2', 'node3'],
                },
              ],
              total_model_versions: 1,
            });
          }, 300);
        })
    );
    act(() => {
      result.current.handleTableChange({
        pagination: {
          currentPage: 2,
          pageSize: 50,
        },
      });
    });
    expect(result.current.params.currentPage).toEqual(2);
    await waitFor(() => {
      expect(result.current.params.currentPage).toEqual(1);
    });
  });
});

describe('useMonitoring.pageStatus', () => {
  it("should return 'loading' if data loading and will back to 'normal' after data loaded", async () => {
    let resolveFn: Function;
    const promise = new Promise<ModelVersionSearchResponse>((resolve) => {
      resolveFn = () => {
        resolve({
          data: [
            {
              id: 'model-1-id',
              name: 'model-1-name',
              algorithm: 'TEXT_EMBEDDING',
              model_state: 'DEPLOYED',
              model_version: '1.0.0',
              current_worker_node_count: 1,
              planning_worker_node_count: 3,
              planning_worker_nodes: ['node1', 'node2', 'node3'],
            },
          ],
          total_model_versions: 1,
        });
      };
    });
    jest.spyOn(ModelVersion.prototype, 'search').mockReturnValueOnce(promise);
    const { result } = renderHook(() => useMonitoring());

    expect(result.current.pageStatus).toBe('loading');

    await act(async () => {
      resolveFn!();
      await promise;
    });

    expect(result.current.pageStatus).toBe('normal');
  });

  it("should return 'reset-filter' when search by name or id but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // Mock search function to return empty result
    mockEmptyRecords();
    act(() => {
      result.current.searchByNameOrId('foo');
    });
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by status but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    act(() => {
      result.current.searchByStatus(['responding']);
    });
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by source but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    act(() => {
      result.current.searchBySource(['local']);
    });
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by connector but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    act(() => {
      result.current.searchByConnector(['Sagemaker']);
    });
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'empty' if empty data return", async () => {
    mockEmptyRecords();
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => expect(result.current.pageStatus).toBe('empty'));
  });

  it('should return "loading" and not call model search when data source id is fetching', async () => {
    const {
      renderHookResult: { result, waitFor },
    } = setup();

    await waitFor(() => {
      expect(result.current.pageStatus).toBe('loading');
    });
  });
});
