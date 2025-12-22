'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import EtherealNav from '@/components/void/EtherealNav';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import DimensionalCard from '@/components/void/DimensionalCard';
import SpectralButton from '@/components/void/SpectralButton';
import TemporalReveal, { StaggerContainer, StaggerItem } from '@/components/void/TemporalReveal';
import ParticleField, { AnimatedCounter } from '@/components/void/ParticleField';
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
} from 'lucide-react';

// Lazy load services
const createServiceLoader = () => {
  let userProgressService: any = null;
  let userActivityService: any = null;
  let servicesPromise: Promise<{ userProgressService: any; userActivityService: any }> | null = null;

  return async () => {
    if (userProgressService && userActivityService) {
      return { userProgressService, userActivityService };
    }

    if (servicesPromise) {
      return servicesPromise;
    }

    servicesPromise = (async () => {
      try {
        const progressModule = await import('@/services/userProgressService');
        userProgressService = progressModule.userProgressService;
        await new Promise(resolve => setTimeout(resolve, 0));
        const activityModule = await import('@/services/userActivityService');
        userActivityService = activityModule.userActivityService;
        return { userProgressService, userActivityService };
      } catch (error) {
        servicesPromise = null;
        throw error;
      }
    })();

    return servicesPromise;
  };
};

const getServices = createServiceLoader();

/**
 * DASHBOARD INTERACTIVE
 * Your personal command center in the void.
 * Where stories converge and adventures begin.
 */
