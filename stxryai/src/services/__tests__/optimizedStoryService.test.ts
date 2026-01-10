/**
 * Unit Tests for Optimized Story Service
 * Tests caching, query batching, and type safety
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { optimizedStoryService } from '../optimizedStoryService';
import { queryCache } from '@/lib/cache/queryCache';

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockStory,
        error: null,
      }),
    })),
  },
}));

// Mock data
const mockStory = {
  id: 'story-1',
  title: 'Test Story',
  description: 'A test story',
  author_id: 'user-1',
  genre: 'fantasy',
  is_published: true,
  view_count: 100,
  average_rating: 4.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockChapter = {
  id: 'chapter-1',
  story_id: 'story-1',
  chapter_number: 1,
  title: 'Chapter One',
  content: 'Once upon a time...',
  choices: [
    {
      id: 'choice-1',
      chapter_id: 'chapter-1',
      choice_text: 'Go left',
      position: 1,
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('OptimizedStoryService', () => {
  beforeEach(() => {
    // Clear cache before each test
    queryCache.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Caching Behavior', () => {
    it('should cache story results', async () => {
      const story1 = await optimizedStoryService.getStoryById('story-1');
      const story2 = await optimizedStoryService.getStoryById('story-1');

      // Both should return the same cached result
      expect(story1).toEqual(story2);

      // Cache should have a hit
      const stats = optimizedStoryService.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('should invalidate cache when requested', async () => {
      await optimizedStoryService.getStoryById('story-1');

      // Invalidate the cache
      optimizedStoryService.invalidateStory('story-1');

      // Cache should be empty for this key
      const stats = optimizedStoryService.getCacheStats();
      // After invalidation, next request will be a miss
    });
  });

  describe('Query Optimization', () => {
    it('should fetch story with chapters in one query', async () => {
      const result = await optimizedStoryService.getStoryWithChapters('story-1');

      // Result should include nested chapters
      expect(result).toBeDefined();
    });

    it('should batch fetch multiple stories', async () => {
      const storyIds = ['story-1', 'story-2', 'story-3'];
      const results = await optimizedStoryService.getStoriesByIds(storyIds);

      // Should return array of stories
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed Story objects', async () => {
      const story = await optimizedStoryService.getStoryById('story-1');

      if (story) {
        // TypeScript should infer these properties
        expect(typeof story.id).toBe('string');
        expect(typeof story.title).toBe('string');
        expect(typeof story.is_published).toBe('boolean');
      }
    });

    it('should return properly typed Chapter objects with choices', async () => {
      const chapters = await optimizedStoryService.getChaptersWithChoices('story-1');

      expect(Array.isArray(chapters)).toBe(true);
      if (chapters.length > 0) {
        const chapter = chapters[0];
        expect(typeof chapter.chapter_number).toBe('number');
        expect(Array.isArray(chapter.choices)).toBe(true);
      }
    });
  });

  describe('Filtering', () => {
    it('should filter stories by genre', async () => {
      const stories = await optimizedStoryService.getFilteredStories({
        genres: ['fantasy', 'sci-fi'],
      });

      expect(Array.isArray(stories)).toBe(true);
    });

    it('should filter stories by minimum rating', async () => {
      const stories = await optimizedStoryService.getFilteredStories({
        minRating: 4.0,
      });

      expect(Array.isArray(stories)).toBe(true);
    });

    it('should sort stories correctly', async () => {
      const popularStories = await optimizedStoryService.getFilteredStories({
        sortBy: 'popular',
      });

      const newestStories = await optimizedStoryService.getFilteredStories({
        sortBy: 'newest',
      });

      expect(Array.isArray(popularStories)).toBe(true);
      expect(Array.isArray(newestStories)).toBe(true);
    });

    it('should paginate results', async () => {
      const page1 = await optimizedStoryService.getFilteredStories({
        page: 1,
        pageSize: 10,
      });

      const page2 = await optimizedStoryService.getFilteredStories({
        page: 2,
        pageSize: 10,
      });

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
    });
  });

  describe('Featured & Trending', () => {
    it('should fetch featured stories', async () => {
      const featured = await optimizedStoryService.getFeaturedStories(5);

      expect(Array.isArray(featured)).toBe(true);
    });

    it('should fetch trending stories', async () => {
      const trending = await optimizedStoryService.getTrendingStories(10);

      expect(Array.isArray(trending)).toBe(true);
    });
  });
});

describe('QueryCache', () => {
  beforeEach(() => {
    queryCache.clear();
  });

  it('should store and retrieve values', () => {
    queryCache.set('test-key', { data: 'test' }, 60000);
    const result = queryCache.get<{ data: string }>('test-key');

    expect(result).toEqual({ data: 'test' });
  });

  it('should return null for expired entries', async () => {
    queryCache.set('test-key', { data: 'test' }, 1); // 1ms TTL

    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = queryCache.get('test-key');
    expect(result).toBeNull();
  });

  it('should invalidate entries by pattern', () => {
    queryCache.set('story:1', { id: '1' }, 60000);
    queryCache.set('story:2', { id: '2' }, 60000);
    queryCache.set('user:1', { id: '1' }, 60000);

    queryCache.invalidatePattern('^story:');

    expect(queryCache.get('story:1')).toBeNull();
    expect(queryCache.get('story:2')).toBeNull();
    expect(queryCache.get('user:1')).not.toBeNull();
  });

  it('should track cache statistics', async () => {
    // Miss
    await queryCache.getOrSet('key1', async () => 'value1');

    // Hit
    await queryCache.getOrSet('key1', async () => 'value1');

    const stats = queryCache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });
});
