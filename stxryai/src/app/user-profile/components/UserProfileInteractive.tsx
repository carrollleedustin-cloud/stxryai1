'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import VoidBackground from '@/components/void/VoidBackground';
import {
  EtherealNav,
  TemporalHeading,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  ParticleField,
} from '@/components/void';
import {
  HolographicCard,
  RevealOnScroll,
  GradientBorder,
  NeonText,
} from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { UserProfile, Story, Achievement } from '@/types/database';
import { ReadingClub } from '@/services/communityService';
import { userProgressService } from '@/services/userProgressService';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { CharacterSheet, getZodiacEmoji } from '@/types/character-sheet';
import { useAuth } from '@/contexts/AuthContext';

// Define specific interfaces for props
export interface UserStats {
  storiesCompleted: number;
  choicesMade: number;
  readingStreak: number;
  totalReadingTime: number;
}

export interface UserAchievement extends Achievement {
  progress: number;
  total: number;
  unlocked: boolean;
}

interface UserProfileInteractiveProps {
  initialUser: any;
  initialStats: any;
  initialAchievements: any[];
  initialStories: any[];
  initialChoicePatterns: any;
  initialGenrePreferences: any[];
  initialReadingTimes: any[];
  initialFriends: any[];
  initialClubs: any[];
  initialLists: any[];
}

