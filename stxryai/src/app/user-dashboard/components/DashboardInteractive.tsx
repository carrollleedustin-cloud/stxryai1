'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userProgressService } from '@/services/userProgressService';
import { userActivityService } from '@/services/userActivityService';
import ContinueReadingWidget from './ContinueReadingWidget';

import ReadingStatsPanel from './ReadingStatsPanel';
import ActivityFeedItem from './ActivityFeedItem';
import DailyChoiceLimitWidget from './DailyChoiceLimitWidget';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.display_name || 'Reader'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {profile?.subscription_tier === 'premium' ? '⭐ Premium Member' : '📚 Free Member'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/story-library')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Stories
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {continueReading.map((progress: any) => (
                <ContinueReadingWidget
                  key={progress.id}
                  progress={progress}
                  onClick={() => router.push(`/story-reader?storyId=${progress.story_id}`)}
                />
              ))}
            </div>
          </div>
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