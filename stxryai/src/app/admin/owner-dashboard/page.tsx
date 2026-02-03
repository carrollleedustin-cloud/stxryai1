'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Shield, Zap, Users, Settings, Activity, AlertTriangle,
  Database, Server, Globe, Lock, Unlock, Bell, Eye, Edit,
  Gift, Award, Package, Palette, Image, FileText, Trash2,
  Plus, Search, RefreshCw, Download, Upload, Terminal,
  ToggleLeft, ToggleRight, ChevronDown, ChevronRight,
  Sparkles, Flame, Heart, Star, Coins, Gem
} from 'lucide-react';
import { rbacService, StaffMember } from '@/services/rbacService';
import { godModeService, FeatureFlag, PlatformStats, SystemConfig } from '@/services/godModeService';

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'features' | 'content' | 'system' | 'emergency'>('overview');
  
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const ownerCheck = await rbacService.isOwner(user.id);
        setIsOwner(ownerCheck);

        if (!ownerCheck) {
          router.push('/admin');
          return;
        }

        const [stats, flags, staff, config] = await Promise.all([
          godModeService.getPlatformStats(user.id),
          godModeService.getFeatureFlags(user.id),
          rbacService.getStaffMembers(),
          godModeService.getSystemConfig(user.id),
        ]);

        setPlatformStats(stats);
        setFeatureFlags(flags);
        setStaffMembers(staff);
        setSystemConfig(config);
      } catch (error) {
        console.error('Error loading owner data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, router]);

  const handleToggleFeature = async (flagKey: string, enabled: boolean) => {
    if (!user) return;
    const success = await godModeService.toggleFeatureFlag(user.id, flagKey, enabled);
    if (success) {
      setFeatureFlags(flags => 
        flags.map(f => f.flagKey === flagKey ? { ...f, isEnabled: enabled } : f)
      );
    }
  };

  const handleMaintenanceMode = async (enable: boolean) => {
    if (!user) return;
    if (enable) {
      await godModeService.activateMaintenanceMode(user.id, 'Manual activation');
    } else {
      await godModeService.deactivateMaintenanceMode(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/20 to-void-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Crown className="w-full h-full text-purple-400" />
          </motion.div>
          <p className="text-void-400">Loading God Mode...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950">
      {/* Epic Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, -20, 20],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-purple-500/10 to-transparent" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-500/10 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative border-b border-purple-500/20 bg-void-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="relative"
              >
                <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl">
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl border-2 border-purple-500/30 border-dashed"
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                  GOD MODE
                </h1>
                <p className="text-void-400 text-sm">Full system control • Owner access only</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Emergency Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Systems Normal</span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Crown className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">{profile?.display_name}</p>
                  <p className="text-xs text-purple-400">Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users & Roles', icon: Users },
            { id: 'features', label: 'Feature Flags', icon: ToggleLeft },
            { id: 'content', label: 'Content Tools', icon: Package },
            { id: 'system', label: 'System Config', icon: Settings },
            { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-void-300 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <GodModeStat icon={Users} value={platformStats?.totalUsers || 0} label="Total Users" color="purple" />
                <GodModeStat icon={Activity} value={platformStats?.activeUsersToday || 0} label="Active Today" color="green" />
                <GodModeStat icon={FileText} value={platformStats?.totalStories || 0} label="Stories" color="blue" />
                <GodModeStat icon={Eye} value={platformStats?.totalReads || 0} label="Total Reads" color="cyan" />
                <GodModeStat icon={Gem} value={platformStats?.premiumUsers || 0} label="Premium" color="amber" />
                <GodModeStat icon={Database} value={`${platformStats?.storageUsedGB || 0}GB`} label="Storage" color="pink" />
              </div>

              {/* Quick Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Overview */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Staff Team ({staffMembers.length})
                  </h3>
                  <div className="space-y-3">
                    {staffMembers.slice(0, 5).map((staff) => (
                      <StaffMemberRow key={staff.userId} member={staff} />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection('users')}
                    className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-white transition-colors"
                  >
                    Manage Staff →
                  </motion.button>
                </div>

                {/* Feature Flags Preview */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ToggleLeft className="w-5 h-5 text-purple-400" />
                    Feature Flags
                  </h3>
                  <div className="space-y-3">
                    {featureFlags.slice(0, 5).map((flag) => (
                      <FeatureFlagToggle
                        key={flag.id}
                        flag={flag}
                        onToggle={(enabled) => handleToggleFeature(flag.flagKey, enabled)}
                      />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection('features')}
                    className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-white transition-colors"
                  >
                    All Flags →
                  </motion.button>
                </div>
              </div>

              {/* God Mode Actions */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  God Mode Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <GodModeAction icon={Gift} label="Grant Items" color="green" />
                  <GodModeAction icon={Award} label="Award Badge" color="amber" />
                  <GodModeAction icon={Coins} label="Add Coins" color="yellow" />
                  <GodModeAction icon={Heart} label="Grant Pet" color="pink" />
                  <GodModeAction icon={Star} label="Set VIP" color="purple" />
                  <GodModeAction icon={Eye} label="Audit Mode" color="cyan" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Users & Roles Section */}
          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* User Search */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">User Lookup</h3>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-void-400" />
                    <input
                      type="text"
                      placeholder="Search by username, email, or ID..."
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-void-400 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium"
                  >
                    Search
                  </motion.button>
                </div>
              </div>

              {/* Staff Management */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Staff Members
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {staffMembers.map((staff) => (
                    <StaffMemberCard key={staff.userId} member={staff} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature Flags Section */}
          {activeSection === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Feature Flags</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Create Flag
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <FeatureFlagCard
                    key={flag.id}
                    flag={flag}
                    onToggle={(enabled) => handleToggleFeature(flag.flagKey, enabled)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Content Tools Section */}
          {activeSection === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <ContentToolCard
                title="Badge Manager"
                description="Create, edit, and manage platform badges"
                icon={Award}
                actions={['Create Badge', 'View All', 'Grant to User']}
              />
              <ContentToolCard
                title="Icon Manager"
                description="Manage profile icons and avatars"
                icon={Image}
                actions={['Upload Icon', 'View All', 'Grant to User']}
              />
              <ContentToolCard
                title="Banner Manager"
                description="Manage profile banners"
                icon={Palette}
                actions={['Upload Banner', 'View All', 'Grant to User']}
              />
              <ContentToolCard
                title="Pet Manager"
                description="Manage pet species, skins, and accessories"
                icon={Heart}
                actions={['Create Species', 'Create Skin', 'Grant Pet']}
              />
              <ContentToolCard
                title="Event Manager"
                description="Create and manage platform events"
                icon={Flame}
                actions={['Create Event', 'View Active', 'End Event']}
              />
              <ContentToolCard
                title="Season Pass"
                description="Configure battle pass rewards"
                icon={Star}
                actions={['New Season', 'Edit Rewards', 'Preview']}
              />
            </motion.div>
          )}

          {/* System Config Section */}
          {activeSection === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  System Configuration
                </h3>
                <div className="space-y-4">
                  {systemConfig.map((config) => (
                    <SystemConfigRow key={config.key} config={config} />
                  ))}
                  {systemConfig.length === 0 && (
                    <p className="text-void-400 text-center py-8">No system configurations found</p>
                  )}
                </div>
              </div>

              {/* Audit Log Preview */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Recent Audit Log
                </h3>
                <div className="font-mono text-sm space-y-2 bg-black/30 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p className="text-green-400">[2024-02-03 10:15:32] SYSTEM: Feature flag toggled: ai_companions = true</p>
                  <p className="text-blue-400">[2024-02-03 10:12:18] ADMIN: User role updated: @writer_pro → moderator</p>
                  <p className="text-yellow-400">[2024-02-03 10:10:45] MOD: Report resolved: #12345</p>
                  <p className="text-purple-400">[2024-02-03 10:05:22] OWNER: Badge created: "Winter Champion"</p>
                  <p className="text-cyan-400">[2024-02-03 10:00:00] SYSTEM: Daily backup completed</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emergency Section */}
          {activeSection === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/30">
                <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  Emergency Controls
                </h3>
                <p className="text-void-400 mb-6">Use these controls only in emergencies. All actions are logged.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <EmergencyButton
                    icon={Lock}
                    label="Maintenance Mode"
                    description="Disable site access for maintenance"
                    color="yellow"
                    onClick={() => handleMaintenanceMode(true)}
                  />
                  <EmergencyButton
                    icon={Shield}
                    label="Lockdown"
                    description="Emergency lockdown - disable registrations & posting"
                    color="orange"
                    onClick={() => {}}
                  />
                  <EmergencyButton
                    icon={Trash2}
                    label="Purge Cache"
                    description="Clear all system caches"
                    color="red"
                    onClick={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Emergency Action History</h3>
                <div className="space-y-3">
                  <p className="text-void-400 text-center py-8">No emergency actions recorded</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components
function GodModeStat({ icon: Icon, value, label, color }: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    green: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    pink: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs opacity-75">{label}</p>
    </motion.div>
  );
}

function GodModeAction({ icon: Icon, label, color }: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: 'hover:bg-emerald-500/20 text-emerald-400',
    amber: 'hover:bg-amber-500/20 text-amber-400',
    yellow: 'hover:bg-yellow-500/20 text-yellow-400',
    pink: 'hover:bg-pink-500/20 text-pink-400',
    purple: 'hover:bg-purple-500/20 text-purple-400',
    cyan: 'hover:bg-cyan-500/20 text-cyan-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 ${colorClasses[color]} transition-colors`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs text-white text-center">{label}</span>
    </motion.button>
  );
}

function StaffMemberRow({ member }: { member: StaffMember }) {
  const roleColors: Record<string, string> = {
    owner: 'text-purple-400',
    admin: 'text-blue-400',
    moderator: 'text-emerald-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <span className="text-white text-sm font-bold">{member.displayName[0]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">{member.displayName}</p>
        <p className={`text-xs ${roleColors[member.role]}`}>{member.role}</p>
      </div>
    </div>
  );
}

function StaffMemberCard({ member }: { member: StaffMember }) {
  const roleColors: Record<string, string> = {
    owner: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    admin: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    moderator: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${roleColors[member.role]} border`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold">{member.displayName[0]}</span>
          </div>
          <div>
            <p className="font-medium text-white">{member.displayName}</p>
            <p className="text-sm text-void-400">@{member.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-white capitalize">{member.role}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/10 text-void-300 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureFlagToggle({ flag, onToggle }: { flag: FeatureFlag; onToggle: (enabled: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <div className="flex-1">
        <p className="text-sm text-white">{flag.displayName}</p>
        <p className="text-xs text-void-400">{flag.flagKey}</p>
      </div>
      <motion.button
        onClick={() => onToggle(!flag.isEnabled)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-1 rounded-lg ${flag.isEnabled ? 'text-green-400' : 'text-void-400'}`}
      >
        {flag.isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}

function FeatureFlagCard({ flag, onToggle }: { flag: FeatureFlag; onToggle: (enabled: boolean) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl border ${
        flag.isEnabled 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white">{flag.displayName}</h4>
        <motion.button
          onClick={() => onToggle(!flag.isEnabled)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={flag.isEnabled ? 'text-green-400' : 'text-void-400'}
        >
          {flag.isEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
        </motion.button>
      </div>
      <p className="text-sm text-void-400 mb-2">{flag.description || 'No description'}</p>
      <div className="flex items-center gap-2 text-xs text-void-500">
        <code className="px-2 py-1 bg-black/30 rounded">{flag.flagKey}</code>
        <span>Rollout: {flag.rolloutPercentage}%</span>
      </div>
    </motion.div>
  );
}

function ContentToolCard({ title, description, icon: Icon, actions }: {
  title: string;
  description: string;
  icon: React.ElementType;
  actions: string[];
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-purple-500/20">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h4 className="font-semibold text-white">{title}</h4>
          <p className="text-sm text-void-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
          >
            {action}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function SystemConfigRow({ config }: { config: SystemConfig }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div>
        <p className="font-medium text-white">{config.key}</p>
        <p className="text-sm text-void-400">{config.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <code className="px-3 py-1 bg-black/30 rounded text-sm text-void-300">
          {config.isSensitive ? '••••••••' : JSON.stringify(config.value)}
        </code>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/10 text-void-300 hover:text-white"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

function EmergencyButton({ icon: Icon, label, description, color, onClick }: {
  icon: React.ElementType;
  label: string;
  description: string;
  color: 'yellow' | 'orange' | 'red';
  onClick: () => void;
}) {
  const colorClasses = {
    yellow: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400',
    orange: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30 text-orange-400',
    red: 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border ${colorClasses[color]} transition-all text-left`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <p className="font-semibold text-white">{label}</p>
      <p className="text-xs text-void-400 mt-1">{description}</p>
    </motion.button>
  );
}
