import { supabase } from '@/lib/supabase/client';

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
    const { data, error } = await supabase
      .from('user_reading_progress')
      .upsert({
        user_id: userId,
        story_id: storyId,
        current_chapter_id: currentChapterId,
        last_choice_id: lastChoiceId,
        progress_percentage: progressPercentage,
        reading_time: readingTime,
        last_read_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markStoryCompleted(userId: string, storyId: string) {
    const { data, error } = await supabase
      .from('user_reading_progress')
      .update({
        is_completed: true,
        progress_percentage: 100,
      })
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .select()
      .single();

    if (error) throw error;

    // Update user stats using RPC function for atomic increment
    await supabase.rpc('increment_stories_completed', {
      user_id: userId,
    });

    return data;
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
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_name: badgeName,
        badge_type: badgeType,
        badge_description: description,
        badge_icon: icon,
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },
};