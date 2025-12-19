'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
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

// Lazy load services to avoid circular dependencies
let userProgressService: any = null;
let userActivityService: any = null;

const getServices = async () => {
  if (!userProgressService) {
    const progressModule = await import('@/services/userProgressService');
    userProgressService = progressModule.userProgressService;
  }
  if (!userActivityService) {
    const activityModule = await import('@/services/userActivityService');
    userActivityService = activityModule.userActivityService;
  }
  return { userProgressService, userActivityService };
};

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
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Maximum timeout to prevent infinite loading - always render after 10 seconds
    const maxTimeout = setTimeout(() => {
      if (loading && !dataLoaded) {
        console.warn('Dashboard loading timeout - rendering anyway');
        setLoading(false);
        setDataLoaded(true);
      }
    }, 10000); // 10 second max - faster timeout

    // Wait for auth to initialize
    if (authLoading) {
      return () => clearTimeout(maxTimeout);
    }

    // Auth finished loading
    if (!user) {
      // No user, redirect to login
      router.push('/authentication');
      return () => clearTimeout(maxTimeout);
    }

    // User exists, load dashboard data (only once)
    if (user && !dataLoaded) {
      loadDashboardData();
    }

    return () => clearTimeout(maxTimeout);
  }, [user, authLoading, router, dataLoaded, loadDashboardData]);

  const loadDashboardData = useCallback(async () => {
    if (!user || dataLoaded) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get services with lazy loading
      const services = await getServices();
      
      // Load data with better error handling
      const [progressResult, activitiesResult, badgesResult] = await Promise.allSettled([
        services.userProgressService.getAllUserProgress(user.id).catch((err: any) => {
          console.warn('Failed to load progress:', err);
          return [];
        }),
        services.userActivityService.getUserActivities(user.id, 10).catch((err: any) => {
          console.warn('Failed to load activities:', err);
          return [];
        }),
        services.userProgressService.getUserBadges(user.id).catch((err: any) => {
          console.warn('Failed to load badges:', err);
          return [];
        }),
      ]);

      const progressData = progressResult.status === 'fulfilled' ? progressResult.value : [];
      const activitiesData = activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];
      const badgesData = badgesResult.status === 'fulfilled' ? badgesResult.value : [];

      setContinueReading(Array.isArray(progressData) ? progressData.filter((p: any) => !p?.is_completed) : []);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setBadges(Array.isArray(badgesData) ? badgesData : []);
      setError('');
      setDataLoaded(true);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError('Some data failed to load, but you can still use the dashboard.');
      // Set empty arrays so dashboard still renders
      setContinueReading([]);
      setActivities([]);
      setBadges([]);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [user, dataLoaded]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/authentication');
    } catch (err: any) {
      setError('Failed to sign out. Please try again.');
    }
  };

  // Redirect effect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    }
  }, [authLoading, user, router]);

  // Show loading while auth is initializing
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // If no user after auth loads, show redirect message
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // If we have a user, show dashboard (even if still loading)
  // The 15-second timeout ensures we always render eventually
  // Show loading indicator if still loading, but render the dashboard structure

  // Safety check - ensure we have valid data structures
  const safeContinueReading = Array.isArray(continueReading) ? continueReading : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeBadges = Array.isArray(badges) ? badges : [];

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
        {loading && !dataLoaded && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Loading your dashboard data...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                achievements: safeBadges.map((badge: any) => ({
                  id: badge?.id || '',
                  name: badge?.badge_name || 'Unknown',
                  icon: badge?.badge_icon || '🏆',
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
            {safeContinueReading.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {safeContinueReading.map((progress: any) => (
                  <motion.div key={progress?.id || Math.random()} variants={slideUp}>
                    <ContinueReadingWidget
                      progress={progress}
                      onClick={() => router.push(`/story-reader?storyId=${progress?.story_id || ''}`)}
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
            {safeActivities.length > 0 ? (
              <div className="bg-card/50 backdrop-blur-lg border border-border rounded-xl shadow-lg p-6 space-y-4">
                {safeActivities.map((activity: any) => (
                  <ActivityFeedItem key={activity?.id || Math.random()} activity={activity} />
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
