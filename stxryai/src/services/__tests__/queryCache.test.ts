/**
 * Unit Tests for Query Cache
 * Tests caching behavior, TTL, and cache invalidation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queryCache, cacheKeys, cacheTTL } from '@/lib/cache/queryCache';

describe('QueryCache', () => {
  beforeEach(() => {
    queryCache.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      queryCache.set('key1', 'value1');
      expect(queryCache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(queryCache.get('non-existent')).toBeNull();
    });

    it('should overwrite existing values', () => {
      queryCache.set('key1', 'value1');
      queryCache.set('key1', 'value2');
      expect(queryCache.get('key1')).toBe('value2');
    });

    it('should store complex objects', () => {
      const obj = { id: 1, name: 'test', nested: { value: true } };
      queryCache.set('complex', obj);
      expect(queryCache.get('complex')).toEqual(obj);
    });
  });

  describe('TTL (Time-to-Live)', () => {
    it('should expire entries after TTL', async () => {
      queryCache.set('expiring', 'value', 50); // 50ms TTL

      expect(queryCache.get('expiring')).toBe('value');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(queryCache.get('expiring')).toBeNull();
    });

    it('should not expire entries before TTL', async () => {
      queryCache.set('not-expiring', 'value', 1000); // 1 second TTL

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(queryCache.get('not-expiring')).toBe('value');
    });
  });

  describe('getOrSet', () => {
    it('should execute query on cache miss', async () => {
      const queryFn = vi.fn().mockResolvedValue('fetched-value');

      const result = await queryCache.getOrSet('new-key', queryFn);

      expect(result).toBe('fetched-value');
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should return cached value on cache hit', async () => {
      const queryFn = vi.fn().mockResolvedValue('new-value');

      queryCache.set('existing-key', 'cached-value');

      const result = await queryCache.getOrSet('existing-key', queryFn);

      expect(result).toBe('cached-value');
      expect(queryFn).not.toHaveBeenCalled();
    });

    it('should cache the query result', async () => {
      const queryFn = vi.fn().mockResolvedValue('fetched-value');

      await queryCache.getOrSet('key', queryFn);
      await queryCache.getOrSet('key', queryFn);

      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalidation', () => {
    it('should invalidate single entry', () => {
      queryCache.set('key1', 'value1');
      queryCache.set('key2', 'value2');

      queryCache.invalidate('key1');

      expect(queryCache.get('key1')).toBeNull();
      expect(queryCache.get('key2')).toBe('value2');
    });

    it('should invalidate by pattern', () => {
      queryCache.set('story:1', { id: '1' });
      queryCache.set('story:2', { id: '2' });
      queryCache.set('story:3', { id: '3' });
      queryCache.set('user:1', { id: '1' });

      queryCache.invalidatePattern('^story:');

      expect(queryCache.get('story:1')).toBeNull();
      expect(queryCache.get('story:2')).toBeNull();
      expect(queryCache.get('story:3')).toBeNull();
      expect(queryCache.get('user:1')).toEqual({ id: '1' });
    });

    it('should clear entire cache', () => {
      queryCache.set('key1', 'value1');
      queryCache.set('key2', 'value2');

      queryCache.clear();

      expect(queryCache.get('key1')).toBeNull();
      expect(queryCache.get('key2')).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', async () => {
      // First call - miss
      await queryCache.getOrSet('key', async () => 'value');

      // Second call - hit
      await queryCache.getOrSet('key', async () => 'value');

      // Third call - different key - miss
      await queryCache.getOrSet('key2', async () => 'value2');

      const stats = queryCache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate correctly', async () => {
      // 2 misses, 2 hits = 50% hit rate
      await queryCache.getOrSet('key1', async () => 'v1');
      await queryCache.getOrSet('key2', async () => 'v2');
      await queryCache.getOrSet('key1', async () => 'v1');
      await queryCache.getOrSet('key2', async () => 'v2');

      const stats = queryCache.getStats();
      expect(stats.hitRate).toBe(0.5);
    });

    it('should report cache size', () => {
      queryCache.set('key1', 'value1');
      queryCache.set('key2', 'value2');
      queryCache.set('key3', 'value3');

      const stats = queryCache.getStats();
      expect(stats.size).toBe(3);
    });
  });
});

describe('Cache Key Generators', () => {
  it('should generate story key', () => {
    expect(cacheKeys.story('123')).toBe('story:123');
  });

  it('should generate story with chapters key', () => {
    expect(cacheKeys.storyWithChapters('123')).toBe('story-chapters:123');
  });

  it('should generate chapter choices key', () => {
    expect(cacheKeys.chapterChoices('456')).toBe('choices:456');
  });

  it('should generate story comments key with page', () => {
    expect(cacheKeys.storyComments('123', 2)).toBe('comments:123:2');
  });

  it('should generate featured stories key', () => {
    expect(cacheKeys.featuredStories()).toBe('featured-stories');
  });
});

describe('Cache TTL Constants', () => {
  it('should have appropriate TTL values', () => {
    expect(cacheTTL.story).toBeGreaterThan(60000); // > 1 minute
    expect(cacheTTL.storyList).toBeLessThanOrEqual(60000); // <= 1 minute
    expect(cacheTTL.comments).toBeLessThan(60000); // < 1 minute (fresh comments)
    expect(cacheTTL.featured).toBeGreaterThan(60000); // > 1 minute (stable)
  });
});
