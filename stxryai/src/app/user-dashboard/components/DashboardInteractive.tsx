'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
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

// Lazy load services to avoid circular dependencies and initialization issues
// Using a factory function pattern to avoid module-level state issues
const createServiceLoader = () => {
  let userProgressService: any = null;
  let userActivityService: any = null;
  let servicesPromise: Promise<{ userProgressService: any; userActivityService: any }> | null = null;

  return async (): Promise<{ userProgressService: any; userActivityService: any }> => {
    // If already loaded, return immediately
    if (userProgressService && userActivityService) {
      return { userProgressService, userActivityService };
    }

    // If already loading, wait for existing promise
    if (servicesPromise) {
      return servicesPromise;
    }

    // Start loading - use a function to avoid hoisting issues
    servicesPromise = (async () => {
      try {
        // Load services sequentially to avoid initialization race conditions
        // This ensures each service is fully initialized before the next one loads
        const progressModule = await import('@/services/userProgressService');
        if (!progressModule?.userProgressService) {
          throw new Error('userProgressService not found in module');
        }
        userProgressService = progressModule.userProgressService;

        // Small delay to ensure first service is fully initialized
        await new Promise(resolve => setTimeout(resolve, 0));

        const activityModule = await import('@/services/userActivityService');
        if (!activityModule?.userActivityService) {
          throw new Error('userActivityService not found in module');
        }
        userActivityService = activityModule.userActivityService;

        return { userProgressService, userActivityService };
      } catch (error) {
        console.error('Error loading services:', error);
        // Reset on error so we can retry
        servicesPromise = null;
        userProgressService = null;
        userActivityService = null;
        throw error;
      }
    })();

    return servicesPromise;
  };
};

// Create the loader function
const getServices = createServiceLoader();

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
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
  const redirectAttemptedRef = useRef(false);

  // Define loadDashboardData BEFORE useEffect that uses it
  const loadDashboardData = useCallback(async () => {
    if (!user || dataLoaded) {
      return;
    }

    // Add a timeout wrapper to prevent infinite hanging
    const loadWithTimeout = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get services with lazy loading
        const services = await getServices();
        
        // Load data with better error handling and individual timeouts
        // Each service call has its own timeout, and we wrap the whole thing in a timeout too
        const loadPromise = Promise.allSettled([
          services.userProgressService.getAllUserProgress(user.id).catch((err: any) => {
            console.warn('Failed to load progress:', err);
            // Check if it's a connection error
            if (err?.message?.includes('Cannot connect to database') || err?.message?.includes('timed out')) {
              throw err; // Re-throw connection errors so we can show them
            }
            return [];
          }),
          services.userActivityService.getUserActivities(user.id, 10).catch((err: any) => {
            console.warn('Failed to load activities:', err);
            if (err?.message?.includes('Cannot connect to database') || err?.message?.includes('timed out')) {
              throw err;
            }
            return [];
          }),
          services.userProgressService.getUserBadges(user.id).catch((err: any) => {
            console.warn('Failed to load badges:', err);
            if (err?.message?.includes('Cannot connect to database') || err?.message?.includes('timed out')) {
              throw err;
            }
            return [];
          }),
        ]);

        // Add overall timeout of 10 seconds using Promise.race
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Dashboard loading timed out. Please check your connection.'));
          }, 10000);
        });

        const results = await Promise.race([
          loadPromise,
          timeoutPromise,
        ]);

        // If we got here, loadPromise completed (timeout would have thrown)
        const [progressResult, activitiesResult, badgesResult] = results as PromiseSettledResult<any>[];

        const progressData = progressResult?.status === 'fulfilled' ? progressResult.value : [];
        const activitiesData = activitiesResult?.status === 'fulfilled' ? activitiesResult.value : [];
        const badgesData = badgesResult?.status === 'fulfilled' ? badgesResult.value : [];

        setContinueReading(Array.isArray(progressData) ? progressData.filter((p: any) => !p?.is_completed) : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setBadges(Array.isArray(badgesData) ? badgesData : []);
        setError('');
        setDataLoaded(true);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        // Check if it's a connection error
        if (err?.message?.includes('Cannot connect to database') || err?.message?.includes('Supabase project')) {
          setError(err.message || 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        } else if (err?.message?.includes('timed out')) {
          setError('Request timed out. Please check your internet connection and try again.');
        } else {
          setError('Some data failed to load, but you can still use the dashboard.');
        }
        // Set empty arrays so dashboard still renders
        setContinueReading([]);
        setActivities([]);
        setBadges([]);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    await loadWithTimeout();
  }, [user, dataLoaded]);

  useEffect(() => {
    // Maximum timeout to prevent infinite loading - always render after 10 seconds
    const maxTimeout = setTimeout(() => {
      if (loading && !dataLoaded) {
        console.warn('Dashboard loading timeout - rendering anyway');
        setLoading(false);
        setDataLoaded(true);
      }
    }, 10000); // 10 second max - faster timeout

    // Wait for auth to initialize - don't do anything while auth is loading
    if (authLoading) {
      return () => clearTimeout(maxTimeout);
    }

    // If user exists, load dashboard data immediately (no delay needed)
    if (user && !dataLoaded) {
      loadDashboardData();
      // Reset redirect flag since we have a user
      redirectAttemptedRef.current = false;
      return () => clearTimeout(maxTimeout);
    }

    // Only attempt redirect once, and only if auth has finished loading
    // Don't redirect if we're currently loading data (user might be loading)
    // Simplified redirect logic - let middleware handle it primarily
    if (!user && !authLoading && !redirectAttemptedRef.current && !loading) {
      redirectAttemptedRef.current = true;
      // Use router.push instead of window.location to work better with middleware
      router.push('/authentication');
    }

    return () => clearTimeout(maxTimeout);
  }, [user, authLoading, router, dataLoaded, loadDashboardData]);

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

  // If no user after auth loads, middleware should have redirected
  // But if we're here, just show skeleton to prevent flash
  if (!user && !authLoading) {
    return <DashboardSkeleton />;
  }

  // If we have a user, show dashboard (even if still loading)
  // The 15-second timeout ensures we always render eventually
  // Show loading indicator if still loading, but render the dashboard structure

  // Safety check - ensure we have valid data structures
  const safeContinueReading = Array.isArray(continueReading) ? continueReading : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeBadges = Array.isArray(badges) ? badges : [];

  return (
    <div className="min-h-screen bg-background">
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
                className="hidden sm:flex items-center btn-primary px-4 py-2"
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
          <div className="mb-6 p-4 rounded-2xl border border-secondary/25 bg-secondary/10">
            <p className="text-sm text-secondary">Loading your dashboard data…</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-error/25 bg-error/10">
            <p className="text-sm text-error">{error}</p>
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
