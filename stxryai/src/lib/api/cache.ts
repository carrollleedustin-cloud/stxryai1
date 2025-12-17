/**
 * API Response Cache
 * Provides in-memory and localStorage caching for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'memory' | 'localStorage' | 'both';
  prefix?: string;
}

class APICache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly prefix = 'stxryai_cache_';

  /**
   * Get cached data
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const storage = options.storage || 'memory';
    const cacheKey = this.getCacheKey(key, options.prefix);

    // Try memory cache first
    if (storage === 'memory' || storage === 'both') {
      const memoryEntry = this.memoryCache.get(cacheKey);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        return memoryEntry.data;
      }
    }

    // Try localStorage
    if (typeof window !== 'undefined' && (storage === 'localStorage' || storage === 'both')) {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (!this.isExpired(entry)) {
            // Restore to memory cache
            if (storage === 'both') {
              this.memoryCache.set(cacheKey, entry);
            }
            return entry.data;
          } else {
            // Clean up expired entry
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const storage = options.storage || 'memory';
    const cacheKey = this.getCacheKey(key, options.prefix);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // Store in memory cache
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.set(cacheKey, entry);
    }

    // Store in localStorage
    if (typeof window !== 'undefined' && (storage === 'localStorage' || storage === 'both')) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to localStorage:', error);
      }
    }
  }

  /**
   * Delete cached data
   */
  delete(key: string, options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';
    const cacheKey = this.getCacheKey(key, options.prefix);

    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.delete(cacheKey);
    }

    if (typeof window !== 'undefined' && (storage === 'localStorage' || storage === 'both')) {
      try {
        localStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(options: { storage?: 'memory' | 'localStorage' | 'both'; prefix?: string } = {}): void {
    const storage = options.storage || 'both';

    if (storage === 'memory' || storage === 'both') {
      if (options.prefix) {
        const prefix = this.getCacheKey('', options.prefix);
        Array.from(this.memoryCache.keys())
          .filter((key) => key.startsWith(prefix))
          .forEach((key) => this.memoryCache.delete(key));
      } else {
        this.memoryCache.clear();
      }
    }

    if (typeof window !== 'undefined' && (storage === 'localStorage' || storage === 'both')) {
      try {
        const prefix = this.getCacheKey('', options.prefix);
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get formatted cache key
   */
  private getCacheKey(key: string, prefix?: string): string {
    return `${this.prefix}${prefix || ''}${key}`;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    // Clean memory cache
    Array.from(this.memoryCache.entries()).forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    });

    // Clean localStorage
    if (typeof window !== 'undefined') {
      try {
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const entry = JSON.parse(stored);
                if (this.isExpired(entry)) {
                  keysToDelete.push(key);
                }
              }
            } catch {
              // Invalid entry, mark for deletion
              keysToDelete.push(key);
            }
          }
        }
        keysToDelete.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    localStorageEntries: number;
    memorySize: number;
  } {
    const stats = {
      memoryEntries: this.memoryCache.size,
      localStorageEntries: 0,
      memorySize: 0,
    };

    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            stats.localStorageEntries++;
            const item = localStorage.getItem(key);
            if (item) {
              stats.memorySize += new Blob([item]).size;
            }
          }
        }
      } catch (error) {
        console.warn('Failed to get localStorage stats:', error);
      }
    }

    return stats;
  }
}

export const apiCache = new APICache();

/**
 * Decorator function to cache API calls
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & {
    getCacheKey: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = options.getCacheKey(...args);

    // Try to get from cache
    const cached = apiCache.get(cacheKey, options);
    if (cached !== null) {
      return cached;
    }

    // Call the function and cache the result
    const result = await fn(...args);
    apiCache.set(cacheKey, result, options);

    return result;
  }) as T;
}

/**
 * Hook for cache management in React components
 */
export function useCacheManagement() {
  return {
    clear: (options?: Parameters<typeof apiCache.clear>[0]) => apiCache.clear(options),
    cleanup: () => apiCache.cleanup(),
    getStats: () => apiCache.getStats(),
    delete: (key: string, options?: CacheOptions) => apiCache.delete(key, options),
  };
}

// Automatically cleanup expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      apiCache.cleanup();
    },
    10 * 60 * 1000
  );
}
