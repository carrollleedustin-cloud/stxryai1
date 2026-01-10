/**
 * Milestone Celebration Service
 * Triggers celebratory animations and notifications for user achievements
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import { pushNotificationService } from './pushNotificationService';
import { activityFeedService } from './activityFeedService';

// ========================================
// TYPES
// ========================================

export type MilestoneType =
  | 'first_story'
  | 'stories_read'
  | 'chapters_read'
  | 'choices_made'
  | 'streak_days'
  | 'level_reached'
  | 'xp_earned'
  | 'achievements_earned'
  | 'challenges_completed'
  | 'time_reading'
  | 'genres_explored'
  | 'friends_made'
  | 'reviews_written'
  | 'clubs_joined'
  | 'perfect_week'
  | 'anniversary';

export interface Milestone {
  id: string;
  type: MilestoneType;
  value: number;
  title: string;
  description: string;
  icon: string;
  celebrationType: 'confetti' | 'fireworks' | 'sparkle' | 'glow' | 'epic' | 'legendary';
  xpReward: number;
  badgeId?: string;
  createdAt: string;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneId: string;
  milestone?: Milestone;
  achievedAt: string;
  celebrated: boolean;
  rewardClaimed: boolean;
}

export interface CelebrationEvent {
  milestone: Milestone;
  isNew: boolean;
  showAnimation: boolean;
  animationType: Milestone['celebrationType'];
}

// ========================================
// MILESTONE DEFINITIONS
// ========================================

const MILESTONES: Omit<Milestone, 'id' | 'createdAt'>[] = [
  // First story milestones
  {
    type: 'first_story',
    value: 1,
    title: 'First Adventure',
    description: 'You completed your first story!',
    icon: '🎉',
    celebrationType: 'confetti',
    xpReward: 100,
    badgeId: 'first-story',
  },

  // Stories read milestones
  {
    type: 'stories_read',
    value: 5,
    title: 'Getting Started',
    description: 'Read 5 stories',
    icon: '📚',
    celebrationType: 'sparkle',
    xpReward: 200,
  },
  {
    type: 'stories_read',
    value: 10,
    title: 'Story Enthusiast',
    description: 'Read 10 stories',
    icon: '📖',
    celebrationType: 'confetti',
    xpReward: 400,
    badgeId: 'story-enthusiast',
  },
  {
    type: 'stories_read',
    value: 25,
    title: 'Bookworm',
    description: 'Read 25 stories',
    icon: '🐛',
    celebrationType: 'fireworks',
    xpReward: 1000,
    badgeId: 'bookworm',
  },
  {
    type: 'stories_read',
    value: 50,
    title: 'Story Master',
    description: 'Read 50 stories',
    icon: '🏆',
    celebrationType: 'epic',
    xpReward: 2500,
    badgeId: 'story-master',
  },
  {
    type: 'stories_read',
    value: 100,
    title: 'Legendary Reader',
    description: 'Read 100 stories',
    icon: '👑',
    celebrationType: 'epic',
    xpReward: 5000,
    badgeId: 'legendary-reader',
  },

  // Streak milestones
  {
    type: 'streak_days',
    value: 7,
    title: 'Week Warrior',
    description: '7-day reading streak',
    icon: '🔥',
    celebrationType: 'confetti',
    xpReward: 200,
    badgeId: 'week-warrior',
  },
  {
    type: 'streak_days',
    value: 14,
    title: 'Fortnight Fighter',
    description: '14-day reading streak',
    icon: '💪',
    celebrationType: 'fireworks',
    xpReward: 500,
    badgeId: 'fortnight-fighter',
  },
  {
    type: 'streak_days',
    value: 30,
    title: 'Month Master',
    description: '30-day reading streak',
    icon: '🌟',
    celebrationType: 'epic',
    xpReward: 1500,
    badgeId: 'month-master',
  },
  {
    type: 'streak_days',
    value: 100,
    title: 'Century Streak',
    description: '100-day reading streak',
    icon: '💯',
    celebrationType: 'epic',
    xpReward: 5000,
    badgeId: 'century-streak',
  },
  {
    type: 'streak_days',
    value: 365,
    title: 'Year of Reading',
    description: '365-day reading streak',
    icon: '🎊',
    celebrationType: 'epic',
    xpReward: 20000,
    badgeId: 'year-streak',
  },

  // Level milestones
  {
    type: 'level_reached',
    value: 5,
    title: 'Rising Star',
    description: 'Reached Level 5',
    icon: '⭐',
    celebrationType: 'sparkle',
    xpReward: 100,
  },
  {
    type: 'level_reached',
    value: 10,
    title: 'Double Digits',
    description: 'Reached Level 10',
    icon: '🌟',
    celebrationType: 'confetti',
    xpReward: 250,
    badgeId: 'level-10',
  },
  {
    type: 'level_reached',
    value: 25,
    title: 'Silver Status',
    description: 'Reached Level 25',
    icon: '🥈',
    celebrationType: 'fireworks',
    xpReward: 750,
    badgeId: 'level-25',
  },
  {
    type: 'level_reached',
    value: 50,
    title: 'Golden Reader',
    description: 'Reached Level 50',
    icon: '🥇',
    celebrationType: 'epic',
    xpReward: 2000,
    badgeId: 'level-50',
  },

  // Choices milestones
  {
    type: 'choices_made',
    value: 100,
    title: 'Decision Maker',
    description: 'Made 100 story choices',
    icon: '🔀',
    celebrationType: 'sparkle',
    xpReward: 150,
  },
  {
    type: 'choices_made',
    value: 500,
    title: 'Fate Weaver',
    description: 'Made 500 story choices',
    icon: '🎭',
    celebrationType: 'confetti',
    xpReward: 500,
    badgeId: 'fate-weaver',
  },
  {
    type: 'choices_made',
    value: 1000,
    title: 'Destiny Shaper',
    description: 'Made 1000 story choices',
    icon: '✨',
    celebrationType: 'fireworks',
    xpReward: 1000,
    badgeId: 'destiny-shaper',
  },

  // Time reading milestones
  {
    type: 'time_reading',
    value: 60,
    title: 'Hour Hero',
    description: 'Read for 1 hour total',
    icon: '⏱️',
    celebrationType: 'sparkle',
    xpReward: 100,
  },
  {
    type: 'time_reading',
    value: 600,
    title: 'Day Dreamer',
    description: 'Read for 10 hours total',
    icon: '⏰',
    celebrationType: 'confetti',
    xpReward: 500,
  },
  {
    type: 'time_reading',
    value: 3600,
    title: 'Time Lord',
    description: 'Read for 60 hours total',
    icon: '⌛',
    celebrationType: 'epic',
    xpReward: 2000,
    badgeId: 'time-lord',
  },

  // Genre exploration
  {
    type: 'genres_explored',
    value: 3,
    title: 'Genre Curious',
    description: 'Read stories from 3 genres',
    icon: '🎨',
    celebrationType: 'sparkle',
    xpReward: 150,
  },
  {
    type: 'genres_explored',
    value: 5,
    title: 'Genre Explorer',
    description: 'Read stories from 5 genres',
    icon: '🗺️',
    celebrationType: 'confetti',
    xpReward: 300,
    badgeId: 'genre-explorer',
  },
  {
    type: 'genres_explored',
    value: 8,
    title: 'Genre Master',
    description: 'Read stories from all 8 genres',
    icon: '🌈',
    celebrationType: 'fireworks',
    xpReward: 750,
    badgeId: 'genre-master',
  },

  // Social milestones
  {
    type: 'friends_made',
    value: 1,
    title: 'First Friend',
    description: 'Made your first friend',
    icon: '🤝',
    celebrationType: 'confetti',
    xpReward: 50,
  },
  {
    type: 'friends_made',
    value: 10,
    title: 'Social Butterfly',
    description: 'Made 10 friends',
    icon: '🦋',
    celebrationType: 'fireworks',
    xpReward: 300,
    badgeId: 'social-butterfly',
  },

  // Special milestones
  {
    type: 'perfect_week',
    value: 1,
    title: 'Perfect Week',
    description: 'Read every day for a week',
    icon: '🏅',
    celebrationType: 'fireworks',
    xpReward: 500,
    badgeId: 'perfect-week',
  },
  {
    type: 'anniversary',
    value: 1,
    title: 'One Year Anniversary',
    description: 'Member for 1 year',
    icon: '🎂',
    celebrationType: 'epic',
    xpReward: 1000,
    badgeId: 'anniversary-1',
  },
];

// ========================================
// SERVICE CLASS
// ========================================

class MilestoneCelebrationService {
  private pendingCelebrations: CelebrationEvent[] = [];
  private celebrationCallbacks: Set<(event: CelebrationEvent) => void> = new Set();

  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Check for new milestones based on user progress
   */
  async checkMilestones(
    userId: string,
    type: MilestoneType,
    currentValue: number
  ): Promise<CelebrationEvent[]> {
    const supabase = this.getSupabase();

    // Get milestones of this type that the user hasn't achieved
    const relevantMilestones = MILESTONES.filter((m) => m.type === type && m.value <= currentValue);

    // Get user's already achieved milestones
    const { data: achievedMilestones } = await supabase
      .from('user_milestones')
      .select('milestone_id')
      .eq('user_id', userId);

    const achievedIds = new Set((achievedMilestones || []).map((m) => m.milestone_id));

    // Find new milestones
    const newEvents: CelebrationEvent[] = [];

    for (const milestone of relevantMilestones) {
      // Check if already achieved (by type+value since we don't have real IDs)
      const milestoneKey = `${milestone.type}-${milestone.value}`;

      const { data: existing } = await supabase
        .from('milestones')
        .select('id')
        .eq('type', milestone.type)
        .eq('value', milestone.value)
        .single();

      if (existing && !achievedIds.has(existing.id)) {
        // New milestone achieved!
        await this.recordMilestone(userId, existing.id);

        const event: CelebrationEvent = {
          milestone: { ...milestone, id: existing.id, createdAt: new Date().toISOString() },
          isNew: true,
          showAnimation: true,
          animationType: milestone.celebrationType,
        };

        newEvents.push(event);
        this.triggerCelebration(event);
      }
    }

    return newEvents;
  }

  /**
   * Check all milestone types for a user (comprehensive check)
   */
  async checkAllMilestones(userId: string): Promise<CelebrationEvent[]> {
    const supabase = this.getSupabase();
    const allEvents: CelebrationEvent[] = [];

    // Get user stats
    const { data: user } = await supabase
      .from('users')
      .select('level, xp')
      .eq('id', userId)
      .single();

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stats) {
      // Check each milestone type
      const checks: Array<{ type: MilestoneType; value: number }> = [
        { type: 'stories_read', value: stats.stories_completed || 0 },
        { type: 'chapters_read', value: stats.chapters_read || 0 },
        { type: 'choices_made', value: stats.choices_made || 0 },
        { type: 'streak_days', value: stats.current_streak || 0 },
        { type: 'level_reached', value: user?.level || 1 },
        { type: 'xp_earned', value: stats.total_xp || 0 },
        { type: 'time_reading', value: stats.total_reading_time || 0 },
        { type: 'genres_explored', value: stats.genres_explored || 0 },
        { type: 'friends_made', value: stats.friends_count || 0 },
        { type: 'reviews_written', value: stats.reviews_written || 0 },
        { type: 'challenges_completed', value: stats.challenges_completed || 0 },
      ];

      for (const check of checks) {
        const events = await this.checkMilestones(userId, check.type, check.value);
        allEvents.push(...events);
      }
    }

    return allEvents;
  }

  /**
   * Get user's achieved milestones
   */
  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_milestones')
      .select(
        `
        *,
        milestones (*)
      `
      )
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('Error fetching user milestones:', error);
      return [];
    }

    return (data || []).map(this.mapUserMilestone);
  }

  /**
   * Get next milestones for a user (goals to work toward)
   */
  async getNextMilestones(userId: string, limit: number = 5): Promise<Milestone[]> {
    const supabase = this.getSupabase();

    // Get achieved milestone IDs
    const { data: achieved } = await supabase
      .from('user_milestones')
      .select('milestone_id')
      .eq('user_id', userId);

    const achievedIds = new Set((achieved || []).map((m) => m.milestone_id));

    // Get user stats to find relevant next milestones
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Find next milestones for each type
    const nextMilestones: Array<{ milestone: Milestone; distance: number }> = [];

    for (const milestone of MILESTONES) {
      const { data: existing } = await supabase
        .from('milestones')
        .select('id')
        .eq('type', milestone.type)
        .eq('value', milestone.value)
        .single();

      if (existing && !achievedIds.has(existing.id)) {
        const currentValue = this.getCurrentValueForType(milestone.type, stats);
        if (currentValue < milestone.value) {
          nextMilestones.push({
            milestone: { ...milestone, id: existing.id, createdAt: '' },
            distance: milestone.value - currentValue,
          });
        }
      }
    }

    // Sort by distance and return top ones
    return nextMilestones
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((m) => m.milestone);
  }

  /**
   * Claim milestone reward
   */
  async claimMilestoneReward(
    userId: string,
    milestoneId: string
  ): Promise<{ success: boolean; xpAwarded: number; badgeId?: string }> {
    const supabase = this.getSupabase();

    // Get user milestone
    const { data: userMilestone, error: umError } = await supabase
      .from('user_milestones')
      .select('*, milestones(*)')
      .eq('user_id', userId)
      .eq('milestone_id', milestoneId)
      .single();

    if (umError || !userMilestone) {
      return { success: false, xpAwarded: 0 };
    }

    if (userMilestone.reward_claimed) {
      return { success: false, xpAwarded: 0 };
    }

    // Mark as claimed
    await supabase
      .from('user_milestones')
      .update({ reward_claimed: true })
      .eq('id', userMilestone.id);

    const milestone = userMilestone.milestones;

    // Award XP
    await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: milestone.xp_reward,
    });

    // Award badge if applicable
    if (milestone.badge_id) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: milestone.badge_id,
        awarded_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      xpAwarded: milestone.xp_reward,
      badgeId: milestone.badge_id,
    };
  }

  /**
   * Subscribe to celebration events
   */
  onCelebration(callback: (event: CelebrationEvent) => void): () => void {
    this.celebrationCallbacks.add(callback);
    return () => this.celebrationCallbacks.delete(callback);
  }

  /**
   * Get pending celebrations
   */
  getPendingCelebrations(): CelebrationEvent[] {
    const pending = [...this.pendingCelebrations];
    this.pendingCelebrations = [];
    return pending;
  }

  /**
   * Mark milestone as celebrated (animation shown)
   */
  async markCelebrated(userId: string, milestoneId: string): Promise<void> {
    const supabase = this.getSupabase();

    await supabase
      .from('user_milestones')
      .update({ celebrated: true })
      .eq('user_id', userId)
      .eq('milestone_id', milestoneId);
  }

  // ==================== PRIVATE METHODS ====================

  private async recordMilestone(userId: string, milestoneId: string): Promise<void> {
    const supabase = this.getSupabase();

    // Record achievement
    await supabase.from('user_milestones').insert({
      user_id: userId,
      milestone_id: milestoneId,
      achieved_at: new Date().toISOString(),
      celebrated: false,
      reward_claimed: false,
    });

    // Get milestone details for notifications
    const { data: milestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (milestone) {
      // Send push notification
      await pushNotificationService.sendNotification(userId, 'milestone', {
        milestoneMessage: `${milestone.icon} ${milestone.title}: ${milestone.description}`,
      });

      // Record activity
      await activityFeedService.recordActivity(userId, 'achievement_earned', {
        achievementName: milestone.title,
        achievementIcon: milestone.icon,
        xpEarned: milestone.xp_reward,
      });
    }
  }

  private triggerCelebration(event: CelebrationEvent): void {
    this.pendingCelebrations.push(event);
    this.celebrationCallbacks.forEach((callback) => callback(event));
  }

  private getCurrentValueForType(type: MilestoneType, stats: any): number {
    if (!stats) return 0;

    const mapping: Record<MilestoneType, string> = {
      first_story: 'stories_completed',
      stories_read: 'stories_completed',
      chapters_read: 'chapters_read',
      choices_made: 'choices_made',
      streak_days: 'current_streak',
      level_reached: 'level',
      xp_earned: 'total_xp',
      achievements_earned: 'achievements_count',
      challenges_completed: 'challenges_completed',
      time_reading: 'total_reading_time',
      genres_explored: 'genres_explored',
      friends_made: 'friends_count',
      reviews_written: 'reviews_written',
      clubs_joined: 'clubs_count',
      perfect_week: 'perfect_weeks',
      anniversary: 'years_member',
    };

    return stats[mapping[type]] || 0;
  }

  private mapUserMilestone(data: any): UserMilestone {
    return {
      id: data.id,
      userId: data.user_id,
      milestoneId: data.milestone_id,
      milestone: data.milestones
        ? {
            id: data.milestones.id,
            type: data.milestones.type,
            value: data.milestones.value,
            title: data.milestones.title,
            description: data.milestones.description,
            icon: data.milestones.icon,
            celebrationType: data.milestones.celebration_type,
            xpReward: data.milestones.xp_reward,
            badgeId: data.milestones.badge_id,
            createdAt: data.milestones.created_at,
          }
        : undefined,
      achievedAt: data.achieved_at,
      celebrated: data.celebrated,
      rewardClaimed: data.reward_claimed,
    };
  }
}

export const milestoneCelebrationService = new MilestoneCelebrationService();
