/**
 * Meta-Progression Service
 * Season passes, quests, achievements, and platform-wide progression
 */

import { createClient } from '@/lib/supabase/client';

export interface SeasonPass {
  id: string;
  seasonNumber: number;
  title: string;
  description: string | null;
  theme: string | null;
  startsAt: string;
  endsAt: string;
  maxLevel: number;
  freeRewards: SeasonReward[];
  premiumRewards: SeasonReward[];
  premiumPriceUsd: number | null;
  isActive: boolean;
}

export interface SeasonReward {
  level: number;
  rewardType: 'coins' | 'xp' | 'badge' | 'icon' | 'banner' | 'pet_skin' | 'pet_accessory' | 'title' | 'premium_days';
  rewardId?: string;
  quantity: number;
  name: string;
  description?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface UserSeasonProgress {
  seasonId: string;
  currentLevel: number;
  currentXP: number;
  hasPremium: boolean;
  premiumPurchasedAt: string | null;
  claimedFreeRewards: number[];
  claimedPremiumRewards: number[];
}

export interface Quest {
  id: string;
  questKey: string;
  displayName: string;
  description: string | null;
  questType: 'daily' | 'weekly' | 'special' | 'story';
  requirements: QuestRequirement[];
  rewards: QuestRewardItem[];
  xpReward: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface QuestRequirement {
  type: string;
  target: number;
  description: string;
}

export interface QuestRewardItem {
  type: string;
  id?: string;
  quantity: number;
}

export interface UserQuestProgress {
  questId: string;
  progress: Record<string, number>;
  completedAt: string | null;
  rewardsClaimedAt: string | null;
  assignedAt: string;
  expiresAt: string | null;
}

class MetaProgressionService {
  private supabase = createClient();

  // XP required per level (exponential curve)
  private getXPForLevel(level: number): number {
    return Math.floor(1000 * Math.pow(level, 1.2));
  }

  // ============================================
  // SEASON PASS
  // ============================================

  /**
   * Get active season
   */
  async getActiveSeason(): Promise<SeasonPass | null> {
    try {
      const { data, error } = await this.supabase
        .from('season_passes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        seasonNumber: data.season_number,
        title: data.title,
        description: data.description,
        theme: data.theme,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        maxLevel: data.max_level,
        freeRewards: data.free_rewards || [],
        premiumRewards: data.premium_rewards || [],
        premiumPriceUsd: data.premium_price_usd,
        isActive: data.is_active,
      };
    } catch (error) {
      console.error('Error fetching active season:', error);
      return null;
    }
  }

  /**
   * Get user's season progress
   */
  async getUserSeasonProgress(userId: string, seasonId: string): Promise<UserSeasonProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_season_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('season_id', seasonId)
        .single();

      if (error || !data) {
        // Create new progress
        const { data: newProgress } = await this.supabase
          .from('user_season_progress')
          .insert({
            user_id: userId,
            season_id: seasonId,
            current_level: 1,
            current_xp: 0,
            has_premium: false,
          })
          .select()
          .single();

        if (newProgress) {
          return {
            seasonId: newProgress.season_id,
            currentLevel: newProgress.current_level,
            currentXP: newProgress.current_xp,
            hasPremium: newProgress.has_premium,
            premiumPurchasedAt: newProgress.premium_purchased_at,
            claimedFreeRewards: newProgress.claimed_free_rewards || [],
            claimedPremiumRewards: newProgress.claimed_premium_rewards || [],
          };
        }
        return null;
      }

      return {
        seasonId: data.season_id,
        currentLevel: data.current_level,
        currentXP: data.current_xp,
        hasPremium: data.has_premium,
        premiumPurchasedAt: data.premium_purchased_at,
        claimedFreeRewards: data.claimed_free_rewards || [],
        claimedPremiumRewards: data.claimed_premium_rewards || [],
      };
    } catch (error) {
      console.error('Error fetching user season progress:', error);
      return null;
    }
  }

