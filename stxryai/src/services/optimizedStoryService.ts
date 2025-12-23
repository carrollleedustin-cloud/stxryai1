/**
 * Optimized Story Service
 * Fixes N+1 query patterns, adds caching, and improves type safety
 */

import { supabase } from '@/lib/supabase/client';
import { queryCache, cacheKeys, cacheTTL } from '@/lib/cache/queryCache';
import type { Story } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string;
  content: string;
  choices: Choice[];
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  chapter_id: string;
  choice_text: string;
  consequence_text?: string;
  next_chapter_id?: string;
  position: number;
}

export interface StoryWithChapters extends Story {
  chapters: Chapter[];
}

export interface StoryWithAuthor extends Story {
  author: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface StoryFilters {
  genres?: string[];
  minRating?: number;
  sortBy?: 'relevance' | 'popular' | 'newest' | 'rating';
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  isPremium?: boolean;
}

// ============================================================================
// OPTIMIZED STORY SERVICE
// ============================================================================

export const optimizedStoryService = {
  /**
   * Get story with all chapters and choices in ONE query (fixes N+1)
   */
  async getStoryWithChapters(storyId: string): Promise<StoryWithChapters | null> {
    const cacheKey = cacheKeys.storyWithChapters(storyId);
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            chapters (
              id,
              story_id,
              chapter_number,
              title,
              content,
              created_at,
              updated_at,
              choices (
                id,
                chapter_id,
                choice_text,
                consequence_text,
                next_chapter_id,
                position
              )
            )
          `)
          .eq('id', storyId)
          .single();

        if (error) {
          console.error('Error fetching story with chapters:', error);
          return null;
        }

        // Sort chapters and choices
        if (data?.chapters) {
          data.chapters.sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number);
          data.chapters.forEach((chapter: Chapter) => {
            if (chapter.choices) {
              chapter.choices.sort((a: Choice, b: Choice) => a.position - b.position);
            }
          });
        }

        return data as StoryWithChapters;
      },
      { ttl: cacheTTL.story }
    );
  },

  /**
   * Get story by ID with caching
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    const cacheKey = cacheKeys.story(storyId);
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (error) {
          console.error('Error fetching story:', error);
          return null;
        }

        return data as Story;
      },
      { ttl: cacheTTL.story }
    );
  },

  /**
   * Get chapters with choices in one query (batch loading)
   */
  async getChaptersWithChoices(storyId: string): Promise<Chapter[]> {
    const cacheKey = cacheKeys.storyChapters(storyId);
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('chapters')
          .select(`
            *,
            choices (
              id,
              chapter_id,
              choice_text,
              consequence_text,
              next_chapter_id,
              position
            )
          `)
          .eq('story_id', storyId)
          .order('chapter_number', { ascending: true });

        if (error) {
          console.error('Error fetching chapters:', error);
          return [];
        }

        // Sort choices within each chapter
        const chapters = (data || []) as Chapter[];
        chapters.forEach(chapter => {
          if (chapter.choices) {
            chapter.choices.sort((a, b) => a.position - b.position);
          }
        });

        return chapters;
      },
      { ttl: cacheTTL.chapters }
    );
  },

  /**
   * Get filtered stories with author info (optimized query)
   */
  async getFilteredStories(filters: StoryFilters = {}): Promise<StoryWithAuthor[]> {
    const {
      genres,
      minRating,
      sortBy = 'newest',
      searchQuery,
      page = 1,
      pageSize = 20,
      isPremium,
    } = filters;

    // Build cache key from filters
    const cacheKey = `stories:${JSON.stringify(filters)}`;
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        let query = supabase
          .from('stories')
          .select(`
            *,
            author:user_profiles!author_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_published', true);

        // Apply filters
        if (genres && genres.length > 0) {
          query = query.in('genre', genres);
        }

        if (minRating && minRating > 0) {
          query = query.gte('average_rating', minRating);
        }

        if (isPremium !== undefined) {
          query = query.eq('is_premium', isPremium);
        }

        if (searchQuery) {
          // Use text search for better performance with index
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'popular':
            query = query.order('view_count', { ascending: false });
            break;
          case 'rating':
            query = query.order('average_rating', { ascending: false });
            break;
          case 'relevance':
            // For relevance, we'd ideally use full-text search ranking
            query = query.order('view_count', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('published_at', { ascending: false, nullsFirst: false });
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching filtered stories:', error);
          return [];
        }

        return (data || []) as StoryWithAuthor[];
      },
      { ttl: cacheTTL.storyList }
    );
  },

