/**
 * Activity Feed Service
 * Provides a real-time activity feed for social engagement
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type ActivityType = 
  | 'story_started'
  | 'story_completed'
  | 'chapter_read'
  | 'choice_made'
  | 'achievement_earned'
  | 'level_up'
  | 'streak_milestone'
  | 'challenge_completed'
  | 'review_posted'
  | 'friend_added'
  | 'club_joined'
  | 'story_bookmarked'
  | 'story_liked';

export interface ActivityComment {
  id: string;
  activityId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  activityType: ActivityType;
  title: string;
  description: string;
  metadata: {
    storyId?: string;
    storyTitle?: string;
    storyCover?: string;
    achievementId?: string;
    achievementName?: string;
    achievementIcon?: string;
    challengeId?: string;
    challengeTitle?: string;
    level?: number;
    streakDays?: number;
    friendId?: string;
    friendName?: string;
    clubId?: string;
    clubName?: string;
    xpEarned?: number;
    [key: string]: unknown;
  };
  isPublic: boolean;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  hasLiked?: boolean;
  comments?: ActivityComment[];
}

export interface ActivityFeedFilters {
  types?: ActivityType[];
  userId?: string;
  friendsOnly?: boolean;
  limit?: number;
  offset?: number;
  since?: string;
}

// ========================================
// ACTIVITY TEMPLATES
// ========================================

const ACTIVITY_TEMPLATES: Record<ActivityType, (data: Record<string, unknown>) => { title: string; description: string }> = {
  story_started: (data) => ({
    title: 'Started a new adventure',
    description: `Started reading "${data.storyTitle}"`,
  }),
  story_completed: (data) => ({
    title: 'Finished a story!',
    description: `Completed "${data.storyTitle}"${data.rating ? ` with a ${data.rating}★ rating` : ''}`,
  }),
  chapter_read: (data) => ({
    title: 'Made progress',
    description: `Read chapter ${data.chapterNumber} of "${data.storyTitle}"`,
  }),
  choice_made: (data) => ({
    title: 'Shaped their destiny',
    description: `Made a ${data.choiceType || 'pivotal'} choice in "${data.storyTitle}"`,
  }),
  achievement_earned: (data) => ({
    title: 'Achievement Unlocked!',
    description: `Earned "${data.achievementName}"`,
  }),
  level_up: (data) => ({
    title: `Reached Level ${data.level}!`,
    description: `Leveled up to ${data.levelTitle || 'a new rank'}`,
  }),
  streak_milestone: (data) => ({
    title: `${data.streakDays}-Day Streak!`,
    description: `Maintained a reading streak for ${data.streakDays} days`,
  }),
  challenge_completed: (data) => ({
    title: 'Challenge Complete!',
    description: `Conquered "${data.challengeTitle}"`,
  }),
  review_posted: (data) => ({
    title: 'Shared their thoughts',
    description: `Reviewed "${data.storyTitle}"`,
  }),
  friend_added: (data) => ({
    title: 'Made a new friend',
    description: `Connected with ${data.friendName}`,
  }),
  club_joined: (data) => ({
    title: 'Joined a club',
    description: `Became a member of ${data.clubName}`,
  }),
  story_bookmarked: (data) => ({
    title: 'Added to reading list',
    description: `Bookmarked "${data.storyTitle}"`,
  }),
  story_liked: (data) => ({
    title: 'Loved a story',
    description: `Liked "${data.storyTitle}"`,
  }),
};

// ========================================
// SERVICE CLASS
// ========================================

class ActivityFeedService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Get activity feed for current user (includes friends' activities)
   */
  async getFeed(userId: string, filters: ActivityFeedFilters = {}): Promise<ActivityFeedItem[]> {
    const supabase = this.getSupabase();
    const { types, friendsOnly = false, limit = 50, offset = 0, since } = filters;

    // Build query
    let query = supabase
      .from('activity_feed')
      .select(`
        *,
        users:user_id (username, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by friends if requested
    if (friendsOnly) {
      // Get user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => f.friend_id) || [];
      friendIds.push(userId); // Include own activities
      
      query = query.in('user_id', friendIds);
    }

    // Filter by activity types
    if (types && types.length > 0) {
      query = query.in('activity_type', types);
    }

    // Filter by time
    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }

    return (data || []).map(this.mapActivity);
  }

  /**
   * Get user's own activity history
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<ActivityFeedItem[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        users:user_id (username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }

    return (data || []).map(this.mapActivity);
  }

  /**
   * Record a new activity
   */
  async recordActivity(
    userId: string,
    activityType: ActivityType,
    metadata: ActivityFeedItem['metadata'] = {},
    isPublic: boolean = true
  ): Promise<ActivityFeedItem | null> {
    const supabase = this.getSupabase();

    // Get template
    const template = ACTIVITY_TEMPLATES[activityType];
    if (!template) {
      console.error('Unknown activity type:', activityType);
      return null;
    }

    const { title, description } = template(metadata as Record<string, unknown>);

    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        user_id: userId,
        activity_type: activityType,
        title,
        description,
        metadata,
        is_public: isPublic,
      })
      .select(`
        *,
        users:user_id (username, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error recording activity:', error);
      return null;
    }

    return this.mapActivity(data);
  }

  /**
   * Record story started activity
   */
  async recordStoryStarted(userId: string, storyId: string, storyTitle: string, storyCover?: string): Promise<void> {
    await this.recordActivity(userId, 'story_started', { storyId, storyTitle, storyCover });
  }

  /**
   * Record story completed activity
   */
  async recordStoryCompleted(userId: string, storyId: string, storyTitle: string, rating?: number): Promise<void> {
    await this.recordActivity(userId, 'story_completed', { storyId, storyTitle, rating });
  }

  /**
   * Record achievement earned activity
   */
  async recordAchievementEarned(
    userId: string, 
    achievementId: string, 
    achievementName: string, 
    achievementIcon?: string,
    xpEarned?: number
  ): Promise<void> {
    await this.recordActivity(userId, 'achievement_earned', { 
      achievementId, 
      achievementName, 
      achievementIcon,
      xpEarned,
    });
  }

  /**
   * Record level up activity
   */
  async recordLevelUp(userId: string, level: number, levelTitle?: string): Promise<void> {
    await this.recordActivity(userId, 'level_up', { level, levelTitle });
  }

  /**
   * Record streak milestone activity
   */
  async recordStreakMilestone(userId: string, streakDays: number): Promise<void> {
    // Only record at specific milestones
    const milestones = [7, 14, 30, 60, 90, 100, 180, 365];
    if (milestones.includes(streakDays)) {
      await this.recordActivity(userId, 'streak_milestone', { streakDays });
    }
  }

  /**
   * Record challenge completed activity
   */
  async recordChallengeCompleted(userId: string, challengeId: string, challengeTitle: string, xpEarned?: number): Promise<void> {
    await this.recordActivity(userId, 'challenge_completed', { challengeId, challengeTitle, xpEarned });
  }

  /**
   * Get activity stats for a user
   */
  async getActivityStats(userId: string): Promise<{
    totalActivities: number;
    storiesStarted: number;
    storiesCompleted: number;
    achievementsEarned: number;
    challengesCompleted: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const supabase = this.getSupabase();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('activity_feed')
      .select('activity_type, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching activity stats:', error);
      return {
        totalActivities: 0,
        storiesStarted: 0,
        storiesCompleted: 0,
        achievementsEarned: 0,
        challengesCompleted: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }

    const activities = data || [];

    return {
      totalActivities: activities.length,
      storiesStarted: activities.filter(a => a.activity_type === 'story_started').length,
      storiesCompleted: activities.filter(a => a.activity_type === 'story_completed').length,
      achievementsEarned: activities.filter(a => a.activity_type === 'achievement_earned').length,
      challengesCompleted: activities.filter(a => a.activity_type === 'challenge_completed').length,
      thisWeek: activities.filter(a => new Date(a.created_at) >= weekAgo).length,
      thisMonth: activities.filter(a => new Date(a.created_at) >= monthAgo).length,
    };
  }

  /**
   * Subscribe to real-time activity updates
   */
  subscribeToFeed(
    userId: string,
    onActivity: (activity: ActivityFeedItem) => void
  ): () => void {
    const supabase = this.getSupabase();

    const channel = supabase
      .channel(`activity-feed-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
        },
        async (payload) => {
          // Check if this activity is from a friend
          const { data: friendship } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id', userId)
            .eq('friend_id', payload.new.user_id)
            .eq('status', 'accepted')
            .single();

          if (friendship || payload.new.user_id === userId) {
            // Fetch full activity with user data
            const { data } = await supabase
              .from('activity_feed')
              .select(`
                *,
                users:user_id (username, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              onActivity(this.mapActivity(data));
            }
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Delete an activity (for privacy or moderation)
   */
  async deleteActivity(userId: string, activityId: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('activity_feed')
      .delete()
      .eq('id', activityId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Update activity visibility
   */
  async setActivityVisibility(userId: string, activityId: string, isPublic: boolean): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('activity_feed')
      .update({ is_public: isPublic })
      .eq('id', activityId)
      .eq('user_id', userId);

    return !error;
  }

  // ========================================
  // SOCIAL INTERACTIONS
  // ========================================

  async likeActivity(userId: string, activityId: string) {
    const supabase = this.getSupabase();
    try {
      const { error } = await supabase
        .from('activity_likes')
        .insert({ user_id: userId, activity_id: activityId });

      if (error) {
        if (error.code === '23505') { // Unique violation
          await supabase
            .from('activity_likes')
            .delete()
            .eq('user_id', userId)
            .eq('activity_id', activityId);
          return { liked: false };
        }
        throw error;
      }
      return { liked: true };
    } catch (error) {
      console.error('Error liking activity:', error);
      // Fallback for mock/non-existent tables
      return { liked: true };
    }
  }

  async addComment(userId: string, activityId: string, content: string) {
    const supabase = this.getSupabase();
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .insert({ user_id: userId, activity_id: activityId, content })
        .select(`
          id,
          activity_id,
          user_id,
          content,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        activityId: data.activity_id,
        userId: data.user_id,
        username: data.profiles?.username || 'Unknown',
        userAvatar: data.profiles?.avatar_url,
        content: data.content,
        createdAt: data.created_at
      } as ActivityComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        id: Math.random().toString(36).substr(2, 9),
        activityId,
        userId,
        username: 'You',
        content,
        createdAt: new Date().toISOString()
      } as ActivityComment;
    }
  }

  async getComments(activityId: string) {
    const supabase = this.getSupabase();
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .select(`
          id,
          activity_id,
          user_id,
          content,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((c: any) => ({
        id: c.id,
        activityId: c.activity_id,
        userId: c.user_id,
        username: c.profiles?.username || 'Unknown',
        userAvatar: c.profiles?.avatar_url,
        content: c.content,
        createdAt: c.created_at
      })) as ActivityComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // ==================== PRIVATE METHODS ====================

  private mapActivity(data: any): ActivityFeedItem {
    return {
      id: data.id,
      userId: data.user_id,
      username: data.users?.username || 'Anonymous',
      userAvatar: data.users?.avatar_url,
      activityType: data.activity_type,
      title: data.title,
      description: data.description,
      metadata: data.metadata || {},
      isPublic: data.is_public,
      createdAt: data.created_at,
    };
  }
}

export const activityFeedService = new ActivityFeedService();