  /**
   * Add XP to user's season progress
   */
  async addSeasonXP(userId: string, xpAmount: number): Promise<{
    levelUp: boolean;
    newLevel: number;
    totalXP: number;
  }> {
    try {
      const season = await this.getActiveSeason();
      if (!season) {
        return { levelUp: false, newLevel: 1, totalXP: 0 };
      }

      const progress = await this.getUserSeasonProgress(userId, season.id);
      if (!progress) {
        return { levelUp: false, newLevel: 1, totalXP: 0 };
      }

      // Double XP for premium users
      const effectiveXP = progress.hasPremium ? xpAmount * 2 : xpAmount;
      const newTotalXP = progress.currentXP + effectiveXP;

      // Calculate new level
      let newLevel = progress.currentLevel;
      let xpForNextLevel = this.getXPForLevel(newLevel);
      let accumulatedXP = newTotalXP;

      while (accumulatedXP >= xpForNextLevel && newLevel < season.maxLevel) {
        accumulatedXP -= xpForNextLevel;
        newLevel++;
        xpForNextLevel = this.getXPForLevel(newLevel);
      }

      const levelUp = newLevel > progress.currentLevel;

      await this.supabase
        .from('user_season_progress')
        .update({
          current_level: newLevel,
          current_xp: newTotalXP,
        })
        .eq('user_id', userId)
        .eq('season_id', season.id);

      return {
        levelUp,
        newLevel,
        totalXP: newTotalXP,
      };
    } catch (error) {
      console.error('Error adding season XP:', error);
      return { levelUp: false, newLevel: 1, totalXP: 0 };
    }
  }

  /**
   * Claim season reward
   */
  async claimSeasonReward(
    userId: string,
    seasonId: string,
    level: number,
    isPremium: boolean
  ): Promise<{ success: boolean; reward?: SeasonReward; error?: string }> {
    try {
      const progress = await this.getUserSeasonProgress(userId, seasonId);
      if (!progress) {
        return { success: false, error: 'Progress not found' };
      }

      // Check level requirement
      if (level > progress.currentLevel) {
        return { success: false, error: 'Level not reached' };
      }

      // Check premium requirement
      if (isPremium && !progress.hasPremium) {
        return { success: false, error: 'Premium pass required' };
      }

      // Check if already claimed
      const claimedArray = isPremium ? progress.claimedPremiumRewards : progress.claimedFreeRewards;
      if (claimedArray.includes(level)) {
        return { success: false, error: 'Already claimed' };
      }

      // Get reward details from season
      const season = await this.getActiveSeason();
      if (!season) {
        return { success: false, error: 'Season not found' };
      }

      const rewards = isPremium ? season.premiumRewards : season.freeRewards;
      const reward = rewards.find(r => r.level === level);
      if (!reward) {
        return { success: false, error: 'Reward not found' };
      }

      // Grant reward
      await this.grantReward(userId, reward);

      // Update claimed list
      const newClaimedArray = [...claimedArray, level];
      const updateKey = isPremium ? 'claimed_premium_rewards' : 'claimed_free_rewards';

      await this.supabase
        .from('user_season_progress')
        .update({ [updateKey]: newClaimedArray })
        .eq('user_id', userId)
        .eq('season_id', seasonId);

      return { success: true, reward };
    } catch (error) {
      console.error('Error claiming season reward:', error);
      return { success: false, error: 'Failed to claim reward' };
    }
  }

  /**
   * Grant reward to user
   */
  private async grantReward(userId: string, reward: SeasonReward): Promise<void> {
    // Implementation depends on reward type
    switch (reward.rewardType) {
      case 'coins':
        // Add coins to wallet
        break;
      case 'xp':
        // Add XP to profile
        break;
      case 'badge':
        // Grant badge
        break;
      case 'icon':
        // Grant icon
        break;
      case 'banner':
        // Grant banner
        break;
      case 'pet_skin':
        // Grant pet skin
        break;
      case 'pet_accessory':
        // Grant pet accessory
        break;
      case 'title':
        // Grant title
        break;
      case 'premium_days':
        // Add premium subscription days
        break;
    }
  }

