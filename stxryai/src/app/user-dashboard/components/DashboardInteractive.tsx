'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import EtherealNav from '@/components/void/EtherealNav';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import DimensionalCard from '@/components/void/DimensionalCard';
import SpectralButton from '@/components/void/SpectralButton';
import TemporalReveal, { StaggerContainer, StaggerItem } from '@/components/void/TemporalReveal';
import ParticleField, { AnimatedCounter, TypewriterText } from '@/components/void/ParticleField';
import {
  AuroraBackdrop,
  NoiseOverlay,
  BentoGrid,
  BentoItem,
  GlassCard,
  NarrativeConstellation,
} from '@/components/void/AdvancedEffects';
import StoryPetDisplay from '@/components/pet/StoryPetDisplay';
import {
  BookOpen,
  Compass,
  Sparkles,
  Clock,
  Zap,
  TrendingUp,
  Library,
  PenTool,
  Settings,
  ChevronRight,
  Play,
  Award,
  Target,
  Flame,
  Star,
  Heart,
  Eye,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  PawPrint,
} from 'lucide-react';

/**
 * HOLOGRAPHIC CARD
 * A card with holographic shimmer effect
 */
function HolographicCard({
  children,
  className = '',
  glowColor = 'spectral-cyan',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-void-black/60 backdrop-blur-xl border border-white/10 ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Holographic gradient */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, var(--${glowColor}) 0%, transparent 50%)`,
        }}
      />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(${135 + mousePos.x * 90}deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * PULSE ORB
 * Animated pulsing indicator
 */
function PulseOrb({
  color = 'spectral-cyan',
  size = 'sm',
}: {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };

  return (
    <span className="relative inline-flex">
      <span
        className={`${sizes[size]} rounded-full animate-ping absolute opacity-75`}
        style={{ backgroundColor: `var(--${color})` }}
      />
      <span
        className={`${sizes[size]} rounded-full`}
        style={{ backgroundColor: `var(--${color})` }}
      />
    </span>
  );
}

/**
 * ACTIVITY GRAPH
 * Visual representation of activity over time
 */
function ActivityGraph({ data }: { data: number[] }) {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, index) => (
        <motion.div
          key={index}
          className="flex-1 rounded-t-sm"
          style={{
            background: `linear-gradient(to top, var(--spectral-cyan), var(--spectral-violet))`,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${(value / maxValue) * 100}%` }}
          transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

/**
 * DASHBOARD INTERACTIVE
 * Your personal command center in the void.
 * Where stories converge and adventures begin.
 */
