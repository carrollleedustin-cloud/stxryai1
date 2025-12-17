'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

type AchievementCategory = 'reading' | 'creating' | 'social' | 'special';
type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    total: number;
  };
}

interface AchievementsShowcaseProps {
  achievements: Achievement[];
  variant?: 'grid' | 'showcase' | 'compact';
}

export default function AchievementsShowcase({
  achievements,
  variant = 'grid',
}: AchievementsShowcaseProps) {
  const [filter, setFilter] = useState<'all' | AchievementCategory | 'unlocked' | 'locked'>('all');

  const rarityColors = {
    common: 'from-gray-600 to-gray-700',
    uncommon: 'from-green-600 to-emerald-600',
    rare: 'from-blue-600 to-cyan-600',
    epic: 'from-purple-600 to-pink-600',
    legendary: 'from-yellow-600 to-orange-600',
  };

  const rarityLabels = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return a.category === filter;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  if (variant === 'showcase') {
    return <FeaturedAchievementsShowcase achievements={achievements.filter((a) => a.unlocked)} />;
  }

  if (variant === 'compact') {
    return <CompactAchievements achievements={achievements} />;
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {unlockedCount}/{achievements.length}
          </div>
          <div className="text-sm text-white/80">Achievements</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">{totalXP}</div>
          <div className="text-sm text-white/80">Total XP</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </div>
          <div className="text-sm text-white/80">Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'unlocked', 'locked', 'reading', 'creating', 'social', 'special'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            index={index}
            rarityColor={rarityColors[achievement.rarity]}
            rarityLabel={rarityLabels[achievement.rarity]}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🏆</div>
          <p>No achievements in this category</p>
        </div>
      )}
    </div>
  );
}

// Achievement Card Component
function AchievementCard({
  achievement,
  index,
  rarityColor,
  rarityLabel,
}: {
  achievement: Achievement;
  index: number;
  rarityColor: string;
  rarityLabel: string;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => setShowDetails(!showDetails)}
      className={`relative rounded-xl p-4 border-2 transition-all cursor-pointer ${
        achievement.unlocked
          ? `bg-gradient-to-br ${rarityColor} border-transparent shadow-lg`
          : 'bg-white/5 border-white/10 grayscale opacity-60'
      }`}
    >
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            achievement.unlocked ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
          }`}
        >
          {rarityLabel}
        </span>
      </div>

      {/* Icon */}
      <motion.div
        animate={{
          rotate: achievement.unlocked ? [0, 360] : 0,
        }}
        transition={{
          duration: 20,
          repeat: achievement.unlocked ? Infinity : 0,
          ease: 'linear',
        }}
        className="text-6xl mb-3"
      >
        {achievement.icon}
      </motion.div>

      {/* Title */}
      <h4 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
        {achievement.title}
      </h4>

      {/* Description */}
      <p
        className={`text-sm mb-3 line-clamp-2 ${
          achievement.unlocked ? 'text-white/80' : 'text-gray-500'
        }`}
      >
        {achievement.description}
      </p>

      {/* Progress Bar (if in progress) */}
      {achievement.progress && !achievement.unlocked && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {achievement.progress.current} / {achievement.progress.total}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(achievement.progress.current / achievement.progress.total) * 100}%`,
              }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>
        </div>
      )}

      {/* XP Reward */}
      <div
        className={`flex items-center justify-between text-sm ${
          achievement.unlocked ? 'text-white/90' : 'text-gray-500'
        }`}
      >
        <span className="flex items-center gap-1">⚡ {achievement.xpReward} XP</span>
        {achievement.unlocked && achievement.unlockedAt && (
          <span className="text-xs">{achievement.unlockedAt.toLocaleDateString()}</span>
        )}
      </div>

      {/* Locked Overlay */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[1px]">
          <div className="text-4xl">🔒</div>
        </div>
      )}
    </motion.div>
  );
}

// Featured Achievements Showcase
function FeaturedAchievementsShowcase({ achievements }: { achievements: Achievement[] }) {
  const recentAchievements = achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => b.unlockedAt!.getTime() - a.unlockedAt!.getTime())
    .slice(0, 3);

  if (recentAchievements.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Achievements Yet</h3>
        <p className="text-gray-400">Start reading and creating to unlock achievements!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recentAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: index * 0.2 }}
          className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          {/* Shine Effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          <div className="relative">
            {/* Icon */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
              className="text-7xl mb-4 text-center"
            >
              {achievement.icon}
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white text-center mb-2">{achievement.title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-300 text-center mb-4">{achievement.description}</p>

            {/* Badge */}
            <div className="flex justify-center">
              <span className="px-4 py-2 bg-yellow-600 text-white rounded-full text-sm font-bold">
                Recently Unlocked
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Compact Achievements (for sidebar/profile)
function CompactAchievements({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const recentlyUnlocked = achievements.filter((a) => a.unlocked).slice(0, 5);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Achievements</h3>
        <span className="text-sm text-gray-400">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {recentlyUnlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg"
            title={achievement.title}
          >
            {achievement.icon}
          </div>
        ))}
        {unlockedCount > 5 && (
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-400">
            +{unlockedCount - 5}
          </div>
        )}
      </div>

      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
        />
      </div>
    </div>
  );
}
