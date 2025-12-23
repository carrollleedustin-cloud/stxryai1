/**
 * Query Result Cache
 * Simple in-memory caching layer to reduce database hits
 * and improve response times for frequently accessed data.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds
  key?: string; // Custom cache key
}

const DEFAULT_TTL = 60 * 1000; // 1 minute
const MAX_CACHE_SIZE = 500; // Maximum entries

class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private hitCount = 0;
  private missCount = 0;

  /**
   * Get cached value or execute query and cache result
   */
  async getOrSet<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const ttl = options.ttl ?? DEFAULT_TTL;
    
    // Check cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      this.hitCount++;
      return cached;
    }

    // Execute query and cache
    this.missCount++;
    const result = await queryFn();
    this.set(key, result, ttl);
    return result;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    // Enforce max cache size
    if (this.cache.size >= MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number; hits: number; misses: number } {
    const total = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? this.hitCount / total : 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    const now = Date.now();
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // First, remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      } else if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    // If still at capacity, remove oldest
    if (this.cache.size >= MAX_CACHE_SIZE && oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Cache key generators
export const cacheKeys = {
  story: (id: string) => `story:${id}`,
  storyWithChapters: (id: string) => `story-chapters:${id}`,
  storyChapters: (storyId: string) => `chapters:${storyId}`,
  chapterChoices: (chapterId: string) => `choices:${chapterId}`,
  storyComments: (storyId: string, page: number) => `comments:${storyId}:${page}`,
  userStories: (userId: string) => `user-stories:${userId}`,
  featuredStories: () => 'featured-stories',
  trendingStories: () => 'trending-stories',
  genreStories: (genre: string) => `genre:${genre}`,
};

// Cache TTLs (in milliseconds)
export const cacheTTL = {
  story: 5 * 60 * 1000,          // 5 minutes
  storyList: 60 * 1000,          // 1 minute
  chapters: 10 * 60 * 1000,      // 10 minutes
  choices: 10 * 60 * 1000,       // 10 minutes
  comments: 30 * 1000,           // 30 seconds
  featured: 5 * 60 * 1000,       // 5 minutes
  trending: 2 * 60 * 1000,       // 2 minutes
};

// Export singleton instance
export const queryCache = new QueryCache();

