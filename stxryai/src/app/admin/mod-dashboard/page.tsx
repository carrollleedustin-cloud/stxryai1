'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import VoidBackground from '@/components/void/VoidBackground';
import {
  EtherealNav,
  TemporalHeading,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from '@/components/void';
import {
  HolographicCard,
  RevealOnScroll,
  GradientBorder,
  NeonText,
} from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import {
  canAccessAdminDashboard,
  getRoleDisplayName,
  getRoleBadgeColor,
} from '@/lib/auth/accessControl';
import { createClient } from '@/lib/supabase/client';

type ModTab = 'reports' | 'content' | 'users' | 'comments' | 'activity';

const ModDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ModTab>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      router.push('/authentication');
      return;
    }

    const accessCheck = canAccessAdminDashboard(profile);
    if (!accessCheck.allowed) {
      router.push('/user-dashboard');
      return;
    }

    loadData();
  }, [user, profile, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      // Load reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*, users!reporter_id(username, display_name), stories!story_id(title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      // Load content queue
      const { data: contentData } = await supabase
        .from('stories')
        .select('*, users!author_id(username, display_name)')
        .in('status', ['pending_review', 'flagged'])
        .order('created_at', { ascending: false })
        .limit(20);

      // Load recent users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, display_name, email, created_at, tier, role')
        .order('created_at', { ascending: false })
        .limit(20);

      // Load recent comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, users!user_id(username, display_name), stories!story_id(title)')
        .order('created_at', { ascending: false })
        .limit(20);

      setReports(reportsData || []);
      setContentQueue(contentData || []);
      setRecentUsers(usersData || []);
      setRecentComments(commentsData || []);
    } catch (error) {
      console.error('Error loading mod dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (
    reportId: string,
    action: 'approve' | 'reject' | 'investigate'
  ) => {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const statusMap = {
        approve: 'resolved',
        reject: 'dismissed',
        investigate: 'investigating',
      };

      await supabase
        .from('reports')
        .update({
          status: statusMap[action],
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      loadData();
    } catch (error) {
      console.error('Error handling report:', error);
    }
  };

  const handleContentAction = async (storyId: string, action: 'approve' | 'reject' | 'flag') => {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const statusMap = {
        approve: 'published',
        reject: 'rejected',
        flag: 'flagged',
      };

      await supabase.from('stories').update({ status: statusMap[action] }).eq('id', storyId);

      loadData();
    } catch (error) {
      console.error('Error handling content:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || !profile) return null;

  const tabs = [
    { id: 'reports' as const, label: 'Reports', icon: 'FlagIcon', count: reports.length },
    {
      id: 'content' as const,
      label: 'Content Queue',
      icon: 'DocumentTextIcon',
      count: contentQueue.length,
    },
    { id: 'users' as const, label: 'Users', icon: 'UsersIcon' },
    { id: 'comments' as const, label: 'Comments', icon: 'ChatBubbleLeftIcon' },
    { id: 'activity' as const, label: 'Activity', icon: 'ClockIcon' },
  ];

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
                  Moderation Dashboard
                </TemporalHeading>
                <div className="flex items-center gap-3">
                  <p className="text-void-400">Content moderation and user management</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(profile.role as any)}`}
                  >
                    {getRoleDisplayName(profile.role as any)}
                  </span>
                </div>
              </div>
              <SpectralButton variant="primary" onClick={loadData} className="mt-4 md:mt-0">
                <Icon name="ArrowPathIcon" size={16} className="mr-2" />
                Refresh
              </SpectralButton>
            </div>
          </RevealOnScroll>

          {/* Stats */}
          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Icon name="FlagIcon" size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUpIcon" size={12} />
                    +5
                  </span>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={reports.length} />
                </div>
                <p className="text-sm text-void-500">Pending Reports</p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Icon name="DocumentTextIcon" size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={contentQueue.length} />
                </div>
                <p className="text-sm text-void-500">Content Queue</p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Icon name="UsersIcon" size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={recentUsers.length} />
                </div>
                <p className="text-sm text-void-500">Recent Users</p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon name="ChatBubbleLeftIcon" size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={recentComments.length} />
                </div>
                <p className="text-sm text-void-500">Recent Comments</p>
              </HolographicCard>
            </div>
          </RevealOnScroll>

          {/* Tab Navigation */}
          <RevealOnScroll delay={0.2}>
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-void-900/50 rounded-xl border border-void-800/50">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 text-void-100 border border-spectral-cyan/50'
                        : 'text-void-400 hover:text-void-200 hover:bg-void-800/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </RevealOnScroll>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-void-800/50">
                      <h3 className="text-xl font-semibold text-void-100">Pending Reports</h3>
                    </div>
                    <div className="divide-y divide-void-800/30">
                      {reports.length === 0 ? (
                        <div className="p-12 text-center">
                          <Icon
                            name="CheckCircleIcon"
                            size={48}
                            className="text-green-400 mx-auto mb-4"
                          />
                          <p className="text-void-300">No pending reports</p>
                        </div>
                      ) : (
                        reports.map((report) => (
                          <div
                            key={report.id}
                            className="p-6 hover:bg-void-900/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                      report.type === 'content'
                                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                        : report.type === 'user'
                                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    }`}
                                  >
                                    {report.type}
                                  </span>
                                  <h4 className="font-semibold text-void-200">
                                    {report.title || report.reason}
                                  </h4>
                                </div>
                                <p className="text-sm text-void-400 mb-3">
                                  {report.description || report.details}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-void-500">
                                  <span>Reported by: {report.users?.username || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                  {report.stories && (
                                    <>
                                      <span>•</span>
                                      <span>Story: {report.stories.title}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <SpectralButton
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleReportAction(report.id, 'investigate')}
                                >
                                  <Icon name="MagnifyingGlassIcon" size={14} className="mr-1" />
                                  Investigate
                                </SpectralButton>
                                <SpectralButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReportAction(report.id, 'approve')}
                                >
                                  <Icon name="CheckIcon" size={14} className="mr-1" />
                                  Approve
                                </SpectralButton>
                                <SpectralButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReportAction(report.id, 'reject')}
                                >
                                  <Icon name="XMarkIcon" size={14} className="mr-1" />
                                  Dismiss
                                </SpectralButton>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-void-800/50">
                      <h3 className="text-xl font-semibold text-void-100">Content Review Queue</h3>
                    </div>
                    <div className="divide-y divide-void-800/30">
                      {contentQueue.length === 0 ? (
                        <div className="p-12 text-center">
                          <Icon
                            name="CheckCircleIcon"
                            size={48}
                            className="text-green-400 mx-auto mb-4"
                          />
                          <p className="text-void-300">No content pending review</p>
                        </div>
                      ) : (
                        contentQueue.map((story) => (
                          <div
                            key={story.id}
                            className="p-6 hover:bg-void-900/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-void-200 mb-2">{story.title}</h4>
                                <p className="text-sm text-void-400 mb-3 line-clamp-2">
                                  {story.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-void-500">
                                  <span>Author: {story.users?.username || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>Status: {story.status}</span>
                                  <span>•</span>
                                  <span>{new Date(story.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <SpectralButton
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleContentAction(story.id, 'approve')}
                                >
                                  <Icon name="CheckIcon" size={14} className="mr-1" />
                                  Approve
                                </SpectralButton>
                                <SpectralButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContentAction(story.id, 'flag')}
                                >
                                  <Icon name="FlagIcon" size={14} className="mr-1" />
                                  Flag
                                </SpectralButton>
                                <SpectralButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContentAction(story.id, 'reject')}
                                >
                                  <Icon name="XMarkIcon" size={14} className="mr-1" />
                                  Reject
                                </SpectralButton>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-void-800/50">
                      <h3 className="text-xl font-semibold text-void-100">Recent Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-void-900/30 text-void-400 text-sm">
                            <th className="text-left px-6 py-4 font-medium">User</th>
                            <th className="text-left px-6 py-4 font-medium">Tier</th>
                            <th className="text-left px-6 py-4 font-medium">Role</th>
                            <th className="text-left px-6 py-4 font-medium">Joined</th>
                            <th className="text-right px-6 py-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-void-800/30">
                          {recentUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-void-900/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-950 font-bold">
                                    {u.display_name?.charAt(0) || u.username?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-void-200">
                                      {u.display_name || 'No name'}
                                    </p>
                                    <p className="text-sm text-void-500">@{u.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    u.tier === 'premium'
                                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                      : u.tier === 'creator_pro'
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        : 'bg-void-800/50 text-void-400 border-void-700/30'
                                  }`}
                                >
                                  {u.tier || 'free'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role as any)}`}
                                >
                                  {getRoleDisplayName(u.role as any)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-void-500 text-sm">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
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
                                    <Icon name="ShieldExclamationIcon" size={16} />
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

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-void-800/50">
                      <h3 className="text-xl font-semibold text-void-100">Recent Comments</h3>
                    </div>
                    <div className="divide-y divide-void-800/30">
                      {recentComments.length === 0 ? (
                        <div className="p-12 text-center">
                          <Icon
                            name="ChatBubbleLeftIcon"
                            size={48}
                            className="text-void-600 mx-auto mb-4"
                          />
                          <p className="text-void-300">No comments yet</p>
                        </div>
                      ) : (
                        recentComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-6 hover:bg-void-900/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-medium text-void-200">
                                    {comment.users?.username || 'Unknown'}
                                  </p>
                                  <span className="text-xs text-void-500">
                                    on {comment.stories?.title || 'Story'}
                                  </span>
                                </div>
                                <p className="text-sm text-void-300 mb-2">{comment.content}</p>
                                <div className="flex items-center gap-4 text-xs text-void-500">
                                  <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                  {comment.is_flagged && (
                                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                      Flagged
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {comment.is_flagged && (
                                  <SpectralButton
                                    variant="primary"
                                    size="sm"
                                    onClick={async () => {
                                      const supabase = createClient();
                                      await supabase
                                        .from('comments')
                                        .update({ is_flagged: false })
                                        .eq('id', comment.id);
                                      loadData();
                                    }}
                                  >
                                    <Icon name="CheckIcon" size={14} className="mr-1" />
                                    Clear Flag
                                  </SpectralButton>
                                )}
                                <SpectralButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    const supabase = createClient();
                                    await supabase.from('comments').delete().eq('id', comment.id);
                                    loadData();
                                  }}
                                >
                                  <Icon name="TrashIcon" size={14} className="mr-1" />
                                  Delete
                                </SpectralButton>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-void-900/30 border border-void-800/30">
                        <p className="text-void-300">Activity log coming soon...</p>
                      </div>
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

export default ModDashboardPage;
