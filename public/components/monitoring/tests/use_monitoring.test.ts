/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { ModelSearchItem, Model, ModelSearchResponse } from '../../../apis/model';
import { useMonitoring } from '../use_monitoring';

jest.mock('../../../apis/model');

const mockEmptyRecords = () =>
  jest.spyOn(Model.prototype, 'search').mockResolvedValueOnce({
    data: [],
    pagination: {
      currentPage: 0,
      pageSize: 15,
      totalRecords: 0,
      totalPages: 0,
    },
  });

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.spyOn(Model.prototype, 'search').mockResolvedValueOnce({
      data: [
        {
          id: 'model-1-id',
          name: 'model-1-name',
          current_worker_node_count: 1,
          planning_worker_node_count: 3,
          algorithm: '',
          model_state: '',
          model_version: '',
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 15,
        totalRecords: 1,
        totalPages: 1,
      },
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
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['LOAD_FAILED', 'LOADED', 'PARTIAL_LOADED'],
        })
      )
    );

    act(() => {
      result.current.searchByStatus(['responding']);
    });
    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOrId: 'foo',
          states: ['LOADED'],
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
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          states: ['PARTIAL_LOADED'],
        })
      )
    );
  });

  it('should call search API with consistent sort and pagination after table change', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() =>
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ['name-asc'],
          currentPage: 1,
          pageSize: 10,
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
      expect(Model.prototype.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ['name-desc'],
          currentPage: 2,
          pageSize: 10,
        })
      )
    );
  });

  it('should call search API twice after reload called', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());

    await waitFor(() => expect(Model.prototype.search).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(Model.prototype.search).toHaveBeenCalledTimes(2));
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
              current_worker_node_count: 1,
              planning_worker_node_count: 3,
            } as ModelSearchItem,
          ],
          pagination: {
            currentPage: 1,
            pageSize: 15,
            totalRecords: 1,
            totalPages: 1,
          },
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
      expect(result.current.deployedModels).toEqual([
        {
          id: 'model-1-id',
          name: 'model-1-name',
          respondingNodesCount: 1,
          notRespondingNodesCount: 2,
          planningNodesCount: 3,
        },
      ])
    );
  });
});
