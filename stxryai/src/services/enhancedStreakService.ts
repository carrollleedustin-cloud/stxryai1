/**
 * Enhanced Streak Service
 * Handles reading streaks, daily login bonuses, freeze tokens, and milestone celebrations
 */

import { createClient } from '@/lib/supabase/client';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
  freezeTokens: number;
}

export interface StreakReward {
  id: string;
  streakDays: number;
  rewardType: 'xp' | 'coins' | 'badge' | 'freeze_token' | 'premium_day';
  rewardAmount: number;
  title: string;
  description: string;
  iconUrl: string;
}

export interface DailyLoginBonus {
  bonusType: string;
  bonusAmount: number;
  streakMultiplier: number;
}

export interface MilestoneData {
  milestoneDays: number;
  achievedAt: string;
  celebrated: boolean;
  rewardsClaimed: any[];
}

class EnhancedStreakService {
  private supabase = createClient();

  /**
   * Get user's current streak data
   */
  async getStreakData(userId: string): Promise<StreakData | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_reading_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak data:', error);
        return null;
      }

      if (!data) {
        // Initialize streak data for new user
        return await this.initializeStreak(userId);
      }

      return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastReadDate: data.last_read_date,
        totalDaysRead: data.total_days_read,
        freezeTokens: data.freeze_tokens || 0,
      };
    } catch (error) {
      console.error('Error in getStreakData:', error);
      return null;
    }
  }

  /**
   * Initialize streak for new user
   */
  private async initializeStreak(userId: string): Promise<StreakData> {
    const defaultData = {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_read_date: null,
      total_days_read: 0,
      freeze_tokens: 0,
    };

    await this.supabase.from('user_reading_streaks').insert(defaultData);

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalDaysRead: 0,
      freezeTokens: 0,
    };
  }

  /**
   * Record daily reading activity and update streak
   */
  async recordReadingActivity(userId: string): Promise<{
    streakData: StreakData;
    newMilestone?: number;
    rewards?: StreakReward[];
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentData = await this.getStreakData(userId);

      if (!currentData) {
        throw new Error('Could not get streak data');
      }

      const lastRead = currentData.lastReadDate;
      let newStreak = currentData.currentStreak;
      let newLongest = currentData.longestStreak;
      let newMilestone: number | undefined;

      if (lastRead === today) {
        // Already recorded today
        return { streakData: currentData };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastRead === yesterdayStr) {
        // Continuing streak
        newStreak += 1;
      } else if (lastRead && currentData.freezeTokens > 0) {
        // Check if we can use a freeze token
        const daysSinceLastRead = this.getDaysDifference(lastRead, today);
        if (daysSinceLastRead <= 2) {
          // Use freeze token
          await this.useFreezeToken(userId);
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } else {
        // Starting new streak or first day
        newStreak = 1;
      }

      // Update longest streak
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }

      // Check for milestones
      const milestones = [7, 14, 30, 60, 90, 100, 150, 200, 365, 500, 1000];
      if (milestones.includes(newStreak)) {
        newMilestone = newStreak;
        await this.recordMilestone(userId, newStreak);
      }

      // Update database
      const { error } = await this.supabase
        .from('user_reading_streaks')
        .upsert({
          user_id: userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_read_date: today,
          total_days_read: currentData.totalDaysRead + 1,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating streak:', error);
      }

      // Get any rewards for this streak
      const rewards = await this.getRewardsForStreak(newStreak);

      // Award rewards
      if (rewards.length > 0) {
        await this.awardStreakRewards(userId, rewards);
      }

      return {
        streakData: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastReadDate: today,
          totalDaysRead: currentData.totalDaysRead + 1,
          freezeTokens: currentData.freezeTokens,
        },
        newMilestone,
        rewards,
      };
    } catch (error) {
      console.error('Error recording reading activity:', error);
      throw error;
    }
  }

  /**
   * Get rewards for a specific streak day
   */
  async getRewardsForStreak(streakDays: number): Promise<StreakReward[]> {
    try {
      const { data, error } = await this.supabase
        .from('streak_rewards')
        .select('*')
        .eq('streak_days', streakDays);

      if (error) {
        console.error('Error fetching streak rewards:', error);
        return [];
      }

      return (data || []).map((r) => ({
        id: r.id,
        streakDays: r.streak_days,
        rewardType: r.reward_type,
        rewardAmount: r.reward_amount,
        title: r.title,
        description: r.description,
        iconUrl: r.icon_url,
      }));
    } catch (error) {
      console.error('Error in getRewardsForStreak:', error);
      return [];
    }
  }

  /**
   * Award streak rewards to user
   */
  private async awardStreakRewards(userId: string, rewards: StreakReward[]): Promise<void> {
    for (const reward of rewards) {
      switch (reward.rewardType) {
        case 'xp':
          await this.supabase.rpc('award_xp', {
            p_user_id: userId,
            p_amount: reward.rewardAmount,
            p_reason: `${reward.streakDays}-day streak reward`,
          });
          break;
        case 'coins':
          await this.supabase.rpc('add_coins', {
            p_user_id: userId,
            p_amount: reward.rewardAmount,
            p_reason: `${reward.streakDays}-day streak reward`,
          });
          break;
        case 'freeze_token':
          await this.addFreezeTokens(userId, reward.rewardAmount);
          break;
        // Handle other reward types...
      }
    }
  }

  /**
   * Record a milestone achievement
   */
  private async recordMilestone(userId: string, milestoneDays: number): Promise<void> {
    try {
      await this.supabase.from('streak_milestones').insert({
        user_id: userId,
        milestone_days: milestoneDays,
        achieved_at: new Date().toISOString(),
        celebrated: false,
        rewards_claimed: [],
      });
    } catch (error) {
      console.error('Error recording milestone:', error);
    }
  }

  /**
   * Get uncelebrated milestones
   */
  async getUncelebratedMilestones(userId: string): Promise<MilestoneData[]> {
    try {
      const { data, error } = await this.supabase
        .from('streak_milestones')
        .select('*')
        .eq('user_id', userId)
        .eq('celebrated', false)
        .order('milestone_days', { ascending: false });

      if (error) {
        console.error('Error fetching milestones:', error);
        return [];
      }

      return (data || []).map((m) => ({
        milestoneDays: m.milestone_days,
        achievedAt: m.achieved_at,
        celebrated: m.celebrated,
        rewardsClaimed: m.rewards_claimed,
      }));
    } catch (error) {
      console.error('Error in getUncelebratedMilestones:', error);
      return [];
    }
  }

  /**
   * Mark milestone as celebrated
   */
  async celebrateMilestone(userId: string, milestoneDays: number): Promise<void> {
    try {
      await this.supabase
        .from('streak_milestones')
        .update({ celebrated: true })
        .eq('user_id', userId)
        .eq('milestone_days', milestoneDays);
    } catch (error) {
      console.error('Error celebrating milestone:', error);
    }
  }

  /**
   * Claim daily login bonus
   */
  async claimDailyLoginBonus(userId: string): Promise<DailyLoginBonus | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if already claimed today
      const { data: existing } = await this.supabase
        .from('daily_login_bonuses')
        .select('*')
        .eq('user_id', userId)
        .eq('login_date', today)
        .single();

      if (existing) {
        return null; // Already claimed
      }

      // Get current streak for multiplier
      const streakData = await this.getStreakData(userId);
      const multiplier = this.calculateStreakMultiplier(streakData?.currentStreak || 0);

      // Base bonus
      const baseBonusXP = 50;
      const bonusAmount = Math.floor(baseBonusXP * multiplier);

      // Record the bonus
      await this.supabase.from('daily_login_bonuses').insert({
        user_id: userId,
        login_date: today,
        bonus_type: 'xp',
        bonus_amount: bonusAmount,
        streak_multiplier: multiplier,
      });

      // Award the XP
      await this.supabase.rpc('award_xp', {
        p_user_id: userId,
        p_amount: bonusAmount,
        p_reason: 'Daily login bonus',
      });

      return {
        bonusType: 'xp',
        bonusAmount,
        streakMultiplier: multiplier,
      };
    } catch (error) {
      console.error('Error claiming daily login bonus:', error);
      return null;
    }
  }

  /**
   * Calculate streak multiplier
   */
  private calculateStreakMultiplier(streak: number): number {
    if (streak >= 100) return 2.0;
    if (streak >= 60) return 1.75;
    if (streak >= 30) return 1.5;
    if (streak >= 14) return 1.25;
    if (streak >= 7) return 1.1;
    return 1.0;
  }

  /**
   * Add freeze tokens to user
   */
  async addFreezeTokens(userId: string, amount: number): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('streak_freeze_tokens')
        .select('tokens_available')
        .eq('user_id', userId)
        .single();

      const currentTokens = data?.tokens_available || 0;

      await this.supabase.from('streak_freeze_tokens').upsert({
        user_id: userId,
        tokens_available: currentTokens + amount,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding freeze tokens:', error);
    }
  }

  /**
   * Use a freeze token
   */
  async useFreezeToken(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('streak_freeze_tokens')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data || data.tokens_available <= 0) {
        return false;
      }

      await this.supabase
        .from('streak_freeze_tokens')
        .update({
          tokens_available: data.tokens_available - 1,
          tokens_used: (data.tokens_used || 0) + 1,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error using freeze token:', error);
      return false;
    }
  }

  /**
   * Get freeze token balance
   */
  async getFreezeTokens(userId: string): Promise<number> {
    try {
      const { data } = await this.supabase
        .from('streak_freeze_tokens')
        .select('tokens_available')
        .eq('user_id', userId)
        .single();

      return data?.tokens_available || 0;
    } catch (error) {
      console.error('Error getting freeze tokens:', error);
      return 0;
    }
  }

  /**
   * Share streak on social media
   */
  async shareStreak(userId: string, milestoneDays: number): Promise<{ shareUrl: string; message: string }> {
    await this.supabase
      .from('streak_milestones')
      .update({ shared_socially: true })
      .eq('user_id', userId)
      .eq('milestone_days', milestoneDays);

    const message = `I've maintained a ${milestoneDays}-day reading streak on StxryAI! 🔥📚`;
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/achievements?streak=${milestoneDays}`;

    return { shareUrl, message };
  }

  /**
   * Helper to calculate days difference
   */
  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const enhancedStreakService = new EnhancedStreakService();
