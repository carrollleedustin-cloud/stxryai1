'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Crown, Zap, Users, FileText, Settings, Activity,
  TrendingUp, BarChart3, AlertTriangle, Flag, MessageSquare,
  Calendar, Gift, Award, Package, Palette, Globe, Bell,
  ChevronRight, Search, Plus, RefreshCw
} from 'lucide-react';
import { rbacService, StaffRole } from '@/services/rbacService';
import { moderationService, ModerationStats } from '@/services/moderationService';
import { godModeService, PlatformStats } from '@/services/godModeService';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [userRole, setUserRole] = useState<StaffRole>('user');
  const [modStats, setModStats] = useState<ModerationStats | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const role = await rbacService.getUserRole(user.id);
        setUserRole(role);

        if (!['moderator', 'admin', 'owner'].includes(role)) {
          router.push('/');
          return;
        }

        const [modStatsData, platformStatsData] = await Promise.all([
          moderationService.getModerationStats(),
          role === 'admin' || role === 'owner' 
            ? godModeService.getPlatformStats(user.id)
            : Promise.resolve(null),
        ]);

        setModStats(modStatsData);
        setPlatformStats(platformStatsData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, router]);

  const roleInfo = rbacService.getRoleInfo(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-void-900 to-void-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-spectral-cyan border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-void-900 to-void-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-spectral-cyan/5 to-transparent animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-500/5 to-transparent animate-pulse-slow delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-void-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className={`p-3 bg-gradient-to-br ${
                  userRole === 'owner' 
                    ? 'from-purple-500/30 to-pink-500/30' 
                    : userRole === 'admin'
                    ? 'from-blue-500/30 to-cyan-500/30'
                    : 'from-emerald-500/30 to-green-500/30'
                } rounded-xl`}
              >
                {userRole === 'owner' ? (
                  <Crown className="w-7 h-7 text-purple-400" />
                ) : userRole === 'admin' ? (
                  <Zap className="w-7 h-7 text-blue-400" />
                ) : (
                  <Shield className="w-7 h-7 text-emerald-400" />
                )}
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {roleInfo.name} Control Center
                </h1>
                <p className="text-void-400 text-sm">{roleInfo.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-void-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-void-300" />
                {modStats && modStats.pendingReports > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold"
                  >
                    !
                  </motion.span>
                )}
              </motion.button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                  userRole === 'owner' 
                    ? 'from-purple-500 to-pink-500' 
                    : userRole === 'admin'
                    ? 'from-blue-500 to-cyan-500'
                    : 'from-emerald-500 to-green-500'
                } flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {profile?.display_name?.[0] || roleInfo.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{profile?.display_name}</p>
                  <p className={`text-xs ${
                    userRole === 'owner' 
                      ? 'text-purple-400' 
                      : userRole === 'admin'
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}>{roleInfo.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <QuickStat
            icon={AlertTriangle}
            value={modStats?.pendingReports || 0}
            label="Pending Reports"
            color="yellow"
            urgent={modStats ? modStats.pendingReports > 5 : false}
          />
          <QuickStat
            icon={Users}
            value={platformStats?.totalUsers || 0}
            label="Total Users"
            color="blue"
          />
          <QuickStat
            icon={Activity}
            value={platformStats?.activeUsersToday || 0}
            label="Active Today"
            color="green"
          />
          <QuickStat
            icon={FileText}
            value={platformStats?.totalStories || 0}
            label="Total Stories"
            color="purple"
          />
          <QuickStat
            icon={TrendingUp}
            value={platformStats?.totalReads || 0}
            label="Total Reads"
            color="cyan"
          />
          <QuickStat
            icon={Award}
            value={platformStats?.premiumUsers || 0}
            label="Premium Users"
            color="amber"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Navigation Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Moderation */}
            <DashboardCard
              title="Moderation"
              description="Reports, bans, and content moderation"
              icon={Shield}
              color="emerald"
              href="/admin/mod-dashboard"
              stats={[
                { label: 'Pending', value: modStats?.pendingReports || 0 },
                { label: 'Bans', value: modStats?.activeBans || 0 },
              ]}
            />

            {/* User Management */}
            {(userRole === 'admin' || userRole === 'owner') && (
              <DashboardCard
                title="User Management"
                description="Manage users, roles, and permissions"
                icon={Users}
                color="blue"
                href="/admin/users"
                stats={[
                  { label: 'Total', value: platformStats?.totalUsers || 0 },
                  { label: 'Active', value: platformStats?.activeUsersToday || 0 },
                ]}
              />
            )}

            {/* Events */}
            {(userRole === 'admin' || userRole === 'owner') && (
              <DashboardCard
                title="Events Manager"
                description="Create and manage platform events"
                icon={Calendar}
                color="purple"
                href="/admin/events"
                stats={[
                  { label: 'Active', value: 2 },
                  { label: 'Upcoming', value: 3 },
                ]}
              />
            )}

            {/* Content */}
            <DashboardCard
              title="Content Tools"
              description="Manage stories and featured content"
              icon={FileText}
              color="cyan"
              href="/admin/content"
              stats={[
                { label: 'Stories', value: platformStats?.totalStories || 0 },
                { label: 'Featured', value: 12 },
              ]}
            />

            {/* Analytics */}
            {(userRole === 'admin' || userRole === 'owner') && (
              <DashboardCard
                title="Analytics"
                description="Platform statistics and insights"
                icon={BarChart3}
                color="amber"
                href="/admin/analytics"
              />
            )}

            {/* Owner Tools */}
            {userRole === 'owner' && (
              <DashboardCard
                title="God Mode"
                description="Full system control and configuration"
                icon={Crown}
                color="gradient"
                href="/admin/owner-dashboard"
                premium
              />
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-spectral-cyan" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <ActivityItem
                action="New report submitted"
                target="Spam content"
                time="2 min ago"
                type="report"
              />
              <ActivityItem
                action="User banned"
                target="@spammer123"
                time="15 min ago"
                type="moderation"
              />
              <ActivityItem
                action="Story featured"
                target="The Last Adventure"
                time="1 hour ago"
                type="content"
              />
              <ActivityItem
                action="Event created"
                target="Winter Writing Contest"
                time="3 hours ago"
                type="event"
              />
              <ActivityItem
                action="New premium user"
                target="@writer_pro"
                time="5 hours ago"
                type="user"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-2 text-sm text-spectral-cyan hover:text-white transition-colors"
            >
              View All Activity →
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <QuickAction icon={Flag} label="Review Reports" onClick={() => router.push('/admin/reports')} />
            <QuickAction icon={Users} label="Search User" onClick={() => {}} />
            <QuickAction icon={MessageSquare} label="Send Broadcast" onClick={() => {}} disabled={userRole === 'moderator'} />
            <QuickAction icon={Calendar} label="New Event" onClick={() => {}} disabled={userRole === 'moderator'} />
            <QuickAction icon={Gift} label="Grant Reward" onClick={() => {}} disabled={userRole !== 'owner'} />
            <QuickAction icon={Settings} label="Settings" onClick={() => {}} disabled={userRole !== 'owner'} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function QuickStat({ icon: Icon, value, label, color, urgent }: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
  urgent?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-500/20 to-amber-500/20 text-yellow-400',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-green-500/20 text-emerald-400',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border border-white/10 ${
        urgent ? 'ring-2 ring-red-500/50 animate-pulse' : ''
      }`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs opacity-75">{label}</p>
      {urgent && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
      )}
    </motion.div>
  );
}

