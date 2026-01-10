/**
 * Custom hook for data fetching with caching, loading states, and error handling.
 * A lightweight alternative to React Query for simpler use cases.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createComponentLogger } from '@/lib/logger';

const log = createComponentLogger('useAsyncData');

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isRefreshing: boolean;
}

interface UseAsyncDataOptions<T> {
  /** Initial data before fetch completes */
  initialData?: T;
  /** Cache key for storing results */
  cacheKey?: string;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
  /** Callback on successful fetch */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Whether to retry on error */
  retry?: boolean;
  /** Number of retry attempts */
  retryCount?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
}

interface UseAsyncDataReturn<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T | ((prev: T | null) => T)) => void;
  reset: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCached<T>(key: string, duration: number): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData = null,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    fetchOnMount = true,
    deps = [],
    onSuccess,
    onError,
    retry = true,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncState<T>>(() => {
    // Try to get cached data on initial render
    const cached = cacheKey ? getCached<T>(cacheKey, cacheDuration) : null;
    return {
      data: cached ?? (initialData as T | null),
      isLoading: !cached && fetchOnMount,
      error: null,
      isRefreshing: false,
    };
  });

  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        isLoading: !isRefresh && !prev.data,
        isRefreshing: isRefresh,
        error: null,
      }));

      let lastError: Error | null = null;
      const attempts = retry ? retryCount : 1;

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          const data = await fetcherRef.current();

          if (!mountedRef.current) return;

          if (cacheKey) {
            setCache(cacheKey, data);
          }

          setState({
            data,
            isLoading: false,
            error: null,
            isRefreshing: false,
          });

          onSuccess?.(data);
          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (attempt < attempts - 1) {
            log.debug(`Retry attempt ${attempt + 1}/${attempts}`, { cacheKey });
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }

      if (!mountedRef.current) return;

      log.error('Fetch failed', lastError, { cacheKey });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: lastError,
      }));

      onError?.(lastError!);
    },
    [cacheKey, cacheDuration, retry, retryCount, retryDelay, onSuccess, onError]
  );

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const mutate = useCallback(
    (dataOrUpdater: T | ((prev: T | null) => T)) => {
      setState((prev) => {
        const newData =
          typeof dataOrUpdater === 'function'
            ? (dataOrUpdater as (prev: T | null) => T)(prev.data)
            : dataOrUpdater;

        if (cacheKey) {
          setCache(cacheKey, newData);
        }

        return { ...prev, data: newData };
      });
    },
    [cacheKey]
  );

  const reset = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    setState({
      data: initialData as T | null,
      isLoading: false,
      error: null,
      isRefreshing: false,
    });
  }, [cacheKey, initialData]);

  // Fetch on mount
  useEffect(() => {
    mountedRef.current = true;

    if (fetchOnMount) {
      // Check cache first
      const cached = cacheKey ? getCached<T>(cacheKey, cacheDuration) : null;
      if (!cached) {
        fetchData();
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchOnMount, cacheKey, cacheDuration, ...deps]);

  return {
    ...state,
    refetch,
    mutate,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data: T | null, error: Error | null, variables: V) => void;
}

interface UseMutationReturn<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  mutateAsync: (variables: V) => Promise<T>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  reset: () => void;
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await mutationFn(variables);
        setState({ data, error: null, isLoading: false });
        onSuccess?.(data, variables);
        onSettled?.(data, null, variables);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, isLoading: false });
        onError?.(error, variables);
        onSettled?.(null, error, variables);
        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      try {
        return await mutateAsync(variables);
      } catch {
        return null;
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

/**
 * Hook for infinite/paginated data loading
 */
interface UseInfiniteDataOptions<T> {
  pageSize?: number;
  cacheKey?: string;
}

interface UseInfiniteDataReturn<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteData<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseInfiniteDataOptions<T> = {}
): UseInfiniteDataReturn<T> {
  const { pageSize = 20 } = options;

  const [state, setState] = useState<{
    data: T[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: Error | null;
    hasMore: boolean;
    page: number;
  }>({
    data: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    hasMore: true,
    page: 0,
  });

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      setState((prev) => ({
        ...prev,
        isLoading: !append,
        isLoadingMore: append,
        error: null,
      }));

      try {
        const result = await fetcher(page, pageSize);

        setState((prev) => ({
          ...prev,
          data: append ? [...prev.data, ...result.data] : result.data,
          hasMore: result.hasMore,
          isLoading: false,
          isLoadingMore: false,
          page,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error(String(err)),
          isLoading: false,
          isLoadingMore: false,
        }));
      }
    },
    [fetcher, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return;
    await fetchPage(state.page + 1, true);
  }, [fetchPage, state.page, state.isLoadingMore, state.hasMore]);

  const refetch = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      isLoading: true,
      isLoadingMore: false,
      error: null,
      hasMore: true,
      page: 0,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPage(0);
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    refetch,
    reset,
  };
}

// Cache management utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  delete: (key: string) => cache.delete(key),
  has: (key: string) => cache.has(key),
  invalidatePattern: (pattern: RegExp) => {
    for (const key of cache.keys()) {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    }
  },
};
