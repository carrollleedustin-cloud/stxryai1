import { supabase } from '@/lib/supabase';

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

// Fetch platform-wide metrics
export const getPlatformMetrics = async (): Promise<PlatformMetrics | null> => {
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, subscription_tier');
    
    if (profileError) throw profileError;

    const { data: stories, error: storyError } = await supabase
      .from('stories')
      .select('id, play_count, status');
    
    if (storyError) throw storyError;

    const activeUsers = profiles?.length || 0;
    const totalStories = stories?.filter(s => s.status === 'published').length || 0;
    const avgEngagement = stories?.reduce((acc, s) => acc + (s.play_count || 0), 0) / (totalStories || 1);
    const premiumUsers = profiles?.filter(p => p.subscription_tier !== 'free').length || 0;

    return {
      activeUsers,
      totalStories,
      avgEngagementRate: Math.round(avgEngagement),
      premiumConversions: premiumUsers
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
      .from('user_profiles')
      .select('id, username, display_name, subscription_tier, stories_completed, total_reading_time, created_at')
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
      .select('id, title, author_id, play_count, completion_count, rating, status, created_at')
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
export const updateStoryStatus = async (storyId: string, status: 'draft' | 'published' | 'archived') => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating story status:', error);
    return { success: false, error };
  }
};

// Update user subscription tier
export const updateUserSubscription = async (userId: string, tier: 'free' | 'premium' | 'vip') => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
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
      .select(`
        id,
        activity_type,
        activity_data,
        created_at,
        user_profiles (username, display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};