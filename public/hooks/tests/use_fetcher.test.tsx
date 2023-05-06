/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

import { act, renderHook } from '@testing-library/react-hooks';
import { DO_NOT_FETCH, useFetcher } from '../use_fetcher';
import { render, waitFor } from '../../../test/test_utils';

describe('useFetcher', () => {
  it('should call fetcher with consistent params and return consistent result', async () => {
    const data = { foo: 'bar' };
    const fetcher = jest.fn((_arg1: string) => Promise.resolve(data));
    const { result } = renderHook(() => useFetcher(fetcher, 'foo'));

    await waitFor(() => result.current.data !== null);
    expect(result.current.data).toBe(data);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('foo');
  });

  it('should call fetcher only once if params content not change', async () => {
    const fetcher = jest.fn((_arg1: any) => Promise.resolve());
    const { result, rerender } = renderHook(({ params }) => useFetcher(fetcher, params), {
      initialProps: { params: { foo: 'bar' } },
    });

    await waitFor(() => result.current.data !== null);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => {
      rerender({ params: { foo: 'foo' } });
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => {
      rerender({ params: { foo: 'foo' } });
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should return consistent loading state', async () => {
    let resolveFn: Function;
    const fetcherResult = new Promise((resolve) => {
      resolveFn = resolve;
    });
    const fetcher = jest.fn(() => fetcherResult);
    const { result } = renderHook(() => useFetcher(fetcher));

    expect(result.current.loading).toBe(true);
    await act(async () => {
      resolveFn();
      await fetcherResult;
    });
    expect(result.current.loading).toBe(false);
  });

  it('should return consistent error state', async () => {
    let rejectFn: Function;
    const rejectedError = new Error();
    const fetcherResult = new Promise((_resolve, reject) => {
      rejectFn = () => {
        reject(rejectedError);
      };
    });
    const fetcher = jest.fn(() => fetcherResult);
    const { result } = renderHook(() => useFetcher(fetcher));

    expect(result.current.error).toBe(null);
    await act(async () => {
      rejectFn(rejectedError);
    });
    expect(result.current.error).toBe(rejectedError);
  });

  it('should return consistent result after params change', async () => {
    let fooResolveFn: Function;
    let barResolveFn: Function;
    const fooResult = new Promise((resolve) => {
      fooResolveFn = () => {
        resolve('foo');
      };
    });
    const barResult = new Promise((resolve) => {
      barResolveFn = () => {
        resolve('bar');
      };
    });
    const fetcher = jest.fn((id: 'foo' | 'bar') => ({ foo: fooResult, bar: barResult }[id]));
    const { result, rerender } = renderHook(
      ({ id }: { id: 'foo' | 'bar' }) => useFetcher(fetcher, id),
      {
        initialProps: { id: 'foo' },
      }
    );
    expect(result.current.data).toBeNull();
    await act(async () => {
      rerender({ id: 'bar' });
      barResolveFn();
      await barResult;
    });
    expect(result.current.data).toBe('bar');
    await act(async () => {
      fooResolveFn();
      await fooResult;
    });
    expect(result.current.data).toBe('bar');
  });

  it('should return consistent updated data', async () => {
    const fetcher = () => Promise.resolve('foo');

    const { result } = renderHook(() => useFetcher(fetcher));

    await waitFor(() => result.current.data === 'foo');
    await act(async () => {
      result.current.update('bar');
    });

    expect(result.current.data).toBe('bar');
  });

  it('should return consistent mutated data', async () => {
    const fetcher = () => Promise.resolve('foo');

    const { result } = renderHook(() => useFetcher(fetcher));

    await waitFor(() => result.current.data === 'foo');

    await act(async () => {
      result.current.mutate((prev) => (prev === 'foo' ? 'bar' : prev));
    });

    expect(result.current.data).toBe('bar');
  });

  it('should not call fetcher when first parameter is DO_NOT_FETCH', () => {
    const fetcher = jest.fn();
    const { result } = renderHook(() => useFetcher(fetcher, DO_NOT_FETCH));

    expect(result.current.loading).toBe(false);
    expect(fetcher).not.toHaveBeenCalledWith();
  });

  it('should not call fetcher after reload called when first parameter is DO_NOT_FETCH', () => {
    const fetcher = jest.fn();
    const { result } = renderHook(() => useFetcher(fetcher, DO_NOT_FETCH));

    result.current.reload();
    expect(result.current.loading).toBe(false);
    expect(fetcher).not.toHaveBeenCalledWith();
  });

  it('should call fetcher after first parameter changed from DO_NOT_FETCH', async () => {
    const fetcher = jest.fn(async (...params) => params);
    const { result, rerender, waitFor: hookWaitFor } = renderHook(
      ({ params }) => useFetcher(fetcher, ...params),
      {
        initialProps: {
          params: [DO_NOT_FETCH],
        },
      }
    );

    rerender({ params: [] });
    expect(result.current.loading).toBe(true);
    expect(fetcher).toHaveBeenCalled();

    await hookWaitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);
    });
  });

  it('should return loading true immediately after params change', async () => {
    const testLoadingFetcher = (payload: string) => Promise.resolve(payload);
    const loadingAndParams: Array<[boolean, string]> = [];
    const collectLoadingAndParams = (loading: boolean, params: string) => {
      loadingAndParams.push([loading, params]);
    };

    const TestLoading = ({
      params,
      onRender,
    }: {
      params: string;
      onRender: (loading: boolean, params: string) => void;
    }) => {
      const { loading } = useFetcher(testLoadingFetcher, params);
      onRender(loading, params);
      return <>{loading.toString()}</>;
    };

    const { getByText, rerender } = render(
      <TestLoading params="foo" onRender={collectLoadingAndParams} />
    );
    await waitFor(() => {
      expect(getByText('false')).toBeInTheDocument();
    });
    rerender(<TestLoading params="bar" onRender={collectLoadingAndParams} />);
    await waitFor(() => {
      expect(getByText('false')).toBeInTheDocument();
    });

    expect(loadingAndParams).toEqual([
      [true, 'foo'], // For first rendering
      [false, 'foo'], // For first data load complete
      [true, 'bar'], // For params modified rendering
      [false, 'bar'], // For params modified data load complete
    ]);
  });

  it('should return loading true after params changed and not response', async () => {
    jest.useFakeTimers();

    const fetcher = jest.fn(
      (params: string) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(params);
          }, 1000);
        })
    );
    const { result, rerender } = renderHook(({ params }) => useFetcher(fetcher, params), {
      initialProps: { params: 'foo' },
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(500);
      rerender({ params: 'bar' });
    });

    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current.loading).toBe(true);

    jest.useRealTimers();
  });
});
