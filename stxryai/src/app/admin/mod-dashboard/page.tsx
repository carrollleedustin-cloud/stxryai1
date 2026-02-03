'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, Users, FileText, Clock, CheckCircle,
  XCircle, Eye, MessageSquare, Flag, ChevronRight, Search,
  Filter, Bell, Activity, BarChart3, TrendingUp
} from 'lucide-react';
import { moderationService, UserReport, ModerationStats } from '@/services/moderationService';
import { rbacService } from '@/services/rbacService';

export default function ModeratorDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'queue'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      // Verify moderator access
      const isStaff = await rbacService.isStaff(user.id);
      if (!isStaff) {
        router.push('/');
        return;
      }

      try {
        const [statsData, reportsData] = await Promise.all([
          moderationService.getModerationStats(),
          moderationService.getReports(user.id, { status: filterStatus as any, limit: 20 }),
        ]);

        setStats(statsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Error loading moderator data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, filterStatus, router]);

  const handleAssignReport = async (reportId: string) => {
    if (!user) return;
    const success = await moderationService.assignReport(user.id, reportId);
    if (success) {
      // Reload reports
      const reportsData = await moderationService.getReports(user.id, { status: filterStatus as any });
      setReports(reportsData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-void-900 to-void-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-void-900 to-void-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-void-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Moderator Dashboard</h1>
                <p className="text-void-400 text-sm">Community protection center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-void-300" />
                {stats && stats.pendingReports > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {stats.pendingReports > 9 ? '9+' : stats.pendingReports}
                  </span>
                )}
              </motion.button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile?.display_name?.[0] || 'M'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{profile?.display_name}</p>
                  <p className="text-xs text-emerald-400">Moderator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={AlertTriangle}
            label="Pending Reports"
            value={stats?.pendingReports || 0}
            color="yellow"
            trend="+3 today"
          />
          <StatCard
            icon={FileText}
            label="Reports Today"
            value={stats?.reportsToday || 0}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Actions Today"
            value={stats?.actionsToday || 0}
            color="green"
          />
          <StatCard
            icon={XCircle}
            label="Active Bans"
            value={stats?.activeBans || 0}
            color="red"
          />
          <StatCard
            icon={MessageSquare}
            label="Active Mutes"
            value={stats?.activeMutes || 0}
            color="orange"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {['overview', 'reports', 'queue'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-void-300 hover:bg-white/10'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <ReportQuickView key={report.id} report={report} onAssign={handleAssignReport} />
                  ))}
                  {reports.length === 0 && (
                    <p className="text-void-400 text-center py-8">No pending reports</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <QuickActionButton
                      icon={Eye}
                      label="Review Reports"
                      onClick={() => setActiveTab('reports')}
                      color="emerald"
                    />
                    <QuickActionButton
                      icon={Users}
                      label="View Flagged Users"
                      onClick={() => router.push('/admin/reports')}
                      color="blue"
                    />
                    <QuickActionButton
                      icon={BarChart3}
                      label="View Analytics"
                      onClick={() => {}}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Moderation Guidelines */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Moderation Guidelines</h3>
                  <ul className="space-y-2 text-sm text-void-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                      Always provide clear reasoning for actions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                      Escalate severe violations immediately
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                      Document evidence before taking action
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-void-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-void-400 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} onAssign={handleAssignReport} />
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-12 bg-white/5 rounded-2xl">
                    <Shield className="w-12 h-12 text-void-500 mx-auto mb-4" />
                    <p className="text-void-400">No reports matching your criteria</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">My Assigned Queue</h3>
              <div className="space-y-4">
                {reports.filter(r => r.assignedTo === user?.id).map((report) => (
                  <ReportCard key={report.id} report={report} onAssign={handleAssignReport} />
                ))}
                {reports.filter(r => r.assignedTo === user?.id).length === 0 && (
                  <p className="text-void-400 text-center py-8">No reports assigned to you</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components
function StatCard({ icon: Icon, label, value, color, trend }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  trend?: string;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-500/20 to-amber-500/20 text-yellow-400',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-green-500/20 text-emerald-400',
    red: 'from-red-500/20 to-rose-500/20 text-red-400',
    orange: 'from-orange-500/20 to-amber-500/20 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border border-white/10`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
        {trend && <span className="text-xs opacity-75">{trend}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm opacity-75">{label}</p>
    </motion.div>
  );
}

function ReportQuickView({ report, onAssign }: { report: UserReport; onAssign: (id: string) => void }) {
  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    normal: 'bg-blue-500',
    low: 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className={`w-2 h-2 rounded-full ${priorityColors[report.priority]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{report.reportType.replace('_', ' ')}</p>
        <p className="text-xs text-void-400">by {report.reporterName}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onAssign(report.id)}
        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

function ReportCard({ report, onAssign }: { report: UserReport; onAssign: (id: string) => void }) {
  const priorityColors: Record<string, string> = {
    urgent: 'border-red-500/50 bg-red-500/10',
    high: 'border-orange-500/50 bg-orange-500/10',
    normal: 'border-blue-500/50 bg-blue-500/10',
    low: 'border-gray-500/50 bg-gray-500/10',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    reviewing: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
    escalated: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${priorityColors[report.priority]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="w-5 h-5 text-red-400" />
            <h4 className="font-semibold text-white capitalize">
              {report.reportType.replace('_', ' ')}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[report.status]}`}>
              {report.status}
            </span>
            <span className="text-xs text-void-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm text-void-300 mb-3">{report.description || 'No description provided'}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-void-400">
            <span>Reported by: <strong className="text-white">{report.reporterName}</strong></span>
            {report.reportedUserName && (
              <span>Target: <strong className="text-white">{report.reportedUserName}</strong></span>
            )}
            {report.assignedToName && (
              <span>Assigned to: <strong className="text-emerald-400">{report.assignedToName}</strong></span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {report.status === 'pending' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAssign(report.id)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium"
            >
              Claim
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, color }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'hover:bg-emerald-500/20 text-emerald-400',
    blue: 'hover:bg-blue-500/20 text-blue-400',
    purple: 'hover:bg-purple-500/20 text-purple-400',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 ${colorClasses[color]} transition-colors`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-white text-sm">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto" />
    </motion.button>
  );
}
