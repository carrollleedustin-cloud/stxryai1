/**
 * XP and Level System
 * Manages user progression through experience points and levels
 */

export interface Level {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  badge: string;
}

export interface XPActivity {
  type: 'story_completed' | 'choice_made' | 'daily_login' | 'profile_completed' | 'story_created' | 'comment_posted' | 'story_shared';
  xpReward: number;
  description: string;
}

// XP rewards for different activities
export const XP_ACTIVITIES: Record<string, XPActivity> = {
  story_completed: {
    type: 'story_completed',
    xpReward: 100,
    description: 'Complete a story'
  },
  choice_made: {
    type: 'choice_made',
    xpReward: 10,
    description: 'Make a choice in a story'
  },
  daily_login: {
    type: 'daily_login',
    xpReward: 25,
    description: 'Daily login bonus'
  },
  profile_completed: {
    type: 'profile_completed',
    xpReward: 50,
    description: 'Complete your profile'
  },
  story_created: {
    type: 'story_created',
    xpReward: 150,
    description: 'Create a new story'
  },
  comment_posted: {
    type: 'comment_posted',
    xpReward: 15,
    description: 'Post a comment'
  },
  story_shared: {
    type: 'story_shared',
    xpReward: 30,
    description: 'Share a story'
  }
};

// Level progression curve - exponential growth
export const LEVELS: Level[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const baseXP = 100;
  const multiplier = 1.15; // 15% increase per level
  const minXP = level === 1 ? 0 : Math.floor(baseXP * Math.pow(multiplier, level - 2));
  const maxXP = Math.floor(baseXP * Math.pow(multiplier, level - 1));

  // Level titles based on progression
  let title = 'Novice Reader';
  let badge = '📖';

  if (level >= 90) {
    title = 'Legendary Author';
    badge = '👑';
  } else if (level >= 75) {
    title = 'Master Storyteller';
    badge = '🎭';
  } else if (level >= 60) {
    title = 'Epic Narrator';
    badge = '⚡';
  } else if (level >= 45) {
    title = 'Advanced Writer';
    badge = '✨';
  } else if (level >= 30) {
    title = 'Skilled Reader';
    badge = '📚';
  } else if (level >= 15) {
    title = 'Apprentice Writer';
    badge = '✍️';
  } else if (level >= 5) {
    title = 'Eager Reader';
    badge = '📘';
  }

  return {
    level,
    minXP,
    maxXP,
    title,
    badge
  };
});

/**
 * Get level information from total XP
 */
export function getLevelFromXP(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get XP progress to next level (0-1)
 */
export function getXPProgress(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const xpNeededForNextLevel = currentLevel.maxXP - currentLevel.minXP;
  return Math.min(xpInCurrentLevel / xpNeededForNextLevel, 1);
}

/**
 * Get XP needed for next level
 */
export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  return currentLevel.maxXP - totalXP;
}

/**
 * Calculate XP reward with multipliers
 */
export function calculateXPReward(
  activity: keyof typeof XP_ACTIVITIES,
  multiplier: number = 1
): number {
  const baseXP = XP_ACTIVITIES[activity].xpReward;
  return Math.floor(baseXP * multiplier);
}

/**
 * Check if XP gain results in level up
 */
export function checkLevelUp(oldXP: number, newXP: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
} {
  const oldLevel = getLevelFromXP(oldXP);
  const newLevel = getLevelFromXP(newXP);

  return {
    leveledUp: newLevel.level > oldLevel.level,
    oldLevel: oldLevel.level,
    newLevel: newLevel.level,
    levelsGained: newLevel.level - oldLevel.level
  };
}