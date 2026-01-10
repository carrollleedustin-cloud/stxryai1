'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { achievementService, LeaderboardEntry } from '@/services/achievementService';
import { socialService } from '@/services/socialService';
import Icon from '@/components/ui/AppIcon';

// Mock data for when backend is unavailable
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: '1',
    username: 'darkstoryteller',
    displayName: 'Alexandra Chen',
    avatarUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png',
    level: 42,
    totalXp: 125000,
    achievementCount: 45,
    rank: 1,
  },
  {
    userId: '2',
    username: 'scifiexplorer',
    displayName: 'Marcus Rodriguez',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    level: 38,
    totalXp: 98500,
    achievementCount: 38,
    rank: 2,
  },
  {
    userId: '3',
    username: 'mysteryreader',
    displayName: 'Emily Watson',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    level: 35,
    totalXp: 87200,
    achievementCount: 32,
    rank: 3,
  },
  {
    userId: '4',
    username: 'fantasyfan',
    displayName: 'David Kim',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    level: 31,
    totalXp: 72400,
    achievementCount: 28,
    rank: 4,
  },
  {
    userId: '5',
    username: 'horrorfanatic',
    displayName: 'Sarah Johnson',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    level: 29,
    totalXp: 65800,
    achievementCount: 25,
    rank: 5,
  },
  {
    userId: '6',
    username: 'romancereader',
    displayName: 'Jessica Williams',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    level: 27,
    totalXp: 58200,
    achievementCount: 22,
    rank: 6,
  },
  {
    userId: '7',
    username: 'thrillerking',
    displayName: 'Michael Brown',
    avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    level: 25,
    totalXp: 52100,
    achievementCount: 20,
    rank: 7,
  },
  {
    userId: '8',
    username: 'dramalover',
    displayName: 'Amanda Davis',
    avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    level: 23,
    totalXp: 46800,
    achievementCount: 18,
    rank: 8,
  },
  {
    userId: '9',
    username: 'adventurer',
    displayName: 'Chris Wilson',
    avatarUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    level: 21,
    totalXp: 41500,
    achievementCount: 16,
    rank: 9,
  },
  {
    userId: '10',
    username: 'bookworm',
    displayName: 'Lisa Anderson',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    level: 19,
    totalXp: 36200,
    achievementCount: 14,
    rank: 10,
  },
];

const MOCK_WEEKLY_LEADERS = [
  {
    userId: '3',
    username: 'mysteryreader',
    displayName: 'Emily Watson',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    storiesRead: 12,
    xpGained: 4500,
    rank: 1,
  },
  {
    userId: '1',
    username: 'darkstoryteller',
    displayName: 'Alexandra Chen',
    avatarUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png',
    storiesRead: 10,
    xpGained: 3800,
    rank: 2,
  },
  {
    userId: '5',
    username: 'horrorfanatic',
    displayName: 'Sarah Johnson',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    storiesRead: 8,
    xpGained: 3200,
    rank: 3,
  },
];

const MOCK_STREAK_LEADERS = [
  {
    userId: '1',
    username: 'darkstoryteller',
    displayName: 'Alexandra Chen',
    avatarUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png',
    currentStreak: 156,
    longestStreak: 156,
    rank: 1,
  },
  {
    userId: '7',
    username: 'thrillerking',
    displayName: 'Michael Brown',
    avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    currentStreak: 89,
    longestStreak: 124,
    rank: 2,
  },
  {
    userId: '2',
    username: 'scifiexplorer',
    displayName: 'Marcus Rodriguez',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    currentStreak: 67,
    longestStreak: 98,
    rank: 3,
  },
];

type LeaderboardType = 'xp' | 'weekly' | 'streaks' | 'achievements';

const LeaderboardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('xp');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await achievementService.getLeaderboard(
          activeTab === 'achievements' ? 'achievements' : 'xp',
          100
        );
        if (data && data.length > 0) {
          setLeaderboard(data);
        } else {
          setLeaderboard(MOCK_LEADERBOARD);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard(MOCK_LEADERBOARD);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [activeTab]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-amber-500 to-orange-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-amber-600 via-amber-700 to-amber-800';
    return 'from-spectral-cyan/50 to-spectral-violet/50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const tabs = [
    { id: 'xp' as const, label: 'Total XP', icon: 'SparklesIcon' },
    { id: 'weekly' as const, label: 'This Week', icon: 'CalendarIcon' },
    { id: 'streaks' as const, label: 'Streaks', icon: 'FireIcon' },
    { id: 'achievements' as const, label: 'Achievements', icon: 'TrophyIcon' },
  ];

  return (
    <VoidBackground variant="aurora">
      <EtherealNav />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="text-center mb-12">
              <TemporalHeading level={1} accent className="mb-4">
                Leaderboards
              </TemporalHeading>
              <p className="text-xl text-void-400 max-w-2xl mx-auto">
                The greatest storytellers rise to the top. Where do you stand among the legends?
              </p>
            </div>
          </RevealOnScroll>

          {/* Top 3 Podium */}
          <RevealOnScroll delay={0.2}>
            <div className="flex justify-center items-end gap-4 mb-16 h-80">
              {/* Second Place */}
              <motion.div
                className="relative"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              >
                <div className="relative z-10 text-center mb-2">
                  <div className="w-20 h-20 mx-auto mb-2 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 animate-pulse" />
                    <img
                      src={MOCK_LEADERBOARD[1]?.avatarUrl || '/placeholder.jpg'}
                      alt={MOCK_LEADERBOARD[1]?.displayName}
                      className="w-full h-full rounded-full object-cover border-4 border-gray-400 relative z-10"
                    />
                    <span className="absolute -bottom-1 -right-1 text-2xl z-20">🥈</span>
                  </div>
                  <p className="text-sm font-semibold text-void-100">
                    {MOCK_LEADERBOARD[1]?.displayName}
                  </p>
                  <p className="text-xs text-void-400">@{MOCK_LEADERBOARD[1]?.username}</p>
                </div>
                <div className="w-28 h-36 bg-gradient-to-b from-gray-400/30 to-gray-600/20 backdrop-blur-xl rounded-t-lg border border-gray-400/30 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold bg-gradient-to-b from-gray-200 to-gray-400 bg-clip-text text-transparent">
                      2
                    </p>
                    <p className="text-xs text-void-400">
                      {MOCK_LEADERBOARD[1]?.totalXp?.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* First Place */}
              <motion.div
                className="relative z-10"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
              >
                <div className="relative z-10 text-center mb-2">
                  <div className="w-28 h-28 mx-auto mb-2 relative">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 animate-pulse"
                      style={{ filter: 'blur(8px)' }}
                    />
                    <img
                      src={MOCK_LEADERBOARD[0]?.avatarUrl || '/placeholder.jpg'}
                      alt={MOCK_LEADERBOARD[0]?.displayName}
                      className="w-full h-full rounded-full object-cover border-4 border-yellow-400 relative z-10"
                    />
                    <span className="absolute -bottom-2 -right-2 text-3xl z-20">👑</span>
                  </div>
                  <p className="text-base font-bold text-void-100">
                    {MOCK_LEADERBOARD[0]?.displayName}
                  </p>
                  <p className="text-sm text-void-400">@{MOCK_LEADERBOARD[0]?.username}</p>
                </div>
                <div className="w-32 h-48 bg-gradient-to-b from-yellow-400/30 via-amber-500/20 to-orange-600/10 backdrop-blur-xl rounded-t-lg border border-yellow-400/40 flex items-center justify-center shadow-xl shadow-yellow-500/20">
                  <div className="text-center">
                    <p className="text-4xl font-bold bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                      1
                    </p>
                    <p className="text-sm text-void-300 font-semibold">
                      {MOCK_LEADERBOARD[0]?.totalXp?.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Third Place */}
              <motion.div
                className="relative"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 12 }}
              >
                <div className="relative z-10 text-center mb-2">
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 animate-pulse" />
                    <img
                      src={MOCK_LEADERBOARD[2]?.avatarUrl || '/placeholder.jpg'}
                      alt={MOCK_LEADERBOARD[2]?.displayName}
                      className="w-full h-full rounded-full object-cover border-4 border-amber-600 relative z-10"
                    />
                    <span className="absolute -bottom-1 -right-1 text-xl z-20">🥉</span>
                  </div>
                  <p className="text-xs font-semibold text-void-100">
                    {MOCK_LEADERBOARD[2]?.displayName}
                  </p>
                  <p className="text-xs text-void-400">@{MOCK_LEADERBOARD[2]?.username}</p>
                </div>
                <div className="w-24 h-28 bg-gradient-to-b from-amber-600/30 to-amber-800/20 backdrop-blur-xl rounded-t-lg border border-amber-600/30 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold bg-gradient-to-b from-amber-400 to-amber-700 bg-clip-text text-transparent">
                      3
                    </p>
                    <p className="text-xs text-void-400">
                      {MOCK_LEADERBOARD[2]?.totalXp?.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </RevealOnScroll>

          {/* Tabs */}
          <RevealOnScroll delay={0.3}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-lg font-medium transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 text-void-100 border border-spectral-cyan/50'
                        : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Icon name={tab.icon} size={18} />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg border-2 border-spectral-cyan/50"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </RevealOnScroll>

          {/* Leaderboard Table */}
          <RevealOnScroll delay={0.4}>
            <GradientBorder>
              <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-void-900/50 border-b border-void-700/50 text-void-400 text-sm font-medium">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5">Player</div>
                  <div className="col-span-2 text-center">Level</div>
                  <div className="col-span-2 text-center">XP</div>
                  <div className="col-span-2 text-center">Achievements</div>
                </div>

                {/* Table Body */}
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <div className="py-16 text-center">
                      <div className="w-8 h-8 border-2 border-spectral-cyan/30 border-t-spectral-cyan rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-void-400">Loading leaderboard...</p>
                    </div>
                  ) : (
                    <StaggerContainer className="divide-y divide-void-800/50">
                      {leaderboard.slice(0, 50).map((entry, index) => (
                        <StaggerItem key={entry.userId}>
                          <motion.div
                            className={`
                              grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-300
                              ${hoveredRank === entry.rank ? 'bg-spectral-cyan/5' : 'hover:bg-void-900/50'}
                              ${entry.rank <= 3 ? 'bg-gradient-to-r from-transparent via-transparent to-transparent' : ''}
                            `}
                            onMouseEnter={() => setHoveredRank(entry.rank)}
                            onMouseLeave={() => setHoveredRank(null)}
                          >
                            {/* Rank */}
                            <div className="col-span-1 text-center">
                              {entry.rank <= 3 ? (
                                <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                              ) : (
                                <span
                                  className={`
                                  inline-flex items-center justify-center w-8 h-8 rounded-full
                                  bg-gradient-to-br ${getRankColor(entry.rank)} text-void-950 font-bold text-sm
                                `}
                                >
                                  {entry.rank}
                                </span>
                              )}
                            </div>

                            {/* Player */}
                            <div className="col-span-5 flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={entry.avatarUrl || '/placeholder.jpg'}
                                  alt={entry.displayName}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-void-700"
                                />
                                {entry.rank <= 3 && (
                                  <div
                                    className={`absolute -inset-1 rounded-full bg-gradient-to-r ${getRankColor(entry.rank)} opacity-30 blur-sm -z-10`}
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-void-100">{entry.displayName}</p>
                                <p className="text-sm text-void-500">@{entry.username}</p>
                              </div>
                            </div>

                            {/* Level */}
                            <div className="col-span-2 text-center">
                              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-spectral-violet/20 border border-spectral-violet/30">
                                <span className="text-spectral-violet font-semibold">
                                  Lv.{entry.level}
                                </span>
                              </div>
                            </div>

                            {/* XP */}
                            <div className="col-span-2 text-center">
                              <span className="text-spectral-cyan font-mono font-semibold">
                                {entry.totalXp?.toLocaleString()}
                              </span>
                            </div>

                            {/* Achievements */}
                            <div className="col-span-2 text-center">
                              <div className="inline-flex items-center gap-1">
                                <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
                                <span className="text-void-200">{entry.achievementCount}</span>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  )}
                </AnimatePresence>
              </div>
            </GradientBorder>
          </RevealOnScroll>

          {/* Weekly & Streak Mini-Leaderboards */}
          <RevealOnScroll delay={0.5}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Weekly Stars */}
              <HolographicCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center">
                    <Icon name="SparklesIcon" size={20} className="text-void-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-void-100">Weekly Stars</h3>
                    <p className="text-sm text-void-500">Top performers this week</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {MOCK_WEEKLY_LEADERS.map((leader, index) => (
                    <div
                      key={leader.userId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-void-900/30 border border-void-800/50"
                    >
                      <span className="text-2xl">{getRankIcon(leader.rank)}</span>
                      <img
                        src={leader.avatarUrl}
                        alt={leader.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-void-100">{leader.displayName}</p>
                        <p className="text-xs text-void-500">
                          {leader.storiesRead} stories • +{leader.xpGained} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </HolographicCard>

              {/* Streak Champions */}
              <HolographicCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Icon name="FireIcon" size={20} className="text-void-100" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-void-100">Streak Champions</h3>
                    <p className="text-sm text-void-500">Longest active reading streaks</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {MOCK_STREAK_LEADERS.map((leader, index) => (
                    <div
                      key={leader.userId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-void-900/30 border border-void-800/50"
                    >
                      <span className="text-2xl">{getRankIcon(leader.rank)}</span>
                      <img
                        src={leader.avatarUrl}
                        alt={leader.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-void-100">{leader.displayName}</p>
                        <div className="flex items-center gap-2 text-xs text-void-500">
                          <span className="text-orange-400 font-semibold">
                            🔥 {leader.currentStreak} days
                          </span>
                          <span>•</span>
                          <span>Best: {leader.longestStreak}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </HolographicCard>
            </div>
          </RevealOnScroll>

          {/* Call to Action */}
          <RevealOnScroll delay={0.6}>
            <div className="text-center mt-16">
              <p className="text-void-400 mb-6">Ready to climb the ranks?</p>
              <SpectralButton href="/story-library" variant="primary" size="lg">
                Start Reading
                <Icon name="ArrowRightIcon" size={20} className="ml-2" />
              </SpectralButton>
            </div>
          </RevealOnScroll>
        </div>
      </main>
    </VoidBackground>
  );
};

export default LeaderboardsPage;
