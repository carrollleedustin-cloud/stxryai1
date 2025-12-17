'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPProgressBar from './XPProgressBar';
import AchievementCard from './AchievementCard';
import Leaderboard, { LeaderboardEntry } from './Leaderboard';
import { ACHIEVEMENTS, Achievement } from '@/lib/gamification/achievements';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

interface GamificationDashboardProps {
  userId: string;
  userStats: {
    totalXP: number;
    stories_completed: number;
    choices_made: number;
    reading_streak: number;
    stories_created: number;
    comments_posted: number;
    stories_shared: number;
  };
  unlockedAchievements: string[];
  leaderboardData?: LeaderboardEntry[];
}

export default function GamificationDashboard({
  userId,
  userStats,
  unlockedAchievements,
  leaderboardData = [],
}: GamificationDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'leaderboard'>('achievements');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const tabs = [
    { value: 'achievements' as const, label: 'Achievements', icon: 'TrophyIcon' },
    { value: 'leaderboard' as const, label: 'Leaderboard', icon: 'ChartBarIcon' },
  ];

  const filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'unlocked' as const, label: 'Unlocked' },
    { value: 'locked' as const, label: 'Locked' },
  ];

  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    if (achievementFilter === 'unlocked') return isUnlocked;
    if (achievementFilter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id)).length;
  const completionPercentage = (unlockedCount / ACHIEVEMENTS.length) * 100;

  return (
    <div className="space-y-6">
      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl shadow-lg p-6"
      >
        <XPProgressBar totalXP={userStats.totalXP} showDetails={true} size="lg" />
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div variants={slideUp} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BookOpenIcon" size={20} className="text-blue-500" />
            <span className="text-sm text-muted-foreground">Stories</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.stories_completed}</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BoltIcon" size={20} className="text-purple-500" />
            <span className="text-sm text-muted-foreground">Choices</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.choices_made}</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="FireIcon" size={20} className="text-orange-500" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.reading_streak} days</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrophyIcon" size={20} className="text-yellow-500" />
            <span className="text-sm text-muted-foreground">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <motion.button
            key={tab.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
              selectedTab === tab.value
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            {tab.label}
            {selectedTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Achievement Filters */}
            <div className="flex gap-2 mb-6">
              {filters.map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAchievementFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    achievementFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>

            {/* Achievement Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredAchievements.map((achievement) => (
                <motion.div key={achievement.id} variants={slideUp}>
                  <AchievementCard
                    achievement={achievement}
                    userStats={userStats}
                    unlocked={unlockedAchievements.includes(achievement.id)}
                    showProgress={true}
                  />
                </motion.div>
              ))}
            </motion.div>

            {filteredAchievements.length === 0 && (
              <div className="py-20 text-center">
                <Icon
                  name="TrophyIcon"
                  size={64}
                  className="text-muted-foreground mx-auto mb-4 opacity-50"
                />
                <p className="text-lg text-muted-foreground">
                  No achievements in this category yet
                </p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Leaderboard entries={leaderboardData} currentUserId={userId} timeframe="all-time" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
