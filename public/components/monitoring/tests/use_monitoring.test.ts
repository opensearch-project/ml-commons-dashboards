/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';

import { ModelDeployedProfile } from '../../../apis/profile';
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
  it('should return "loading" for pageStatus when loading and back to "normal" when loaded', async () => {
    let resolveFn: Function;
    const promise = new Promise<ModelDeployedProfile[]>((resolve) => {
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

  it('should return consistent pageStatus and data after name and state filter applyed', async () => {
    const { result, waitForValueToChange, waitFor } = renderHook(() => useMonitoring());

    act(() => {
      result.current.searchByName('foo');
    });

    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('reset-filter');
    expect(result.current.deployedModels).toEqual([]);

    act(() => {
      result.current.searchByName('moDel');
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ name: expect.stringContaining('model') }),
    ]);

    act(() => {
      result.current.searchByState(['partial-responding']);
    });
    await waitForValueToChange(() => result.current.pageStatus);
    expect(result.current.pageStatus).toBe('normal');
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ state: 'partial-responding' }),
    ]);

    act(() => {
      result.current.searchByState(['responding']);
    });
    await waitFor(() => result.current.pageStatus === 'reset-filter');
    expect(result.current.pageStatus).toBe('reset-filter');
    expect(result.current.deployedModels).toEqual([]);

    act(() => {
      result.current.clearNameStateFilter();
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
    expect(result.current.params.sort).toBe('name-asc');

    mockMultiRecords();
    act(() => {
      result.current.handleTableChange({
        sort: 'name-desc',
        pagination: { currentPage: 1, pageSize: 15 },
      });
    });
    await waitForValueToChange(() => result.current.deployedModels);
    expect(result.current.deployedModels).toEqual([
      expect.objectContaining({ id: 'model-2-id' }),
      expect.objectContaining({ id: 'model-1-id' }),
    ]);
    expect(result.current.params.sort).toBe('name-desc');
  });

  it('should return consistent data after pagination change', async () => {
    mockMultiRecords();
    const { result, waitFor, waitForValueToChange } = renderHook(() => useMonitoring());
    act(() => {
      result.current.handleTableChange({
        pagination: { currentPage: 1, pageSize: 1 },
        sort: 'name-asc',
      });
    });
    await waitFor(() => result.current.deployedModels.length === 1);
    expect(result.current.deployedModels).toEqual([expect.objectContaining({ id: 'model-1-id' })]);

    mockMultiRecords();
    act(() => {
      result.current.handleTableChange({
        pagination: { currentPage: 2, pageSize: 1 },
        sort: 'name-asc',
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
});
