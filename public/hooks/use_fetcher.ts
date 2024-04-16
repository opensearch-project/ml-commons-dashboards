/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const DO_NOT_FETCH = Symbol('DO_NOT_FETCH');

export type DoNotFetchParams = [typeof DO_NOT_FETCH];

const isDoNotFetch = (test: string | any[] | DoNotFetchParams): test is DoNotFetchParams =>
  test[0] === DO_NOT_FETCH;

export const useFetcher = <TParams extends any[], TResponse>(
  fetcher: (...params: TParams) => Promise<TResponse>,
  ...params: TParams | [typeof DO_NOT_FETCH]
) => {
  const [, setCount] = useState(0);
  const dataRef = useRef<TResponse | null>(null);
  const loadingRef = useRef(!isDoNotFetch(params));
  const errorRef = useRef<unknown | null>(null);
  const usedRef = useRef({
    data: false,
    loading: false,
    error: false,
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const paramsKey = isDoNotFetch(params) ? params : JSON.stringify(params);

  const forceUpdate = useCallback(() => {
    setCount((prevCount) => (prevCount === Number.MAX_SAFE_INTEGER ? 0 : prevCount + 1));
  }, []);

  const loadData = useCallback(
    async (fetcherParams: TParams, shouldUpdateResult: () => boolean = () => true) => {
      loadingRef.current = true;
      if (usedRef.current.loading) {
        forceUpdate();
      }
      let shouldUpdate = false;
      try {
        const data = await fetcher(...fetcherParams);
        shouldUpdate = shouldUpdateResult();

        if (shouldUpdate) {
          dataRef.current = data;
          errorRef.current = null;
        }
      } catch (e) {
        shouldUpdate = shouldUpdateResult();
        if (shouldUpdate) {
          errorRef.current = e;
          dataRef.current = null;
        }
      } finally {
        loadingRef.current = false;
        if (
          usedRef.current.loading ||
          (shouldUpdate && (usedRef.current.data || usedRef.current.error))
        ) {
          forceUpdate();
        }
      }
    },
    [forceUpdate, fetcher]
  );

  const reload = useCallback(() => {
    if (!isDoNotFetch(paramsRef.current)) {
      loadData(paramsRef.current);
    }
  }, [loadData]);

  const update = useCallback(
    (data: TResponse | null) => {
      dataRef.current = data;
      forceUpdate();
    },
    [forceUpdate]
  );

  const mutate = useCallback(
    async (updateFunction: (prevData: TResponse | null) => TResponse | null) => {
      update(updateFunction(dataRef.current));
    },
    [update]
  );

  useEffect(() => {
    if (isDoNotFetch(paramsKey)) {
      return;
    }
    let changed = false;
    loadData(JSON.parse(paramsKey), () => !changed);
    return () => {
      changed = true;
    };
  }, [paramsKey, loadData]);

  return Object.defineProperties(
    {
      data: dataRef.current,
      loading: loadingRef.current,
      error: errorRef.current,
      reload,
      update,
      mutate,
    },
    {
      data: {
        get() {
          usedRef.current.data = true;
          return dataRef.current;
        },
      },
      loading: {
        get() {
          usedRef.current.loading = true;
          return loadingRef.current;
        },
      },
      error: {
        get() {
          usedRef.current.error = true;
          return errorRef.current;
        },
      },
    }
  );
};
