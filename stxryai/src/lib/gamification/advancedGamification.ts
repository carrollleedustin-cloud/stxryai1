/**
 * Advanced Gamification Engine
 * Comprehensive gamification system with quests, daily challenges, seasons, and rewards
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'epic';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  expiresAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  category: 'writing' | 'reading' | 'social' | 'creative' | 'special';
}

export interface QuestObjective {
  id: string;
  description: string;
  type: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'xp' | 'currency' | 'item' | 'badge' | 'pet-accessory' | 'title';
  amount?: number;
  itemId?: string;
  name: string;
}

export interface DailyChallenge {
  id: string;
  date: Date;
  challenges: Challenge[];
  bonusMultiplier: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: string;
    value: number;
  };
  reward: {
    xp: number;
    currency: number;
  };
  completed: boolean;
}

export interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  rewards: SeasonReward[];
  leaderboard: LeaderboardEntry[];
}

export interface SeasonReward {
  rank: number;
  rewards: QuestReward[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

export interface Streak {
  type: 'writing' | 'reading' | 'login';
  current: number;
  longest: number;
  lastActivity: Date;
  multiplier: number;
}

export interface VirtualCurrency {
  gems: number;
  coins: number;
  tokens: number;
}

// ============================================================================
// QUEST SYSTEM
// ============================================================================

/**
 * Generate daily quests
 */
export function generateDailyQuests(): Quest[] {
  const quests: Quest[] = [
    {
      id: 'daily-write-1',
      title: 'Morning Pages',
      description: 'Write 500 words today',
      type: 'daily',
      objectives: [
        {
          id: 'obj-1',
          description: 'Write 500 words',
          type: 'words_written',
          target: 500,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 100, name: '100 XP' },
        { type: 'currency', amount: 50, name: '50 Coins' },
      ],
      expiresAt: getEndOfDay(),
      difficulty: 'easy',
      category: 'writing',
    },
    {
      id: 'daily-read-1',
      title: 'Daily Reader',
      description: 'Read 2 chapters today',
      type: 'daily',
      objectives: [
        {
          id: 'obj-2',
          description: 'Read 2 chapters',
          type: 'chapters_read',
          target: 2,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 75, name: '75 XP' },
        { type: 'currency', amount: 30, name: '30 Coins' },
      ],
      expiresAt: getEndOfDay(),
      difficulty: 'easy',
      category: 'reading',
    },
    {
      id: 'daily-social-1',
      title: 'Community Engagement',
      description: 'Leave 3 thoughtful comments',
      type: 'daily',
      objectives: [
        {
          id: 'obj-3',
          description: 'Leave 3 comments',
          type: 'comments_written',
          target: 3,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 60, name: '60 XP' },
        { type: 'currency', amount: 25, name: '25 Coins' },
      ],
      expiresAt: getEndOfDay(),
      difficulty: 'easy',
      category: 'social',
    },
  ];

  return quests;
}

/**
 * Generate weekly quests
 */
export function generateWeeklyQuests(): Quest[] {
  return [
    {
      id: 'weekly-write-1',
      title: 'Weekly Writer',
      description: 'Write 5,000 words this week',
      type: 'weekly',
      objectives: [
        {
          id: 'obj-w1',
          description: 'Write 5,000 words',
          type: 'words_written',
          target: 5000,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 500, name: '500 XP' },
        { type: 'currency', amount: 200, name: '200 Coins' },
        { type: 'item', itemId: 'boost-1', name: 'XP Boost (24h)' },
      ],
      expiresAt: getEndOfWeek(),
      difficulty: 'medium',
      category: 'writing',
    },
    {
      id: 'weekly-read-1',
      title: 'Reading Marathon',
      description: 'Complete 5 stories this week',
      type: 'weekly',
      objectives: [
        {
          id: 'obj-w2',
          description: 'Complete 5 stories',
          type: 'stories_completed',
          target: 5,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 400, name: '400 XP' },
        { type: 'currency', amount: 150, name: '150 Coins' },
      ],
      expiresAt: getEndOfWeek(),
      difficulty: 'medium',
      category: 'reading',
    },
  ];
}

/**
 * Generate epic quests
 */
export function generateEpicQuests(): Quest[] {
  return [
    {
      id: 'epic-1',
      title: 'The Grand Saga',
      description: 'Create a complete 10-chapter story',
      type: 'epic',
      objectives: [
        {
          id: 'epic-obj-1',
          description: 'Write 10 chapters',
          type: 'chapters_in_story',
          target: 10,
          current: 0,
          completed: false,
        },
        {
          id: 'epic-obj-2',
          description: 'Publish the story',
          type: 'story_published',
          target: 1,
          current: 0,
          completed: false,
        },
        {
          id: 'epic-obj-3',
          description: 'Get 10 ratings',
          type: 'story_ratings',
          target: 10,
          current: 0,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 5000, name: '5,000 XP' },
        { type: 'currency', amount: 1000, name: '1,000 Gems' },
        { type: 'badge', itemId: 'epic-author', name: 'Epic Author Badge' },
        { type: 'title', itemId: 'saga-master', name: 'Saga Master Title' },
      ],
      difficulty: 'extreme',
      category: 'writing',
    },
  ];
}

