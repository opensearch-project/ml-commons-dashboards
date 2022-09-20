import { useCallback, useEffect, useRef, useState } from 'react';

export const useFetcher = <TParams extends Array<any>, TResponse>(
  fetcher: (...params: TParams) => Promise<TResponse>,
  ...params: TParams
) => {
  const [count, setCount] = useState(0);
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

  const forceUpdate = useCallback(() => {
    setCount((prevCount) => (prevCount === Number.MAX_SAFE_INTEGER ? 0 : prevCount + 1));
  }, []);

  const loadData = useCallback(
    async (params: TParams, shouldUpdateResult: () => boolean = () => true) => {
      loadingRef.current = true;
      usedRef.current.loading && forceUpdate();
      let shouldUpdate = false;
      try {
        const data = await fetcher(...params);
        shouldUpdate = shouldUpdateResult();

        if (shouldUpdate) {
          dataRef.current = data;
          errorRef.current = null;
        }
      } catch (e) {
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
    [forceUpdate]
  );

  const reload = useCallback(() => {
    loadData(paramsRef.current);
  }, []);

  useEffect(() => {
    let changed = false;
    loadData(JSON.parse(stringifyParams), () => !changed);
    return () => {
      changed = true;
    };
  }, [stringifyParams]);

  return Object.defineProperties(
    {
      data: dataRef.current,
      loading: loadingRef.current,
      error: errorRef.current,
      reload,
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
