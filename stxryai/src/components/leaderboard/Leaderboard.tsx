'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

type LeaderboardType = 'readers' | 'creators' | 'stories';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'allTime';

interface LeaderEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  score: number;
  change: number; // Position change
  badge?: string;
  stats?: {
    [key: string]: number;
  };
}

interface LeaderboardProps {
  type?: LeaderboardType;
  timeRange?: TimeRange;
  entries?: LeaderEntry[];
  currentUserId?: string;
}

export default function Leaderboard({
  type = 'readers',
  timeRange = 'weekly',
  entries = [],
  currentUserId,
}: LeaderboardProps) {
  const [activeType, setActiveType] = useState<LeaderboardType>(type);
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>(timeRange);

  const getScoreLabel = () => {
    switch (activeType) {
      case 'readers':
        return 'Stories Read';
      case 'creators':
        return 'Total Views';
      case 'stories':
        return 'Views';
      default:
        return 'Score';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-600 to-orange-600';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-700 to-orange-800';
    return 'from-purple-600 to-pink-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Leaderboard</h2>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-4">
        {(['readers', 'creators', 'stories'] as LeaderboardType[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeType === t
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Time Range */}
      <div className="flex gap-2 mb-6">
        {(['daily', 'weekly', 'monthly', 'allTime'] as TimeRange[]).map((tr) => (
          <button
            key={tr}
            onClick={() => setActiveTimeRange(tr)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTimeRange === tr
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tr === 'allTime' ? 'All Time' : tr.charAt(0).toUpperCase() + tr.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <LeaderEntry
            key={entry.id}
            entry={entry}
            index={index}
            rankColor={getRankColor(entry.rank)}
            rankIcon={getRankIcon(entry.rank)}
            scoreLabel={getScoreLabel()}
            isCurrentUser={entry.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderEntry({
  entry,
  index,
  rankColor,
  rankIcon,
  scoreLabel,
  isCurrentUser,
}: {
  entry: LeaderEntry;
  index: number;
  rankColor: string;
  rankIcon: string;
  scoreLabel: string;
  isCurrentUser: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-600'
          : 'bg-white/5 hover:bg-white/10 border border-white/10'
      }`}
    >
      {/* Rank Badge */}
      <div
        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${rankColor} flex items-center justify-center flex-shrink-0 shadow-lg`}
      >
        <span className="text-white font-bold text-xl">{rankIcon}</span>
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
            {entry.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name & Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white truncate">{entry.name}</h3>
          {entry.badge && <span className="text-lg">{entry.badge}</span>}
          {isCurrentUser && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
              YOU
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {scoreLabel}:{' '}
          <span className="font-semibold text-white">{entry.score.toLocaleString()}</span>
        </p>
      </div>

      {/* Change Indicator */}
      {entry.change !== 0 && (
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
            entry.change > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}
        >
          {entry.change > 0 ? '↑' : '↓'}
          {Math.abs(entry.change)}
        </div>
      )}
    </motion.div>
  );
}
