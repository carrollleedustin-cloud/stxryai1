/**
 * Advanced Gamification Engine
 * Handles achievements, quests, daily challenges, and progression systems
 */

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reader' | 'creator' | 'social' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: AchievementRequirement;
  rewards: Reward[];
  secret: boolean;
}

interface AchievementRequirement {
  type: 'count' | 'streak' | 'milestone' | 'special';
  metric: string;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'alltime';
}

interface Reward {
  type: 'xp' | 'badge' | 'title' | 'energy' | 'premium_days' | 'cosmetic';
  amount?: number;
  itemId?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: QuestObjective[];
  rewards: Reward[];
  expiresAt?: Date;
  prerequisites?: string[];
}

interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

interface DailyChallenge {
  id: string;
  date: Date;
  challenges: Challenge[];
  bonusMultiplier: number;
}

interface Challenge {
  id: string;
  task: string;
  xpReward: number;
  completed: boolean;
}

interface PlayerProgress {
  userId: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  lastActiveDate: Date;
  achievementsUnlocked: string[];
  activeQuests: string[];
  completedQuests: string[];
  statistics: PlayerStatistics;
}

interface PlayerStatistics {
  storiesRead: number;
  storiesCreated: number;
  totalReadingTime: number;
  chaptersCompleted: number;
  choicesMade: number;
  commentsPosted: number;
  storiesRated: number;
  followersGained: number;
}

export class GamificationEngine {
  private readonly XP_CURVE_BASE = 100;
  private readonly XP_CURVE_MULTIPLIER = 1.5;

  /**
   * Calculate XP required for next level
   */
  calculateXPForLevel(level: number): number {
    return Math.floor(this.XP_CURVE_BASE * Math.pow(level, this.XP_CURVE_MULTIPLIER));
  }

  /**
   * Calculate level from total XP
   */
  calculateLevelFromXP(totalXP: number): {
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
  } {
    let level = 1;
    let xpForCurrentLevel = 0;

    while (true) {
      const xpForNextLevel = this.calculateXPForLevel(level);
      if (totalXP < xpForCurrentLevel + xpForNextLevel) {
        break;
      }
      xpForCurrentLevel += xpForNextLevel;
      level++;
    }

    return {
      level,
      currentLevelXP: totalXP - xpForCurrentLevel,
      nextLevelXP: this.calculateXPForLevel(level),
    };
  }

  /**
   * Award XP to player
   */
  awardXP(
    progress: PlayerProgress,
    amount: number,
    reason: string
  ): {
    newProgress: PlayerProgress;
    leveledUp: boolean;
    newLevel?: number;
    unlockedAchievements: Achievement[];
  } {
    const newTotalXP = progress.totalXP + amount;
    const { level, currentLevelXP, nextLevelXP } = this.calculateLevelFromXP(newTotalXP);
    const leveledUp = level > progress.level;

    const newProgress: PlayerProgress = {
      ...progress,
      currentXP: currentLevelXP,
      nextLevelXP,
      totalXP: newTotalXP,
      level,
    };

    // Check for newly unlocked achievements
    const unlockedAchievements = this.checkAchievements(newProgress);

    return {
      newProgress,
      leveledUp,
      newLevel: leveledUp ? level : undefined,
      unlockedAchievements,
    };
  }

