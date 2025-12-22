'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder, NeonText } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { getPlatformMetrics, getUserAnalytics, getStoryAnalytics, getRecentActivities, PlatformMetrics, updateStoryStatus, updateUserSubscription } from '@/services/adminService';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const MOCK_METRICS: PlatformMetrics = {
  activeUsers: 15847,
  totalStories: 2456,
  avgEngagementRate: 78,
  premiumConversions: 1247,
};

const MOCK_USERS = [
  { id: '1', username: 'darkstoryteller', display_name: 'Alexandra Chen', subscription_tier: 'premium', stories_completed: 47, total_reading_time: 12540, created_at: '2024-03-15' },
  { id: '2', username: 'scifiexplorer', display_name: 'Marcus Rodriguez', subscription_tier: 'vip', stories_completed: 89, total_reading_time: 25680, created_at: '2024-01-20' },
  { id: '3', username: 'mysteryreader', display_name: 'Emily Watson', subscription_tier: 'free', stories_completed: 23, total_reading_time: 5420, created_at: '2024-06-10' },
  { id: '4', username: 'fantasyfan', display_name: 'David Kim', subscription_tier: 'premium', stories_completed: 56, total_reading_time: 18920, created_at: '2024-02-28' },
  { id: '5', username: 'horrorfanatic', display_name: 'Sarah Johnson', subscription_tier: 'free', stories_completed: 12, total_reading_time: 3200, created_at: '2024-08-05' },
];

const MOCK_STORIES = [
  { id: '1', title: 'The Midnight Carnival', user_id: '1', play_count: 15420, completion_count: 8956, rating: 4.8, status: 'published', created_at: '2024-06-15' },
  { id: '2', title: 'Echoes of Tomorrow', user_id: '2', play_count: 12850, completion_count: 7230, rating: 4.6, status: 'published', created_at: '2024-05-20' },
  { id: '3', title: 'The Last Kingdom', user_id: '1', play_count: 9870, completion_count: 5640, rating: 4.9, status: 'published', created_at: '2024-04-10' },
  { id: '4', title: 'Whispers in the Dark', user_id: '4', play_count: 7650, completion_count: 4120, rating: 4.4, status: 'published', created_at: '2024-07-25' },
  { id: '5', title: 'Digital Dreams', user_id: '2', play_count: 6420, completion_count: 3560, rating: 4.7, status: 'draft', created_at: '2024-08-01' },
];

const MOCK_ACTIVITIES = [
  { id: '1', activity_type: 'story_published', activity_data: { story_title: 'The Final Frontier' }, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), users: { username: 'cosmicwriter', display_name: 'Nova Star' } },
  { id: '2', activity_type: 'user_signup', activity_data: {}, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), users: { username: 'newreader42', display_name: 'New Reader' } },
  { id: '3', activity_type: 'premium_upgrade', activity_data: { tier: 'premium' }, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), users: { username: 'bookworm', display_name: 'Lisa Anderson' } },
  { id: '4', activity_type: 'story_completed', activity_data: { story_title: 'Mystery Manor' }, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), users: { username: 'detective99', display_name: 'Sam Holmes' } },
  { id: '5', activity_type: 'achievement_unlocked', activity_data: { achievement: 'Story Master' }, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), users: { username: 'champion', display_name: 'Victory Lane' } },
];

const MOCK_REPORTS = [
  { id: '1', type: 'content', title: 'Inappropriate content in story', reporter: 'user123', status: 'pending', created_at: '2024-12-20' },
  { id: '2', type: 'user', title: 'Harassment in comments', reporter: 'reader456', status: 'investigating', created_at: '2024-12-19' },
  { id: '3', type: 'bug', title: 'Story progress not saving', reporter: 'techie789', status: 'resolved', created_at: '2024-12-18' },
];