// ============================================================================
// STREAK SYSTEM
// ============================================================================

/**
 * Update streak
 */
export function updateStreak(streak: Streak, activityDate: Date): Streak {
  const lastActivity = new Date(streak.lastActivity);
  const daysSinceLastActivity = Math.floor(
    (activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity === 1) {
    // Consecutive day
    return {
      ...streak,
      current: streak.current + 1,
      longest: Math.max(streak.current + 1, streak.longest),
      lastActivity: activityDate,
      multiplier: calculateStreakMultiplier(streak.current + 1),
    };
  } else if (daysSinceLastActivity === 0) {
    // Same day
    return streak;
  } else {
    // Streak broken
    return {
      ...streak,
      current: 1,
      lastActivity: activityDate,
      multiplier: 1,
    };
  }
}

/**
 * Calculate streak multiplier
 */
function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 365) return 3.0;
  if (streakDays >= 180) return 2.5;
  if (streakDays >= 90) return 2.0;
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 7) return 1.25;
  return 1.0;
}

// ============================================================================
// REWARD SYSTEM
// ============================================================================

/**
 * Calculate XP with multipliers
 */
export function calculateXP(
  baseXP: number,
  multipliers: {
    streak?: number;
    premium?: boolean;
    event?: number;
    boost?: number;
  }
): number {
  let totalXP = baseXP;

  if (multipliers.streak) {
    totalXP *= multipliers.streak;
  }

  if (multipliers.premium) {
    totalXP *= 1.5; // 50% bonus for premium users
  }

  if (multipliers.event) {
    totalXP *= multipliers.event;
  }

  if (multipliers.boost) {
    totalXP *= multipliers.boost;
  }

  return Math.floor(totalXP);
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Calculate XP needed for next level
 */
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level + 1, 2));
}

/**
 * Grant reward to user
 */
