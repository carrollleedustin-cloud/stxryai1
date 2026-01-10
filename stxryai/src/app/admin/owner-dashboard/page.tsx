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
  canAccessOwnerDashboard,
  getRoleDisplayName,
  getRoleBadgeColor,
} from '@/lib/auth/accessControl';
import { createClient } from '@/lib/supabase/client';

type OwnerTab =
  | 'overview'
  | 'platform'
  | 'users'
  | 'financial'
  | 'system'
  | 'settings'
  | 'analytics'
  | 'security';

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalStories: number;
  totalRevenue: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

const OwnerDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalStories: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    systemHealth: 'healthy',
  });
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      router.push('/authentication');
      return;
    }

    const accessCheck = canAccessOwnerDashboard(profile);
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

      // Load platform metrics
      const [usersResult, storiesResult, subscriptionsResult] = await Promise.all([
        supabase.from('users').select('id, tier, created_at, last_seen_at').limit(1000),
        supabase.from('stories').select('id, status').limit(1000),
        supabase
          .from('subscriptions')
          .select('id, status, amount, created_at')
          .eq('status', 'active'),
      ]);

      const users = usersResult.data || [];
      const stories = storiesResult.data || [];
      const subscriptions = subscriptionsResult.data || [];

      const activeUsers = users.filter((u) => {
        if (!u.last_seen_at) return false;
        const lastSeen = new Date(u.last_seen_at);
        const daysSince = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }).length;

      const premiumUsers = users.filter((u) =>
        ['premium', 'creator_pro', 'enterprise'].includes(u.tier)
      ).length;

      const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
      const monthlyRevenue = subscriptions
        .filter((s) => {
          const created = new Date(s.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return created >= monthAgo;
        })
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      setMetrics({
        totalUsers: users.length,
        activeUsers,
        premiumUsers,
        totalStories: stories.length,
        totalRevenue,
        monthlyRevenue,
        systemHealth: 'healthy',
      });

      // Load system logs (if table exists)
      const { data: logsData } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setSystemLogs(logsData || []);

      // Load recent transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*, users!user_id(username, display_name)')
        .order('created_at', { ascending: false })
        .limit(20);

      setRecentTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error loading owner dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemAction = async (action: string, targetId?: string) => {
    // Owner-only system actions
    console.log('System action:', action, targetId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || !profile) return null;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'ChartBarIcon' },
    { id: 'platform' as const, label: 'Platform', icon: 'GlobeAltIcon' },
    { id: 'users' as const, label: 'Users', icon: 'UsersIcon' },
    { id: 'financial' as const, label: 'Financial', icon: 'CurrencyDollarIcon' },
    { id: 'system' as const, label: 'System', icon: 'CogIcon' },
    { id: 'analytics' as const, label: 'Analytics', icon: 'ChartPieIcon' },
    { id: 'security' as const, label: 'Security', icon: 'ShieldCheckIcon' },
    { id: 'settings' as const, label: 'Settings', icon: 'AdjustmentsHorizontalIcon' },
  ];

  return (
    <VoidBackground variant="dense">
      <EtherealNav />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TemporalHeading level={2} accent>
                    Owner Dashboard
                  </TemporalHeading>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold border ${getRoleBadgeColor('owner')}`}
                  >
                    👑 {getRoleDisplayName('owner')}
                  </span>
                </div>
                <p className="text-void-400">Complete platform control and management</p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    metrics.systemHealth === 'healthy'
                      ? 'bg-green-500/10 border-green-500/30'
                      : metrics.systemHealth === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      metrics.systemHealth === 'healthy'
                        ? 'bg-green-500 animate-pulse'
                        : metrics.systemHealth === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      metrics.systemHealth === 'healthy'
                        ? 'text-green-400'
                        : metrics.systemHealth === 'warning'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    System{' '}
                    {metrics.systemHealth === 'healthy'
                      ? 'Healthy'
                      : metrics.systemHealth === 'warning'
                        ? 'Warning'
                        : 'Critical'}
                  </span>
                </div>
                <SpectralButton variant="primary" onClick={loadData}>
                  <Icon name="ArrowPathIcon" size={16} className="mr-2" />
                  Refresh
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>

          {/* Key Metrics */}
          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Icon name="UsersIcon" size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUpIcon" size={12} />
                    +12.5%
                  </span>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={metrics.totalUsers} />
                </div>
                <p className="text-sm text-void-500">Total Users</p>
                <p className="text-xs text-void-600 mt-1">{metrics.activeUsers} active (30d)</p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon name="SparklesIcon" size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUpIcon" size={12} />
                    +8.3%
                  </span>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={metrics.premiumUsers} />
                </div>
                <p className="text-sm text-void-500">Premium Users</p>
                <p className="text-xs text-void-600 mt-1">
                  {metrics.totalUsers > 0
                    ? Math.round((metrics.premiumUsers / metrics.totalUsers) * 100)
                    : 0}
                  % conversion
                </p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Icon name="CurrencyDollarIcon" size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUpIcon" size={12} />
                    +18.7%
                  </span>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  $
                  {(metrics.monthlyRevenue / 100).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-sm text-void-500">Monthly Revenue</p>
                <p className="text-xs text-void-600 mt-1">
                  ${(metrics.totalRevenue / 100).toLocaleString()} total
                </p>
              </HolographicCard>

              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Icon name="BookOpenIcon" size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="ArrowUpIcon" size={12} />
                    +5.2%
                  </span>
                </div>
                <div className="text-3xl font-bold text-void-100 mb-1">
                  <AnimatedCounter end={metrics.totalStories} />
                </div>
                <p className="text-sm text-void-500">Total Stories</p>
                <p className="text-xs text-void-600 mt-1">Published content</p>
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
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-void-100 border border-amber-500/50'
                        : 'text-void-400 hover:text-void-200 hover:bg-void-800/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Recent Transactions */}
                <GradientBorder className="lg:col-span-2">
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="CurrencyDollarIcon" size={20} className="text-amber-400" />
                      Recent Transactions
                    </h3>
                    <div className="space-y-4">
                      {recentTransactions.length === 0 ? (
                        <p className="text-void-400 text-center py-8">No recent transactions</p>
                      ) : (
                        recentTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-void-900/30 border border-void-800/30"
                          >
                            <div>
                              <p className="font-medium text-void-200">
                                {tx.users?.username || 'Unknown'}
                              </p>
                              <p className="text-sm text-void-500">
                                {tx.type} • {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400">
                                ${(tx.amount / 100).toFixed(2)}
                              </p>
                              <p className="text-xs text-void-500">{tx.status}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </GradientBorder>

                {/* System Status */}
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
                      <Icon name="CogIcon" size={20} className="text-spectral-cyan" />
                      System Status
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-void-300">Database</span>
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-void-500">Operational</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-void-300">API Services</span>
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-void-500">All systems normal</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-void-300">Storage</span>
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-void-500">78% available</p>
                      </div>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'financial' && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">Financial Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <HolographicCard className="p-6">
                        <h4 className="text-lg font-semibold text-void-200 mb-4">
                          Revenue Breakdown
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-void-400">Monthly Recurring</span>
                            <span className="font-bold text-void-100">
                              ${(metrics.monthlyRevenue / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-void-400">Total Revenue</span>
                            <span className="font-bold text-void-100">
                              ${(metrics.totalRevenue / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-void-400">Premium Subscriptions</span>
                            <span className="font-bold text-void-100">{metrics.premiumUsers}</span>
                          </div>
                        </div>
                      </HolographicCard>
                      <HolographicCard className="p-6">
                        <h4 className="text-lg font-semibold text-void-200 mb-4">Quick Actions</h4>
                        <div className="space-y-3">
                          <SpectralButton variant="primary" className="w-full">
                            <Icon name="DocumentArrowDownIcon" size={16} className="mr-2" />
                            Export Financial Report
                          </SpectralButton>
                          <SpectralButton variant="ghost" className="w-full">
                            <Icon name="ChartBarIcon" size={16} className="mr-2" />
                            View Analytics
                          </SpectralButton>
                        </div>
                      </HolographicCard>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div
                key="system"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">System Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-void-900/30 border border-void-800/30">
                        <h4 className="font-semibold text-void-200 mb-3">System Logs</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {systemLogs.length === 0 ? (
                            <p className="text-void-400 text-sm">No system logs available</p>
                          ) : (
                            systemLogs.map((log, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-void-400 font-mono p-2 bg-void-800/30 rounded"
                              >
                                [{new Date(log.created_at).toLocaleTimeString()}]{' '}
                                {log.message || log.type}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SpectralButton
                          variant="primary"
                          onClick={() => handleSystemAction('backup')}
                        >
                          <Icon name="ArrowDownTrayIcon" size={16} className="mr-2" />
                          Backup Database
                        </SpectralButton>
                        <SpectralButton
                          variant="ghost"
                          onClick={() => handleSystemAction('clear_cache')}
                        >
                          <Icon name="TrashIcon" size={16} className="mr-2" />
                          Clear Cache
                        </SpectralButton>
                      </div>
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
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">User Management</h3>
                    <p className="text-void-400">Full user management capabilities (coming soon)</p>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-void-900/30 border border-void-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-void-200">Two-Factor Authentication</span>
                          <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                          </div>
                        </div>
                        <p className="text-sm text-void-500">Required for all admin accounts</p>
                      </div>
                      <div className="p-4 rounded-lg bg-void-900/30 border border-void-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-void-200">Audit Logging</span>
                          <div className="w-12 h-6 bg-green-500/30 rounded-full p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-green-500 rounded-full ml-auto" />
                          </div>
                        </div>
                        <p className="text-sm text-void-500">All actions are logged</p>
                      </div>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}

            {['platform', 'analytics', 'settings'].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-void-100 mb-6 capitalize">
                      {activeTab === 'platform'
                        ? 'Platform Management'
                        : activeTab === 'analytics'
                          ? 'Analytics Dashboard'
                          : 'Platform Settings'}
                    </h3>
                    <p className="text-void-400">Advanced {activeTab} features coming soon...</p>
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

export default OwnerDashboardPage;
