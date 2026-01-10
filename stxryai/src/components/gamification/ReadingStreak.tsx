'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { streakService, type StreakData, type DailyGoal } from '@/services/streakService';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface ReadingStreakProps {
  className?: string;
  showCalendar?: boolean;
  onStreakUpdated?: (streak: StreakData) => void;
}

export function ReadingStreak({
  className = '',
  showCalendar = false,
  onStreakUpdated,
}: ReadingStreakProps) {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [streak, goal] = await Promise.all([
          streakService.getStreakData(user.id),
          streakService.getDailyGoal(user.id),
        ]);

        setStreakData(streak);
        setDailyGoal(goal);

        if (streak) {
          const recoveryUsed = streak.streakRecoveryUsed || 0;
          setRecoveryAvailable(recoveryUsed < 1);
        }
      } catch (error) {
        console.error('Failed to load streak data:', error);
        toast.error('Failed to load reading streak');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleRecovery = async () => {
    if (!user || !recoveryAvailable || !streakData) return;

    try {
      setIsClaiming(true);
      const success = await streakService.useStreakRecovery(user.id);
      if (success) {
        setRecoveryAvailable(false);
        toast.success('Streak recovery used! Your streak is safe 🔥');
        // Reload streak data
        const updated = await streakService.getStreakData(user.id);
        if (updated) {
          setStreakData(updated);
          onStreakUpdated?.(updated);
        }
      } else {
        toast.error('Recovery not available. You may have already used it this month.');
      }
    } catch (error) {
      console.error('Failed to use streak recovery:', error);
      toast.error('Failed to use streak recovery');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimReward = async () => {
    if (!user || !dailyGoal || dailyGoal.rewardClaimed) return;

    try {
      setIsClaiming(true);
      const success = await streakService.claimDailyGoalReward(user.id, dailyGoal.id);
      if (success) {
        toast.success('Reward claimed! 🎉');
        // Reload goal
        const updated = await streakService.getDailyGoal(user.id);
        if (updated) {
          setDailyGoal(updated);
        }
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!streakData) {
    // No streak data yet - show onboarding
    return (
      <div
        className={`bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 ${className}`}
      >
        <div className="text-center">
          <span className="text-4xl mb-2 block">🔥</span>
          <h3 className="text-lg font-bold text-foreground mb-2">Start Your Reading Streak!</h3>
          <p className="text-sm text-muted-foreground">
            Read a story today to begin your streak journey
          </p>
        </div>
      </div>
    );
  }

  const goalPercentage = dailyGoal ? (dailyGoal.currentValue / dailyGoal.goalValue) * 100 : 0;

  return (
    <div
      className={`relative bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Reading Streak
        </h3>
        {recoveryAvailable && streakData.currentStreak > 0 && (
          <motion.button
            onClick={handleRecovery}
            disabled={isClaiming}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
            title="Use free pass to maintain streak"
          >
            {isClaiming ? 'Using...' : 'Free Pass'}
          </motion.button>
        )}
      </div>

      {/* Current Streak */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            key={streakData.currentStreak}
            initial={{ scale: 1.2, color: '#f97316' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-4xl font-bold text-orange-600 dark:text-orange-400"
          >
            {streakData.currentStreak}
          </motion.span>
          <span className="text-muted-foreground">days in a row!</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
            <span className="text-muted-foreground">Best: {streakData.longestStreak} days</span>
          </div>
          {dailyGoal?.completed && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Icon name="CheckCircleIcon" size={16} />
              <span className="font-medium">Goal met today!</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Goal */}
      {dailyGoal && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Daily Goal</span>
            <span className="text-muted-foreground">
              {dailyGoal.currentValue} / {dailyGoal.goalValue}{' '}
              {dailyGoal.goalType === 'time'
                ? 'min'
                : dailyGoal.goalType === 'stories'
                  ? 'stories'
                  : 'chapters'}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, goalPercentage)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {dailyGoal.completed && !dailyGoal.rewardClaimed && (
            <motion.button
              onClick={handleClaimReward}
              disabled={isClaiming}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-colors"
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward! 🎉'}
            </motion.button>
          )}
          {dailyGoal.rewardClaimed && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1"
            >
              <Icon name="CheckCircleIcon" size={16} />
              Reward claimed! 🎉
            </motion.p>
          )}
        </div>
      )}

      {/* Milestone Badges */}
      <div className="flex gap-2 flex-wrap">
        {streakData.currentStreak >= 7 && (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
            🏆 Week Warrior
          </span>
        )}
        {streakData.currentStreak >= 30 && (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
            🌟 Monthly Master
          </span>
        )}
        {streakData.currentStreak >= 100 && (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-medium">
            👑 Centurion
          </span>
        )}
      </div>

      {/* Streak Fire Animation */}
      {streakData.currentStreak > 0 && (
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
