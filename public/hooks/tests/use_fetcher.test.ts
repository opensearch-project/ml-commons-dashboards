/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { useFetcher } from '../use_fetcher';

describe('useFetcher', () => {
  it('should call fetcher with consistent params and return consistent result', async () => {
    const data = { foo: 'bar' };
    const fetcher = jest.fn((_arg1: string) => Promise.resolve(data));
    const { result, waitFor } = renderHook(() => useFetcher(fetcher, 'foo'));

    await waitFor(() => result.current.data !== null);
    expect(result.current.data).toBe(data);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('foo');
  });

  it('should call fetcher only onece if params content not change', async () => {
    const fetcher = jest.fn((_arg1: any) => Promise.resolve());
    const { result, waitFor, rerender } = renderHook(({ params }) => useFetcher(fetcher, params), {
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
});
