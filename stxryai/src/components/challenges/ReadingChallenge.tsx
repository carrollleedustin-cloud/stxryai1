'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  goal: number;
  progress: number;
  unit: 'stories' | 'minutes' | 'chapters' | 'choices';
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  deadline?: string;
  isCompleted: boolean;
}

interface ReadingChallengeProps {
  challenges: Challenge[];
  onClaimReward?: (challengeId: string) => void;
}

export function ReadingChallenge({ challenges, onClaimReward }: ReadingChallengeProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeChallenges = challenges.filter((c) => !c.isCompleted);
  const completedChallenges = challenges.filter((c) => c.isCompleted);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return '🌅';
      case 'weekly':
        return '📅';
      case 'monthly':
        return '🗓️';
      case 'special':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getProgressColor = (progress: number, goal: number) => {
    const percentage = (progress / goal) * 100;
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🏆</span>
            Reading Challenges
          </h2>
          <p className="text-muted-foreground">Complete challenges to earn rewards</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Active ({activeChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'completed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed ({completedChallenges.length})
        </button>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeChallenges : completedChallenges).map(
          (challenge, index) => {
            const percentage = Math.min(100, (challenge.progress / challenge.goal) * 100);
            const isComplete = challenge.progress >= challenge.goal;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card border-2 rounded-xl p-6 ${
                  isComplete
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getChallengeIcon(challenge.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-foreground">{challenge.title}</h3>
                        {challenge.type === 'special' && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                            SPECIAL
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      {challenge.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isComplete && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">
                      ✅
                    </motion.div>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {challenge.progress} / {challenge.goal} {challenge.unit}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getProgressColor(
                        challenge.progress,
                        challenge.goal
                      )}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Icon name="SparklesIcon" size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium text-foreground">
                        +{challenge.reward.xp} XP
                      </span>
                    </div>
                    {challenge.reward.badge && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{challenge.reward.badge}</span>
                        <span className="text-sm text-muted-foreground">Badge</span>
                      </div>
                    )}
                    {challenge.reward.title && (
                      <div className="flex items-center gap-1">
                        <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {challenge.reward.title}
                        </span>
                      </div>
                    )}
                  </div>
                  {isComplete && onClaimReward && (
                    <motion.button
                      onClick={() => onClaimReward(challenge.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium text-sm"
                    >
                      Claim Reward
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          }
        )}
      </div>

      {activeTab === 'active' && activeChallenges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active challenges. Check back soon!</p>
        </div>
      )}

      {activeTab === 'completed' && completedChallenges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Complete challenges to see them here!</p>
        </div>
      )}
    </div>
  );
}
