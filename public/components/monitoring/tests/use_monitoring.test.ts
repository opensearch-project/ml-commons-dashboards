/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { ModelDeploymentProfile } from '../../../apis/profile';
import { APIProvider } from '../../../apis/api_provider';
import { useMonitoring } from '../use_monitoring';

jest.mock('../../../apis/profile');

const mockMultiRecords = () => {
  jest.spyOn(APIProvider.getAPI('profile'), 'getAllDeployedModels').mockResolvedValueOnce([
    {
      id: 'model-1-id',
      name: 'model-1-name',
      target_node_ids: ['node-1', 'node-2', 'node-3'],
      deployed_node_ids: ['node-1', 'node-2'],
      not_deployed_node_ids: ['node-3'],
    },
    {
      id: 'model-2-id',
      name: 'model-2-name',
      target_node_ids: ['node-1', 'node-2', 'node-3'],
      deployed_node_ids: ['node-1', 'node-2', 'node-3'],
      not_deployed_node_ids: [],
    },
  ]);
};

describe('useMonitoring', () => {
  it('should return "loading" for pageStatus if data loading and will back to "normal" after data loaded', async () => {
    let resolveFn: Function;
    const promise = new Promise<ModelDeploymentProfile[]>((resolve) => {
      resolveFn = () => {
        resolve([
          {
            id: 'model-1-id',
            name: 'model-1-name',
            target_node_ids: ['node-1', 'node-2', 'node-3'],
            deployed_node_ids: ['node-1', 'node-2'],
            not_deployed_node_ids: ['node-3'],
          },
        ]);
      };
    });
    jest.spyOn(APIProvider.getAPI('profile'), 'getAllDeployedModels').mockReturnValueOnce(promise);
    const { result } = renderHook(() => useMonitoring());

    expect(result.current.pageStatus).toBe('loading');

    await act(async () => {
      resolveFn!();
      await promise;
    });

    expect(result.current.pageStatus).toBe('normal');
  });

  it('should return consistent pageStatus and data after nameOrId and status filter applied', async () => {
    const { result, waitForValueToChange, waitFor } = renderHook(() => useMonitoring());

    act(() => {
      result.current.searchByNameOrId('foo');
    });

    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('reset-filter');
    expect(result.current.deployedModels).toEqual([]);

    act(() => {
      result.current.searchByNameOrId('moDel');
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ name: expect.stringContaining('model') }),
    ]);

    act(() => {
      result.current.searchByNameOrId('1-id');
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ id: expect.stringContaining('model-1-id') }),
    ]);

    act(() => {
      result.current.searchByStatus(['partial-responding']);
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ status: 'partial-responding' }),
    ]);

    act(() => {
      result.current.searchByStatus(['responding']);
    });
    await waitFor(() => result.current.pageStatus === 'reset-filter');
    expect(result.current.pageStatus).toBe('reset-filter');
    expect(result.current.deployedModels).toEqual([]);

    act(() => {
      result.current.resetSearch();
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([expect.objectContaining({ id: 'model-1-id' })]);

    jest.spyOn(APIProvider.getAPI('profile'), 'getAllDeployedModels').mockResolvedValueOnce([]);

    act(() => {
      result.current.reload();
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('empty');
  });

  it('should return consistent data after order change', async () => {
    mockMultiRecords();
    const { result, waitFor, waitForValueToChange } = renderHook(() => useMonitoring());

    await waitFor(() => result.current.deployedModels.length > 0);
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ id: 'model-1-id' }),
      expect.objectContaining({ id: 'model-2-id' }),
    ]);
    expect(result.current.params.sort).toEqual({ field: 'name', direction: 'asc' });

    mockMultiRecords();
    act(() => {
      result.current.handleTableChange({
        sort: { field: 'name', direction: 'desc' },
        pagination: { currentPage: 1, pageSize: 15 },
      });
    });
    await waitForValueToChange(() => result.current.deployedModels);
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ id: 'model-2-id' }),
      expect.objectContaining({ id: 'model-1-id' }),
    ]);
    expect(result.current.params.sort).toEqual({ field: 'name', direction: 'desc' });
  });

  it('should return consistent data after pagination change', async () => {
    mockMultiRecords();
    const { result, waitFor, waitForValueToChange } = renderHook(() => useMonitoring());
    act(() => {
      result.current.handleTableChange({
        pagination: { currentPage: 1, pageSize: 1 },
        sort: { field: 'name', direction: 'asc' },
      });
    });
    await waitFor(() => result.current.deployedModels.length === 1);
    expect(result.current.deployedModels).toEqual([expect.objectContaining({ id: 'model-1-id' })]);

    mockMultiRecords();
    act(() => {
      result.current.handleTableChange({
        pagination: { currentPage: 2, pageSize: 1 },
        sort: { field: 'name', direction: 'asc' },
      });
    });
    await waitForValueToChange(() => result.current.deployedModels);
    expect(result.current.deployedModels).toEqual([expect.objectContaining({ id: 'model-2-id' })]);
  });

  it('should return consistent data after model update', async () => {
    const { result, waitFor } = renderHook(() => useMonitoring());
    await waitFor(() => result.current.deployedModels.length > 0);
    act(() => {
      result.current.updateDeployedModel({
        id: 'model-1-id',
        name: 'model-1-name',
        target_node_ids: ['node-1', 'node-2', 'node-3'],
        deployed_node_ids: ['node-1', 'node-2', 'node-3'],
        not_deployed_node_ids: [],
      });
    });
    expect(result.current.deployedModels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ deployed_node_ids: ['node-1', 'node-2', 'node-3'] }),
      ])
    );
  });

  it('should call getAllDeployedModels twice after reload called', async () => {
    jest.spyOn(APIProvider.getAPI('profile'), 'getAllDeployedModels').mockClear();
    const { result, waitFor, waitForValueToChange } = renderHook(() => useMonitoring());
    await waitFor(() => result.current.deployedModels.length > 0);
    expect(APIProvider.getAPI('profile').getAllDeployedModels).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reload();
    });
    await waitForValueToChange(() => result.current.deployedModels);
    expect(APIProvider.getAPI('profile').getAllDeployedModels).toHaveBeenCalledTimes(2);
  });

  it('should return consistent statusFilterOptions', async () => {
    mockMultiRecords();
    const { result, waitFor, waitForValueToChange } = renderHook(() => useMonitoring());
    await waitFor(() => result.current.deployedModels.length > 0);

    expect(result.current.statusFilterOptions).toEqual([
      { value: 'responding', checked: undefined },
      { value: 'partial-responding', checked: undefined },
    ]);

    mockMultiRecords();
    act(() => {
      result.current.searchByStatus(['partial-responding']);
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.statusFilterOptions).toEqual([
      { value: 'responding', checked: undefined },
      { value: 'partial-responding', checked: 'on' },
    ]);

    mockMultiRecords();
    act(() => {
      result.current.searchByNameOrId('not-exists-model');
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.statusFilterOptions).toEqual([]);

    mockMultiRecords();
    act(() => {
      result.current.searchByNameOrId('1-name');
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.statusFilterOptions).toEqual([
      { value: 'partial-responding', checked: 'on' },
    ]);

    mockMultiRecords();
    act(() => {
      result.current.resetSearch();
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.statusFilterOptions).toEqual([
      { value: 'responding', checked: undefined },
      { value: 'partial-responding', checked: undefined },
    ]);
  });
});
