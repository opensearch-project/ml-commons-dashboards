/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { Model, ModelSearchResponse } from '../../../apis/model';
import { useMonitoring } from '../use_monitoring';

jest.mock('../../../apis/connector');

const mockEmptyRecords = () =>
  jest.spyOn(Model.prototype, 'search').mockResolvedValueOnce({
    data: [],
    total_models: 0,
  });

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.spyOn(Model.prototype, 'search').mockResolvedValue({
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
      total_models: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call search API with consistent nameOrId and states after filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');

    result.current.searchByNameOrId('foo');
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['DEPLOY_FAILED', 'DEPLOYED', 'PARTIALLY_DEPLOYED'],
        })
      )
    );

    result.current.searchByStatus(['responding']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['DEPLOYED'],
        })
      )
    );

    result.current.resetSearch();
    await waitFor(() => result.current.pageStatus === 'normal');

    result.current.searchByStatus(['partial-responding']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          states: ['PARTIALLY_DEPLOYED'],
        })
      )
    );
  });

  it('should call search API with consistent sort and pagination after table change', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ['model_state-asc'],
          from: 0,
          size: 10,
        })
      )
    );

    result.current.handleTableChange({
      sort: { field: 'name', direction: 'desc' },
      pagination: { currentPage: 2, pageSize: 10 },
    });
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
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

    await waitFor(() => expect(Model.prototype.search).toHaveBeenCalledTimes(1));

    result.current.reload();
    await waitFor(() => expect(Model.prototype.search).toHaveBeenCalledTimes(2));
  });

  it('should return consistent deployedModels', async () => {
    jest.spyOn(Model.prototype, 'search').mockRestore();
    const searchMock = jest.spyOn(Model.prototype, 'search').mockResolvedValue({
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
      total_models: 2,
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

  it('should call searchByNameOrId with from 0 after page changed', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    result.current.handleTableChange({
      pagination: {
        currentPage: 2,
        pageSize: 15,
      },
    });

    await waitFor(() => {
      expect(result.current.pagination?.currentPage).toBe(2);
    });

    result.current.searchByNameOrId('foo');

    await waitFor(() => {
      expect(Model.prototype.search).toHaveBeenCalledTimes(3);
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: 0,
        })
      );
    });
  });

  it('should call searchByStatus with from 0 after page changed', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    result.current.handleTableChange({
      pagination: {
        currentPage: 2,
        pageSize: 15,
      },
    });

    await waitFor(() => {
      expect(result.current.pagination?.currentPage).toBe(2);
    });

    result.current.searchByStatus(['responding']);

    await waitFor(() => {
      expect(Model.prototype.search).toHaveBeenCalledTimes(3);
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: 0,
        })
      );
    });
  });

  it('should call search API with consistent extraQuery after source filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');

    result.current.searchBySource(['local']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
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

    result.current.searchBySource(['external']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
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

    result.current.searchBySource(['external', 'local']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: undefined,
        })
      )
    );
  });

  it('should call search API with consistent extraQuery after connector filter applied', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.pageStatus === 'normal');

    result.current.searchByConnector(['External Connector 1']);
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenLastCalledWith(
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
});

describe('useMonitoring.pageStatus', () => {
  it("should return 'loading' if data loading and will back to 'normal' after data loaded", async () => {
    let resolveFn: Function;
    const promise = new Promise<ModelSearchResponse>((resolve) => {
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
          total_models: 1,
        });
      };
    });
    jest.spyOn(Model.prototype, 'search').mockReturnValueOnce(promise);
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
    result.current.searchByNameOrId('foo');
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by status but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    result.current.searchByStatus(['responding']);
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by source but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    result.current.searchBySource(['local']);
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'reset-filter' when filter by connector but no result was found", async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    // Page status is normal for the initial run(search returns mocked results)
    await waitFor(() => expect(result.current.pageStatus).toBe('normal'));

    // assume result is empty
    mockEmptyRecords();
    result.current.searchByConnector([{ name: 'Sagemaker', ids: [] }]);
    await waitFor(() => expect(result.current.pageStatus).toBe('reset-filter'));
  });

  it("should return 'empty' if empty data return", async () => {
    mockEmptyRecords();
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => expect(result.current.pageStatus).toBe('empty'));
  });
});
