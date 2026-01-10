/**
 * Achievement System Service
 * Provides gamification with badges, rewards, levels, and milestones.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xpReward: number;
  requirement: AchievementRequirement;
  isSecret: boolean;
  unlockedAt?: string;
}

export type AchievementCategory =
  | 'reading'
  | 'writing'
  | 'social'
  | 'exploration'
  | 'dedication'
  | 'special';

export interface AchievementRequirement {
  type: string;
  target: number;
  current?: number;
}

export interface UserLevel {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  title: string;
  perks: string[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  achievementCount: number;
  rank: number;
  // Weekly leaderboard fields
  storiesRead?: number;
  xpGained?: number;
  // Streaks leaderboard fields
  currentStreak?: number;
  longestStreak?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'read' | 'write' | 'social' | 'explore';
  requirement: number;
  progress: number;
  xpReward: number;
  expiresAt: string;
  completed: boolean;
}

export interface Streak {
  type: 'reading' | 'writing' | 'login';
  current: number;
  longest: number;
  lastActivity: string;
}

// Level titles and XP requirements
const LEVEL_CONFIG = {
  xpPerLevel: 1000,
  xpMultiplier: 1.2,
  titles: [
    { level: 1, title: 'Novice Reader', perks: [] },
    { level: 5, title: 'Story Enthusiast', perks: ['Custom profile badge'] },
    { level: 10, title: 'Bookworm', perks: ['Early access to new features'] },
    { level: 15, title: 'Tale Keeper', perks: ['Extra collection slots'] },
    { level: 20, title: 'Story Sage', perks: ['Priority support'] },
    { level: 25, title: 'Narrative Master', perks: ['Exclusive themes'] },
    { level: 30, title: 'Legend Weaver', perks: ['Beta features access'] },
    { level: 40, title: 'Mythic Chronicler', perks: ['Custom title creation'] },
    { level: 50, title: 'Eternal Storyteller', perks: ['Hall of Fame entry'] },
  ],
};

// Achievement definitions
const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Reading achievements
  {
    id: 'first-story',
    name: 'First Steps',
    description: 'Complete your first story',
    icon: '📖',
    category: 'reading',
    tier: 'bronze',
    xpReward: 100,
    requirement: { type: 'stories_completed', target: 1 },
    isSecret: false,
  },
  {
    id: 'story-marathon',
    name: 'Story Marathon',
    description: 'Complete 10 stories',
    icon: '🏃',
    category: 'reading',
    tier: 'silver',
    xpReward: 500,
    requirement: { type: 'stories_completed', target: 10 },
    isSecret: false,
  },
  {
    id: 'story-champion',
    name: 'Story Champion',
    description: 'Complete 50 stories',
    icon: '🏆',
    category: 'reading',
    tier: 'gold',
    xpReward: 2000,
    requirement: { type: 'stories_completed', target: 50 },
    isSecret: false,
  },
  {
    id: 'story-legend',
    name: 'Story Legend',
    description: 'Complete 100 stories',
    icon: '👑',
    category: 'reading',
    tier: 'platinum',
    xpReward: 5000,
    requirement: { type: 'stories_completed', target: 100 },
    isSecret: false,
  },
  {
    id: 'choice-maker',
    name: 'Choice Maker',
    description: 'Make 100 story choices',
    icon: '🔀',
    category: 'reading',
    tier: 'bronze',
    xpReward: 200,
    requirement: { type: 'choices_made', target: 100 },
    isSecret: false,
  },
  {
    id: 'decision-master',
    name: 'Decision Master',
    description: 'Make 1000 story choices',
    icon: '⚡',
    category: 'reading',
    tier: 'gold',
    xpReward: 1500,
    requirement: { type: 'choices_made', target: 1000 },
    isSecret: false,
  },

  // Streak achievements
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain a 7-day reading streak',
    icon: '🔥',
    category: 'dedication',
    tier: 'bronze',
    xpReward: 300,
    requirement: { type: 'reading_streak', target: 7 },
    isSecret: false,
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintain a 30-day reading streak',
    icon: '💪',
    category: 'dedication',
    tier: 'gold',
    xpReward: 1500,
    requirement: { type: 'reading_streak', target: 30 },
    isSecret: false,
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day reading streak',
    icon: '🌟',
    category: 'dedication',
    tier: 'diamond',
    xpReward: 5000,
    requirement: { type: 'reading_streak', target: 100 },
    isSecret: false,
  },

  // Social achievements
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Follow 10 other readers',
    icon: '🦋',
    category: 'social',
    tier: 'bronze',
    xpReward: 150,
    requirement: { type: 'following_count', target: 10 },
    isSecret: false,
  },
  {
    id: 'popular-reader',
    name: 'Popular Reader',
    description: 'Gain 50 followers',
    icon: '⭐',
    category: 'social',
    tier: 'silver',
    xpReward: 500,
    requirement: { type: 'follower_count', target: 50 },
    isSecret: false,
  },
  {
    id: 'community-star',
    name: 'Community Star',
    description: 'Gain 500 followers',
    icon: '🌠',
    category: 'social',
    tier: 'platinum',
    xpReward: 3000,
    requirement: { type: 'follower_count', target: 500 },
    isSecret: false,
  },
  {
    id: 'club-founder',
    name: 'Club Founder',
    description: 'Create a reading club',
    icon: '🏛️',
    category: 'social',
    tier: 'silver',
    xpReward: 400,
    requirement: { type: 'clubs_created', target: 1 },
    isSecret: false,
  },

  // Writing achievements
  {
    id: 'first-creation',
    name: 'First Creation',
    description: 'Publish your first story',
    icon: '✍️',
    category: 'writing',
    tier: 'bronze',
    xpReward: 300,
    requirement: { type: 'stories_published', target: 1 },
    isSecret: false,
  },
  {
    id: 'prolific-author',
    name: 'Prolific Author',
    description: 'Publish 10 stories',
    icon: '📚',
    category: 'writing',
    tier: 'gold',
    xpReward: 2000,
    requirement: { type: 'stories_published', target: 10 },
    isSecret: false,
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Write 10,000 words total',
    icon: '🖊️',
    category: 'writing',
    tier: 'silver',
    xpReward: 800,
    requirement: { type: 'total_words_written', target: 10000 },
    isSecret: false,
  },

  // Exploration achievements
  {
    id: 'genre-explorer',
    name: 'Genre Explorer',
    description: 'Read stories from 5 different genres',
    icon: '🗺️',
    category: 'exploration',
    tier: 'bronze',
    xpReward: 250,
    requirement: { type: 'genres_explored', target: 5 },
    isSecret: false,
  },
  {
    id: 'path-finder',
    name: 'Path Finder',
    description: 'Discover 10 different story endings',
    icon: '🔍',
    category: 'exploration',
    tier: 'silver',
    xpReward: 500,
    requirement: { type: 'unique_endings', target: 10 },
    isSecret: false,
  },

  // Secret achievements
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Read between midnight and 4am',
    icon: '🦉',
    category: 'special',
    tier: 'bronze',
    xpReward: 200,
    requirement: { type: 'late_night_reading', target: 1 },
    isSecret: true,
  },
  {
    id: 'speed-reader',
    name: 'Speed Reader',
    description: 'Complete a story in under 5 minutes',
    icon: '⚡',
    category: 'special',
    tier: 'silver',
    xpReward: 300,
    requirement: { type: 'speed_completion', target: 1 },
    isSecret: true,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Find all endings in a single story',
    icon: '💎',
    category: 'special',
    tier: 'gold',
    xpReward: 1000,
    requirement: { type: 'all_endings_found', target: 1 },
    isSecret: true,
  },
];

export const achievementService = {
  /**
   * Get all achievements with user's progress
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    // Get user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    const unlockedMap = new Map(
      (userAchievements || []).map((ua) => [ua.achievement_id, ua.unlocked_at])
    );

    // Get user's progress stats
    const progress = await this.getUserProgress(userId);

    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlockedAt: unlockedMap.get(achievement.id),
      requirement: {
        ...achievement.requirement,
        current: progress[achievement.requirement.type] || 0,
      },
    }));
  },

  /**
   * Get user's progress on various metrics
   */
  async getUserProgress(userId: string): Promise<Record<string, number>> {
    const { data: user } = await supabase
      .from('users')
      .select('stories_completed, choices_made, total_reading_time')
      .eq('id', userId)
      .single();

    const { data: streak } = await supabase
      .from('user_reading_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single();

    const { count: followingCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    const { count: followerCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const { count: publishedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_published', true);

    return {
      stories_completed: user?.stories_completed || 0,
      choices_made: user?.choices_made || 0,
      total_reading_time: user?.total_reading_time || 0,
      reading_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      following_count: followingCount || 0,
      follower_count: followerCount || 0,
      stories_published: publishedStories || 0,
    };
  },

  /**
   * Check and unlock achievements for a user
   */
  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const achievements = await this.getUserAchievements(userId);
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of achievements) {
      if (achievement.unlockedAt) continue; // Already unlocked

      const { current = 0, target } = achievement.requirement;
      if (current >= target) {
        // Unlock the achievement
        const unlocked = await this.unlockAchievement(userId, achievement.id);
        if (unlocked) {
          newlyUnlocked.push({
            ...achievement,
            unlockedAt: new Date().toISOString(),
          });
        }
      }
    }

    return newlyUnlocked;
  },

  /**
   * Unlock a specific achievement
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return false;

    const { error } = await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }

    // Award XP
    await this.awardXp(userId, achievement.xpReward, `Achievement: ${achievement.name}`);

    return true;
  },

  /**
   * Get user's level information
   */
  async getUserLevel(userId: string): Promise<UserLevel> {
    const { data } = await supabase
      .from('user_levels')
      .select('level, current_xp, total_xp')
      .eq('user_id', userId)
      .single();

    const totalXp = data?.total_xp || 0;
    const level = this.calculateLevel(totalXp);
    const xpForCurrentLevel = this.getXpForLevel(level);
    const xpForNextLevel = this.getXpForLevel(level + 1);
    const currentXpInLevel = totalXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    const titleConfig =
      [...LEVEL_CONFIG.titles].reverse().find((t) => level >= t.level) || LEVEL_CONFIG.titles[0];

    return {
      level,
      currentXp: currentXpInLevel,
      xpToNextLevel: xpNeeded,
      totalXp,
      title: titleConfig.title,
      perks: titleConfig.perks,
    };
  },

  /**
   * Calculate level from total XP
   */
  calculateLevel(totalXp: number): number {
    let level = 1;
    let xpRequired = 0;

    while (xpRequired <= totalXp) {
      xpRequired += Math.floor(
        LEVEL_CONFIG.xpPerLevel * Math.pow(LEVEL_CONFIG.xpMultiplier, level - 1)
      );
      if (xpRequired <= totalXp) level++;
    }

    return level;
  },

  /**
   * Get XP required for a specific level
   */
  getXpForLevel(level: number): number {
    let xp = 0;
    for (let i = 1; i < level; i++) {
      xp += Math.floor(LEVEL_CONFIG.xpPerLevel * Math.pow(LEVEL_CONFIG.xpMultiplier, i - 1));
    }
    return xp;
  },

  /**
   * Award XP to a user
   */
  async awardXp(userId: string, amount: number, reason: string): Promise<void> {
    const { data: current } = await supabase
      .from('user_levels')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    const newTotal = (current?.total_xp || 0) + amount;

    await supabase.from('user_levels').upsert({
      user_id: userId,
      total_xp: newTotal,
      current_xp: newTotal,
      level: this.calculateLevel(newTotal),
      updated_at: new Date().toISOString(),
    });

    // Log XP gain
    await supabase.from('xp_history').insert({
      user_id: userId,
      amount,
      reason,
      created_at: new Date().toISOString(),
    });
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'xp' | 'achievements' | 'streaks' = 'xp',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('user_levels')
      .select(
        `
        user_id,
        level,
        total_xp,
        users:user_id (
          username,
          display_name,
          avatar_url
        )
      `
      )
      .order('total_xp', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map((entry, index) => {
      const user = entry.users as {
        username?: string;
        display_name?: string;
        avatar_url?: string;
      } | null;
      return {
        userId: entry.user_id,
        username: user?.username || 'Unknown',
        displayName: user?.display_name || 'Unknown User',
        avatarUrl: user?.avatar_url,
        level: entry.level,
        totalXp: entry.total_xp,
        achievementCount: 0, // Would need separate query
        rank: index + 1,
      };
    });
  },

  /**
   * Get daily challenges
   */
  async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const { data: existing } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    if (existing && existing.length > 0) {
      return existing.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.challenge_type,
        requirement: c.requirement,
        progress: c.progress,
        xpReward: c.xp_reward,
        expiresAt: c.expires_at,
        completed: c.completed,
      }));
    }

    // Generate new daily challenges
    const challenges: Omit<DailyChallenge, 'id'>[] = [
      {
        title: 'Daily Reader',
        description: 'Read for 15 minutes today',
        type: 'read',
        requirement: 15,
        progress: 0,
        xpReward: 50,
        expiresAt: today.toISOString(),
        completed: false,
      },
      {
        title: 'Choice Maker',
        description: 'Make 10 story choices',
        type: 'read',
        requirement: 10,
        progress: 0,
        xpReward: 30,
        expiresAt: today.toISOString(),
        completed: false,
      },
      {
        title: 'Explorer',
        description: 'Start a new story',
        type: 'explore',
        requirement: 1,
        progress: 0,
        xpReward: 25,
        expiresAt: today.toISOString(),
        completed: false,
      },
    ];

    // Save to database
    const { data: saved } = await supabase
      .from('daily_challenges')
      .insert(
        challenges.map((c) => ({
          user_id: userId,
          title: c.title,
          description: c.description,
          challenge_type: c.type,
          requirement: c.requirement,
          progress: c.progress,
          xp_reward: c.xpReward,
          expires_at: c.expiresAt,
          completed: c.completed,
        }))
      )
      .select();

    return (saved || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.challenge_type,
      requirement: c.requirement,
      progress: c.progress,
      xpReward: c.xp_reward,
      expiresAt: c.expires_at,
      completed: c.completed,
    }));
  },

  /**
   * Update daily challenge progress
   */
  async updateChallengeProgress(challengeId: string, progress: number): Promise<boolean> {
    const { data: challenge } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge || challenge.completed) return false;

    const newProgress = Math.min(progress, challenge.requirement);
    const completed = newProgress >= challenge.requirement;

    await supabase
      .from('daily_challenges')
      .update({ progress: newProgress, completed })
      .eq('id', challengeId);

    if (completed) {
      await this.awardXp(
        challenge.user_id,
        challenge.xp_reward,
        `Daily Challenge: ${challenge.title}`
      );
    }

    return completed;
  },
};

export default achievementService;
