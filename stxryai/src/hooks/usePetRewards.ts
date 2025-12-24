'use client';

/**
 * Pet Rewards Hook
 * Integrates pet experience rewards with user activities throughout the app.
 * Provides easy-to-use functions for awarding XP on various actions.
 */

import { useCallback, useRef } from 'react';
import { usePet } from '@/contexts/PetContext';
import { PET_EXPERIENCE_REWARDS } from '@/types/pet';

interface RewardResult {
  success: boolean;
  leveledUp: boolean;
  evolved: boolean;
  xpAwarded: number;
}

interface PetRewardsHook {
  // Award for reading activities
  onStoryRead: (storyId: string, genre?: string) => Promise<RewardResult>;
  onChapterComplete: (storyId: string) => Promise<RewardResult>;
  onChoiceMade: (storyId: string) => Promise<RewardResult>;
  
  // Award for creation activities
  onStoryCreated: (storyId: string) => Promise<RewardResult>;
  onChapterPublished: (storyId: string) => Promise<RewardResult>;
  
  // Award for social activities
  onCommentWritten: (storyId: string) => Promise<RewardResult>;
  onRatingGiven: (storyId: string) => Promise<RewardResult>;
  onFriendMade: (friendId: string) => Promise<RewardResult>;
  
  // Award for engagement
  onDailyLogin: () => Promise<RewardResult>;
  onChallengeCompleted: (challengeId: string) => Promise<RewardResult>;
  onAchievementUnlocked: (achievementId: string) => Promise<RewardResult>;
  
  // Get pet dialogue for context
  getContextDialogue: () => string;
  
  // Check if pet exists
  hasPet: boolean;
}

export function usePetRewards(): PetRewardsHook {
  const { pet, hasPet, awardExperience, getDialogue } = usePet();
  
  // Track recent rewards to prevent spam
  const recentRewards = useRef<Map<string, number>>(new Map());
  
  // Helper to check if reward was recently given (within 1 second)
  const wasRecentlyRewarded = (key: string): boolean => {
    const lastReward = recentRewards.current.get(key);
    if (!lastReward) return false;
    return Date.now() - lastReward < 1000;
  };
  
  // Helper to mark reward as given
  const markRewarded = (key: string): void => {
    recentRewards.current.set(key, Date.now());
  };
  
  // Generic reward function
  const reward = useCallback(async (
    type: keyof typeof PET_EXPERIENCE_REWARDS,
    key: string,
    additionalData?: { storyId?: string; genre?: string }
  ): Promise<RewardResult> => {
    if (!hasPet) {
      return { success: false, leveledUp: false, evolved: false, xpAwarded: 0 };
    }
    
    // Prevent spam rewards
    const rewardKey = `${type}-${key}`;
    if (wasRecentlyRewarded(rewardKey)) {
      return { success: false, leveledUp: false, evolved: false, xpAwarded: 0 };
    }
    
    try {
      markRewarded(rewardKey);
      const result = await awardExperience(type, additionalData);
      
      return {
        success: true,
        leveledUp: result.leveledUp,
        evolved: result.evolved,
        xpAwarded: PET_EXPERIENCE_REWARDS[type],
      };
    } catch (error) {
      console.error('Error awarding pet XP:', error);
      return { success: false, leveledUp: false, evolved: false, xpAwarded: 0 };
    }
  }, [hasPet, awardExperience]);
  
  // Reading activities
  const onStoryRead = useCallback(async (storyId: string, genre?: string) => {
    return reward('storyRead', storyId, { storyId, genre });
  }, [reward]);
  
  const onChapterComplete = useCallback(async (storyId: string) => {
    return reward('chapterCompleted', `${storyId}-${Date.now()}`, { storyId });
  }, [reward]);
  
  const onChoiceMade = useCallback(async (storyId: string) => {
    return reward('choiceMade', `${storyId}-${Date.now()}`, { storyId });
  }, [reward]);
  
  // Creation activities
  const onStoryCreated = useCallback(async (storyId: string) => {
    return reward('storyCreated', storyId, { storyId });
  }, [reward]);
  
  const onChapterPublished = useCallback(async (storyId: string) => {
    return reward('chapterPublished', `${storyId}-${Date.now()}`, { storyId });
  }, [reward]);
  
  // Social activities
  const onCommentWritten = useCallback(async (storyId: string) => {
    return reward('commentWritten', `${storyId}-${Date.now()}`, { storyId });
  }, [reward]);
  
  const onRatingGiven = useCallback(async (storyId: string) => {
    return reward('ratingGiven', storyId, { storyId });
  }, [reward]);
  
  const onFriendMade = useCallback(async (friendId: string) => {
    return reward('friendMade', friendId);
  }, [reward]);
  
  // Engagement activities
  const onDailyLogin = useCallback(async () => {
    return reward('dailyLogin', new Date().toISOString().split('T')[0]);
  }, [reward]);
  
  const onChallengeCompleted = useCallback(async (challengeId: string) => {
    return reward('challengeCompleted', challengeId);
  }, [reward]);
  
  const onAchievementUnlocked = useCallback(async (achievementId: string) => {
    return reward('achievementUnlocked', achievementId);
  }, [reward]);
  
  // Get contextual dialogue
  const getContextDialogue = useCallback(() => {
    if (!pet) return '';
    return getDialogue('encouragement');
  }, [pet, getDialogue]);
  
  return {
    onStoryRead,
    onChapterComplete,
    onChoiceMade,
    onStoryCreated,
    onChapterPublished,
    onCommentWritten,
    onRatingGiven,
    onFriendMade,
    onDailyLogin,
    onChallengeCompleted,
    onAchievementUnlocked,
    getContextDialogue,
    hasPet,
  };
}

export default usePetRewards;

