/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { ModelVersion, ModelVersionSearchResponse } from '../../../apis/model_version';
import { useMonitoring } from '../use_monitoring';

const mockEmptyRecords = () =>
  jest.spyOn(ModelVersion.prototype, 'search').mockResolvedValueOnce({
    data: [],
    total_models: 0,
  });

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.spyOn(ModelVersion.prototype, 'search');
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
          total_models: 1,
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

  it("should return 'empty' if empty data return", async () => {
    mockEmptyRecords();
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => expect(result.current.pageStatus).toBe('empty'));
  });

  it('should return consistent deployedModels', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() =>
      expect(result.current.deployedModels[0]).toEqual({
        id: '1',
        name: 'model1',
        respondingNodesCount: 1,
        planningNodesCount: 3,
        notRespondingNodesCount: 2,
        planningWorkerNodes: ['node1', 'node2', 'node3'],
      })
    );
  });
});