const UserProfileInteractive = ({
  initialUser,
  initialStats,
  initialAchievements,
  initialStories,
  initialChoicePatterns,
  initialGenrePreferences,
  initialReadingTimes,
  initialFriends,
  initialClubs,
  initialLists,
}: UserProfileInteractiveProps) => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history' | 'social'>(
    'overview'
  );
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [characterSheet, setCharacterSheet] = useState<CharacterSheet | null>(null);

  // Use real user data if logged in, otherwise use mock data
  const currentUser =
    user && profile
      ? {
          id: user.id,
          name: profile.display_name || profile.username || 'User',
          username: profile.username || 'user',
          avatar:
            profile.avatar_url ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          bio: profile.bio || 'No bio yet. Edit your profile to add one!',
          isPremium: profile.subscription_tier !== 'free',
          joinDate: new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          location: profile.location || null,
          website: profile.website || null,
        }
      : initialUser;

  useEffect(() => {
    setIsHydrated(true);

    // Load character sheet from localStorage
    const savedSheet = localStorage.getItem('stxryai_character_sheet');
    if (savedSheet) {
      try {
        setCharacterSheet(JSON.parse(savedSheet));
      } catch (e) {
        console.error('Failed to parse character sheet:', e);
      }
    }

    const fetchReadingHistory = async () => {
      try {
        const userId = user?.id || initialUser.id;
        const history = await userProgressService.getAllUserProgress(userId);
        setReadingHistory(history || initialStories);
      } catch {
        setReadingHistory(initialStories);
      }
    };
    fetchReadingHistory();
  }, [user?.id, initialUser.id, initialStories]);

  if (!isHydrated || loading) {
    return (
      <VoidBackground variant="minimal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-spectral-cyan/30 border-t-spectral-cyan rounded-full animate-spin mx-auto mb-4" />
            <p className="text-void-400">Loading Profile...</p>
          </div>
        </div>
      </VoidBackground>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <VoidBackground variant="aurora">
        <ParticleField color="rgba(0, 245, 212, 0.5)" particleCount={50} />
        <EtherealNav />
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <GradientBorder className="max-w-md w-full">
            <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-8 text-center">
              <Icon name="UserCircleIcon" size={64} className="text-spectral-cyan mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-void-100 mb-2">Sign In Required</h2>
              <p className="text-void-400 mb-6">
                Please sign in to view your profile and access all features.
              </p>
              <Link href="/authentication?redirect=/user-profile">
                <SpectralButton variant="primary" size="lg" className="w-full">
                  <Icon name="ArrowRightOnRectangleIcon" size={20} className="mr-2" />
                  Sign In
                </SpectralButton>
              </Link>
            </div>
          </GradientBorder>
        </main>
      </VoidBackground>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'UserIcon' },
    { id: 'achievements' as const, label: 'Achievements', icon: 'TrophyIcon' },
    { id: 'history' as const, label: 'History', icon: 'BookOpenIcon' },
    { id: 'social' as const, label: 'Social', icon: 'UsersIcon' },
  ];

  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-xl shadow-yellow-500/30';
      case 'epic':
        return 'shadow-lg shadow-purple-500/30';
      case 'rare':
        return 'shadow-md shadow-blue-500/30';
      default:
        return '';
    }
  };

  return (
    <VoidBackground variant="aurora">
      <ParticleField color="rgba(0, 245, 212, 0.5)" particleCount={50} />
      <EtherealNav />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <RevealOnScroll>
            <GradientBorder className="mb-8">
              <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Avatar */}
                  <div className="relative group">
                    <motion.div
                      className="relative w-32 h-32 md:w-40 md:h-40"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-spectral-cyan via-spectral-violet to-spectral-pink animate-spin-slow"
                        style={{ animationDuration: '8s' }}
                      />
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover border-2 border-void-900"
                      />
                      {currentUser.isPremium && (
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-void-950 shadow-lg shadow-yellow-500/30">
                          <Icon name="SparklesIcon" size={20} className="text-void-950" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-void-100">
                        {currentUser.name}
                      </h1>
                      {currentUser.isPremium && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium">
                          <Icon name="CrownIcon" size={14} />
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-spectral-cyan text-lg mb-3">@{currentUser.username}</p>
                    <p className="text-void-400 max-w-xl mb-4">{currentUser.bio}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-void-500 justify-center md:justify-start">
                      <span className="flex items-center gap-1">
                        <Icon name="CalendarIcon" size={14} />
                        Joined {currentUser.joinDate}
                      </span>
                      {currentUser.location && (
                        <span className="flex items-center gap-1">
                          <Icon name="MapPinIcon" size={14} />
                          {currentUser.location}
                        </span>
                      )}
                      {currentUser.website && (
                        <a
                          href={currentUser.website}
                          className="flex items-center gap-1 text-spectral-cyan hover:underline"
                        >
                          <Icon name="LinkIcon" size={14} />
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Link href="/settings">
                      <SpectralButton variant="primary" size="md">
                        <Icon name="PencilIcon" size={16} className="mr-2" />
                        Edit Profile
                      </SpectralButton>
                    </Link>
                    <SpectralButton
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${currentUser.name}'s Profile`,
                            text: `Check out ${currentUser.name}'s profile on StxryAI`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Profile link copied to clipboard!');
                        }
                      }}
                    >
                      <Icon name="ShareIcon" size={16} className="mr-2" />
                      Share
                    </SpectralButton>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-void-800/50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-spectral-cyan mb-1">
                      <AnimatedCounter end={initialStats.storiesCompleted} />
                    </div>
                    <p className="text-sm text-void-500">Stories Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-spectral-violet mb-1">
                      <AnimatedCounter end={initialStats.totalChoices} />
                    </div>
                    <p className="text-sm text-void-500">Choices Made</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1 flex items-center justify-center gap-1">
                      <Icon name="FireIcon" size={24} className="text-orange-500" />
                      <AnimatedCounter end={initialStats.readingStreak} />
                    </div>
                    <p className="text-sm text-void-500">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      <AnimatedCounter end={initialStats.achievements} />
                    </div>
                    <p className="text-sm text-void-500">Achievements</p>
                  </div>
                </div>
              </div>
            </GradientBorder>
          </RevealOnScroll>

          {/* Tab Navigation */}
          <RevealOnScroll delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                    ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 text-void-100 border border-spectral-cyan/50'
                        : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </RevealOnScroll>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column - Play Style */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Play Style Analysis */}
                  <HolographicCard className="p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="ChartBarIcon" size={24} className="text-spectral-cyan" />
                      Play Style Analysis
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Object.entries(initialChoicePatterns).map(([pattern, value]) => (
                        <div
                          key={pattern}
                          className="text-center p-4 rounded-lg bg-void-900/50 border border-void-800/50"
                        >
                          <div className="text-2xl font-bold text-spectral-cyan mb-1">
                            {value as number}%
                          </div>
                          <p className="text-sm text-void-500 capitalize">{pattern}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-void-400">Genre Preferences</h4>
                      {initialGenrePreferences.map((genre: { name: string; value: number }) => (
                        <div key={genre.name} className="flex items-center gap-4">
                          <span className="w-20 text-sm text-void-300">{genre.name}</span>
                          <div className="flex-1 h-2 bg-void-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${genre.value}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-sm text-void-500 w-12">{genre.value}%</span>
                        </div>
                      ))}
                    </div>
                  </HolographicCard>

                  {/* Recent Stories */}
                  <HolographicCard className="p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="BookOpenIcon" size={24} className="text-spectral-violet" />
                      Recent Stories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {initialStories.slice(0, 4).map((story: any) => (
                        <Link key={story.id} href={`/story-reader?id=${story.id}`}>
                          <motion.div
                            className="group relative overflow-hidden rounded-lg border border-void-800/50 hover:border-spectral-cyan/50 transition-all"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="aspect-[3/2] relative">
                              <img
                                src={story.cover}
                                alt={story.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/50 to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <span className="inline-block px-2 py-1 rounded-full bg-spectral-cyan/20 text-spectral-cyan text-xs mb-2">
                                {story.genre}
                              </span>
                              <h4 className="font-semibold text-void-100 group-hover:text-spectral-cyan transition-colors">
                                {story.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-2 text-sm text-void-500">
                                <span>{story.completionRate}% complete</span>
                                {story.rating && (
                                  <span className="flex items-center gap-1">
                                    <Icon name="StarIcon" size={14} className="text-yellow-400" />
                                    {story.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </HolographicCard>

                  {/* Reading Lists */}
                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="ListBulletIcon" size={24} className="text-spectral-pink" />
                        Reading Lists
                      </h3>
                      <SpectralButton variant="ghost" size="sm">
                        <Icon name="PlusIcon" size={16} className="mr-1" />
                        New List
                      </SpectralButton>
                    </div>
                    <div className="space-y-4">
                      {initialLists.map((list: any) => (
                        <motion.div
                          key={list.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-void-900/50 border border-void-800/50 hover:border-spectral-cyan/30 transition-all"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex -space-x-2">
                            {list.coverImages?.slice(0, 3).map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border-2 border-void-900"
                              />
                            ))}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-void-100">{list.name}</h4>
                              {list.isPublic ? (
                                <Icon name="GlobeAltIcon" size={14} className="text-void-500" />
                              ) : (
                                <Icon name="LockClosedIcon" size={14} className="text-void-500" />
                              )}
                            </div>
                            <p className="text-sm text-void-500">{list.storyCount} stories</p>
                          </div>
                          <Icon name="ChevronRightIcon" size={20} className="text-void-500" />
                        </motion.div>
                      ))}
                    </div>
                  </HolographicCard>
                </div>

                {/* Right Column - Social */}
                <div className="space-y-8">
                  {/* Character Sheet */}
                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="SparklesIcon" size={20} className="text-spectral-pink" />
                        Character Sheet
                      </h3>
                    </div>
                    {characterSheet ? (
                      <div className="space-y-4">
                        {/* Core Signs */}
                        <div className="text-center">
                          <div className="flex justify-center gap-2 mb-3">
                            <span className="text-3xl">
                              {getZodiacEmoji(characterSheet.coreAlignment.sunSign)}
                            </span>
                            <span className="text-3xl">
                              {getZodiacEmoji(characterSheet.coreAlignment.moonSign)}
                            </span>
                            <span className="text-3xl">
                              {getZodiacEmoji(characterSheet.coreAlignment.risingSign)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-spectral-cyan to-spectral-violet">
                            {characterSheet.personalityArchetype.title}
                          </h4>
                          <p className="text-sm text-void-500 italic mt-1">
                            "{characterSheet.coreAlignment.tagline}"
                          </p>
                        </div>

                        {/* Core Signs Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-void-900/50">
                            <p className="text-xs text-void-500">Sun</p>
                            <p className="text-sm font-bold text-yellow-400">
                              {characterSheet.coreAlignment.sunSign}
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-void-900/50">
                            <p className="text-xs text-void-500">Moon</p>
                            <p className="text-sm font-bold text-blue-300">
                              {characterSheet.coreAlignment.moonSign}
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-void-900/50">
                            <p className="text-xs text-void-500">Rising</p>
                            <p className="text-sm font-bold text-purple-400">
                              {characterSheet.coreAlignment.risingSign}
                            </p>
                          </div>
                        </div>

                        {/* Signature Quote */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 border border-spectral-cyan/20">
                          <p className="text-sm text-void-300 italic text-center">
                            {characterSheet.signatureQuote}
                          </p>
                        </div>

                        <Link href="/profile/character-sheet" className="block">
                          <SpectralButton variant="ghost" size="sm" className="w-full">
                            View Full Character Sheet →
                          </SpectralButton>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <motion.div
                          className="text-5xl mb-4"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🌟
                        </motion.div>
                        <p className="text-void-400 mb-4">
                          Discover your cosmic blueprint with a personalized Character Sheet based
                          on your birth chart.
                        </p>
                        <Link href="/profile/character-sheet">
                          <SpectralButton variant="primary" size="sm" className="w-full">
                            <Icon name="SparklesIcon" size={16} className="mr-2" />
                            Create Character Sheet
                          </SpectralButton>
                        </Link>
                      </div>
                    )}
                  </HolographicCard>

                  {/* Friends */}
                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="UsersIcon" size={20} className="text-spectral-cyan" />
                        Friends
                      </h3>
                      <span className="text-sm text-void-500">{initialFriends.length}</span>
                    </div>
                    <div className="space-y-3">
                      {initialFriends.slice(0, 5).map((friend: any) => (
                        <motion.div
                          key={friend.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-void-900/50 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="relative">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {friend.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-void-950" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-void-100 truncate">{friend.name}</p>
                            <p className="text-xs text-void-500 truncate">
                              {friend.isOnline
                                ? friend.currentStory
                                : `Last seen ${friend.lastActive}`}
                            </p>
                          </div>
                          <SpectralButton variant="ghost" size="sm">
                            <Icon name="ChatBubbleLeftRightIcon" size={16} />
                          </SpectralButton>
                        </motion.div>
                      ))}
                    </div>
                    <Link href="/community-hub" className="block mt-4">
                      <SpectralButton variant="ghost" size="sm" className="w-full">
                        View All Friends
                      </SpectralButton>
                    </Link>
                  </HolographicCard>

                  {/* Clubs */}
                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="UserGroupIcon" size={20} className="text-spectral-violet" />
                        Clubs
                      </h3>
                      <span className="text-sm text-void-500">{initialClubs.length}</span>
                    </div>
                    <div className="space-y-3">
                      {initialClubs.slice(0, 3).map((club: any) => (
                        <motion.div
                          key={club.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-void-900/50 border border-void-800/50"
                          whileHover={{ x: 4 }}
                        >
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-void-100 truncate">{club.name}</p>
                              {club.role === 'admin' && (
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                                  Admin
                                </span>
                              )}
                              {club.role === 'moderator' && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                  Mod
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-void-500">
                              {club.memberCount?.toLocaleString()} members
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Link href="/clubs" className="block mt-4">
                      <SpectralButton variant="ghost" size="sm" className="w-full">
                        Discover Clubs
                      </SpectralButton>
                    </Link>
                  </HolographicCard>

                  {/* Reading Time Heatmap */}
                  <HolographicCard className="p-6">
                    <h3 className="text-lg font-semibold text-void-100 mb-4 flex items-center gap-2">
                      <Icon name="ClockIcon" size={20} className="text-spectral-pink" />
                      Peak Reading Times
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {initialReadingTimes.map((time: { hour: string; sessions: number }) => (
                        <div
                          key={time.hour}
                          className="relative p-2 rounded-lg text-center"
                          style={{
                            background: `rgba(0, 245, 212, ${Math.min(time.sessions / 50, 0.5)})`,
                          }}
                        >
                          <span className="text-xs text-void-300">{time.hour}</span>
                          <div className="text-sm font-semibold text-void-100">{time.sessions}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-void-500 mt-4 text-center">Sessions per time slot</p>
                  </HolographicCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-void-100">Achievements</h2>
                        <p className="text-void-500">
                          {initialAchievements.filter((a: any) => a.unlockedAt).length} of{' '}
                          {initialAchievements.length} unlocked
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-600" />
                          <span className="text-void-500">Common</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                          <span className="text-void-500">Rare</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
                          <span className="text-void-500">Epic</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-600" />
                          <span className="text-void-500">Legendary</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {initialAchievements.map((achievement: any) => (
                        <motion.div
                          key={achievement.id}
                          className={`
                            relative p-4 rounded-xl border transition-all
                            ${
                              achievement.unlockedAt
                                ? `bg-void-900/50 border-void-700/50 ${getRarityGlow(achievement.rarity)}`
                                : 'bg-void-950/50 border-void-800/30 opacity-50'
                            }
                          `}
                          whileHover={{ scale: achievement.unlockedAt ? 1.02 : 1 }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`
                              w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                              bg-gradient-to-br ${rarityColors[achievement.rarity] || rarityColors.common}
                              ${!achievement.unlockedAt && 'grayscale'}
                            `}
                            >
                              {achievement.icon === 'BookOpenIcon' && '📖'}
                              {achievement.icon === 'BoltIcon' && '⚡'}
                              {achievement.icon === 'MoonIcon' && '🌙'}
                              {achievement.icon === 'TrophyIcon' && '🏆'}
                              {achievement.icon === 'UserGroupIcon' && '👥'}
                              {achievement.icon === 'FireIcon' && '🔥'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-void-100">{achievement.name}</h4>
                              <p className="text-sm text-void-500">{achievement.description}</p>
                              {achievement.progress !== undefined && achievement.maxProgress && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-void-500 mb-1">
                                    <span>
                                      {achievement.progress} / {achievement.maxProgress}
                                    </span>
                                    <span>
                                      {Math.round(
                                        (achievement.progress / achievement.maxProgress) * 100
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-void-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${rarityColors[achievement.rarity]}`}
                                      style={{
                                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {achievement.unlockedAt && (
                                <p className="text-xs text-void-600 mt-2">
                                  Unlocked {achievement.unlockedAt}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-void-100 mb-6">Reading History</h2>
                    <div className="space-y-4">
                      {initialStories.map((story: any) => (
                        <motion.div
                          key={story.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-void-900/50 border border-void-800/50 hover:border-spectral-cyan/30 transition-all"
                          whileHover={{ x: 4 }}
                        >
                          <img
                            src={story.cover}
                            alt={story.title}
                            className="w-16 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-void-100">{story.title}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-void-500">
                              <span className="px-2 py-0.5 rounded-full bg-spectral-cyan/10 text-spectral-cyan text-xs">
                                {story.genre}
                              </span>
                              <span>{story.totalChoices} choices</span>
                              <span>Last read: {story.lastRead}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-void-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet rounded-full"
                                  style={{ width: `${story.completionRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-void-400">{story.completionRate}%</span>
                            </div>
                          </div>
                          {story.rating && (
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Icon name="StarIcon" size={16} />
                                <span className="font-semibold">{story.rating}</span>
                              </div>
                              <span className="text-xs text-void-500">Your rating</span>
                            </div>
                          )}
                          <SpectralButton variant="ghost" size="sm">
                            <Icon name="PlayIcon" size={16} className="mr-1" />
                            Continue
                          </SpectralButton>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Friends List */}
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h2 className="text-xl font-bold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="UsersIcon" size={24} className="text-spectral-cyan" />
                      Friends ({initialFriends.length})
                    </h2>
                    <div className="space-y-3">
                      {initialFriends.map((friend: any) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-void-900/50 border border-void-800/50"
                        >
                          <div className="relative">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {friend.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-void-950" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-void-100">{friend.name}</p>
                            <p className="text-sm text-void-500">@{friend.username}</p>
                            {friend.currentStory && (
                              <p className="text-xs text-spectral-cyan mt-1">
                                Reading: {friend.currentStory}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <SpectralButton variant="ghost" size="sm">
                              <Icon name="ChatBubbleLeftRightIcon" size={16} />
                            </SpectralButton>
                            <SpectralButton variant="ghost" size="sm">
                              <Icon name="UserMinusIcon" size={16} />
                            </SpectralButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>

                {/* Clubs */}
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h2 className="text-xl font-bold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="UserGroupIcon" size={24} className="text-spectral-violet" />
                      Clubs ({initialClubs.length})
                    </h2>
                    <div className="space-y-4">
                      {initialClubs.map((club: any) => (
                        <div
                          key={club.id}
                          className="p-4 rounded-lg bg-void-900/50 border border-void-800/50"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={club.logo}
                              alt={club.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-void-100">{club.name}</h3>
                                {club.role === 'admin' && (
                                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                                    Admin
                                  </span>
                                )}
                                {club.role === 'moderator' && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                    Mod
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-void-500 mt-1">{club.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-void-500">
                                <span>{club.memberCount?.toLocaleString()} members</span>
                                <span>Joined {club.joinedDate}</span>
                                <span className="flex items-center gap-1">
                                  Activity: {'⚡'.repeat(club.activityLevel || 1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </VoidBackground>
  );
};

export default UserProfileInteractive;