type AdminTab = 'overview' | 'users' | 'stories' | 'reports' | 'settings';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [metrics, setMetrics] = useState<PlatformMetrics>(MOCK_METRICS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [stories, setStories] = useState(MOCK_STORIES);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, usersData, storiesData, activitiesData] = await Promise.all([
          getPlatformMetrics(),
          getUserAnalytics(10),
          getStoryAnalytics(10),
          getRecentActivities(20),
        ]);
        if (metricsData) setMetrics(metricsData);
        if (usersData && usersData.length > 0) setUsers(usersData);
        if (storiesData && storiesData.length > 0) setStories(storiesData);
        if (activitiesData && activitiesData.length > 0) setActivities(activitiesData as any);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'ChartBarIcon' },
    { id: 'users' as const, label: 'Users', icon: 'UsersIcon' },
    { id: 'stories' as const, label: 'Stories', icon: 'BookOpenIcon' },
    { id: 'reports' as const, label: 'Reports', icon: 'FlagIcon' },
    { id: 'settings' as const, label: 'Settings', icon: 'CogIcon' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'story_published': return { icon: 'BookOpenIcon', color: 'text-green-400', bg: 'bg-green-400/20' };
      case 'user_signup': return { icon: 'UserPlusIcon', color: 'text-blue-400', bg: 'bg-blue-400/20' };
      case 'premium_upgrade': return { icon: 'SparklesIcon', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
      case 'story_completed': return { icon: 'CheckCircleIcon', color: 'text-spectral-cyan', bg: 'bg-spectral-cyan/20' };
      case 'achievement_unlocked': return { icon: 'TrophyIcon', color: 'text-purple-400', bg: 'bg-purple-400/20' };
      default: return { icon: 'BellIcon', color: 'text-void-400', bg: 'bg-void-400/20' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'investigating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-void-500/20 text-void-400 border-void-500/30';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30';
      case 'premium': return 'bg-gradient-to-r from-spectral-violet/20 to-spectral-pink/20 text-spectral-violet border-spectral-violet/30';
      default: return 'bg-void-800/50 text-void-400 border-void-700/30';
    }
  };

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <VoidBackground variant="minimal">
      <EtherealNav />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <TemporalHeading level={2} accent className="mb-2">
                  Admin Dashboard
                </TemporalHeading>
                <p className="text-void-400">Monitor platform activity and manage content</p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-400">System Healthy</span>
                </div>
                <SpectralButton variant="primary" size="md">
                  <Icon name="ArrowPathIcon" size={16} className="mr-2" />
                  Refresh
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>

          {/* Tab Navigation */}
          <RevealOnScroll delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-void-900/50 rounded-xl border border-void-800/50">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 text-void-100 border border-spectral-cyan/50' 
                      : 'text-void-400 hover:text-void-200 hover:bg-void-800/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                  {tab.id === 'reports' && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                      {MOCK_REPORTS.filter(r => r.status === 'pending').length}
                    </span>
                  )}
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
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Icon name="UsersIcon" size={24} className="text-void-950" />
                      </div>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Icon name="ArrowUpIcon" size={12} />
                        +12.5%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-void-100 mb-1">
                      <AnimatedCounter end={metrics.activeUsers} />
                    </div>
                    <p className="text-sm text-void-500">Active Users</p>
                  </HolographicCard>

                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon name="BookOpenIcon" size={24} className="text-void-950" />
                      </div>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Icon name="ArrowUpIcon" size={12} />
                        +8.3%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-void-100 mb-1">
                      <AnimatedCounter end={metrics.totalStories} />
                    </div>
                    <p className="text-sm text-void-500">Published Stories</p>
                  </HolographicCard>

                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center">
                        <Icon name="ChartBarIcon" size={24} className="text-void-950" />
                      </div>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Icon name="ArrowUpIcon" size={12} />
                        +5.2%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-void-100 mb-1">
                      <AnimatedCounter end={metrics.avgEngagementRate} suffix="%" />
                    </div>
                    <p className="text-sm text-void-500">Engagement Rate</p>
                  </HolographicCard>

                  <HolographicCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Icon name="CurrencyDollarIcon" size={24} className="text-void-950" />
                      </div>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Icon name="ArrowUpIcon" size={12} />
                        +18.7%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-void-100 mb-1">
                      <AnimatedCounter end={metrics.premiumConversions} />
                    </div>
                    <p className="text-sm text-void-500">Premium Users</p>
                  </HolographicCard>
                </div>

                {/* Activity & Top Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <GradientBorder className="lg:col-span-2">
                    <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-void-100 mb-6 flex items-center gap-2">
                        <Icon name="BellIcon" size={20} className="text-spectral-cyan" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        {activities.slice(0, 8).map((activity: any) => {
                          const { icon, color, bg } = getActivityIcon(activity.activity_type);
                          return (
                            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-void-900/30 border border-void-800/30">
                              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                                <Icon name={icon} size={18} className={color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-void-200">
                                  <span className="font-medium">{activity.users?.display_name}</span>
                                  {activity.activity_type === 'story_published' && ` published "${activity.activity_data?.story_title}"`}
                                  {activity.activity_type === 'user_signup' && ' joined Stxryai'}
                                  {activity.activity_type === 'premium_upgrade' && ` upgraded to ${activity.activity_data?.tier}`}
                                  {activity.activity_type === 'story_completed' && ` completed "${activity.activity_data?.story_title}"`}
                                  {activity.activity_type === 'achievement_unlocked' && ` unlocked "${activity.activity_data?.achievement}"`}
                                </p>
                                <p className="text-xs text-void-500">@{activity.users?.username}</p>
                              </div>
                              <span className="text-xs text-void-500 whitespace-nowrap">
                                {formatTimeAgo(activity.created_at)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GradientBorder>

                  {/* Top Stories */}
                  <GradientBorder>
                    <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-void-100 mb-6 flex items-center gap-2">
                        <Icon name="FireIcon" size={20} className="text-orange-400" />
                        Top Stories
                      </h3>
                      <div className="space-y-4">
                        {stories.slice(0, 5).map((story, index) => (
                          <div key={story.id} className="flex items-center gap-3">
                            <span className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                              ${index === 1 ? 'bg-gray-400/20 text-gray-400' : ''}
                              ${index === 2 ? 'bg-amber-600/20 text-amber-600' : ''}
                              ${index > 2 ? 'bg-void-800/50 text-void-500' : ''}
                            `}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-void-200 truncate">{story.title}</p>
                              <p className="text-xs text-void-500">{story.play_count.toLocaleString()} plays</p>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Icon name="StarIcon" size={14} />
                              <span className="text-sm">{story.rating}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GradientBorder>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <motion.button
                    className="p-4 rounded-xl bg-void-900/50 border border-void-800/50 hover:border-spectral-cyan/50 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon name="UserPlusIcon" size={24} className="text-spectral-cyan mb-3" />
                    <h4 className="font-medium text-void-200">Add User</h4>
                    <p className="text-xs text-void-500">Create new account</p>
                  </motion.button>
                  <motion.button
                    className="p-4 rounded-xl bg-void-900/50 border border-void-800/50 hover:border-spectral-violet/50 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon name="DocumentPlusIcon" size={24} className="text-spectral-violet mb-3" />
                    <h4 className="font-medium text-void-200">Review Content</h4>
                    <p className="text-xs text-void-500">Moderate stories</p>
                  </motion.button>
                  <motion.button
                    className="p-4 rounded-xl bg-void-900/50 border border-void-800/50 hover:border-yellow-500/50 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon name="MegaphoneIcon" size={24} className="text-yellow-400 mb-3" />
                    <h4 className="font-medium text-void-200">Announcements</h4>
                    <p className="text-xs text-void-500">Send notifications</p>
                  </motion.button>
                  <motion.button
                    className="p-4 rounded-xl bg-void-900/50 border border-void-800/50 hover:border-green-500/50 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon name="DocumentArrowDownIcon" size={24} className="text-green-400 mb-3" />
                    <h4 className="font-medium text-void-200">Export Data</h4>
                    <p className="text-xs text-void-500">Download reports</p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    {/* Search & Filters */}
                    <div className="p-6 border-b border-void-800/50">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-void-500" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 bg-void-900/50 border border-void-700/50 rounded-lg text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select className="px-4 py-2 bg-void-900/50 border border-void-700/50 rounded-lg text-void-200 focus:outline-none">
                            <option value="">All Tiers</option>
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
                          </select>
                          <SpectralButton variant="primary" size="md">
                            <Icon name="FunnelIcon" size={16} className="mr-2" />
                            Filter
                          </SpectralButton>
                        </div>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-void-900/30 text-void-400 text-sm">
                            <th className="text-left px-6 py-4 font-medium">User</th>
                            <th className="text-left px-6 py-4 font-medium">Tier</th>
                            <th className="text-left px-6 py-4 font-medium">Stories</th>
                            <th className="text-left px-6 py-4 font-medium">Reading Time</th>
                            <th className="text-left px-6 py-4 font-medium">Joined</th>
                            <th className="text-right px-6 py-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-void-800/30">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-void-900/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-950 font-bold">
                                    {user.display_name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-void-200">{user.display_name}</p>
                                    <p className="text-sm text-void-500">@{user.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(user.subscription_tier)}`}>
                                  {user.subscription_tier.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-void-300">{user.stories_completed}</td>
                              <td className="px-6 py-4 text-void-300">{formatReadingTime(user.total_reading_time)}</td>
                              <td className="px-6 py-4 text-void-500">{user.created_at}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-spectral-cyan/20 text-void-400 hover:text-spectral-cyan transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="EyeIcon" size={16} />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-spectral-violet/20 text-void-400 hover:text-spectral-violet transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="PencilIcon" size={16} />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-red-500/20 text-void-400 hover:text-red-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="TrashIcon" size={16} />
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-void-800/50 flex items-center justify-between">
                      <p className="text-sm text-void-500">Showing 1-5 of 15,847 users</p>
                      <div className="flex items-center gap-2">
                        <SpectralButton variant="ghost" size="sm">Previous</SpectralButton>
                        <SpectralButton variant="ghost" size="sm">Next</SpectralButton>
                      </div>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'stories' && (
              <motion.div
                key="stories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    {/* Search & Filters */}
                    <div className="p-6 border-b border-void-800/50">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-void-500" />
                          <input
                            type="text"
                            placeholder="Search stories..."
                            className="w-full pl-10 pr-4 py-2 bg-void-900/50 border border-void-700/50 rounded-lg text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select className="px-4 py-2 bg-void-900/50 border border-void-700/50 rounded-lg text-void-200 focus:outline-none">
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Stories Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-void-900/30 text-void-400 text-sm">
                            <th className="text-left px-6 py-4 font-medium">Story</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                            <th className="text-left px-6 py-4 font-medium">Plays</th>
                            <th className="text-left px-6 py-4 font-medium">Completions</th>
                            <th className="text-left px-6 py-4 font-medium">Rating</th>
                            <th className="text-left px-6 py-4 font-medium">Created</th>
                            <th className="text-right px-6 py-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-void-800/30">
                          {stories.map((story) => (
                            <tr key={story.id} className="hover:bg-void-900/30 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-medium text-void-200">{story.title}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(story.status)}`}>
                                  {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-void-300">{story.play_count.toLocaleString()}</td>
                              <td className="px-6 py-4 text-void-300">{story.completion_count.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <Icon name="StarIcon" size={14} className="text-yellow-400" />
                                  <span className="text-void-300">{story.rating}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-void-500">{story.created_at}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-spectral-cyan/20 text-void-400 hover:text-spectral-cyan transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="EyeIcon" size={16} />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-yellow-500/20 text-void-400 hover:text-yellow-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="StarIcon" size={16} />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 rounded-lg bg-void-800/50 hover:bg-red-500/20 text-void-400 hover:text-red-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Icon name="ArchiveBoxIcon" size={16} />
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">Content Reports</h3>
                    <div className="space-y-4">
                      {MOCK_REPORTS.map((report) => (
                        <div key={report.id} className="flex items-center gap-4 p-4 rounded-lg bg-void-900/50 border border-void-800/50">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${report.type === 'content' ? 'bg-orange-500/20' : ''}
                            ${report.type === 'user' ? 'bg-red-500/20' : ''}
                            ${report.type === 'bug' ? 'bg-blue-500/20' : ''}
                          `}>
                            <Icon 
                              name={report.type === 'content' ? 'DocumentTextIcon' : report.type === 'user' ? 'UserIcon' : 'BugAntIcon'} 
                              size={20} 
                              className={report.type === 'content' ? 'text-orange-400' : report.type === 'user' ? 'text-red-400' : 'text-blue-400'}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-void-200">{report.title}</p>
                            <p className="text-sm text-void-500">Reported by: {report.reporter} • {report.created_at}</p>
                          </div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                          <div className="flex gap-2">
                            <SpectralButton variant="ghost" size="sm">
                              <Icon name="EyeIcon" size={16} />
                            </SpectralButton>
                            <SpectralButton variant="primary" size="sm">
                              Review
                            </SpectralButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <HolographicCard className="p-6">
                  <h3 className="text-lg font-semibold text-void-100 mb-6 flex items-center gap-2">
                    <Icon name="ShieldCheckIcon" size={20} className="text-spectral-cyan" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">Two-Factor Authentication</p>
                        <p className="text-sm text-void-500">Require 2FA for admin access</p>
                      </div>
                      <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">IP Restrictions</p>
                        <p className="text-sm text-void-500">Limit access to specific IPs</p>
                      </div>
                      <div className="w-12 h-6 bg-void-700/50 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-void-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">Audit Logging</p>
                        <p className="text-sm text-void-500">Log all admin actions</p>
                      </div>
                      <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                      </div>
                    </div>
                  </div>
                </HolographicCard>

                <HolographicCard className="p-6">
                  <h3 className="text-lg font-semibold text-void-100 mb-6 flex items-center gap-2">
                    <Icon name="BellIcon" size={20} className="text-spectral-violet" />
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">New User Alerts</p>
                        <p className="text-sm text-void-500">Notify on new registrations</p>
                      </div>
                      <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">Report Notifications</p>
                        <p className="text-sm text-void-500">Instant alerts for new reports</p>
                      </div>
                      <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-void-200">Weekly Digest</p>
                        <p className="text-sm text-void-500">Summary email every Monday</p>
                      </div>
                      <div className="w-12 h-6 bg-void-700/50 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-void-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </HolographicCard>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
      </main>
    </VoidBackground>
  );
};

export default AdminPage;
