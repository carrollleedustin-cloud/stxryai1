import { supabase } from '@/lib/supabase/client';
import {
  upsertUserReadingProgress,
  updateUserReadingProgressByKeys,
  insertUserBadge,
  insertBookmark,
  deleteBookmarkByKeys,
} from '@/lib/supabase/typed';
import { Story } from '@/types/database';

export interface UserReadingProgress {
  id: string;
  user_id: string;
  story_id: string;
  current_chapter_id: string;
  last_choice_id?: string;
  progress_percentage: number;
  reading_time?: number;
  last_read_at: string;
  is_completed: boolean;
  stories: Story;
}

export const userProgressService = {
  async getUserProgress(userId: string, storyId: string) {
    const { data, error } = await supabase
      .from('user_reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_reading_progress')
      .select(`
        *,
        stories:story_id (
          id,
          title,
          cover_image_url,
          genre,
          estimated_duration
        )
      `)
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateProgress(
    userId: string,
    storyId: string,
    currentChapterId: string,
    lastChoiceId?: string,
    progressPercentage?: number,
    readingTime?: number
  ) {
    const { data, error } = await upsertUserReadingProgress({
      user_id: userId,
      story_id: storyId,
      current_chapter_id: currentChapterId,
      last_choice_id: lastChoiceId,
      progress_percentage: progressPercentage,
      reading_time: readingTime,
      last_read_at: new Date().toISOString(),
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async markStoryCompleted(userId: string, storyId: string) {
    const { data, error } = await updateUserReadingProgressByKeys(userId, storyId, {
      is_completed: true,
      progress_percentage: 100,
    });

    if (error) throw error;

    await supabase.rpc('increment_stories_completed', {
      user_id: userId,
    });

    return Array.isArray(data) ? data[0] : data;
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async awardBadge(userId: string, badgeName: string, badgeType: string, description: string, icon: string) {
    const { data, error } = await insertUserBadge({
      user_id: userId,
      badge_name: badgeName,
      badge_type: badgeType,
      badge_description: description,
      badge_icon: icon,
    });

    if (error && error.code !== '23505') throw error;

    return Array.isArray(data) ? data[0] : data;
  },

  async addBookmark(userId: string, storyId: string, chapterId: string) {
    const { data, error } = await insertBookmark({
      user_id: userId,
      story_id: storyId,
      chapter_id: chapterId,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async removeBookmark(userId: string, storyId: string, chapterId: string) {
    const { data, error } = await deleteBookmarkByKeys(userId, storyId, chapterId);
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async getBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, stories(*), chapters(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isChapterBookmarked(userId: string, chapterId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};
