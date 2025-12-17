import { supabase } from '@/lib/supabase/client';
import { updateStoryById, updateUserById } from '@/lib/supabase/typed';
import { Story } from '@/types/database';

export interface PlatformMetrics {
  activeUsers: number;
  totalStories: number;
  avgEngagementRate: number;
  premiumConversions: number;
}

export interface FlaggedContent {
  id: string;
  storyId: string;
  storyTitle: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reporterUsername: string;
  reason: string;
  status: 'open' | 'investigating' | 'closed';
  createdAt: string;
}

interface Profile {
  id: string;
  subscription_tier: string;
}

// Fetch platform-wide metrics
export const getPlatformMetrics = async (): Promise<PlatformMetrics | null> => {
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('id, subscription_tier');

    if (profileError) throw profileError;

    const { data: stories, error: storyError } = await supabase
      .from('stories')
      .select('id, play_count, status, is_published');

    if (storyError) throw storyError;

    const activeUsers = profiles?.length || 0;
    const storyRows = (stories as any[]) || [];
    const totalStories = storyRows.filter((s) => s.is_published === true).length || 0;
    const avgEngagement =
      storyRows.reduce((acc: number, s: any) => acc + (s.play_count || 0), 0) / (totalStories || 1);
    const premiumUsers =
      profiles?.filter((p: Profile) => p.subscription_tier !== 'free').length || 0;

    return {
      activeUsers,
      totalStories,
      avgEngagementRate: Math.round(avgEngagement),
      premiumConversions: premiumUsers,
    };
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    return null;
  }
};

// Get user analytics data
export const getUserAnalytics = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, username, display_name, subscription_tier, stories_completed, total_reading_time, created_at'
      )
      .order('stories_completed', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return [];
  }
};

// Get story performance analytics
export const getStoryAnalytics = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, user_id, play_count, completion_count, rating, status, created_at')
      .eq('status', 'published')
      .order('play_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching story analytics:', error);
    return [];
  }
};

// Update story status (publish, archive, feature)
export const updateStoryStatus = async (
  storyId: string,
  status: 'draft' | 'published' | 'archived'
) => {
  try {
    const { data, error } = await updateStoryById(storyId, {
      status,
      updated_at: new Date().toISOString(),
    } as any);

    if (error) throw error;
    return { success: true, data: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error updating story status:', error);
    return { success: false, error };
  }
};

// Update user subscription tier
export const updateUserSubscription = async (userId: string, tier: 'free' | 'premium' | 'vip') => {
  try {
    const { data, error } = await updateUserById(userId, {
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    } as any);

    if (error) throw error;
    return { success: true, data: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return { success: false, error };
  }
};

// Get recent user activities for monitoring
export const getRecentActivities = async (limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select(
        `
        id,
        activity_type,
        activity_data,
        created_at,
        users (username, display_name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};
