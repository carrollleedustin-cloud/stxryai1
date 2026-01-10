'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  dailyChallengeService,
  ChallengeProgress,
  ChallengeDifficulty,
} from '@/services/dailyChallengeService';

// ========================================
// TYPES
// ========================================

interface DailyChallengesProps {
  className?: string;
  compact?: boolean;
  onChallengeComplete?: (challengeId: string, xpAwarded: number) => void;
}

// ========================================
// DIFFICULTY CONFIG
// ========================================

const DIFFICULTY_CONFIG: Record<
  ChallengeDifficulty,
  { color: string; bgColor: string; borderColor: string; label: string }
> = {
  easy: {
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Easy',
  },
  medium: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'Medium',
  },
  hard: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    label: 'Hard',
  },
  legendary: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: 'Legendary',
  },
};

// ========================================
// COMPONENT
// ========================================

export function DailyChallenges({
  className = '',
  compact = false,
  onChallengeComplete,
}: DailyChallengesProps) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await dailyChallengeService.getUserChallengeProgress(user.id);
        setChallenges(data);

        if (data.length > 0) {
          setTimeRemaining(data[0].timeRemaining);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user?.id]);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msRemaining = midnight.getTime() - now.getTime();
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimReward = async (challengeId: string) => {
    if (!user?.id || claiming) return;

    try {
      setClaiming(challengeId);
      const result = await dailyChallengeService.claimReward(user.id, challengeId);

      if (result.success) {
        // Update local state
        setChallenges((prev) =>
          prev.map((c) =>
            c.challenge.id === challengeId
              ? { ...c, userProgress: { ...c.userProgress, rewardClaimed: true } }
              : c
          )
        );

        onChallengeComplete?.(challengeId, result.xpAwarded);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaiming(null);
    }
  };

  if (!user) return null;

  const completedCount = challenges.filter((c) => c.userProgress.completed).length;
  const claimedCount = challenges.filter((c) => c.userProgress.rewardClaimed).length;

  return (
    <div
      className={`rounded-xl bg-void-900/50 border border-void-800 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-void-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-void-100 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Daily Challenges
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-void-400">
              {completedCount}/{challenges.length} complete
            </span>
            <span className="px-2 py-1 rounded-full bg-void-800 text-void-300 text-xs">
              ⏱️ {timeRemaining}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-void-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / Math.max(challenges.length, 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Challenges list */}
      <div className={`${compact ? 'max-h-64' : 'max-h-96'} overflow-y-auto`}>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 rounded-lg bg-void-800/50">
                <div className="h-4 bg-void-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-void-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-6 text-center text-void-400">
            <p className="text-2xl mb-2">🎲</p>
            <p>No challenges available</p>
            <p className="text-sm mt-1">Check back tomorrow!</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <AnimatePresence>
              {challenges.map((item, index) => (
                <ChallengeCard
                  key={item.challenge.id}
                  progress={item}
                  index={index}
                  compact={compact}
                  claiming={claiming === item.challenge.id}
                  onClaim={() => handleClaimReward(item.challenge.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* All completed bonus */}
      {completedCount === challenges.length &&
        challenges.length > 0 &&
        claimedCount < challenges.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="m-2 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎊</span>
                <div>
                  <p className="font-medium text-yellow-400">All Challenges Complete!</p>
                  <p className="text-sm text-void-400">Claim all rewards for a bonus</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}

// ========================================
// CHALLENGE CARD COMPONENT
// ========================================

interface ChallengeCardProps {
  progress: ChallengeProgress;
  index: number;
  compact?: boolean;
  claiming: boolean;
  onClaim: () => void;
}

function ChallengeCard({ progress, index, compact, claiming, onClaim }: ChallengeCardProps) {
  const { challenge, userProgress, percentComplete } = progress;
  const config = DIFFICULTY_CONFIG[challenge.difficulty];
  const isCompleted = userProgress.completed;
  const isClaimed = userProgress.rewardClaimed;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-3 rounded-lg border transition-all
        ${
          isCompleted
            ? isClaimed
              ? 'bg-void-800/30 border-void-700/50 opacity-60'
              : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
            : `${config.bgColor} ${config.borderColor}`
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon/Status */}
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg
          ${
            isCompleted
              ? isClaimed
                ? 'bg-void-700 text-void-500'
                : 'bg-green-500/20 text-green-400'
              : config.bgColor
          }
        `}
        >
          {isCompleted ? (isClaimed ? '✓' : '🏆') : '🎯'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium ${isCompleted ? 'text-void-300' : 'text-void-100'}`}>
                {challenge.title}
              </p>
              {!compact && <p className="text-sm text-void-400 mt-0.5">{challenge.description}</p>}
            </div>

            {/* Difficulty badge */}
            <span
              className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${config.bgColor} ${config.color}
            `}
            >
              {config.label}
            </span>
          </div>

          {/* Progress */}
          {!isCompleted && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-void-400">
                  {userProgress.progress} / {challenge.requirement}
                </span>
                <span className={config.color}>{percentComplete}%</span>
              </div>
              <div className="h-1.5 bg-void-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    challenge.difficulty === 'legendary'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                      : challenge.difficulty === 'hard'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                        : challenge.difficulty === 'medium'
                          ? 'bg-blue-400'
                          : 'bg-green-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </div>
          )}

          {/* Rewards & Claim button */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-spectral-cyan">+{challenge.xpReward} XP</span>
              {challenge.bonusReward && (
                <span className="text-xs text-yellow-400">
                  +
                  {challenge.bonusReward.type === 'streak_freeze'
                    ? '🧊 Freeze'
                    : challenge.bonusReward.type === 'energy'
                      ? '⚡ Energy'
                      : challenge.bonusReward.type === 'coins'
                        ? '🪙 Coins'
                        : '🏅 Badge'}
                </span>
              )}
            </div>

            {isCompleted && !isClaimed && (
              <motion.button
                onClick={onClaim}
                disabled={claiming}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-void-950 text-sm font-medium hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {claiming ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Claiming...
                  </span>
                ) : (
                  'Claim Reward'
                )}
              </motion.button>
            )}

            {isClaimed && <span className="text-xs text-void-500">Claimed ✓</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DailyChallenges;
