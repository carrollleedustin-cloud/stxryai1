'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { userProgressService } from '@/services/userProgressService';
import { userActivityService } from '@/services/userActivityService';
import ContinueReadingWidget from './ContinueReadingWidget';
import ReadingStatsPanel from './ReadingStatsPanel';
import ActivityFeedItem from './ActivityFeedItem';
import DailyChoiceLimitWidget from './DailyChoiceLimitWidget';
import ThemeToggle from '@/components/common/ThemeToggle';
import { staggerContainer, slideUp } from '@/lib/animations/variants';
import NotificationBell from '@/components/ui/NotificationBell';
import UserMenu from '@/components/ui/UserMenu';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { BookOpen, Compass, MessageSquare } from 'lucide-react';

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-pulse">
    <header className="bg-card/50 backdrop-blur-lg shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

const EmptyState = ({
  icon,
  title,
  message,
  buttonText,
  onButtonClick,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}) => (
  <div className="text-center p-8 bg-card/50 backdrop-blur-lg border-2 border-dashed border-border rounded-xl">
    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onButtonClick}
      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
    >
      {buttonText}
    </motion.button>
  </div>
);

export default function DashboardInteractive() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) {
      // Still loading auth, wait
      return;
    }

    // Auth finished loading
    if (!user) {
      // No user, redirect to login
      router.push('/authentication');
      return;
    }

    // User exists, load dashboard data
    if (user && !loading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Load data with timeout
      const loadPromise = Promise.all([
        userProgressService.getAllUserProgress(user.id).catch(() => []),
        userActivityService.getUserActivities(user.id, 10).catch(() => []),
        userProgressService.getUserBadges(user.id).catch(() => []),
      ]);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const [progressData, activitiesData, badgesData] = await Promise.race([
        loadPromise,
        timeoutPromise,
      ]) as [any[], any[], any[]];

      setContinueReading(progressData?.filter((p: any) => !p.is_completed) || []);
      setActivities(activitiesData || []);
      setBadges(badgesData || []);
      setError('');
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('timeout')) {
        setError(
          'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.'
        );
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      // Set empty arrays so dashboard still renders
      setContinueReading([]);
      setActivities([]);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/authentication');
    } catch (err: any) {
      setError('Failed to sign out. Please try again.');
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // If no user after auth loads, redirect to login
  if (!user && !authLoading) {
    router.push('/authentication');
    return <DashboardSkeleton />;
  }

  // Show loading while fetching dashboard data
  if (loading && user) {
    return <DashboardSkeleton />;
  }

  // If user exists but no profile yet, still show dashboard (profile might be loading)
  // Don't block the entire dashboard for missing profile

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-lg shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.display_name || user?.display_name || user?.email || 'Reader'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile?.tier === 'premium' ? '⭐ Premium Member' : '📚 Free Member'}
              </p>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/story-library')}
                className="hidden sm:flex px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Compass className="w-5 h-5 mr-2" />
                Browse Stories
              </motion.button>
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Daily Choice Limit */}
          {(profile || user) && (
            <DailyChoiceLimitWidget
              isPremium={profile?.tier === 'premium'}
              choicesUsed={profile?.daily_choices_used || 0}
              choicesLimit={profile?.daily_choice_limit || 10}
              resetTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
            />
          )}

          {/* Reading Stats */}
          {(profile || user) && (
            <ReadingStatsPanel
              stats={{
                storiesCompleted: profile?.stories_completed || 0,
                choicesMade: profile?.choices_made || 0,
                readingStreak: 0,
                totalReadingTime: profile?.total_reading_time || 0,
                achievements: badges.map((badge: any) => ({
                  id: badge.id,
                  name: badge.badge_name,
                  icon: badge.badge_icon,
                  progress: 100,
                  total: 100,
                  unlocked: true,
                })),
              }}
            />
          )}

          {/* Continue Reading */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Continue Reading</h2>
            {continueReading.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {continueReading.map((progress: any) => (
                  <motion.div key={progress.id} variants={slideUp}>
                    <ContinueReadingWidget
                      progress={progress}
                      onClick={() => router.push(`/story-reader?storyId=${progress.story_id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                icon={<BookOpen size={32} />}
                title="Your Adventure Awaits"
                message="You haven't started any stories yet. Dive into the library and begin a new journey!"
                buttonText="Explore Stories"
                onButtonClick={() => router.push('/story-library')}
              />
            )}
          </motion.div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
            {activities.length > 0 ? (
              <div className="bg-card/50 backdrop-blur-lg border border-border rounded-xl shadow-lg p-6 space-y-4">
                {activities.map((activity: any) => (
                  <ActivityFeedItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquare size={32} />}
                title="A Quiet Beginning"
                message="Your activity feed is empty. As you read, make choices, and interact with the community, your epic saga will be written here."
                buttonText="Find a Story to Start"
                onButtonClick={() => router.push('/story-library')}
              />
            )}
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