  /**
   * Get featured stories (heavily cached)
   */
  async getFeaturedStories(limit = 10): Promise<StoryWithAuthor[]> {
    const cacheKey = cacheKeys.featuredStories();
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            author:user_profiles!author_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching featured stories:', error);
          return [];
        }

        return (data || []) as StoryWithAuthor[];
      },
      { ttl: cacheTTL.featured }
    );
  },

  /**
   * Get trending stories (based on recent views)
   */
  async getTrendingStories(limit = 10): Promise<StoryWithAuthor[]> {
    const cacheKey = cacheKeys.trendingStories();
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            author:user_profiles!author_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_published', true)
          .order('view_count', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching trending stories:', error);
          return [];
        }

        return (data || []) as StoryWithAuthor[];
      },
      { ttl: cacheTTL.trending }
    );
  },

  /**
   * Get stories by genre (cached per genre)
   */
  async getStoriesByGenre(genre: string, limit = 20): Promise<StoryWithAuthor[]> {
    const cacheKey = cacheKeys.genreStories(genre);
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            author:user_profiles!author_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_published', true)
          .eq('genre', genre)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching genre stories:', error);
          return [];
        }

        return (data || []) as StoryWithAuthor[];
      },
      { ttl: cacheTTL.storyList }
    );
  },

  /**
   * Get story comments with user info (paginated)
   */
  async getStoryComments(
    storyId: string,
    page = 1,
    pageSize = 10
  ): Promise<StoryComment[]> {
    const cacheKey = cacheKeys.storyComments(storyId, page);
    
    return queryCache.getOrSet(
      cacheKey,
      async () => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_profiles!user_id (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('story_id', storyId)
          .is('parent_id', null)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Error fetching comments:', error);
          return [];
        }

        return (data || []) as StoryComment[];
      },
      { ttl: cacheTTL.comments }
    );
  },

  /**
   * Batch fetch multiple stories by IDs (prevents N+1)
   */
  async getStoriesByIds(storyIds: string[]): Promise<Story[]> {
    if (storyIds.length === 0) return [];

    // Check cache first
    const cachedStories: Story[] = [];
    const uncachedIds: string[] = [];

    for (const id of storyIds) {
      const cached = queryCache.get<Story>(cacheKeys.story(id));
      if (cached) {
        cachedStories.push(cached);
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached stories in one query
    if (uncachedIds.length > 0) {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .in('id', uncachedIds);

      if (!error && data) {
        // Cache each story
        for (const story of data) {
          queryCache.set(cacheKeys.story(story.id), story, cacheTTL.story);
          cachedStories.push(story as Story);
        }
      }
    }

    // Return in original order
    return storyIds
      .map(id => cachedStories.find(s => s.id === id))
      .filter((s): s is Story => s !== undefined);
  },

  /**
   * Invalidate story cache (call after updates)
   */
  invalidateStory(storyId: string): void {
    queryCache.invalidate(cacheKeys.story(storyId));
    queryCache.invalidate(cacheKeys.storyWithChapters(storyId));
    queryCache.invalidate(cacheKeys.storyChapters(storyId));
    // Also invalidate list caches
    queryCache.invalidatePattern('^stories:');
  },

  /**
   * Invalidate all story list caches
   */
  invalidateListCaches(): void {
    queryCache.invalidatePattern('^stories:');
    queryCache.invalidate(cacheKeys.featuredStories());
    queryCache.invalidate(cacheKeys.trendingStories());
    queryCache.invalidatePattern('^genre:');
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return queryCache.getStats();
  },
};