export default function DashboardInteractive() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    storiesRead: 0,
    choicesMade: 0,
    readingStreak: 0,
    totalReadingTime: 0,
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { userProgressService, userActivityService } = await getServices();

      const [progressData, activityData] = await Promise.all([
        userProgressService.getUserReadingList(user.id),
        userActivityService.getRecentActivity(user.id, 5),
      ]);

      setContinueReading(progressData?.filter((p: any) => p.progress_percentage < 100).slice(0, 3) || []);
      setRecentActivity(activityData || []);

      // Mock stats - replace with real data
      setStats({
        storiesRead: 12,
        choicesMade: 156,
        readingStreak: 7,
        totalReadingTime: 24,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-membrane animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-spectral-cyan animate-spin" />
          </div>
          <p className="text-sm font-ui tracking-widest uppercase text-text-ghost">
            Loading Dashboard
          </p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Library, label: 'Library', href: '/story-library', color: 'spectral-cyan' },
    { icon: PenTool, label: 'Create', href: '/story-creation-studio', color: 'spectral-violet' },
    { icon: Compass, label: 'Discover', href: '/community-hub', color: 'plasma-orange' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-tertiary' },
  ];

  return (
    <VoidBackground variant="default">
      <ParticleField particleCount={35} color="rgba(123, 44, 191, 0.25)" />
      <AmbientOrbs />
      <EtherealNav />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-void">
          {/* Welcome Header */}
          <TemporalReveal className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-ui tracking-widest uppercase text-spectral-cyan mb-2"
                >
                  Welcome back
                </motion.p>
                <h1 className="font-display text-4xl md:text-5xl tracking-wide text-text-primary">
                  {profile?.display_name || 'Traveler'}
                </h1>
                <p className="mt-2 font-prose text-text-tertiary">
                  Your stories await. Where will you journey today?
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => router.push(action.href)}
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      bg-void-elevated border border-membrane
                      hover:border-${action.color}/30 hover:bg-void-mist
                      transition-all duration-300 group
                    `}
                    title={action.label}
                  >
                    <action.icon className={`w-5 h-5 text-text-tertiary group-hover:text-${action.color} transition-colors`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </TemporalReveal>
          
          {/* Stats Grid */}
          <TemporalReveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: BookOpen, value: stats.storiesRead, label: 'Stories Read', color: 'spectral-cyan', isNumeric: true },
                { icon: Zap, value: stats.choicesMade, label: 'Choices Made', color: 'spectral-violet', isNumeric: true },
                { icon: Flame, value: stats.readingStreak, label: 'Reading Streak', color: 'plasma-orange', suffix: ' days' },
                { icon: Clock, value: stats.totalReadingTime, label: 'Time Reading', color: 'spectral-emerald', suffix: 'h' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <DimensionalCard
                    className="p-5 relative overflow-hidden group"
                    enableTilt={false}
                  >
                    {/* Background glow on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ 
                        background: `radial-gradient(circle at 50% 0%, var(--${stat.color}) 0%, transparent 70%)`,
                        opacity: 0.05,
                      }}
                    />
                    
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center relative"
                        style={{ background: `var(--${stat.color})10` }}
                      >
                        <stat.icon className="w-5 h-5" style={{ color: `var(--${stat.color})` }} />
                      </div>
                      
                      {/* Trend indicator */}
                      <div className="flex items-center gap-1 text-spectral-emerald text-xs">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12%</span>
                      </div>
                    </div>
                    <div className="font-display text-2xl text-text-primary mb-1">
                      {stat.isNumeric ? (
                        <AnimatedCounter end={stat.value as number} duration={2} suffix={stat.suffix || ''} />
                      ) : (
                        <>{stat.value}{stat.suffix}</>
                      )}
                    </div>
                    <div className="text-xs font-ui tracking-wide uppercase text-text-ghost">
                      {stat.label}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3 h-1 bg-void-mist rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stat.value as number) * 5)}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `var(--${stat.color})` }}
                      />
                    </div>
                  </DimensionalCard>
                </motion.div>
              ))}
            </div>
          </TemporalReveal>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Continue Reading */}
            <div className="lg:col-span-2 space-y-8">
              {/* Continue Reading Section */}
              <TemporalReveal delay={0.2}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl tracking-wide text-text-primary flex items-center gap-3">
                    <Play className="w-5 h-5 text-spectral-cyan" />
                    Continue Reading
                  </h2>
                  <button 
                    onClick={() => router.push('/story-library')}
                    className="text-xs font-ui tracking-wide uppercase text-text-ghost hover:text-spectral-cyan transition-colors flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {continueReading.length > 0 ? (
                  <div className="space-y-4">
                    {continueReading.map((item, index) => (
                      <DimensionalCard
                        key={item.id || index}
                        onClick={() => router.push(`/story-reader?storyId=${item.story_id}`)}
                        className="p-6"
                      >
                        <div className="flex items-start gap-4">
                          {/* Cover placeholder */}
                          <div className="w-16 h-20 rounded-lg bg-void-mist flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 text-text-ghost" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg text-text-primary truncate mb-1">
                              {item.story?.title || 'Untitled Story'}
                            </h3>
                            <p className="text-sm text-text-tertiary mb-3">
                              Chapter {item.current_chapter_number || 1}
                            </p>
                            
                            {/* Progress bar */}
                            <div className="relative h-1.5 bg-void-mist rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress_percentage || 0}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                  background: 'linear-gradient(90deg, var(--spectral-cyan), var(--spectral-violet))',
                                }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-text-ghost">
                              {item.progress_percentage || 0}% complete
                            </p>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-text-ghost shrink-0" />
                        </div>
                      </DimensionalCard>
                    ))}
                  </div>
                ) : (
                  <DimensionalCard className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void-mist flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-text-ghost" />
                    </div>
                    <h3 className="font-display text-lg text-text-primary mb-2">
                      No stories in progress
                    </h3>
                    <p className="text-sm text-text-tertiary mb-6">
                      Start your first adventure and it will appear here.
                    </p>
                    <SpectralButton href="/story-library" icon={<Compass className="w-4 h-4" />}>
                      Explore Library
                    </SpectralButton>
                  </DimensionalCard>
                )}
              </TemporalReveal>
              
              {/* Recommended Stories */}
              <TemporalReveal delay={0.3}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl tracking-wide text-text-primary flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-spectral-violet" />
                    Recommended For You
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'The Last Algorithm', genre: 'Sci-Fi', reads: '12.4K' },
                    { title: 'Whispers of the Void', genre: 'Fantasy', reads: '8.7K' },
                  ].map((story, index) => (
                    <DimensionalCard
                      key={index}
                      onClick={() => router.push('/story-library')}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-spectral-violet/20 to-spectral-cyan/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-spectral-violet" />
                        </div>
                        <div className="flex-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-ui tracking-wide uppercase bg-spectral-cyan/10 text-spectral-cyan mb-2">
                            {story.genre}
                          </span>
                          <h3 className="font-display text-text-primary mb-1">
                            {story.title}
                          </h3>
                          <p className="text-xs text-text-ghost">
                            {story.reads} readers
                          </p>
                        </div>
                      </div>
                    </DimensionalCard>
                  ))}
                </div>
              </TemporalReveal>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Daily Progress */}
              <TemporalReveal delay={0.25}>
                <DimensionalCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-5 h-5 text-spectral-amber" />
                    <h3 className="font-display text-lg text-text-primary">Daily Goal</h3>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          strokeWidth="6"
                          fill="none"
                          className="stroke-void-mist"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          className="stroke-spectral-amber"
                          initial={{ strokeDasharray: '0 251.2' }}
                          animate={{ strokeDasharray: `${(profile?.daily_choices_used || 0) / (profile?.daily_choice_limit || 10) * 251.2} 251.2` }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-2xl text-text-primary">
                          {profile?.daily_choices_used || 0}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-text-tertiary">
                      of {profile?.daily_choice_limit || 10} choices used
                    </p>
                  </div>
                  
                  {(profile?.daily_choices_used || 0) >= (profile?.daily_choice_limit || 10) && (
                    <SpectralButton variant="plasma" fullWidth href="/pricing">
                      Upgrade for Unlimited
                    </SpectralButton>
                  )}
                </DimensionalCard>
              </TemporalReveal>
              
              {/* Achievements Preview */}
              <TemporalReveal delay={0.35}>
                <DimensionalCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-spectral-violet" />
                      <h3 className="font-display text-lg text-text-primary">Achievements</h3>
                    </div>
                    <span className="text-xs font-ui text-text-ghost">3/12</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {[
                      { icon: '📖', title: 'First Story' },
                      { icon: '⚡', title: '10 Choices' },
                      { icon: '🔥', title: '7 Day Streak' },
                    ].map((achievement, index) => (
                      <div
                        key={index}
                        className="flex-1 aspect-square rounded-lg bg-void-mist flex items-center justify-center text-2xl"
                        title={achievement.title}
                      >
                        {achievement.icon}
                      </div>
                    ))}
                    <div className="flex-1 aspect-square rounded-lg bg-void-mist border border-dashed border-membrane flex items-center justify-center">
                      <span className="text-text-ghost text-lg">+9</span>
                    </div>
                  </div>
                </DimensionalCard>
              </TemporalReveal>
              
              {/* Recent Activity */}
              <TemporalReveal delay={0.4}>
                <DimensionalCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-spectral-emerald" />
                    <h3 className="font-display text-lg text-text-primary">Recent Activity</h3>
                  </div>
                  
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-spectral-cyan shrink-0" />
                          <div>
                            <p className="text-sm text-text-secondary">
                              {activity.description || 'Activity recorded'}
                            </p>
                            <p className="text-xs text-text-ghost mt-1">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-ghost text-center py-4">
                      No recent activity yet
                    </p>
                  )}
                </DimensionalCard>
              </TemporalReveal>
            </div>
          </div>
        </div>
      </main>
    </VoidBackground>
  );
}