function DashboardCard({ title, description, icon: Icon, color, href, stats, premium }: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
  stats?: Array<{ label: string; value: number }>;
  premium?: boolean;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    emerald: { bg: 'from-emerald-500/10 to-green-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/30' },
    blue: { bg: 'from-blue-500/10 to-cyan-500/10', icon: 'text-blue-400', border: 'border-blue-500/30' },
    purple: { bg: 'from-purple-500/10 to-pink-500/10', icon: 'text-purple-400', border: 'border-purple-500/30' },
    cyan: { bg: 'from-cyan-500/10 to-blue-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/30' },
    amber: { bg: 'from-amber-500/10 to-orange-500/10', icon: 'text-amber-400', border: 'border-amber-500/30' },
    gradient: { bg: 'from-purple-500/20 via-pink-500/20 to-amber-500/20', icon: 'text-purple-400', border: 'border-purple-500/50' },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} cursor-pointer group overflow-hidden`}
      >
        {premium && (
          <div className="absolute top-0 right-0 w-20 h-20">
            <div className="absolute transform rotate-45 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 right-[-35px] top-[15px] w-[120px] text-center">
              GOD MODE
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/10 ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <ChevronRight className="w-5 h-5 text-void-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-void-400 mb-4">{description}</p>
        
        {stats && (
          <div className="flex gap-4">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-void-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function ActivityItem({ action, target, time, type }: {
  action: string;
  target: string;
  time: string;
  type: 'report' | 'moderation' | 'content' | 'event' | 'user';
}) {
  const typeColors: Record<string, string> = {
    report: 'bg-yellow-500',
    moderation: 'bg-red-500',
    content: 'bg-blue-500',
    event: 'bg-purple-500',
    user: 'bg-green-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
      <div className={`w-2 h-2 rounded-full ${typeColors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{action}</p>
        <p className="text-xs text-void-400">{target}</p>
      </div>
      <span className="text-xs text-void-500">{time}</span>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, disabled }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
        disabled
          ? 'bg-white/5 text-void-500 cursor-not-allowed'
          : 'bg-white/5 text-void-300 hover:bg-white/10 hover:text-white cursor-pointer'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs text-center">{label}</span>
    </motion.button>
  );
}
