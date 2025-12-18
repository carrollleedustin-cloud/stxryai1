'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  prize: string;
  category: string;
  userRank?: number;
  userScore?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  reward: {
    xp: number;
    badge?: string;
    energy?: number;
  };
  completed: boolean;
  expiresAt?: string;
}

interface AdvancedGamificationProps {
  userId: string;
  onBadgeClick?: (badgeId: string) => void;
  onTournamentJoin?: (tournamentId: string) => void;
  onQuestClaim?: (questId: string) => void;
}

export function AdvancedGamification({
  userId,
  onBadgeClick,
  onTournamentJoin,
  onQuestClaim,
}: AdvancedGamificationProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'tournaments' | 'quests' | 'bingo'>('badges');

  // Mock data - replace with actual API calls
  const badges: Badge[] = [];
  const tournaments: Tournament[] = [];
  const quests: Quest[] = [];

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>🎮</span>
          Achievements & Rewards
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'badges' as const, label: 'Badges', icon: '🏅' },
          { id: 'tournaments' as const, label: 'Tournaments', icon: '🏆' },
          { id: 'quests' as const, label: 'Quests', icon: '📜' },
          { id: 'bingo' as const, label: 'Bingo', icon: '🎯' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onBadgeClick?.(badge.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                badge.unlocked
                  ? 'border-primary bg-primary/10 hover:shadow-lg'
                  : 'border-border bg-card opacity-60'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${rarityColors[badge.rarity]} flex items-center justify-center text-3xl mb-4 mx-auto ${
                  !badge.unlocked && 'grayscale'
                }`}
              >
                {badge.icon}
              </div>
              <h3 className="font-bold text-foreground text-center mb-2">{badge.name}</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">{badge.description}</p>
              {badge.progress !== undefined && badge.maxProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {badge.progress} / {badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(badge.progress / badge.maxProgress) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
              {badge.unlocked && (
                <div className="mt-4 text-center">
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                    ✓ Unlocked
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{tournament.name}</h3>
                  <p className="text-muted-foreground mb-4">{tournament.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="UsersIcon" size={16} />
                      <span className="text-muted-foreground">{tournament.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
                      <span className="text-foreground font-medium">{tournament.prize}</span>
                    </div>
                  </div>
                </div>
                {tournament.userRank && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">#{tournament.userRank}</div>
                    <div className="text-sm text-muted-foreground">Your Rank</div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                  {new Date(tournament.endDate).toLocaleDateString()}
                </div>
                {onTournamentJoin && (
                  <motion.button
                    onClick={() => onTournamentJoin(tournament.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium"
                  >
                    {tournament.userRank ? 'View Leaderboard' : 'Join Tournament'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          {quests.map((quest) => {
            const progress = (quest.progress / quest.target) * 100;
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 ${
                  quest.completed
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{quest.title}</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {quest.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{quest.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">
                          {quest.progress} / {quest.target}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            quest.completed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, progress)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="SparklesIcon" size={16} className="text-yellow-500" />
                      <span className="font-medium text-foreground">+{quest.reward.xp} XP</span>
                    </div>
                    {quest.reward.badge && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{quest.reward.badge}</span>
                        <span className="text-muted-foreground">Badge</span>
                      </div>
                    )}
                    {quest.reward.energy && (
                      <div className="flex items-center gap-1">
                        <Icon name="BoltIcon" size={16} className="text-yellow-500" />
                        <span className="font-medium text-foreground">+{quest.reward.energy} Energy</span>
                      </div>
                    )}
                  </div>
                  {quest.completed && onQuestClaim && (
                    <motion.button
                      onClick={() => onQuestClaim(quest.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
                    >
                      Claim Reward
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bingo Tab */}
      {activeTab === 'bingo' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Reading Bingo</h3>
            <p className="text-muted-foreground">
              Complete challenges to fill your bingo card and win rewards!
            </p>
          </div>
          <BingoCard />
        </div>
      )}
    </div>
  );
}

function BingoCard() {
  const [card, setCard] = useState<(boolean | null)[][]>(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(null))
  );

  const challenges = [
    'Read a Fantasy story',
    'Complete 3 choices',
    'Read for 30 min',
    'Bookmark a story',
    'Share a story',
    'Join a club',
    'Rate 5 stories',
    'Read Sci-Fi',
    'Complete daily goal',
    'Unlock achievement',
    'Read Mystery',
    'Make 10 choices',
    'Read Romance',
    'Comment on story',
    'Read Horror',
    'Follow creator',
    'Read Adventure',
    'Create collection',
    'Read Thriller',
    'Complete weekly goal',
    'Read Drama',
    'Remix a story',
    'Read Comedy',
    'Join tournament',
    'Read Historical',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-5 gap-2">
        {challenges.map((challenge, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const isCompleted = card[row][col] === true;

          return (
            <motion.button
              key={index}
              onClick={() => {
                const newCard = [...card];
                newCard[row][col] = !isCompleted;
                setCard(newCard);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square p-2 rounded-lg border-2 text-xs font-medium text-center flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'bg-card border-border text-foreground hover:border-primary'
              }`}
            >
              {isCompleted ? '✓' : challenge}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <p className="text-muted-foreground">
          Completed: {card.flat().filter((c) => c === true).length} / 25
        </p>
      </div>
    </div>
  );
}