export async function grantReward(userId: string, reward: QuestReward): Promise<void> {
  switch (reward.type) {
    case 'xp':
      // Add XP to user
      console.log(`Granting ${reward.amount} XP to user ${userId}`);
      break;

    case 'currency':
      // Add currency to user
      console.log(`Granting ${reward.amount} currency to user ${userId}`);
      break;

    case 'item':
      // Add item to user inventory
      console.log(`Granting item ${reward.itemId} to user ${userId}`);
      break;

    case 'badge':
      // Award badge to user
      console.log(`Granting badge ${reward.itemId} to user ${userId}`);
      break;

    case 'pet-accessory':
      // Add pet accessory
      console.log(`Granting pet accessory ${reward.itemId} to user ${userId}`);
      break;

    case 'title':
      // Award title to user
      console.log(`Granting title ${reward.itemId} to user ${userId}`);
      break;
  }
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

/**
 * Calculate leaderboard score
 */
export function calculateLeaderboardScore(user: {
  xp: number;
  storiesCreated: number;
  storiesRead: number;
  followers: number;
  rating: number;
}): number {
  return (
    user.xp * 1 +
    user.storiesCreated * 100 +
    user.storiesRead * 10 +
    user.followers * 5 +
    user.rating * 50
  );
}

/**
 * Get user rank
 */
export function getUserRank(score: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  return sortedScores.indexOf(score) + 1;
}

// ============================================================================
// DAILY BONUS SYSTEM
// ============================================================================

/**
 * Calculate daily login bonus
 */
export function calculateDailyBonus(consecutiveDays: number): {
  xp: number;
  currency: number;
  special?: QuestReward;
} {
  const baseXP = 50;
  const baseCurrency = 25;

  const bonus: {
    xp: number;
    currency: number;
    special?: QuestReward;
  } = {
    xp: baseXP * Math.min(consecutiveDays, 7),
    currency: baseCurrency * Math.min(consecutiveDays, 7),
  };

  // Special rewards for milestones
  if (consecutiveDays === 7) {
    bonus.special = {
      type: 'item',
      itemId: 'weekly-chest',
      name: 'Weekly Treasure Chest',
    };
  } else if (consecutiveDays === 30) {
    bonus.special = {
      type: 'item',
      itemId: 'monthly-chest',
      name: 'Monthly Legendary Chest',
    };
  } else if (consecutiveDays === 365) {
    bonus.special = {
      type: 'badge',
      itemId: 'year-warrior',
      name: 'Year Warrior Badge',
    };
  }

  return bonus;
}

// ============================================================================
// ACHIEVEMENT TRACKING
// ============================================================================

/**
 * Check if achievement is unlocked
 */
export function checkAchievementProgress(
  achievement: {
    requirementType: string;
    requirementValue: number;
  },
  userStats: Record<string, number>
): {
  unlocked: boolean;
  progress: number;
  percentage: number;
} {
  const currentValue = userStats[achievement.requirementType] || 0;
  const progress = Math.min(currentValue, achievement.requirementValue);
  const percentage = (progress / achievement.requirementValue) * 100;

  return {
    unlocked: currentValue >= achievement.requirementValue,
    progress,
    percentage,
  };
}

/**
 * Get next achievement to unlock
 */
export function getNextAchievement(
  userStats: Record<string, number>,
  allAchievements: Array<{
    id: string;
    title: string;
    requirementType: string;
    requirementValue: number;
    xpReward: number;
  }>
): {
  achievement: any;
  progress: number;
  percentage: number;
} | null {
  const unlockedAchievements = allAchievements.filter((achievement) => {
    const currentValue = userStats[achievement.requirementType] || 0;
    return currentValue >= achievement.requirementValue;
  });

  const lockedAchievements = allAchievements.filter((achievement) => {
    const currentValue = userStats[achievement.requirementType] || 0;
    return currentValue < achievement.requirementValue;
  });

  if (lockedAchievements.length === 0) return null;

  // Find closest achievement
  const closest = lockedAchievements.reduce((prev, curr) => {
    const prevProgress = (userStats[prev.requirementType] || 0) / prev.requirementValue;
    const currProgress = (userStats[curr.requirementType] || 0) / curr.requirementValue;
    return currProgress > prevProgress ? curr : prev;
  });

  const currentValue = userStats[closest.requirementType] || 0;

  return {
    achievement: closest,
    progress: currentValue,
    percentage: (currentValue / closest.requirementValue) * 100,
  };
}

// ============================================================================
// SEASONAL EVENTS
// ============================================================================

/**
 * Create seasonal event
 */
export function createSeasonalEvent(name: string, theme: string, durationDays: number): Season {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return {
    id: `season-${Date.now()}`,
    name,
    theme,
    startDate,
    endDate,
    rewards: [
      {
        rank: 1,
        rewards: [
          { type: 'xp', amount: 10000, name: '10,000 XP' },
          { type: 'currency', amount: 5000, name: '5,000 Gems' },
          { type: 'badge', itemId: 'season-champion', name: 'Season Champion Badge' },
          { type: 'title', itemId: 'seasonal-legend', name: 'Seasonal Legend Title' },
        ],
      },
      {
        rank: 2,
        rewards: [
          { type: 'xp', amount: 7500, name: '7,500 XP' },
          { type: 'currency', amount: 3000, name: '3,000 Gems' },
          { type: 'badge', itemId: 'season-runner-up', name: 'Season Runner-up Badge' },
        ],
      },
      {
        rank: 3,
        rewards: [
          { type: 'xp', amount: 5000, name: '5,000 XP' },
          { type: 'currency', amount: 2000, name: '2,000 Gems' },
          { type: 'badge', itemId: 'season-top-3', name: 'Season Top 3 Badge' },
        ],
      },
    ],
    leaderboard: [],
  };
}

// ============================================================================
// BATTLE PASS SYSTEM
// ============================================================================

export interface BattlePass {
  id: string;
  season: string;
  tier: 'free' | 'premium';
  level: number;
  xp: number;
  rewards: BattlePassReward[];
}

export interface BattlePassReward {
  level: number;
  tier: 'free' | 'premium';
  rewards: QuestReward[];
  claimed: boolean;
}

/**
 * Generate battle pass rewards
 */
export function generateBattlePassRewards(maxLevel: number = 100): BattlePassReward[] {
  const rewards: BattlePassReward[] = [];

  for (let level = 1; level <= maxLevel; level++) {
    // Free tier rewards (every level)
    rewards.push({
      level,
      tier: 'free',
      rewards: [
        { type: 'xp', amount: level * 100, name: `${level * 100} XP` },
        { type: 'currency', amount: level * 10, name: `${level * 10} Coins` },
      ],
      claimed: false,
    });

    // Premium tier rewards (every level, better rewards)
    rewards.push({
      level,
      tier: 'premium',
      rewards: [
        { type: 'xp', amount: level * 150, name: `${level * 150} XP` },
        { type: 'currency', amount: level * 25, name: `${level * 25} Gems` },
        ...(level % 10 === 0
          ? [
              {
                type: 'pet-accessory' as const,
                itemId: `accessory-${level}`,
                name: `Exclusive Pet Accessory`,
              },
            ]
          : []),
      ],
      claimed: false,
    });
  }

  return rewards;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEndOfDay(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function getEndOfWeek(): Date {
  const date = new Date();
  const day = date.getDay();
  const diff = 7 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Quest system
  generateDailyQuests,
  generateWeeklyQuests,
  generateEpicQuests,

  // Streak system
  updateStreak,
  calculateStreakMultiplier,

  // Reward system
  calculateXP,
  calculateLevel,
  getXPForLevel,
  grantReward,

  // Leaderboard
  calculateLeaderboardScore,
  getUserRank,

  // Daily bonus
  calculateDailyBonus,

  // Achievements
  checkAchievementProgress,
  getNextAchievement,

  // Seasonal events
  createSeasonalEvent,

  // Battle pass
  generateBattlePassRewards,
};
