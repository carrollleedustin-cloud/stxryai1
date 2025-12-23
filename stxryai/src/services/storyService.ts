import { supabase } from '@/lib/supabase/client';
import { upsertStoryReview } from '@/lib/supabase/typed';
import { Story } from '@/types/database';
import { withTimeout, isConnectionError, getConnectionErrorMessage } from '@/lib/supabase/timeout';

export interface StoryFilters {
  genre?: string;
  difficulty?: string;
  isPremium?: boolean;
  searchQuery?: string;
}

export interface FilterOptions {
  genres?: string[];
  minRating?: number;
  sortBy?: 'relevance' | 'popular' | 'newest' | 'rating';
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export const storyService = {
  /**
   * @deprecated Use getFilteredStories for more advanced filtering
   */
  async getStories(filters?: StoryFilters) {
    let query = supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.genre && filters.genre !== 'all') {
      query = query.eq('genre', filters.genre);
    }

    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium);
    }

    if (filters?.searchQuery) {
      query = query.or(
        `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Story[];
  },

  async getFilteredStories(filters: FilterOptions = {}): Promise<Story[]> {
    try {
      let query = supabase
        .from('stories')
        .select('*, author:users!user_id(display_name, avatar_url)')
        .eq('is_published', true);

      // Search
      if (filters.searchQuery) {
        query = query.textSearch('title', filters.searchQuery, { type: 'websearch' });
      }

      // Filters
      if (filters.genres && filters.genres.length > 0) {
        query = query.in('genre', filters.genres);
      }
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'popular':
            query = query.order('view_count', { ascending: false });
            break;
          case 'newest':
            query = query.order('published_at', { ascending: false, nullsFirst: false });
            break;

          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          default: // relevance
            // default order is fine for now
            break;
        }
      } else {
        query = query.order('published_at', { ascending: false, nullsFirst: false });
      }

      // Pagination
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await withTimeout(
        query as PromiseLike<{ data: Story[] | null; error: Error | null }>,
        { timeout: 8000, errorMessage: 'Request timed out while loading stories' }
      );

      if (error) {
        if (isConnectionError(error)) {
          throw new Error(getConnectionErrorMessage(error));
        }
        throw error;
      }
      return (data || []) as Story[];
    } catch (err: unknown) {
      if (isConnectionError(err)) {
        throw new Error(getConnectionErrorMessage(err));
      }
      throw err;
    }
  },

  async getStoryById(storyId: string) {
    const { data, error } = await supabase.from('stories').select('*').eq('id', storyId).single();

    if (error) throw error;
    return data as Story;
  },

  async getStoryChapters(storyId: string) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getChapterChoices(chapterId: string) {
    const { data, error } = await supabase
      .from('choices')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getStoryComments(storyId: string, page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:users!user_id (
          id,
          display_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data;
  },

  async getCommentReplies(commentId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:users!user_id (
          id,
          display_name,
          avatar_url
        )
      `
      )
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async incrementPlayCount(storyId: string) {
    const { error } = await supabase.rpc('increment_play_count', {
      story_id: storyId,
    });

    if (error) throw error;
  },

  async submitReview(storyId: string, userId: string, rating: number, reviewText?: string) {
    const { data, error } = await upsertStoryReview({
      story_id: storyId,
      user_id: userId,
      rating,
      review: reviewText ?? null,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },
};
