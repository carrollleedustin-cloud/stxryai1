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
import { DashboardWidgetSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, slideUp } from '@/lib/animations/variants';

export default function DashboardInteractive() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [progressData, activitiesData, badgesData] = await Promise.all([
        userProgressService.getAllUserProgress(user.id),
        userActivityService.getUserActivities(user.id, 10),
        userProgressService.getUserBadges(user.id),
      ]);

      setContinueReading(progressData?.filter((p: any) => !p.is_completed) || []);
      setActivities(activitiesData || []);
      setBadges(badgesData || []);
      setError('');
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <DashboardWidgetSkeleton />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.display_name || 'Reader'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile?.subscription_tier === 'premium' ? '⭐ Premium Member' : '📚 Free Member'}
              </p>
            </motion.div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/story-library')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Stories
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Daily Choice Limit */}
        {profile && (
          <DailyChoiceLimitWidget
            isPremium={profile.subscription_tier === 'premium'}
            choicesUsed={profile.daily_choices_used}
            choicesLimit={profile.daily_choice_limit}
            resetTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
          />
        )}

        {/* Reading Stats */}
        {profile && (
          <ReadingStatsPanel
            stats={{
              storiesCompleted: profile.stories_completed,
              choicesMade: profile.choices_made,
              readingStreak: 0,
              totalReadingTime: profile.total_reading_time,
              achievements: badges.map((badge: any) => ({
                id: badge.id,
                name: badge.badge_name,
                icon: badge.badge_icon,
                progress: 100,
                total: 100,
                unlocked: true
              }))
            }}
          />
        )}

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Continue Reading</h2>
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
          </motion.div>
        )}

        {/* Activity Feed */}
        {activities.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <ActivityFeedItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}