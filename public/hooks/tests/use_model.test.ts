/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { Model, ModelSearchResponse } from '../../apis/model';
import { useModel } from '../use_model';

describe('useModel hook', () => {
  const FAKE_DATA = {
    data: [{ id: 'C7jN0YQBjgpeQQ_RmiDE', name: 'all-MiniLM-L6-v2' }],
    pagination: { currentPage: 1, pageSize: 1, totalRecords: 1, totalPages: 1 },
  } as ModelSearchResponse;

  const fakeSuccessfulSearch = () => {
    return new Promise<ModelSearchResponse>((resolve) => {
      setTimeout(() => resolve(FAKE_DATA), 1000);
    });
  };

  const fakeFailedSearch = () => {
    return new Promise<ModelSearchResponse>((_, reject) => {
      setTimeout(() => reject(new Error()), 1000);
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the target model', async () => {
    jest.useFakeTimers();
    jest.spyOn(Model.prototype, 'search').mockImplementation(fakeSuccessfulSearch);

    const result = renderHook(() => useModel('C7jN0YQBjgpeQQ_RmiDE'));
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.result.current.data).toEqual({
        id: 'C7jN0YQBjgpeQQ_RmiDE',
        name: 'all-MiniLM-L6-v2',
      });
    });

    jest.useRealTimers();
  });

  it('should return loading: true initially and loading: false when model search succeed', async () => {
    jest.useFakeTimers();
    jest.spyOn(Model.prototype, 'search').mockImplementation(fakeSuccessfulSearch);

    const result = renderHook(() => useModel('C7jN0YQBjgpeQQ_RmiDE'));
    expect(result.result.current.loading).toBe(true);

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(result.result.current.loading).toBe(false);
    });

    jest.useRealTimers();
  });

  it('should return loading: true initially and loading: false when model search failed', async () => {
    jest.useFakeTimers();
    jest.spyOn(Model.prototype, 'search').mockImplementation(fakeFailedSearch);

    const result = renderHook(() => useModel('C7jN0YQBjgpeQQ_RmiDE'));
    expect(result.result.current.loading).toBe(true);

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(result.result.current.loading).toBe(false);
    });

    jest.useRealTimers();
  });

  it('should return error when search failed', async () => {
    jest.useFakeTimers();
    jest.spyOn(Model.prototype, 'search').mockImplementation(fakeFailedSearch);

    const result = renderHook(() => useModel('C7jN0YQBjgpeQQ_RmiDE'));
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(result.result.current.error).not.toBeUndefined();
    });

    jest.useRealTimers();
  });
});
