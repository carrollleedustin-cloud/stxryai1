'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import {
  getPlatformMetrics,
  getUserAnalytics,
  getStoryAnalytics,
  updateStoryStatus,
  updateUserSubscription,
  getRecentActivities,
  type PlatformMetrics
} from '@/services/adminService';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'analytics'>('overview');
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<any[]>([]);
  const [storyAnalytics, setStoryAnalytics] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, usersData, storiesData, activitiesData] = await Promise.all([
        getPlatformMetrics(),
        getUserAnalytics(10),
        getStoryAnalytics(10),
        getRecentActivities(20)
      ]);

      setMetrics(metricsData);
      setUserAnalytics(usersData || []);
      setStoryAnalytics(storiesData || []);
      setRecentActivities(activitiesData || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryStatusChange = async (storyId: string, newStatus: 'draft' | 'published' | 'archived') => {
    const result = await updateStoryStatus(storyId, newStatus);
    if (result.success) {
      loadDashboardData();
    } else {
      setError('Failed to update story status');
    }
  };

  const handleUserSubscriptionChange = async (userId: string, newTier: 'free' | 'premium' | 'vip') => {
    const result = await updateUserSubscription(userId, newTier);
    if (result.success) {
      loadDashboardData();
    } else {
      setError('Failed to update user subscription');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform management and analytics</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'User Management' },
              { id: 'content', label: 'Content Moderation' },
              { id: 'analytics', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeUsers?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2">+12% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Stories</h3>
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalStories?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2">+8% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Avg Engagement</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metrics?.avgEngagementRate || 0}</p>
                <p className="text-sm text-green-600 mt-2">+15% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Premium Users</h3>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metrics?.premiumConversions?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2">+23% from last month</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.slice(0, 10).map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{activity.activity_type === 'story_completed' ? '✅' : '📖'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user_profiles?.display_name || 'User'}</span>
                          {' '}
                          {activity.activity_type === 'story_completed' ? 'completed a story' : 'started reading'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage user accounts and subscriptions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stories Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userAnalytics.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscription_tier === 'vip' ? 'bg-purple-100 text-purple-800' :
                          user.subscription_tier === 'premium'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.stories_completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(user.total_reading_time / 60)} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.subscription_tier}
                          onChange={(e) => handleUserSubscriptionChange(user.id, e.target.value as any)}
                          className="text-blue-600 hover:text-blue-900 border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Content Moderation</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and moderate platform content</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Story</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Play Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {storyAnalytics.map((story: any) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{story.title}</div>
                        <div className="text-sm text-gray-500">ID: {story.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {story.genre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          story.status === 'published' ? 'bg-green-100 text-green-800' :
                          story.status === 'draft'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {story.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {story.play_count?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ⭐ {Number(story.rating).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={story.status}
                          onChange={(e) => handleStoryStatusChange(story.id, e.target.value as any)}
                          className="text-blue-600 hover:text-blue-900 border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Stories */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Top Performing Stories</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {storyAnalytics.slice(0, 5).map((story: any, index: number) => (
                      <div key={story.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{story.title}</p>
                            <p className="text-xs text-gray-500">{story.play_count} plays</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">⭐ {Number(story.rating).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Users by Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Most Active Users</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {userAnalytics.slice(0, 5).map((user: any, index: number) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
                            <p className="text-xs text-gray-500">{user.stories_completed} stories completed</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          user.subscription_tier === 'vip' ? 'bg-purple-100 text-purple-800' :
                          user.subscription_tier === 'premium'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Growth Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth Overview</h2>
              <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  📊 Analytics visualization coming soon
                  <br />
                  <span className="text-sm">Integrate with charting library for detailed metrics</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}