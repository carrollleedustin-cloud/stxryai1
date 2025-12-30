'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem, AnimatedCounter, ParticleField } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder, NeonText } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import AchievementBadge from '@/components/achievements/AchievementBadge';

// Achievement categories
const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', name: 'All Achievements', icon: 'SparklesIcon' },
  { id: 'reading', name: 'Reading', icon: 'BookOpenIcon' },
  { id: 'social', name: 'Social', icon: 'UsersIcon' },
  { id: 'exploration', name: 'Exploration', icon: 'CompassIcon' },
  { id: 'creation', name: 'Creation', icon: 'PenToolIcon' },
  { id: 'streaks', name: 'Streaks', icon: 'FlameIcon' },
  { id: 'special', name: 'Special', icon: 'StarIcon' },
];

// Achievement rarity colors
const RARITY_COLORS = {
  common: { bg: 'from-gray-500/30 to-gray-600/20', border: 'border-gray-500/50', text: 'text-gray-400', glow: 'shadow-gray-500/20' },
  uncommon: { bg: 'from-green-500/30 to-green-600/20', border: 'border-green-500/50', text: 'text-green-400', glow: 'shadow-green-500/30' },
  rare: { bg: 'from-blue-500/30 to-blue-600/20', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  epic: { bg: 'from-purple-500/30 to-purple-600/20', border: 'border-purple-500/50', text: 'text-purple-400', glow: 'shadow-purple-500/40' },
  legendary: { bg: 'from-amber-500/30 to-orange-600/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/50' },
  mythic: { bg: 'from-pink-500/30 via-purple-500/30 to-cyan-500/30', border: 'border-pink-500/50', text: 'text-pink-400', glow: 'shadow-pink-500/50' },
};

// Mock achievements data
const MOCK_ACHIEVEMENTS = [
  // Reading achievements
  { id: '1', name: 'First Steps', description: 'Complete your first story', icon: '📖', category: 'reading', rarity: 'common', xpReward: 50, unlockedAt: '2024-12-01', progress: 1, maxProgress: 1 },
  { id: '2', name: 'Bookworm', description: 'Read 10 complete stories', icon: '📚', category: 'reading', rarity: 'uncommon', xpReward: 200, unlockedAt: '2024-12-10', progress: 10, maxProgress: 10 },
  { id: '3', name: 'Literary Scholar', description: 'Read 50 complete stories', icon: '🎓', category: 'reading', rarity: 'rare', xpReward: 500, unlockedAt: null, progress: 23, maxProgress: 50 },
  { id: '4', name: 'Master Reader', description: 'Read 100 complete stories', icon: '👑', category: 'reading', rarity: 'epic', xpReward: 1000, unlockedAt: null, progress: 23, maxProgress: 100 },
  { id: '5', name: 'Legendary Bibliophile', description: 'Read 500 complete stories', icon: '🏆', category: 'reading', rarity: 'legendary', xpReward: 5000, unlockedAt: null, progress: 23, maxProgress: 500 },
  { id: '6', name: 'Speed Reader', description: 'Complete a story in under 30 minutes', icon: '⚡', category: 'reading', rarity: 'uncommon', xpReward: 150, unlockedAt: '2024-12-15', progress: 1, maxProgress: 1 },
  
  // Exploration achievements
  { id: '7', name: 'Path Finder', description: 'Discover 10 unique story endings', icon: '🗺️', category: 'exploration', rarity: 'uncommon', xpReward: 200, unlockedAt: '2024-12-08', progress: 10, maxProgress: 10 },
  { id: '8', name: 'Completionist', description: 'Unlock all endings in a single story', icon: '🎯', category: 'exploration', rarity: 'rare', xpReward: 400, unlockedAt: '2024-12-12', progress: 1, maxProgress: 1 },
  { id: '9', name: 'Hidden Secrets', description: 'Find 5 secret story paths', icon: '🔮', category: 'exploration', rarity: 'epic', xpReward: 750, unlockedAt: null, progress: 2, maxProgress: 5 },
  { id: '10', name: 'Universe Mapper', description: 'Explore every branch in 10 stories', icon: '🌌', category: 'exploration', rarity: 'legendary', xpReward: 2000, unlockedAt: null, progress: 3, maxProgress: 10 },
  
  // Social achievements
  { id: '11', name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', category: 'social', rarity: 'common', xpReward: 100, unlockedAt: '2024-12-05', progress: 5, maxProgress: 5 },
  { id: '12', name: 'Influencer', description: 'Have 50 followers', icon: '⭐', category: 'social', rarity: 'rare', xpReward: 500, unlockedAt: null, progress: 28, maxProgress: 50 },
  { id: '13', name: 'Helpful Critic', description: 'Write 10 story reviews', icon: '✍️', category: 'social', rarity: 'uncommon', xpReward: 250, unlockedAt: '2024-12-18', progress: 10, maxProgress: 10 },
  { id: '14', name: 'Club Founder', description: 'Create a reading club', icon: '🏛️', category: 'social', rarity: 'rare', xpReward: 400, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: '15', name: 'Community Champion', description: 'Reach 100 helpful votes on reviews', icon: '🏅', category: 'social', rarity: 'epic', xpReward: 800, unlockedAt: null, progress: 45, maxProgress: 100 },
  
  // Streak achievements
  { id: '16', name: 'Consistent Reader', description: 'Maintain a 7-day reading streak', icon: '🔥', category: 'streaks', rarity: 'uncommon', xpReward: 200, unlockedAt: '2024-12-14', progress: 7, maxProgress: 7 },
  { id: '17', name: 'Dedicated', description: 'Maintain a 30-day reading streak', icon: '💪', category: 'streaks', rarity: 'rare', xpReward: 500, unlockedAt: null, progress: 18, maxProgress: 30 },
  { id: '18', name: 'Unstoppable', description: 'Maintain a 100-day reading streak', icon: '🚀', category: 'streaks', rarity: 'epic', xpReward: 1500, unlockedAt: null, progress: 18, maxProgress: 100 },
  { id: '19', name: 'Eternal Flame', description: 'Maintain a 365-day reading streak', icon: '🌟', category: 'streaks', rarity: 'legendary', xpReward: 10000, unlockedAt: null, progress: 18, maxProgress: 365 },
  
  // Creation achievements
  { id: '20', name: 'Storyteller', description: 'Create your first story', icon: '📝', category: 'creation', rarity: 'common', xpReward: 100, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: '21', name: 'Published Author', description: 'Publish 5 stories', icon: '📕', category: 'creation', rarity: 'rare', xpReward: 600, unlockedAt: null, progress: 0, maxProgress: 5 },
  { id: '22', name: 'Branching Expert', description: 'Create a story with 20+ branches', icon: '🌳', category: 'creation', rarity: 'epic', xpReward: 1000, unlockedAt: null, progress: 0, maxProgress: 1 },
  
  // Special achievements
  { id: '23', name: 'Early Adopter', description: 'Join during the beta period', icon: '🚀', category: 'special', rarity: 'legendary', xpReward: 2500, unlockedAt: '2024-11-15', progress: 1, maxProgress: 1 },
  { id: '24', name: 'Night Owl', description: 'Read stories between midnight and 4 AM', icon: '🦉', category: 'special', rarity: 'uncommon', xpReward: 150, unlockedAt: '2024-12-20', progress: 1, maxProgress: 1 },
  { id: '25', name: 'Genre Master', description: 'Complete stories in all genres', icon: '🎭', category: 'special', rarity: 'mythic', xpReward: 5000, unlockedAt: null, progress: 5, maxProgress: 12 },
  { id: '26', name: 'Dimension Hopper', description: 'Read stories in 5 different languages', icon: '🌍', category: 'special', rarity: 'epic', xpReward: 1200, unlockedAt: null, progress: 2, maxProgress: 5 },
];

// Calculate stats
const calculateStats = (achievements: typeof MOCK_ACHIEVEMENTS) => {
  const unlocked = achievements.filter(a => a.unlockedAt !== null);
  const totalXP = unlocked.reduce((sum, a) => sum + a.xpReward, 0);
  const categories = [...new Set(unlocked.map(a => a.category))];
  
  return {
    total: achievements.length,
    unlocked: unlocked.length,
    totalXP,
    categoriesCompleted: categories.length,
    completionRate: Math.round((unlocked.length / achievements.length) * 100),
  };
};

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState(MOCK_ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<typeof MOCK_ACHIEVEMENTS[0] | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const stats = calculateStats(achievements);

  const filteredAchievements = achievements.filter(a => {
    const categoryMatch = selectedCategory === 'all' || a.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || a.unlockedAt !== null;
    return categoryMatch && unlockedMatch;
  });

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl text-text-primary">Loading Achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <VoidBackground variant="dense" />
      <ParticleField particleCount={60} color="rgba(168, 85, 247, 0.3)" maxSize={2} interactive={true} />
      <EtherealNav />

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        {/* Header */}
        <RevealOnScroll>
          <div className="text-center mb-12">
            <TemporalHeading level={1} accent className="mb-4">
              Achievements
            </TemporalHeading>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
              Every story you explore, every path you discover, brings you closer to legendary status.
            </p>
          </div>
        </RevealOnScroll>

        {/* Stats Overview */}
        <RevealOnScroll threshold={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <HolographicCard className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-bold text-spectral-cyan">
                <AnimatedCounter end={stats.unlocked} />/<AnimatedCounter end={stats.total} />
              </div>
              <p className="text-sm text-text-secondary">Unlocked</p>
            </HolographicCard>
            
            <HolographicCard className="p-6 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-aurora">
                <AnimatedCounter end={stats.totalXP} suffix=" XP" />
              </div>
              <p className="text-sm text-text-secondary">Total Earned</p>
            </HolographicCard>
            
            <HolographicCard className="p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-purple-400">
                <AnimatedCounter end={stats.completionRate} suffix="%" />
              </div>
              <p className="text-sm text-text-secondary">Completion</p>
            </HolographicCard>
            
            <HolographicCard className="p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-green-400">
                <AnimatedCounter end={stats.categoriesCompleted} />
              </div>
              <p className="text-sm text-text-secondary">Categories</p>
            </HolographicCard>
            
            <HolographicCard className="p-6 text-center col-span-2 md:col-span-1">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-orange-400">
                <AnimatedCounter end={18} />
              </div>
              <p className="text-sm text-text-secondary">Day Streak</p>
            </HolographicCard>
          </div>
        </RevealOnScroll>

        {/* Category Filters */}
        <RevealOnScroll threshold={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENT_CATEGORIES.map(category => (
                <SpectralButton
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                  className="px-4 py-2 text-sm"
                >
                  <Icon name={category.icon} className="mr-2" size={16} />
                  {category.name}
                </SpectralButton>
              ))}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="w-5 h-5 rounded border-void-border bg-void-100/30 text-spectral-cyan focus:ring-spectral-cyan"
              />
              <span className="text-text-secondary">Show unlocked only</span>
            </label>
          </div>
        </RevealOnScroll>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => {
              const isUnlocked = achievement.unlockedAt !== null;
              const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
              const rarityStyle = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={`
                      relative p-12 rounded-2xl cursor-pointer transition-all duration-300
                      backdrop-blur-md border-2
                      bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border}
                      ${isUnlocked ? `shadow-2xl ${rarityStyle.glow}` : 'opacity-60 grayscale-[30%]'}
                      hover:shadow-2xl hover:${rarityStyle.glow} hover:scale-105
                    `}
                  >
                    {/* Rarity Badge */}
                    <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-lg font-bold uppercase ${rarityStyle.text} bg-void-100/50`}>
                      {achievement.rarity}
                    </div>
                    
                    {/* Custom Badge Icon - 3x bigger */}
                    <div className="flex justify-center mb-8">
                      <AchievementBadge
                        achievementId={achievement.id}
                        name={achievement.name}
                        category={achievement.category}
                        rarity={achievement.rarity}
                        size="lg"
                        unlocked={isUnlocked}
                      />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className={`text-3xl font-bold mb-4 text-center ${isUnlocked ? 'text-aurora' : 'text-text-secondary'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-xl text-text-secondary mb-6 text-center line-clamp-2">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {!isUnlocked && (
                      <div className="mb-6">
                        <div className="flex justify-between text-lg text-text-secondary mb-3">
                          <span>Progress</span>
                          <span className="font-bold">{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="h-4 bg-void-100/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full bg-gradient-to-r from-spectral-cyan to-purple-500`}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* XP Reward */}
                    <div className="flex items-center justify-between text-xl">
                      <div className="flex items-center">
                        <Icon name="SparklesIcon" className="mr-2 text-amber-400" size={24} />
                        <span className={`font-bold ${isUnlocked ? 'text-amber-400' : 'text-text-secondary'}`}>
                          +{achievement.xpReward} XP
                        </span>
                      </div>
                      
                      {isUnlocked && (
                        <div className="text-lg text-text-secondary">
                          {new Date(achievement.unlockedAt!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Unlocked Glow Effect */}
                    {isUnlocked && (
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${rarityStyle.bg} opacity-20 animate-pulse pointer-events-none`} />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <RevealOnScroll>
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-aurora mb-2">No Achievements Found</h3>
              <p className="text-text-secondary mb-6">
                {showUnlockedOnly 
                  ? "You haven't unlocked any achievements in this category yet." 
                  : "No achievements match your current filters."}
              </p>
              <SpectralButton onClick={() => { setSelectedCategory('all'); setShowUnlockedOnly(false); }}>
                <Icon name="RefreshCwIcon" className="mr-2" size={18} />
                Reset Filters
              </SpectralButton>
            </div>
          </RevealOnScroll>
        )}

        {/* Achievement Detail Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-900/80 backdrop-blur-sm"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg"
              >
                <GradientBorder className="p-1 rounded-2xl">
                  <div className={`
                    p-8 rounded-2xl backdrop-blur-xl
                    bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity as keyof typeof RARITY_COLORS].bg}
                  `}>
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedAchievement(null)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-void-100/50 hover:bg-void-100 transition-colors"
                    >
                      <Icon name="XIcon" size={20} className="text-text-secondary" />
                    </button>
                    
                    {/* Custom Badge Icon - Extra Large */}
                    <div className="flex justify-center mb-8">
                      <AchievementBadge
                        achievementId={selectedAchievement.id}
                        name={selectedAchievement.name}
                        category={selectedAchievement.category}
                        rarity={selectedAchievement.rarity}
                        size="xl"
                        unlocked={selectedAchievement.unlockedAt !== null}
                      />
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-5xl font-bold text-aurora text-center mb-4">
                      {selectedAchievement.name}
                    </h2>
                    
                    {/* Rarity */}
                    <div className={`text-center mb-4 ${RARITY_COLORS[selectedAchievement.rarity as keyof typeof RARITY_COLORS].text} font-bold uppercase`}>
                      {selectedAchievement.rarity} Achievement
                    </div>
                    
                    {/* Description */}
                    <p className="text-2xl text-text-secondary text-center mb-8">
                      {selectedAchievement.description}
                    </p>
                    
                    {/* Progress */}
                    <div className="mb-8">
                      <div className="flex justify-between text-2xl text-text-secondary mb-4">
                        <span>Progress</span>
                        <span className="font-bold">{selectedAchievement.progress}/{selectedAchievement.maxProgress}</span>
                      </div>
                      <div className="h-6 bg-void-100/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-gradient-to-r from-spectral-cyan via-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                    
                    {/* Reward */}
                    <div className="flex items-center justify-center gap-3 text-3xl mb-8">
                      <Icon name="SparklesIcon" className="text-amber-400" size={36} />
                      <span className="font-bold text-amber-400">+{selectedAchievement.xpReward} XP Reward</span>
                    </div>
                    
                    {/* Unlock Date / CTA */}
                    {selectedAchievement.unlockedAt ? (
                      <div className="text-center text-text-secondary">
                        <Icon name="CheckCircleIcon" className="inline mr-2 text-green-400" size={18} />
                        Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </div>
                    ) : (
                      <div className="text-center">
                        <SpectralButton href="/story-library" variant="primary" className="px-8 py-3">
                          <Icon name="BookOpenIcon" className="mr-2" size={18} />
                          Start Reading to Unlock
                        </SpectralButton>
                      </div>
                    )}
                  </div>
                </GradientBorder>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Rare Achievements Section */}
        <RevealOnScroll threshold={0.1}>
          <div className="mt-16">
            <TemporalHeading level={2} className="mb-8 text-center">
              Legendary Goals
            </TemporalHeading>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {achievements
                .filter(a => a.rarity === 'legendary' || a.rarity === 'mythic')
                .slice(0, 3)
                .map((achievement, index) => {
                  const isUnlocked = achievement.unlockedAt !== null;
                  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                  const rarityStyle = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.15 }}
                      viewport={{ once: true }}
                    >
                      <GradientBorder className="p-2 rounded-2xl h-full">
                        <div className={`
                          p-12 rounded-2xl h-full
                          bg-gradient-to-br ${rarityStyle.bg}
                          ${isUnlocked ? '' : 'opacity-80'}
                        `}>
                          <div className="flex flex-col items-center gap-6">
                            <AchievementBadge
                              achievementId={achievement.id}
                              name={achievement.name}
                              category={achievement.category}
                              rarity={achievement.rarity}
                              size="lg"
                              unlocked={isUnlocked}
                            />
                            <div className="flex-1 w-full text-center">
                              <h3 className={`text-3xl font-bold mb-3 ${rarityStyle.text}`}>
                                {achievement.name}
                              </h3>
                              <p className="text-xl text-text-secondary mb-6">
                                {achievement.description}
                              </p>
                              
                              {/* Progress */}
                              <div className="mb-4">
                                <div className="flex justify-between text-xl text-text-secondary mb-3">
                                  <span className="font-bold">{achievement.progress}/{achievement.maxProgress}</span>
                                  <span className="font-bold">{Math.round(progressPercent)}%</span>
                                </div>
                                <div className="h-4 bg-void-100/50 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.5, delay: 0.3 }}
                                    viewport={{ once: true }}
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center text-2xl text-amber-400">
                                <Icon name="SparklesIcon" className="mr-2" size={28} />
                                <span className="font-bold">+{achievement.xpReward} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GradientBorder>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </RevealOnScroll>

        {/* Call to Action */}
        <RevealOnScroll threshold={0.1}>
          <div className="mt-16 text-center">
            <HolographicCard className="inline-block p-8">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-aurora mb-2">Keep the Adventure Going</h3>
              <p className="text-text-secondary mb-6 max-w-md">
                Every story you read brings new achievements. Explore different genres and discover hidden paths to unlock them all!
              </p>
              <div className="flex justify-center gap-4">
                <SpectralButton href="/story-library" variant="primary" className="px-6 py-3">
                  <Icon name="BookOpenIcon" className="mr-2" size={18} />
                  Explore Stories
                </SpectralButton>
                <SpectralButton href="/leaderboards" variant="secondary" className="px-6 py-3">
                  <Icon name="TrophyIcon" className="mr-2" size={18} />
                  View Leaderboards
                </SpectralButton>
              </div>
            </HolographicCard>
          </div>
        </RevealOnScroll>
      </main>
    </div>
  );
};

export default AchievementsPage;