export default function DashboardInteractive() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { pet, hasPet, setShowPetPanel, showPetPanel } = usePet();

  const [dataLoading, setDataLoading] = useState(true);
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    storiesRead: 0,
    choicesMade: 0,
    readingStreak: 0,
    totalReadingTime: 0,
    followers: 0,
    following: 0,
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Greeting based on time
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'Night owl';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, [currentTime]);

  // Activity data for graph (mock)
  const weeklyActivity = useMemo(() => [3, 7, 4, 9, 2, 6, 8], []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);

      // Dynamic imports for services
      const [progressModule, activityModule] = await Promise.all([
        import('@/services/userProgressService').catch(() => ({ userProgressService: null })),
        import('@/services/userActivityService').catch(() => ({ userActivityService: null })),
      ]);

      const { userProgressService } = progressModule;
      const { userActivityService } = activityModule;

      if (userProgressService && userActivityService) {
        const [progressData, activityData] = await Promise.all([
          userProgressService.getUserReadingList(user.id).catch(() => []),
          userActivityService.getRecentActivity(user.id, 5).catch(() => []),
        ]);

        setContinueReading(
          progressData?.filter((p: any) => p.progress_percentage < 100).slice(0, 3) || []
        );
        setRecentActivity(activityData || []);
      }

      // Set stats (mock data for now - would come from API)
      setStats({
        storiesRead: 12,
        choicesMade: 156,
        readingStreak: 7,
        totalReadingTime: 24,
        followers: 234,
        following: 89,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [loadDashboardData, authLoading]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication?redirect=/user-dashboard');
    }
  }, [authLoading, user, router]);

  // Loading state
  if (authLoading || (dataLoading && user)) {
    return (
      <div className="min-h-screen bg-void-absolute">
        <VoidBackground variant="cosmos" />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Animated loading ring */}
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-spectral-cyan/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-t-spectral-cyan border-r-spectral-violet border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-2 rounded-full bg-void-black/50 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-spectral-cyan" />
              </div>
            </div>

            <div className="text-center">
              <TypewriterText
                text="Entering the void..."
                className="text-sm font-ui tracking-widest uppercase text-ghost-400"
                speed={80}
              />
            </div>

            {/* Loading progress bar */}
            <div className="w-48 h-1 bg-void-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-void-absolute">
        <VoidBackground variant="aurora" />
        <EtherealNav />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <HolographicCard className="p-12 text-center max-w-md mx-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-spectral-cyan/20 to-spectral-violet/20 flex items-center justify-center">
              <Users className="w-10 h-10 text-spectral-cyan" />
            </div>
            <h2 className="font-display text-2xl text-white mb-3">Access Required</h2>
            <p className="text-ghost-400 mb-8">
              Sign in to access your personal dashboard and continue your story journey.
            </p>
            <SpectralButton
              variant="primary"
              onClick={() => router.push('/authentication?redirect=/user-dashboard')}
              className="w-full justify-center"
            >
              <span className="flex items-center gap-2">
                Sign In to Continue
                <ChevronRight className="w-4 h-4" />
              </span>
            </SpectralButton>
          </HolographicCard>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Library, label: 'Library', href: '/story-library', color: 'spectral-cyan' },
    { icon: PenTool, label: 'Create', href: '/story-creation-studio', color: 'spectral-violet' },
    { icon: Compass, label: 'Discover', href: '/community-hub', color: 'spectral-rose' },
    {
      icon: PawPrint,
      label: 'Pet',
      action: () => setShowPetPanel(!showPetPanel),
      color: hasPet ? 'spectral-rose' : 'ghost-400',
      isButton: true,
    },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'ghost-400' },
  ];

  return (
    <div className="min-h-screen bg-void-absolute">
      <NoiseOverlay opacity={0.03} />
      <VoidBackground variant="default" />
      <AuroraBackdrop className="opacity-30" />
      <ParticleField particleCount={40} color="rgba(123, 44, 191, 0.3)" />
      <AmbientOrbs />
      <EtherealNav />

      <main className="min-h-screen pt-28 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-spectral-cyan/10 border border-spectral-cyan/20 mb-4"
                >
                  <PulseOrb color="spectral-cyan" size="sm" />
                  <span className="text-xs font-ui tracking-widest uppercase text-spectral-cyan">
                    {greeting}
                  </span>
                </motion.div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-3">
                  {profile?.display_name || user.email?.split('@')[0] || 'Traveler'}
                </h1>
                <p className="text-lg text-ghost-400 font-prose">
                  Your stories await. Where will you journey today?
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      (action as any).isButton
                        ? (action as any).action?.()
                        : router.push((action as any).href)
                    }
                    className="w-14 h-14 rounded-xl flex items-center justify-center bg-void-black/60 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                    title={action.label}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, var(--${action.color})20 0%, transparent 70%)`,
                      }}
                    />
                    <action.icon
                      className="w-5 h-5 relative z-10 transition-colors duration-300"
                      style={{ color: `var(--${action.color})` }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats & Featured Bento Grid */}
          <BentoGrid className="mb-10 p-0">
            <BentoItem size="medium" className="p-0 border-0 overflow-visible">
              <HolographicCard className="p-5 h-full" glowColor="spectral-cyan">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-spectral-cyan/15">
                    <BookOpen className="w-5 h-5 text-spectral-cyan" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    +3
                  </div>
                </div>
                <div className="font-display text-4xl text-white mb-1">
                  <AnimatedCounter end={stats.storiesRead} duration={2} />
                </div>
                <div className="text-xs font-ui tracking-wide uppercase text-ghost-500">
                  Stories Read
                </div>
              </HolographicCard>
            </BentoItem>

            <BentoItem size="small" className="p-0 border-0">
              <HolographicCard className="p-5 h-full" glowColor="spectral-rose">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-spectral-rose/15">
                    <Flame className="w-5 h-5 text-spectral-rose" />
                  </div>
                </div>
                <div className="font-display text-4xl text-white mb-1">
                  {stats.readingStreak} 🔥
                </div>
                <div className="text-xs font-ui tracking-wide uppercase text-ghost-500">Streak</div>
              </HolographicCard>
            </BentoItem>

            <BentoItem size="small" className="p-0 border-0">
              <HolographicCard className="p-5 h-full" glowColor="spectral-violet">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-spectral-violet/15">
                    <Zap className="w-5 h-5 text-spectral-violet" />
                  </div>
                </div>
                <div className="font-display text-4xl text-white mb-1">
                  <AnimatedCounter end={stats.choicesMade} duration={2} />
                </div>
                <div className="text-xs font-ui tracking-wide uppercase text-ghost-500">
                  Choices
                </div>
              </HolographicCard>
            </BentoItem>

            <BentoItem size="tall" className="p-0 border-0 overflow-hidden">
              <GlassCard
                className="h-full relative overflow-hidden flex flex-col justify-end p-6 border-0"
                hoverEffect={false}
              >
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-void-black to-transparent z-10" />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="w-full h-full bg-[url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"
                  />
                </div>
                <div className="relative z-20">
                  <h3 className="font-display text-lg text-white mb-2">Narrative Core</h3>
                  <p className="text-xs text-ghost-400 mb-4 leading-relaxed">
                    Your AI companion is analyzing your latest story ripples.
                  </p>
                  <SpectralButton size="sm" variant="cyan" fullWidth>
                    View Intelligence
                  </SpectralButton>
                </div>
              </GlassCard>
            </BentoItem>

            <BentoItem size="wide" className="p-0 border-0 overflow-hidden">
              <HolographicCard
                className="p-6 h-full flex items-center justify-between"
                glowColor="spectral-cyan"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-spectral-cyan/30 to-spectral-violet/30 flex items-center justify-center border border-white/10 shrink-0">
                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-white mb-1">Adventure Awaits</h3>
                    <p className="text-sm text-ghost-400">
                      Jump back into your most recent narrative journey.
                    </p>
                  </div>
                </div>
                <SpectralButton
                  onClick={() =>
                    continueReading[0] &&
                    router.push(`/story-reader?storyId=${continueReading[0].story_id}`)
                  }
                  variant="cyan"
                >
                  Resume Story
                </SpectralButton>
              </HolographicCard>
            </BentoItem>
            <BentoItem size="large" className="p-0 border-0 overflow-hidden">
              <HolographicCard className="p-6 h-full" glowColor="spectral-violet">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-spectral-violet" />
                    Narrative Constellation
                  </h3>
                  <div className="text-[10px] font-ui tracking-widest uppercase text-ghost-500">
                    Live View
                  </div>
                </div>

                <NarrativeConstellation
                  nodes={[
                    { id: '1', x: 20, y: 50, label: 'The Awakening', type: 'choice' },
                    { id: '2', x: 50, y: 30, label: 'Shadow Path', type: 'choice' },
                    { id: '3', x: 50, y: 70, label: 'Light Path', type: 'choice' },
                    { id: '4', x: 80, y: 50, label: 'Convergence', type: 'outcome' },
                  ]}
                  connections={[
                    { from: '1', to: '2' },
                    { from: '1', to: '3' },
                    { from: '2', to: '4' },
                    { from: '3', to: '4' },
                  ]}
                />

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-ghost-400">4 active narrative paths detected.</p>
                  <SpectralButton size="sm" variant="ghost">
                    Explore Map
                  </SpectralButton>
                </div>
              </HolographicCard>
            </BentoItem>
          </BentoGrid>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Reading Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl text-white flex items-center gap-3">
                    <Play className="w-5 h-5 text-spectral-cyan" />
                    Continue Reading
                  </h2>
                  <button
                    onClick={() => router.push('/story-library')}
                    className="text-xs font-ui tracking-wide uppercase text-ghost-500 hover:text-spectral-cyan transition-colors flex items-center gap-1 group"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {continueReading.length > 0 ? (
                  <div className="space-y-4">
                    {continueReading.map((item, index) => (
                      <HolographicCard
                        key={item.id || index}
                        className="p-5 cursor-pointer"
                        glowColor="spectral-violet"
                      >
                        <div
                          onClick={() => router.push(`/story-reader?storyId=${item.story_id}`)}
                          className="flex items-start gap-4"
                        >
                          <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-spectral-violet/20 to-spectral-cyan/20 flex items-center justify-center shrink-0 border border-white/5">
                            <BookOpen className="w-6 h-6 text-spectral-violet" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg text-white truncate mb-1">
                              {item.story?.title || 'Untitled Story'}
                            </h3>
                            <p className="text-sm text-ghost-400 mb-3">
                              Chapter {item.current_chapter_number || 1}
                            </p>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-void-elevated rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress_percentage || 0}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-spectral-cyan to-spectral-violet"
                              />
                            </div>
                            <p className="mt-2 text-xs text-ghost-500">
                              {item.progress_percentage || 0}% complete
                            </p>
                          </div>

                          <ChevronRight className="w-5 h-5 text-ghost-500 shrink-0 self-center" />
                        </div>
                      </HolographicCard>
                    ))}
                  </div>
                ) : (
                  <HolographicCard className="p-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-ghost-500" />
                    </div>
                    <h3 className="font-display text-xl text-white mb-2">No stories in progress</h3>
                    <p className="text-sm text-ghost-400 mb-6 max-w-sm mx-auto">
                      Start your first adventure and it will appear here. Every journey begins with
                      a single choice.
                    </p>
                    <SpectralButton onClick={() => router.push('/story-library')} variant="primary">
                      <span className="flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        Explore Library
                      </span>
                    </SpectralButton>
                  </HolographicCard>
                )}
              </motion.div>

              {/* Recommended Stories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl text-white flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-spectral-violet" />
                    Recommended For You
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'The Last Algorithm',
                      genre: 'Sci-Fi',
                      reads: '12.4K',
                      rating: 4.8,
                      color: 'spectral-cyan',
                    },
                    {
                      title: 'Whispers of the Void',
                      genre: 'Fantasy',
                      reads: '8.7K',
                      rating: 4.9,
                      color: 'spectral-violet',
                    },
                  ].map((story, index) => (
                    <HolographicCard
                      key={index}
                      className="p-5 cursor-pointer"
                      glowColor={story.color}
                    >
                      <div
                        onClick={() => router.push('/story-library')}
                        className="flex items-start gap-4"
                      >
                        <div
                          className="w-14 h-18 rounded-lg flex items-center justify-center shrink-0 border border-white/5"
                          style={{
                            background: `linear-gradient(135deg, var(--${story.color})20, transparent)`,
                          }}
                        >
                          <BookOpen
                            className="w-6 h-6"
                            style={{ color: `var(--${story.color})` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-ui tracking-wide uppercase mb-2"
                            style={{
                              background: `var(--${story.color})15`,
                              color: `var(--${story.color})`,
                            }}
                          >
                            {story.genre}
                          </span>
                          <h3 className="font-display text-white mb-2 truncate">{story.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-ghost-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {story.reads}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {story.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HolographicCard>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pet Companion Card */}
              {hasPet && pet && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 }}
                >
                  <HolographicCard
                    className="p-6 cursor-pointer"
                    glowColor={pet.traits.primaryColor.replace('#', '')}
                  >
                    <div
                      className="flex flex-col items-center"
                      onClick={() => setShowPetPanel(true)}
                    >
                      <div className="mb-3">
                        <StoryPetDisplay size="sm" showInteractions={false} showStats={false} />
                      </div>
                      <h3 className="font-display text-lg text-white mb-1">{pet.name}</h3>
                      <p className="text-xs text-ghost-400 capitalize mb-3">
                        Lv.{pet.stats.level} {pet.evolutionStage} {pet.baseType}
                      </p>

                      {/* Mini stats */}
                      <div className="w-full space-y-2">
                        {/* XP bar */}
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-400" />
                          <div className="flex-1 h-1.5 bg-void-elevated rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(pet.stats.experience / pet.stats.experienceToNextLevel) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-ghost-500">
                            {pet.stats.experience}/{pet.stats.experienceToNextLevel}
                          </span>
                        </div>

                        {/* Happiness */}
                        <div className="flex items-center gap-2">
                          <Heart className="w-3 h-3 text-pink-400" />
                          <div className="flex-1 h-1.5 bg-void-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                              style={{ width: `${pet.stats.happiness}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-ghost-500">{pet.stats.happiness}%</span>
                        </div>
                      </div>

                      <button
                        className="mt-4 text-xs font-ui tracking-wide uppercase text-spectral-cyan hover:text-spectral-violet transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPetPanel(true);
                        }}
                      >
                        <PawPrint className="w-3 h-3" />
                        View Companion
                      </button>
                    </div>
                  </HolographicCard>
                </motion.div>
              )}

              {/* Weekly Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <HolographicCard className="p-6" glowColor="spectral-emerald">
                  <div className="flex items-center gap-3 mb-5">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <h3 className="font-display text-lg text-white">Weekly Activity</h3>
                  </div>

                  <ActivityGraph data={weeklyActivity} />

                  <div className="flex justify-between mt-3 text-xs text-ghost-500">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <span key={i} className="w-full text-center">
                        {day}
                      </span>
                    ))}
                  </div>
                </HolographicCard>
              </motion.div>

              {/* Daily Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <HolographicCard className="p-6" glowColor="spectral-amber">
                  <div className="flex items-center gap-3 mb-5">
                    <Target className="w-5 h-5 text-amber-400" />
                    <h3 className="font-display text-lg text-white">Daily Goal</h3>
                  </div>

                  <div className="text-center mb-5">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          strokeWidth="8"
                          fill="none"
                          className="stroke-void-elevated"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r="48"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          className="stroke-amber-400"
                          initial={{ strokeDasharray: '0 301.6' }}
                          animate={{
                            strokeDasharray: `${((profile?.daily_choices_used || 0) / (profile?.daily_choice_limit || 10)) * 301.6} 301.6`,
                          }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-3xl text-white">
                          {profile?.daily_choices_used || 0}
                        </span>
                        <span className="text-xs text-ghost-500">
                          / {profile?.daily_choice_limit || 10}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-sm text-ghost-400 mb-4">choices used today</p>

                  {(profile?.daily_choices_used || 0) >= (profile?.daily_choice_limit || 10) && (
                    <SpectralButton
                      variant="secondary"
                      onClick={() => router.push('/pricing')}
                      className="w-full justify-center"
                    >
                      Upgrade for Unlimited
                    </SpectralButton>
                  )}
                </HolographicCard>
              </motion.div>

              {/* Achievements Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <HolographicCard className="p-6" glowColor="spectral-violet">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-spectral-violet" />
                      <h3 className="font-display text-lg text-white">Achievements</h3>
                    </div>
                    <span className="text-xs font-ui text-ghost-500 px-2 py-1 rounded-full bg-void-elevated">
                      3/12
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: '📖', title: 'First Story', unlocked: true },
                      { icon: '⚡', title: '10 Choices', unlocked: true },
                      { icon: '🔥', title: '7 Day Streak', unlocked: true },
                      { icon: '🌟', title: 'Popular', unlocked: false },
                    ].map((achievement, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl border ${
                          achievement.unlocked
                            ? 'bg-void-elevated border-white/10'
                            : 'bg-void-black/50 border-dashed border-white/5 opacity-50'
                        }`}
                        title={achievement.title}
                      >
                        {achievement.unlocked ? achievement.icon : '?'}
                      </motion.div>
                    ))}
                  </div>

                  <button className="w-full mt-4 text-xs font-ui tracking-wide uppercase text-ghost-500 hover:text-spectral-violet transition-colors text-center">
                    View All Achievements
                  </button>
                </HolographicCard>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <HolographicCard className="p-6" glowColor="spectral-cyan">
                  <div className="flex items-center gap-3 mb-5">
                    <MessageSquare className="w-5 h-5 text-spectral-cyan" />
                    <h3 className="font-display text-lg text-white">Recent Activity</h3>
                  </div>

                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <PulseOrb color="spectral-cyan" size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-ghost-300 truncate">
                              {activity.description || 'Activity recorded'}
                            </p>
                            <p className="text-xs text-ghost-500 mt-1">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-void-elevated flex items-center justify-center">
                        <Clock className="w-5 h-5 text-ghost-500" />
                      </div>
                      <p className="text-sm text-ghost-500">No recent activity yet</p>
                    </div>
                  )}
                </HolographicCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
