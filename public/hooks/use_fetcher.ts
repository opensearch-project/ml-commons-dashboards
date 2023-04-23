/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const useFetcher = <TParams extends any[], TResponse>(
  fetcher: (...params: TParams) => Promise<TResponse>,
  ...params: TParams
) => {
  const [, setCount] = useState(0);
  const dataRef = useRef<TResponse | null>(null);
  const loadingRef = useRef(true);
  const errorRef = useRef<unknown | null>(null);
  const usedRef = useRef({
    data: false,
    loading: false,
    error: false,
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const stringifyParams = JSON.stringify(params);
  const lastLoadStringifyParamsRef = useRef<string>();

  const forceUpdate = useCallback(() => {
    setCount((prevCount) => (prevCount === Number.MAX_SAFE_INTEGER ? 0 : prevCount + 1));
  }, []);

  const loadData = useCallback(
    async (fetcherParams: TParams, shouldUpdateResult: () => boolean = () => true) => {
      const shouldUpdateLoading = loadingRef.current !== true;
      loadingRef.current = true;
      if (shouldUpdateLoading && usedRef.current.loading) {
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
    loadData(paramsRef.current);
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
    let changed = false;
    lastLoadStringifyParamsRef.current = stringifyParams;
    loadData(JSON.parse(stringifyParams), () => !changed);
    return () => {
      changed = true;
    };
  }, [stringifyParams, loadData]);

  if (stringifyParams !== lastLoadStringifyParamsRef.current) {
    loadingRef.current = true;
  }

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