  /**
   * Update daily streak
   */
  updateStreak(progress: PlayerProgress): PlayerProgress {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(progress.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = progress.streakDays;

    if (daysDifference === 0) {
      // Same day, no change
    } else if (daysDifference === 1) {
      // Next day, increment streak
      newStreak++;
    } else {
      // Streak broken
      newStreak = 1;
    }

    return {
      ...progress,
      streakDays: newStreak,
      lastActiveDate: today,
    };
  }

  /**
   * Generate daily challenges
   */
  generateDailyChallenge(date: Date, playerLevel: number): DailyChallenge {
    const challenges: Challenge[] = [
      {
        id: 'read_chapter',
        task: 'Read 3 chapters',
        xpReward: 50,
        completed: false,
      },
      {
        id: 'make_choices',
        task: 'Make 10 story choices',
        xpReward: 30,
        completed: false,
      },
      {
        id: 'rate_story',
        task: 'Rate a story',
        xpReward: 20,
        completed: false,
      },
    ];

    // Scale rewards based on player level
    const bonusMultiplier = 1 + Math.floor(playerLevel / 10) * 0.1;

    return {
      id: `daily_${date.toISOString().split('T')[0]}`,
      date,
      challenges: challenges.map((c) => ({
        ...c,
        xpReward: Math.floor(c.xpReward * bonusMultiplier),
      })),
      bonusMultiplier,
    };
  }

  /**
   * Get available quests for player
   */
  getAvailableQuests(progress: PlayerProgress): Quest[] {
    const quests: Quest[] = [];

    // Story quests
    if (progress.statistics.storiesRead >= 5 && progress.statistics.storiesRead < 10) {
      quests.push({
        id: 'quest_reader_novice',
        title: 'Novice Reader',
        description: 'Read 10 complete stories',
        type: 'story',
        difficulty: 'easy',
        objectives: [
          {
            id: 'obj_read_10',
            description: 'Read stories',
            current: progress.statistics.storiesRead,
            target: 10,
            completed: progress.statistics.storiesRead >= 10,
          },
        ],
        rewards: [
          { type: 'xp', amount: 500 },
          { type: 'badge', itemId: 'badge_reader_novice' },
          { type: 'title', itemId: 'title_bookworm' },
        ],
      });
    }

    // Creator quests
    if (progress.statistics.storiesCreated === 0) {
      quests.push({
        id: 'quest_first_story',
        title: 'First Creation',
        description: 'Publish your first interactive story',
        type: 'story',
        difficulty: 'medium',
        objectives: [
          {
            id: 'obj_create_first',
            description: 'Create and publish a story',
            current: 0,
            target: 1,
            completed: false,
          },
        ],
        rewards: [
          { type: 'xp', amount: 1000 },
          { type: 'badge', itemId: 'badge_creator' },
          { type: 'energy', amount: 50 },
        ],
      });
    }

    // Social quests
    quests.push({
      id: 'quest_social_butterfly',
      title: 'Social Butterfly',
      description: 'Engage with the community',
      type: 'weekly',
      difficulty: 'easy',
      objectives: [
        {
          id: 'obj_comment_5',
          description: 'Post 5 comments',
          current: 0,
          target: 5,
          completed: false,
        },
        {
          id: 'obj_rate_3',
          description: 'Rate 3 stories',
          current: 0,
          target: 3,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', amount: 300 },
        { type: 'energy', amount: 25 },
      ],
      expiresAt: this.getEndOfWeek(),
    });

    return quests.filter(
      (q) => !progress.activeQuests.includes(q.id) && !progress.completedQuests.includes(q.id)
    );
  }

  /**
   * Check for achievement unlocks
   */
  checkAchievements(progress: PlayerProgress): Achievement[] {
    const allAchievements = this.getAllAchievements();
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (progress.achievementsUnlocked.includes(achievement.id)) continue;

      if (this.checkAchievementRequirement(achievement.requirement, progress)) {
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if achievement requirement is met
   */
  private checkAchievementRequirement(
    requirement: AchievementRequirement,
    progress: PlayerProgress
  ): boolean {
    const stats = progress.statistics;

    switch (requirement.metric) {
      case 'stories_read':
        return stats.storiesRead >= requirement.target;
      case 'stories_created':
        return stats.storiesCreated >= requirement.target;
      case 'level':
        return progress.level >= requirement.target;
      case 'streak_days':
        return progress.streakDays >= requirement.target;
      case 'comments_posted':
        return stats.commentsPosted >= requirement.target;
      case 'total_reading_time':
        return stats.totalReadingTime >= requirement.target;
      default:
        return false;
    }
  }

  /**
   * Get all available achievements
   */
  private getAllAchievements(): Achievement[] {
    return [
      {
        id: 'achievement_first_story',
        name: 'First Steps',
        description: 'Read your first story',
        icon: '📖',
        category: 'reader',
        rarity: 'common',
        requirement: {
          type: 'count',
          metric: 'stories_read',
          target: 1,
        },
        rewards: [{ type: 'xp', amount: 100 }],
        secret: false,
      },
      {
        id: 'achievement_bookworm',
        name: 'Bookworm',
        description: 'Read 50 stories',
        icon: '📚',
        category: 'reader',
        rarity: 'rare',
        requirement: {
          type: 'count',
          metric: 'stories_read',
          target: 50,
        },
        rewards: [
          { type: 'xp', amount: 1000 },
          { type: 'title', itemId: 'title_bookworm' },
        ],
        secret: false,
      },
      {
        id: 'achievement_creator_debut',
        name: "Creator's Debut",
        description: 'Publish your first story',
        icon: '✨',
        category: 'creator',
        rarity: 'uncommon',
        requirement: {
          type: 'count',
          metric: 'stories_created',
          target: 1,
        },
        rewards: [
          { type: 'xp', amount: 500 },
          { type: 'badge', itemId: 'badge_creator' },
        ],
        secret: false,
      },
      {
        id: 'achievement_level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '⭐',
        category: 'special',
        rarity: 'rare',
        requirement: {
          type: 'milestone',
          metric: 'level',
          target: 10,
        },
        rewards: [
          { type: 'xp', amount: 1500 },
          { type: 'energy', amount: 100 },
          { type: 'premium_days', amount: 3 },
        ],
        secret: false,
      },
      {
        id: 'achievement_streak_7',
        name: 'Dedicated Reader',
        description: '7 day reading streak',
        icon: '🔥',
        category: 'special',
        rarity: 'uncommon',
        requirement: {
          type: 'streak',
          metric: 'streak_days',
          target: 7,
        },
        rewards: [
          { type: 'xp', amount: 750 },
          { type: 'energy', amount: 50 },
        ],
        secret: false,
      },
      {
        id: 'achievement_social_maven',
        name: 'Social Maven',
        description: 'Post 100 comments',
        icon: '💬',
        category: 'social',
        rarity: 'rare',
        requirement: {
          type: 'count',
          metric: 'comments_posted',
          target: 100,
        },
        rewards: [
          { type: 'xp', amount: 1200 },
          { type: 'badge', itemId: 'badge_social' },
        ],
        secret: false,
      },
      {
        id: 'achievement_marathon_reader',
        name: 'Marathon Reader',
        description: 'Read for 1000 minutes',
        icon: '⏱️',
        category: 'reader',
        rarity: 'epic',
        requirement: {
          type: 'count',
          metric: 'total_reading_time',
          target: 1000,
        },
        rewards: [
          { type: 'xp', amount: 2000 },
          { type: 'premium_days', amount: 7 },
          { type: 'badge', itemId: 'badge_marathon' },
        ],
        secret: false,
      },
    ];
  }

  /**
   * Get leaderboard data
   */
  getLeaderboard(
    players: PlayerProgress[],
    type: 'level' | 'xp' | 'streak' | 'stories_read',
    timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'alltime'
  ): Array<{ rank: number; player: PlayerProgress; score: number }> {
    const sortedPlayers = [...players].sort((a, b) => {
      switch (type) {
        case 'level':
          return b.level - a.level || b.totalXP - a.totalXP;
        case 'xp':
          return b.totalXP - a.totalXP;
        case 'streak':
          return b.streakDays - a.streakDays;
        case 'stories_read':
          return b.statistics.storiesRead - a.statistics.storiesRead;
        default:
          return 0;
      }
    });

    return sortedPlayers.map((player, index) => ({
      rank: index + 1,
      player,
      score: this.getPlayerScore(player, type),
    }));
  }

  private getPlayerScore(player: PlayerProgress, type: string): number {
    switch (type) {
      case 'level':
        return player.level;
      case 'xp':
        return player.totalXP;
      case 'streak':
        return player.streakDays;
      case 'stories_read':
        return player.statistics.storiesRead;
      default:
        return 0;
    }
  }

  private getEndOfWeek(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }
}

// Export singleton instance
export const gamificationEngine = new GamificationEngine();
