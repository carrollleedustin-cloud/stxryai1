'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ReadingStreakProps {
  currentStreak: number;
  longestStreak: number;
  todayGoal: boolean;
  weeklyGoal: number;
  weeklyProgress: number;
  onClaimReward?: () => void;
  className?: string;
}

export function ReadingStreak({
  currentStreak,
  longestStreak,
  todayGoal,
  weeklyGoal,
  weeklyProgress,
  onClaimReward,
  className = '',
}: ReadingStreakProps) {
  const [isClaimed, setIsClaimed] = useState(false);

  const handleClaim = () => {
    if (onClaimReward && !isClaimed) {
      onClaimReward();
      setIsClaimed(true);
    }
  };

  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;

  return (
    <div className={`bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Reading Streak
        </h3>
        {todayGoal && !isClaimed && (
          <motion.button
            onClick={handleClaim}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold rounded-lg shadow-lg"
          >
            Claim Reward
          </motion.button>
        )}
      </div>

      {/* Current Streak */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            key={currentStreak}
            initial={{ scale: 1.2, color: '#f97316' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-4xl font-bold text-orange-600 dark:text-orange-400"
          >
            {currentStreak}
          </motion.span>
          <span className="text-muted-foreground">days in a row!</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
            <span className="text-muted-foreground">Best: {longestStreak} days</span>
          </div>
          {todayGoal && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Icon name="CheckCircleIcon" size={16} />
              <span className="font-medium">Goal met today!</span>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Weekly Goal</span>
          <span className="text-muted-foreground">
            {weeklyProgress} / {weeklyGoal} stories
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, weeklyPercentage)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {weeklyProgress >= weeklyGoal && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1"
          >
            <Icon name="CheckCircleIcon" size={16} />
            Weekly goal completed! 🎉
          </motion.p>
        )}
      </div>

      {/* Streak Fire Animation */}
      {currentStreak > 0 && (
        <div className="absolute top-2 right-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-3xl"
          >
            🔥
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface DailyGoalProps {
  goal: number; // minutes or stories
  progress: number;
  type: 'time' | 'stories';
  onComplete?: () => void;
}

export function DailyGoal({ goal, progress, type, onComplete }: DailyGoalProps) {
  const percentage = Math.min(100, (progress / goal) * 100);
  const isComplete = progress >= goal;

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <span>🎯</span>
          Daily Goal
        </h4>
        {isComplete && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-500 text-sm font-medium"
          >
            ✓ Complete
          </motion.span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {type === 'time' ? 'Reading time' : 'Stories read'}
          </span>
          <span className="font-medium text-foreground">
            {progress} / {goal} {type === 'time' ? 'min' : 'stories'}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

