'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  pendingReviews: number;
  reportedContent: number;
  revenue: number;
  userGrowth: number;
  storyGrowth: number;
}

interface ReportedItem {
  id: string;
  type: 'story' | 'comment' | 'user';
  title: string;
  reporter: string;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'reviewing' | 'resolved';
}

interface AdminDashboardProps {
  stats?: AdminStats;
  reportedItems?: ReportedItem[];
  onReview?: (id: string, action: 'approve' | 'reject' | 'ban') => void;
}

export default function AdminDashboard({
  stats,
  reportedItems = [],
  onReview,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'users' | 'analytics'>(
    'overview'
  );

  if (!stats) {
    return <AdminLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage platform content and users</p>
        </div>
        <div className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-600/30 font-semibold">
          🔒 Admin Access
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subValue={`${stats.activeUsers.toLocaleString()} active`}
          change={stats.userGrowth}
          color="from-blue-600 to-cyan-600"
        />
        <AdminMetricCard
          icon="📚"
          label="Total Stories"
          value={stats.totalStories.toLocaleString()}
          subValue={`${stats.pendingReviews} pending review`}
          change={stats.storyGrowth}
          color="from-purple-600 to-pink-600"
        />
        <AdminMetricCard
          icon="⚠️"
          label="Reported Content"
          value={stats.reportedContent.toString()}
          subValue="Needs attention"
          change={0}
          color="from-red-600 to-orange-600"
          urgent={stats.reportedContent > 0}
        />
        <AdminMetricCard
          icon="💰"
          label="Platform Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          subValue="This month"
          change={15}
          color="from-green-600 to-emerald-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'moderation', 'users', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab
                ? 'text-white border-purple-600'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'moderation' && <ModerationTab items={reportedItems} onReview={onReview} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

// Admin Metric Card
function AdminMetricCard({
  icon,
  label,
  value,
  subValue,
  change,
  color,
  urgent = false,
}: {
  icon: string;
  label: string;
  value: string;
  subValue: string;
  change: number;
  color: string;
  urgent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg ${
        urgent ? 'ring-2 ring-red-500 animate-pulse' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        {change !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              change >= 0 ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {change >= 0 ? '↑' : '↓'}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
      <div className="text-xs text-white/60 mt-2">{subValue}</div>
    </motion.div>
  );
}

// Overview Tab
function OverviewTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { icon: '📝', text: 'New story published: "The Quantum Detective"', time: '5 min ago' },
            { icon: '👤', text: '15 new users registered', time: '12 min ago' },
            { icon: '⭐', text: 'Story "Lost in Time" reached 10k views', time: '1 hour ago' },
            { icon: '💬', text: '45 new comments posted', time: '2 hours ago' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.text}</p>
                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionButton icon="🔍" label="Review Reports" count={stats.reportedContent} />
          <QuickActionButton icon="✅" label="Approve Stories" count={stats.pendingReviews} />
          <QuickActionButton icon="📊" label="View Analytics" />
          <QuickActionButton icon="👥" label="Manage Users" />
          <QuickActionButton icon="⚙️" label="Settings" />
          <QuickActionButton icon="📧" label="Send Announcement" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count?: number;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-center"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-white font-medium">{label}</div>
      {count !== undefined && count > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count}
        </div>
      )}
    </motion.button>
  );
}

// Moderation Tab
function ModerationTab({
  items,
  onReview,
}: {
  items: ReportedItem[];
  onReview?: (id: string, action: 'approve' | 'reject' | 'ban') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Reported Content</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm">
            All ({items.length})
          </button>
          <button className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 text-sm">
            Pending ({items.filter((i) => i.status === 'pending').length})
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        items.map((item) => <ModerationItemCard key={item.id} item={item} onReview={onReview} />)
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">✅</div>
          <p>No reported content - All clear!</p>
        </div>
      )}
    </div>
  );
}

function ModerationItemCard({
  item,
  onReview,
}: {
  item: ReportedItem;
  onReview?: (id: string, action: 'approve' | 'reject' | 'ban') => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return '📖';
      case 'comment':
        return '💬';
      case 'user':
        return '👤';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{getTypeIcon(item.type)}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-white mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">
                Reported by <span className="text-white">{item.reporter}</span> •{' '}
                {item.timestamp.toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.status === 'pending'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : item.status === 'reviewing'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-green-600/20 text-green-400'
              }`}
            >
              {item.status}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            <span className="font-semibold">Reason:</span> {item.reason}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onReview?.(item.id, 'approve')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => onReview?.(item.id, 'reject')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Remove
            </button>
            <button
              onClick={() => onReview?.(item.id, 'ban')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Ban User
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab (placeholder)
function UsersTab() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-4">👥</div>
      <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
      <p className="text-gray-400">User management interface coming soon...</p>
    </div>
  );
}

// Analytics Tab (placeholder)
function AnalyticsTab() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-white mb-2">Platform Analytics</h3>
      <p className="text-gray-400">Detailed analytics dashboard coming soon...</p>
    </div>
  );
}

// Loading Skeleton
function AdminLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-white/5 rounded-xl" />
    </div>
  );
}
