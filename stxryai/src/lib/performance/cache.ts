// Client-Side Caching Utilities
// Simple in-memory and localStorage caching for improved performance

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'memory' | 'localStorage';
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

/**
 * In-memory cache store
 */
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Get from cache
 */
export function getFromCache<T>(key: string, storage: 'memory' | 'localStorage' = 'memory'): T | null {
  if (storage === 'localStorage') {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      if (Date.now() > entry.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return entry.value;
    } catch {
      return null;
    }
  } else {
    const entry = memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }
}

/**
 * Set to cache
 */
export function setToCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): void {
  const { ttl = 5 * 60 * 1000, storage = 'memory' } = options; // Default 5 minutes
  const expiry = Date.now() + ttl;
  const entry: CacheEntry<T> = { value, expiry };

  if (storage === 'localStorage') {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      // Quota exceeded or localStorage disabled
      console.warn('Failed to cache to localStorage:', e);
    }
  } else {
    memoryCache.set(key, entry);
  }
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string, storage: 'memory' | 'localStorage' = 'memory'): void {
  if (storage === 'localStorage') {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`cache_${key}`);
  } else {
    memoryCache.delete(key);
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(storage: 'memory' | 'localStorage' = 'memory'): void {
  if (storage === 'localStorage') {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } else {
    memoryCache.clear();
  }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    const key = `memoize_${fn.name}_${JSON.stringify(args)}`;
    const cached = getFromCache<ReturnType<T>>(key, options.storage);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    setToCache(key, result, options);

    return result;
  }) as T;
}

/**
 * Cache API responses
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & CacheOptions = {}
): Promise<T> {
  const { ttl, storage, ...fetchOptions } = options;
  const cacheKey = `fetch_${url}_${JSON.stringify(fetchOptions)}`;

  // Check cache first
  const cached = getFromCache<T>(cacheKey, storage);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  setToCache(cacheKey, data, { ttl, storage });

  return data;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Cache hook result
 */
export function useCachedValue<T>(
  key: string,
  getValue: () => T,
  options: CacheOptions = {}
): T {
  const cached = getFromCache<T>(key, options.storage);

  if (cached !== null) {
    return cached;
  }

  const value = getValue();
  setToCache(key, value, options);

  return value;
}
