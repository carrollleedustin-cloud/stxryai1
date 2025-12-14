import { supabase } from '@/lib/supabase/client';

export interface StoryFilters {
  genre?: string;
  difficulty?: string;
  isPremium?: boolean;
  searchQuery?: string;
}

export const storyService = {
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
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getStoryById(storyId: string) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (error) throw error;
    return data;
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

  async incrementPlayCount(storyId: string) {
    const { error } = await supabase.rpc('increment_play_count', {
      story_id: storyId,
    });

    if (error) throw error;
  },

  async submitReview(storyId: string, userId: string, rating: number, reviewText?: string) {
    const { data, error } = await supabase
      .from('story_reviews')
      .upsert({
        story_id: storyId,
        user_id: userId,
        rating,
        review_text: reviewText,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};