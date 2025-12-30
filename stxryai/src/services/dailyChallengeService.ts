/**
 * Daily Challenges Service
 * Provides rotating daily challenges with rewards to boost engagement
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type ChallengeType = 
  | 'read_stories' 
  | 'read_chapters' 
  | 'read_time' 
  | 'make_choices' 
  | 'explore_genre' 
  | 'complete_story' 
  | 'social_share' 
  | 'leave_review' 
  | 'bookmark_story'
  | 'reading_streak';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface DailyChallenge {
  id: string;
  challengeDate: string;
  challengeType: ChallengeType;
  difficulty: ChallengeDifficulty;
  title: string;
  description: string;
  requirement: number;
  xpReward: number;
  bonusReward?: {
    type: 'streak_freeze' | 'energy' | 'badge' | 'coins';
    amount: number;
    badgeId?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface UserDailyChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: DailyChallenge;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeProgress {
  challenge: DailyChallenge;
  userProgress: UserDailyChallenge;
  percentComplete: number;
  timeRemaining: string;
}

// ========================================
// CHALLENGE TEMPLATES
// ========================================

const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'challengeDate' | 'isActive' | 'createdAt'>[] = [
  // Easy challenges
  {
    challengeType: 'read_chapters',
    difficulty: 'easy',
    title: 'Chapter Hunter',
    description: 'Read 3 chapters today',
    requirement: 3,
    xpReward: 50,
  },
  {
    challengeType: 'make_choices',
    difficulty: 'easy',
    title: 'Decision Maker',
    description: 'Make 10 story choices',
    requirement: 10,
    xpReward: 50,
  },
  {
    challengeType: 'read_time',
    difficulty: 'easy',
    title: 'Quick Read',
    description: 'Spend 15 minutes reading',
    requirement: 15,
    xpReward: 50,
  },
  {
    challengeType: 'bookmark_story',
    difficulty: 'easy',
    title: 'Collector',
    description: 'Bookmark a story for later',
    requirement: 1,
    xpReward: 30,
  },
  // Medium challenges
  {
    challengeType: 'read_chapters',
    difficulty: 'medium',
    title: 'Chapter Marathon',
    description: 'Read 10 chapters today',
    requirement: 10,
    xpReward: 150,
  },
  {
    challengeType: 'read_time',
    difficulty: 'medium',
    title: 'Dedicated Reader',
    description: 'Spend 45 minutes reading',
    requirement: 45,
    xpReward: 150,
  },
  {
    challengeType: 'explore_genre',
    difficulty: 'medium',
    title: 'Genre Explorer',
    description: 'Read stories from 2 different genres',
    requirement: 2,
    xpReward: 200,
  },
  {
    challengeType: 'complete_story',
    difficulty: 'medium',
    title: 'Story Finisher',
    description: 'Complete a story today',
    requirement: 1,
    xpReward: 200,
  },
  {
    challengeType: 'leave_review',
    difficulty: 'medium',
    title: 'Critic',
    description: 'Leave a review on a story',
    requirement: 1,
    xpReward: 100,
  },
  // Hard challenges
  {
    challengeType: 'read_chapters',
    difficulty: 'hard',
    title: 'Chapter Beast',
    description: 'Read 25 chapters today',
    requirement: 25,
    xpReward: 400,
    bonusReward: { type: 'energy', amount: 10 },
  },
  {
    challengeType: 'read_time',
    difficulty: 'hard',
    title: 'Marathon Reader',
    description: 'Spend 2 hours reading',
    requirement: 120,
    xpReward: 500,
    bonusReward: { type: 'streak_freeze', amount: 1 },
  },
  {
    challengeType: 'complete_story',
    difficulty: 'hard',
    title: 'Story Slayer',
    description: 'Complete 3 stories today',
    requirement: 3,
    xpReward: 600,
    bonusReward: { type: 'coins', amount: 100 },
  },
  // Legendary challenges
  {
    challengeType: 'make_choices',
    difficulty: 'legendary',
    title: 'Fate Weaver',
    description: 'Make 100 story choices in a day',
    requirement: 100,
    xpReward: 1000,
    bonusReward: { type: 'badge', amount: 1, badgeId: 'fate-weaver' },
  },
  {
    challengeType: 'reading_streak',
    difficulty: 'legendary',
    title: 'Streak Legend',
    description: 'Maintain a 30-day reading streak',
    requirement: 30,
    xpReward: 2000,
    bonusReward: { type: 'badge', amount: 1, badgeId: 'streak-legend' },
  },
];

// ========================================
// SERVICE CLASS
// ========================================

class DailyChallengeService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Get today's challenges
   */
  async getTodaysChallenges(): Promise<DailyChallenge[]> {
    const supabase = this.getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .eq('is_active', true)
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Error fetching daily challenges:', error);
      throw error;
    }

    return (data || []).map(this.mapChallenge);
  }

  /**
   * Get user's progress on today's challenges
   */
  async getUserChallengeProgress(userId: string): Promise<ChallengeProgress[]> {
    const challenges = await this.getTodaysChallenges();
    const supabase = this.getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const challengeIds = challenges.map(c => c.id);
    
    const { data: userChallenges, error } = await supabase
      .from('user_daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds);

    if (error) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }

    // Calculate time remaining until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msRemaining = midnight.getTime() - now.getTime();
    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const timeRemaining = `${hoursRemaining}h ${minutesRemaining}m`;

    return challenges.map(challenge => {
      const userChallenge = (userChallenges || []).find(uc => uc.challenge_id === challenge.id);
      
      const userProgress: UserDailyChallenge = userChallenge 
        ? this.mapUserChallenge(userChallenge)
        : {
            id: '',
            userId,
            challengeId: challenge.id,
            progress: 0,
            completed: false,
            rewardClaimed: false,
            createdAt: today,
            updatedAt: today,
          };

      return {
        challenge,
        userProgress,
        percentComplete: Math.min(100, Math.round((userProgress.progress / challenge.requirement) * 100)),
        timeRemaining,
      };
    });
  }

  /**
   * Update challenge progress
   */
  async updateProgress(
    userId: string,
    challengeType: ChallengeType,
    increment: number = 1
  ): Promise<UserDailyChallenge[]> {
    const supabase = this.getSupabase();
    const today = new Date().toISOString().split('T')[0];

    // Get today's challenges of this type
    const { data: challenges, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .eq('challenge_type', challengeType)
      .eq('is_active', true);

    if (challengeError || !challenges || challenges.length === 0) {
      return [];
    }

    const updatedChallenges: UserDailyChallenge[] = [];

    for (const challenge of challenges) {
      // Upsert user challenge progress
      const { data: existingProgress } = await supabase
        .from('user_daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .single();

      const currentProgress = existingProgress?.progress || 0;
      const newProgress = currentProgress + increment;
      const completed = newProgress >= challenge.requirement;

      const { data, error } = await supabase
        .from('user_daily_challenges')
        .upsert({
          user_id: userId,
          challenge_id: challenge.id,
          progress: newProgress,
          completed,
          completed_at: completed && !existingProgress?.completed ? new Date().toISOString() : existingProgress?.completed_at,
        }, {
          onConflict: 'user_id,challenge_id',
        })
        .select()
        .single();

      if (!error && data) {
        updatedChallenges.push(this.mapUserChallenge(data));
      }
    }

    return updatedChallenges;
  }

  /**
   * Claim challenge reward
   */
  async claimReward(userId: string, challengeId: string): Promise<{ success: boolean; xpAwarded: number; bonusReward?: DailyChallenge['bonusReward'] }> {
    const supabase = this.getSupabase();

    // Get user challenge
    const { data: userChallenge, error: ucError } = await supabase
      .from('user_daily_challenges')
      .select('*, daily_challenges(*)')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (ucError || !userChallenge) {
      return { success: false, xpAwarded: 0 };
    }

    if (!userChallenge.completed) {
      return { success: false, xpAwarded: 0 };
    }

    if (userChallenge.reward_claimed) {
      return { success: false, xpAwarded: 0 };
    }

    // Mark as claimed
    const { error: updateError } = await supabase
      .from('user_daily_challenges')
      .update({ reward_claimed: true })
      .eq('id', userChallenge.id);

    if (updateError) {
      console.error('Error claiming reward:', updateError);
      return { success: false, xpAwarded: 0 };
    }

    const challenge = userChallenge.daily_challenges;
    
    // Award XP
    await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: challenge.xp_reward,
    });

    // Handle bonus reward
    const bonusReward = challenge.bonus_reward as DailyChallenge['bonusReward'];
    if (bonusReward) {
      await this.awardBonusReward(userId, bonusReward);
    }

    return {
      success: true,
      xpAwarded: challenge.xp_reward,
      bonusReward,
    };
  }

  /**
   * Generate daily challenges (called by cron job or admin)
   */
  async generateDailyChallenges(date: Date = new Date()): Promise<DailyChallenge[]> {
    const supabase = this.getSupabase();
    const dateStr = date.toISOString().split('T')[0];

    // Check if challenges already exist for this date
    const { data: existing } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', dateStr)
      .limit(1);

    if (existing && existing.length > 0) {
      return this.getTodaysChallenges();
    }

    // Select challenges: 2 easy, 2 medium, 1 hard, 1 legendary (rotating)
    const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    
    const selected = [
      ...shuffled.filter(c => c.difficulty === 'easy').slice(0, 2),
      ...shuffled.filter(c => c.difficulty === 'medium').slice(0, 2),
      ...shuffled.filter(c => c.difficulty === 'hard').slice(0, 1),
      ...shuffled.filter(c => c.difficulty === 'legendary').slice(0, 1),
    ];

    // Insert challenges
    const { data, error } = await supabase
      .from('daily_challenges')
      .insert(selected.map(template => ({
        challenge_date: dateStr,
        challenge_type: template.challengeType,
        difficulty: template.difficulty,
        title: template.title,
        description: template.description,
        requirement: template.requirement,
        xp_reward: template.xpReward,
        bonus_reward: template.bonusReward,
        is_active: true,
      })))
      .select();

    if (error) {
      console.error('Error generating daily challenges:', error);
      throw error;
    }

    return (data || []).map(this.mapChallenge);
  }

  /**
   * Get challenge statistics for a user
   */
  async getUserChallengeStats(userId: string): Promise<{
    totalCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalXpEarned: number;
    favoriteType: ChallengeType | null;
  }> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_daily_challenges')
      .select('*, daily_challenges(challenge_type, xp_reward)')
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('reward_claimed', true);

    if (error) {
      console.error('Error fetching challenge stats:', error);
      return {
        totalCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXpEarned: 0,
        favoriteType: null,
      };
    }

    const completed = data || [];
    const totalXpEarned = completed.reduce((sum, c) => sum + (c.daily_challenges?.xp_reward || 0), 0);

    // Count by type
    const typeCounts: Record<string, number> = {};
    completed.forEach(c => {
      const type = c.daily_challenges?.challenge_type;
      if (type) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });

    const favoriteType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as ChallengeType || null;

    // Calculate streak based on consecutive days with completed challenges
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (completed.length > 0) {
      // Sort by completion date (most recent first)
      const sorted = [...completed].sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at || 0).getTime();
        const dateB = new Date(b.completed_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Calculate current streak (consecutive days from today backwards)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let expectedDate = new Date(today);
      let streakBroken = false;

      for (const challenge of sorted) {
        const completedDate = new Date(challenge.completed_at || challenge.created_at);
        completedDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((expectedDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!streakBroken && daysDiff === 0) {
          // Perfect match - continue streak
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (!streakBroken && daysDiff === 1) {
          // One day gap - continue streak
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 2); // Skip the gap day
        } else if (!streakBroken) {
          // Streak broken
          streakBroken = true;
        }
      }

      // Calculate longest streak (any consecutive period)
      const dates = sorted.map(c => {
        const date = new Date(c.completed_at || c.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      // Remove duplicates and sort
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

      if (uniqueDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
          const daysDiff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            // Streak broken
            tempStreak = 1;
          }
        }
      }
    }

    return {
      totalCompleted: completed.length,
      currentStreak,
      longestStreak,
      totalXpEarned,
      favoriteType,
    };
  }

  // ==================== PRIVATE METHODS ====================

  private async awardBonusReward(userId: string, reward: NonNullable<DailyChallenge['bonusReward']>) {
    const supabase = this.getSupabase();

    switch (reward.type) {
      case 'streak_freeze':
        await supabase.rpc('add_streak_freezes', {
          p_user_id: userId,
          p_amount: reward.amount,
        });
        break;
      case 'energy':
        await supabase.rpc('add_user_energy', {
          p_user_id: userId,
          p_amount: reward.amount,
        });
        break;
      case 'coins':
        await supabase.rpc('add_user_coins', {
          p_user_id: userId,
          p_amount: reward.amount,
        });
        break;
      case 'badge':
        if (reward.badgeId) {
          await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: reward.badgeId,
            awarded_at: new Date().toISOString(),
          });
        }
        break;
    }
  }

  private mapChallenge(data: any): DailyChallenge {
    return {
      id: data.id,
      challengeDate: data.challenge_date,
      challengeType: data.challenge_type,
      difficulty: data.difficulty,
      title: data.title,
      description: data.description,
      requirement: data.requirement,
      xpReward: data.xp_reward,
      bonusReward: data.bonus_reward,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  private mapUserChallenge(data: any): UserDailyChallenge {
    return {
      id: data.id,
      userId: data.user_id,
      challengeId: data.challenge_id,
      progress: data.progress || 0,
      completed: data.completed || false,
      rewardClaimed: data.reward_claimed || false,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const dailyChallengeService = new DailyChallengeService();

