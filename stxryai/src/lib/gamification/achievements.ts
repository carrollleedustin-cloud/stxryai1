/**
 * Achievement System
 * Defines all achievements and tracks user progress
 */

export type AchievementCategory = 'reading' | 'creating' | 'social' | 'mastery' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirement: {
    type: string;
    count: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Reading Achievements
  {
    id: 'first_story',
    name: 'First Steps',
    description: 'Complete your first story',
    category: 'reading',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50,
    requirement: { type: 'stories_completed', count: 1 }
  },
  {
    id: 'story_enthusiast',
    name: 'Story Enthusiast',
    description: 'Complete 10 stories',
    category: 'reading',
    icon: '📚',
    rarity: 'uncommon',
    xpReward: 100,
    requirement: { type: 'stories_completed', count: 10 }
  },
  {
    id: 'voracious_reader',
    name: 'Voracious Reader',
    description: 'Complete 50 stories',
    category: 'reading',
    icon: '📖',
    rarity: 'rare',
    xpReward: 250,
    requirement: { type: 'stories_completed', count: 50 }
  },
  {
    id: 'library_master',
    name: 'Library Master',
    description: 'Complete 100 stories',
    category: 'reading',
    icon: '🏛️',
    rarity: 'epic',
    xpReward: 500,
    requirement: { type: 'stories_completed', count: 100 }
  },
  {
    id: 'choice_maker',
    name: 'Choice Maker',
    description: 'Make 100 choices',
    category: 'reading',
    icon: '🎲',
    rarity: 'common',
    xpReward: 75,
    requirement: { type: 'choices_made', count: 100 }
  },
  {
    id: 'decision_expert',
    name: 'Decision Expert',
    description: 'Make 500 choices',
    category: 'reading',
    icon: '⚡',
    rarity: 'uncommon',
    xpReward: 150,
    requirement: { type: 'choices_made', count: 500 }
  },
  {
    id: 'path_weaver',
    name: 'Path Weaver',
    description: 'Make 1000 choices',
    category: 'reading',
    icon: '🌟',
    rarity: 'rare',
    xpReward: 300,
    requirement: { type: 'choices_made', count: 1000 }
  },

  // Streak Achievements
  {
    id: 'dedicated_reader',
    name: 'Dedicated Reader',
    description: 'Maintain a 7-day reading streak',
    category: 'mastery',
    icon: '🔥',
    rarity: 'uncommon',
    xpReward: 100,
    requirement: { type: 'reading_streak', count: 7 }
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day reading streak',
    category: 'mastery',
    icon: '💪',
    rarity: 'rare',
    xpReward: 300,
    requirement: { type: 'reading_streak', count: 30 }
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Maintain a 100-day reading streak',
    category: 'mastery',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000,
    requirement: { type: 'reading_streak', count: 100 }
  },

  // Creating Achievements
  {
    id: 'first_creation',
    name: 'First Creation',
    description: 'Create your first story',
    category: 'creating',
    icon: '✍️',
    rarity: 'common',
    xpReward: 100,
    requirement: { type: 'stories_created', count: 1 }
  },
  {
    id: 'prolific_writer',
    name: 'Prolific Writer',
    description: 'Create 10 stories',
    category: 'creating',
    icon: '📝',
    rarity: 'uncommon',
    xpReward: 200,
    requirement: { type: 'stories_created', count: 10 }
  },
  {
    id: 'master_author',
    name: 'Master Author',
    description: 'Create 25 stories',
    category: 'creating',
    icon: '🎭',
    rarity: 'rare',
    xpReward: 500,
    requirement: { type: 'stories_created', count: 25 }
  },

  // Social Achievements
  {
    id: 'community_member',
    name: 'Community Member',
    description: 'Post your first comment',
    category: 'social',
    icon: '💬',
    rarity: 'common',
    xpReward: 25,
    requirement: { type: 'comments_posted', count: 1 }
  },
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Post 50 comments',
    category: 'social',
    icon: '🗣️',
    rarity: 'uncommon',
    xpReward: 100,
    requirement: { type: 'comments_posted', count: 50 }
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Share 25 stories',
    category: 'social',
    icon: '📢',
    rarity: 'rare',
    xpReward: 200,
    requirement: { type: 'stories_shared', count: 25 }
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Read a story before 6 AM',
    category: 'special',
    icon: '🌅',
    rarity: 'uncommon',
    xpReward: 50,
    requirement: { type: 'early_morning_read', count: 1 }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Read a story after midnight',
    category: 'special',
    icon: '🦉',
    rarity: 'uncommon',
    xpReward: 50,
    requirement: { type: 'late_night_read', count: 1 }
  },
  {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Complete stories from 5 different genres',
    category: 'special',
    icon: '🎨',
    rarity: 'rare',
    xpReward: 150,
    requirement: { type: 'genres_explored', count: 5 }
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Reach 100% completion on a story',
    category: 'special',
    icon: '💯',
    rarity: 'epic',
    xpReward: 250,
    requirement: { type: 'perfect_completion', count: 1 }
  },
  {
    id: 'premium_member',
    name: 'Premium Member',
    description: 'Upgrade to premium subscription',
    category: 'special',
    icon: '⭐',
    rarity: 'rare',
    xpReward: 200,
    requirement: { type: 'premium_subscription', count: 1 }
  }
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

/**
 * Check if achievement requirement is met
 */
export function checkAchievementProgress(
  achievement: Achievement,
  userStats: Record<string, number>
): {
  unlocked: boolean;
  progress: number;
  current: number;
  required: number;
} {
  const current = userStats[achievement.requirement.type] || 0;
  const required = achievement.requirement.count;
  const progress = Math.min(current / required, 1);

  return {
    unlocked: current >= required,
    progress,
    current,
    required
  };
}

/**
 * Get newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(
  oldStats: Record<string, number>,
  newStats: Record<string, number>,
  currentAchievementIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => {
    // Skip if already unlocked
    if (currentAchievementIds.includes(achievement.id)) {
      return false;
    }

    // Check if newly unlocked
    const oldProgress = checkAchievementProgress(achievement, oldStats);
    const newProgress = checkAchievementProgress(achievement, newStats);

    return !oldProgress.unlocked && newProgress.unlocked;
  });
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400';
    case 'uncommon':
      return 'text-green-600 dark:text-green-400';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400';
    case 'epic':
      return 'text-purple-600 dark:text-purple-400';
    case 'legendary':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: Achievement['rarity']): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}