  /**
   * Purchase premium season pass
   */
  async purchasePremiumPass(userId: string, seasonId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_season_progress')
        .update({
          has_premium: true,
          premium_purchased_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('season_id', seasonId);

      return !error;
    } catch (error) {
      console.error('Error purchasing premium pass:', error);
      return false;
    }
  }

  // ============================================
  // QUESTS
  // ============================================

  /**
   * Get available quests for user
   */
  async getAvailableQuests(userId: string): Promise<Quest[]> {
    try {
      const { data, error } = await this.supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`);

      if (error) {
        console.error('Error fetching quests:', error);
        return [];
      }

      return (data || []).map((q) => ({
        id: q.id,
        questKey: q.quest_key,
        displayName: q.display_name,
        description: q.description,
        questType: q.quest_type,
        requirements: q.requirements || [],
        rewards: q.rewards || [],
        xpReward: q.xp_reward,
        isActive: q.is_active,
        startsAt: q.starts_at,
        endsAt: q.ends_at,
      }));
    } catch (error) {
      console.error('Error in getAvailableQuests:', error);
      return [];
    }
  }

  /**
   * Get user's quest progress
   */
  async getUserQuestProgress(userId: string): Promise<UserQuestProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', userId)
        .is('rewards_claimed_at', null);

      if (error) {
        console.error('Error fetching quest progress:', error);
        return [];
      }

      return (data || []).map((p) => ({
        questId: p.quest_id,
        progress: p.progress || {},
        completedAt: p.completed_at,
        rewardsClaimedAt: p.rewards_claimed_at,
        assignedAt: p.assigned_at,
        expiresAt: p.expires_at,
      }));
    } catch (error) {
      console.error('Error in getUserQuestProgress:', error);
      return [];
    }
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    userId: string,
    questId: string,
    progressKey: string,
    incrementBy: number = 1
  ): Promise<boolean> {
    try {
      // Get current progress
      const { data: existing } = await this.supabase
        .from('user_quest_progress')
        .select('progress')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .single();

      const currentProgress = existing?.progress || {};
      const newValue = (currentProgress[progressKey] || 0) + incrementBy;

      await this.supabase
        .from('user_quest_progress')
        .upsert({
          user_id: userId,
          quest_id: questId,
          progress: {
            ...currentProgress,
            [progressKey]: newValue,
          },
        });

      // Check if quest is complete
      await this.checkQuestCompletion(userId, questId);

      return true;
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return false;
    }
  }

  /**
   * Check if quest is completed
   */
  private async checkQuestCompletion(userId: string, questId: string): Promise<void> {
    try {
      // Get quest requirements
      const { data: quest } = await this.supabase
        .from('quests')
        .select('requirements')
        .eq('id', questId)
        .single();

      if (!quest) return;

      // Get user progress
      const { data: progress } = await this.supabase
        .from('user_quest_progress')
        .select('progress')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .single();

      if (!progress) return;

      // Check all requirements
      const requirements = quest.requirements as QuestRequirement[];
      const userProgress = progress.progress;

      const isComplete = requirements.every((req) => {
        const current = userProgress[req.type] || 0;
        return current >= req.target;
      });

      if (isComplete) {
        await this.supabase
          .from('user_quest_progress')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('quest_id', questId)
          .is('completed_at', null);
      }
    } catch (error) {
      console.error('Error checking quest completion:', error);
    }
  }

  /**
   * Claim quest rewards
   */
  async claimQuestRewards(userId: string, questId: string): Promise<{
    success: boolean;
    rewards?: QuestRewardItem[];
    xp?: number;
    error?: string;
  }> {
    try {
      // Verify quest is completed
      const { data: progress } = await this.supabase
        .from('user_quest_progress')
        .select('completed_at, rewards_claimed_at')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .single();

      if (!progress?.completed_at) {
        return { success: false, error: 'Quest not completed' };
      }

      if (progress.rewards_claimed_at) {
        return { success: false, error: 'Rewards already claimed' };
      }

      // Get quest rewards
      const { data: quest } = await this.supabase
        .from('quests')
        .select('rewards, xp_reward')
        .eq('id', questId)
        .single();

      if (!quest) {
        return { success: false, error: 'Quest not found' };
      }

      // Grant rewards
      const rewards = quest.rewards as QuestRewardItem[];
      for (const reward of rewards) {
        // Grant each reward based on type
      }

      // Add XP
      if (quest.xp_reward > 0) {
        await this.addSeasonXP(userId, quest.xp_reward);
      }

      // Mark as claimed
      await this.supabase
        .from('user_quest_progress')
        .update({ rewards_claimed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('quest_id', questId);

      return {
        success: true,
        rewards,
        xp: quest.xp_reward,
      };
    } catch (error) {
      console.error('Error claiming quest rewards:', error);
      return { success: false, error: 'Failed to claim rewards' };
    }
  }

  /**
   * Assign daily quests to user
   */
  async assignDailyQuests(userId: string): Promise<void> {
    try {
      // Get all daily quests
      const { data: dailyQuests } = await this.supabase
        .from('quests')
        .select('*')
        .eq('quest_type', 'daily')
        .eq('is_active', true);

      if (!dailyQuests || dailyQuests.length === 0) return;

      // Pick 3 random daily quests
      const shuffled = dailyQuests.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);

      // Calculate expiry (end of day)
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      // Assign quests
      for (const quest of selected) {
        await this.supabase.from('user_quest_progress').upsert({
          user_id: userId,
          quest_id: quest.id,
          progress: {},
          assigned_at: new Date().toISOString(),
          expires_at: tomorrow.toISOString(),
        });
      }
    } catch (error) {
      console.error('Error assigning daily quests:', error);
    }
  }

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  /**
   * Check and award achievements
   */
  async checkAchievements(userId: string, context: {
    type: string;
    value?: number;
    metadata?: Record<string, any>;
  }): Promise<string[]> {
    const awardedBadges: string[] = [];

    // This would check various achievement conditions
    // and award badges/achievements when met

    return awardedBadges;
  }

  /**
   * Get user's total progression stats
   */
  async getUserProgressionStats(userId: string): Promise<{
    totalXP: number;
    seasonLevel: number;
    questsCompleted: number;
    achievementsUnlocked: number;
    currentStreak: number;
  }> {
    try {
      // Aggregate stats from various sources
      const season = await this.getActiveSeason();
      let seasonLevel = 1;

      if (season) {
        const progress = await this.getUserSeasonProgress(userId, season.id);
        seasonLevel = progress?.currentLevel || 1;
      }

      // Get quest completions
      const { count: questsCompleted } = await this.supabase
        .from('user_quest_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      // Get achievements
      const { count: achievementsUnlocked } = await this.supabase
        .from('user_badges_enhanced')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get streak
      const { data: streak } = await this.supabase
        .from('user_reading_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      return {
        totalXP: 0, // Would need to track this
        seasonLevel,
        questsCompleted: questsCompleted || 0,
        achievementsUnlocked: achievementsUnlocked || 0,
        currentStreak: streak?.current_streak || 0,
      };
    } catch (error) {
      console.error('Error getting progression stats:', error);
      return {
        totalXP: 0,
        seasonLevel: 1,
        questsCompleted: 0,
        achievementsUnlocked: 0,
        currentStreak: 0,
      };
    }
  }
}

export const metaProgressionService = new MetaProgressionService();
