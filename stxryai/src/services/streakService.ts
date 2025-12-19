/**
 * Reading Streak Service
 * Manages reading streaks, daily goals, calendar heatmap, and weekly challenges
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface StreakData {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  streakRecoveryUsed: number;
  streakRecoveryResetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyGoal {
  id: string;
  userId: string;
  goalDate: string;
  goalType: 'time' | 'stories' | 'chapters';
  goalValue: number;
  currentValue: number;
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingCalendarEntry {
  id: string;
  userId: string;
  readDate: string;
  readingTime: number; // minutes
  storiesRead: number;
  chaptersRead: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyChallenge {
  id: string;
  challengeWeek: string;
  challengeType: 'genre' | 'count' | 'time' | 'explore' | 'social';
  challengeData: Record<string, any>;
  title: string;
  description: string;
  rewardXp: number;
  rewardBadge: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWeeklyChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// SERVICE CLASS
// ========================================

class StreakService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== READING STREAKS ====================

  /**
   * Get reading streak data for a user
   */
  async getStreakData(userId: string): Promise<StreakData | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('reading_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No streak found, return null
        return null;
      }
      console.error('Error fetching streak data:', error);
      throw error;
    }

    return this.mapStreakData(data);
  }

  /**
   * Update reading streak when user reads
   */
  async updateStreak(userId: string, readDate: Date = new Date()): Promise<StreakData> {
    const supabase = this.getSupabase();
    const today = readDate.toISOString().split('T')[0];

    // Call the database function to update streak
    const { data, error } = await supabase.rpc('update_reading_streak_on_read', {
      p_user_id: userId,
      p_read_date: today,
    });

    if (error) {
      console.error('Error updating streak:', error);
      throw error;
    }

    // If function returns data, use it; otherwise fetch
    if (data) {
      return this.mapStreakData(data);
    }

    // Fallback: fetch updated streak
    const streak = await this.getStreakData(userId);
    if (!streak) {
      throw new Error('Failed to update streak');
    }
    return streak;
  }

  /**
   * Use streak recovery (free pass)
   */
  async useStreakRecovery(userId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const current = await this.getStreakData(userId);

    if (!current) {
      return false;
    }

    const now = new Date();
    const resetDate = current.streakRecoveryResetDate
      ? new Date(current.streakRecoveryResetDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    // Check if we need to reset recovery count (new month)
    if (now > resetDate) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await supabase
        .from('reading_streaks')
        .update({
          streak_recovery_used: 0,
          streak_recovery_reset_date: nextMonth.toISOString().split('T')[0],
        })
        .eq('user_id', userId);
    }

    // Check if user has recovery available
    if (current.streakRecoveryUsed >= 1) {
      return false; // Already used this month
    }

    // Use recovery - don't break streak
    const { error } = await supabase
      .from('reading_streaks')
      .update({
        streak_recovery_used: 1,
        current_streak: current.currentStreak + 1, // Maintain streak
        last_read_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error using streak recovery:', error);
      return false;
    }

    return true;
  }

  // ==================== DAILY GOALS ====================

  /**
   * Get daily goal for a specific date
   */
  async getDailyGoal(userId: string, date: Date = new Date()): Promise<DailyGoal | null> {
    const supabase = this.getSupabase();
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_reading_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', dateStr)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching daily goal:', error);
      throw error;
    }

    return this.mapDailyGoal(data);
  }

  /**
   * Set or update daily goal
   */
  async setDailyGoal(
    userId: string,
    goalType: 'time' | 'stories' | 'chapters',
    goalValue: number,
    date?: Date
  ): Promise<DailyGoal> {
    const supabase = this.getSupabase();
    const today = (date || new Date()).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_reading_goals')
      .upsert(
        {
          user_id: userId,
          goal_date: today,
          goal_type: goalType,
          goal_value: goalValue,
          current_value: 0,
          completed: false,
          reward_claimed: false,
        },
        {
          onConflict: 'user_id,goal_date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error setting daily goal:', error);
      throw error;
    }

    return this.mapDailyGoal(data);
  }

  /**
   * Update daily goal progress
   */
  async updateDailyGoalProgress(
    userId: string,
    readingTime: number,
    storiesRead: number = 0,
    chaptersRead: number = 0
  ): Promise<DailyGoal | null> {
    const goal = await this.getDailyGoal(userId);
    if (!goal || goal.completed) {
      return goal;
    }

    const supabase = this.getSupabase();
    let newValue = goal.currentValue;

    if (goal.goalType === 'time') {
      newValue += readingTime;
    } else if (goal.goalType === 'stories') {
      newValue += storiesRead;
    } else if (goal.goalType === 'chapters') {
      newValue += chaptersRead;
    }

    const completed = newValue >= goal.goalValue;

    const { data, error } = await supabase
      .from('daily_reading_goals')
      .update({
        current_value: newValue,
        completed,
      })
      .eq('id', goal.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating daily goal:', error);
      throw error;
    }

    return this.mapDailyGoal(data);
  }

  /**
   * Claim daily goal reward
   */
  async claimDailyGoalReward(userId: string, goalId: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('daily_reading_goals')
      .update({
        reward_claimed: true,
      })
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error claiming daily goal reward:', error);
      return false;
    }

    // TODO: Award XP or other rewards through achievement service
    return true;
  }

  // ==================== READING CALENDAR ====================

  /**
   * Update reading calendar entry
   */
  async updateReadingProgress(
    userId: string,
    readingTime: number,
    storiesRead: number = 0,
    chaptersRead: number = 0,
    readDate: Date = new Date()
  ): Promise<void> {
    const supabase = this.getSupabase();
    const today = readDate.toISOString().split('T')[0];

    // Update calendar
    const { error: calendarError } = await supabase
      .from('reading_calendar')
      .upsert(
        {
          user_id: userId,
          read_date: today,
          reading_time: readingTime,
          stories_read: storiesRead,
          chapters_read: chaptersRead,
        },
        {
          onConflict: 'user_id,read_date',
        }
      );

    if (calendarError) {
      console.error('Error updating reading calendar:', calendarError);
      throw calendarError;
    }

    // Update streak
    await this.updateStreak(userId, readDate);

    // Update daily goal
    await this.updateDailyGoalProgress(userId, readingTime, storiesRead, chaptersRead);
  }

  /**
   * Get calendar heatmap data for a year
   */
  async getCalendarHeatmap(
    userId: string,
    year: number = new Date().getFullYear()
  ): Promise<Map<string, number>> {
    const supabase = this.getSupabase();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from('reading_calendar')
      .select('read_date, reading_time')
      .eq('user_id', userId)
      .gte('read_date', startDate)
      .lte('read_date', endDate)
      .order('read_date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar heatmap:', error);
      throw error;
    }

    const heatmap = new Map<string, number>();
    data?.forEach((entry) => {
      heatmap.set(entry.read_date, entry.reading_time || 0);
    });

    return heatmap;
  }

  // ==================== WEEKLY CHALLENGES ====================

  /**
   * Get current week's challenges
   */
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const supabase = this.getSupabase();

    // Get Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const weekStart = monday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('challenge_week', weekStart)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly challenges:', error);
      throw error;
    }

    return (data || []).map(this.mapWeeklyChallenge);
  }

  /**
   * Get user's progress on weekly challenges
   */
  async getUserWeeklyChallenges(userId: string): Promise<UserWeeklyChallenge[]> {
    const supabase = this.getSupabase();

    // Get current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const weekStart = monday.toISOString().split('T')[0];

    // Get challenges for this week
    const { data: challenges, error: challengesError } = await supabase
      .from('weekly_challenges')
      .select('id')
      .eq('challenge_week', weekStart);

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      throw challengesError;
    }

    if (!challenges || challenges.length === 0) {
      return [];
    }

    const challengeIds = challenges.map((c) => c.id);

    const { data, error } = await supabase
      .from('user_weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds);

    if (error) {
      console.error('Error fetching user weekly challenges:', error);
      throw error;
    }

    return (data || []).map(this.mapUserWeeklyChallenge);
  }

  /**
   * Update user's progress on a weekly challenge
   */
  async updateWeeklyChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number
  ): Promise<UserWeeklyChallenge> {
    const supabase = this.getSupabase();

    // Get challenge to check completion
    const { data: challenge, error: challengeError } = await supabase
      .from('weekly_challenges')
      .select('challenge_data')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      console.error('Error fetching challenge:', challengeError);
      throw challengeError;
    }

    // Determine if completed based on challenge type and data
    const challengeData = challenge.challenge_data || {};
    const target = challengeData.count || challengeData.target || 100;
    const completed = progress >= target;

    const { data, error } = await supabase
      .from('user_weekly_challenges')
      .upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          progress,
          completed,
        },
        {
          onConflict: 'user_id,challenge_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating weekly challenge progress:', error);
      throw error;
    }

    return this.mapUserWeeklyChallenge(data);
  }

  // ==================== HELPER METHODS ====================

  private mapStreakData(data: any): StreakData {
    return {
      id: data.id,
      userId: data.user_id,
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      lastReadDate: data.last_read_date,
      streakRecoveryUsed: data.streak_recovery_used || 0,
      streakRecoveryResetDate: data.streak_recovery_reset_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDailyGoal(data: any): DailyGoal {
    return {
      id: data.id,
      userId: data.user_id,
      goalDate: data.goal_date,
      goalType: data.goal_type,
      goalValue: data.goal_value,
      currentValue: data.current_value || 0,
      completed: data.completed || false,
      rewardClaimed: data.reward_claimed || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapWeeklyChallenge(data: any): WeeklyChallenge {
    return {
      id: data.id,
      challengeWeek: data.challenge_week,
      challengeType: data.challenge_type,
      challengeData: data.challenge_data || {},
      title: data.title,
      description: data.description,
      rewardXp: data.reward_xp || 0,
      rewardBadge: data.reward_badge,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapUserWeeklyChallenge(data: any): UserWeeklyChallenge {
    return {
      id: data.id,
      userId: data.user_id,
      challengeId: data.challenge_id,
      progress: data.progress || 0,
      completed: data.completed || false,
      rewardClaimed: data.reward_claimed || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const streakService = new StreakService();

