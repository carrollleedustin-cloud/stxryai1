'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelFromXP } from '@/lib/gamification/xpSystem';
import Icon from '@/components/ui/AppIcon';
import { slideUp, staggerContainer } from '@/lib/animations/variants';

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  totalXP: number;
  storiesCompleted: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time') => void;
}

export default function Leaderboard({
  entries,
  currentUserId,
  timeframe = 'all-time',
  onTimeframeChange,
}: LeaderboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const timeframes = [
    { value: 'daily' as const, label: 'Daily', icon: 'CalendarDaysIcon' },
    { value: 'weekly' as const, label: 'Weekly', icon: 'CalendarIcon' },
    { value: 'monthly' as const, label: 'Monthly', icon: 'ChartBarIcon' },
    { value: 'all-time' as const, label: 'All Time', icon: 'TrophyIcon' },
  ];

  const handleTimeframeChange = (newTimeframe: (typeof timeframes)[number]['value']) => {
    setSelectedTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-muted to-muted';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon name="TrophyIcon" size={32} className="text-yellow-300" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="text-sm opacity-90">Top performers this period</p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 overflow-x-auto">
          {timeframes.map((tf) => (
            <motion.button
              key={tf.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTimeframeChange(tf.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                selectedTimeframe === tf.value
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Icon name={tf.icon} size={16} />
              {tf.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Leaderboard Entries */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="divide-y divide-border"
      >
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const level = getLevelFromXP(entry.totalXP);
            const isCurrentUser = entry.id === currentUserId || entry.isCurrentUser;
            const medal = getRankMedal(entry.rank);
            const rankColor = getRankColor(entry.rank);

            return (
              <motion.div
                key={entry.id}
                variants={slideUp}
                layout
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  isCurrentUser ? 'bg-primary/10 border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {medal ? (
                      <span className="text-3xl">{medal}</span>
                    ) : (
                      <div className="text-2xl font-bold text-muted-foreground">#{entry.rank}</div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center text-white font-bold`}
                  >
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{entry.displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {entry.displayName}
                      </h3>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span>{level.badge}</span>
                        Level {level.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="BookOpenIcon" size={14} />
                        {entry.storiesCompleted} stories
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-foreground">
                      {entry.totalXP.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="p-12 text-center">
          <Icon
            name="TrophyIcon"
            size={48}
            className="text-muted-foreground mx-auto mb-3 opacity-50"
          />
          <p className="text-muted-foreground">No leaderboard data available</p>
        </div>
      )}
    </div>
  );
}
