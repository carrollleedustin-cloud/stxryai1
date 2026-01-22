'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { NebulaCard } from '@/components/nebula/NebulaCard';
import { NebulaButton } from '@/components/nebula/NebulaButton';
import { NebulaTitle, GlowText, AnimatedCounter } from '@/components/nebula/NebulaText';
import { Plus, Users, Clock, BookOpen, Shield, TrendingUp, Loader2 } from 'lucide-react';
import {
  getFamilyProfiles,
  getFamilyOverview,
  formatTimeAgo,
  type FamilyMember,
} from '@/services/familyService';

/**
 * FAMILY MANAGEMENT DASHBOARD
 * The command center for parents to manage their family's StxryAI experience.
 */

export default function FamilyDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [kids, setKids] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState({
    total_members: 0,
    total_stories_read: 0,
    total_time_this_week: 0,
    weekly_growth: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    } else if (user) {
      loadFamilyData();
    }
  }, [user, authLoading, router]);

  const loadFamilyData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Load family profiles
      const profilesResult = await getFamilyProfiles(user.id);
      if (profilesResult.success && profilesResult.profiles) {
        setKids(profilesResult.profiles);
      } else {
        setError(profilesResult.error || 'Failed to load family profiles');
      }

      // Load overview stats
      const overviewResult = await getFamilyOverview(user.id);
      if (overviewResult.success && overviewResult.overview) {
        setOverview(overviewResult.overview);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalStoriesRead = overview.total_stories_read;
  const totalTimeThisWeek = overview.total_time_this_week;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spectral-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <NebulaCard glowColor="pink" className="max-w-md p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Family Data</h2>
          <p className="text-white/60 mb-4">{error}</p>
          <NebulaButton onClick={loadFamilyData}>Try Again</NebulaButton>
        </NebulaCard>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <NebulaTitle size="md" gradient="aurora">
            Family Dashboard
          </NebulaTitle>
          <p className="text-white/60 mt-2">Manage your family&apos;s reading adventure</p>
        </div>

        <NebulaButton icon={<Plus size={18} />} href="/family/profiles/new">
          Add Child Profile
        </NebulaButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <NebulaCard glowColor="cyan">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Family Members</p>
              <p className="text-2xl font-bold text-white">{kids.length}</p>
            </div>
          </div>
        </NebulaCard>

        <NebulaCard glowColor="violet">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <BookOpen size={20} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Stories Read</p>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={totalStoriesRead} />
              </p>
            </div>
          </div>
        </NebulaCard>

        <NebulaCard glowColor="pink">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Clock size={20} className="text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Time This Week</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor(totalTimeThisWeek / 60)}h {totalTimeThisWeek % 60}m
              </p>
            </div>
          </div>
        </NebulaCard>

        <NebulaCard glowColor="gold">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Weekly Growth</p>
              <p className="text-2xl font-bold text-green-400">+{overview.weekly_growth}%</p>
            </div>
          </div>
        </NebulaCard>
      </div>

      {/* Kids Profiles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-cyan-400" />
          Kids Profiles
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {kids.map((kid, i) => (
            <motion.div
              key={kid.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <NebulaCard className="cursor-pointer" hover3D>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(155,93,229,0.3), rgba(241,91,181,0.3))',
                        border: '2px solid rgba(155,93,229,0.3)',
                      }}
                    >
                      {kid.avatar}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0c0c1e]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-white">{kid.name}</h3>
                      <span className="text-xs text-white/40">Age {kid.age}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                        {kid.stats.stories_read} stories
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400">
                        {Math.floor(kid.stats.time_this_week / 60)}h this week
                      </span>
                    </div>

                    <p className="text-xs text-white/40">Last active: {formatTimeAgo(kid.stats.last_active)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <NebulaButton size="sm" variant="ghost" href={`/family/profiles/${kid.id}`}>
                    Edit Profile
                  </NebulaButton>
                  <NebulaButton size="sm" variant="ghost" href={`/family/activity?kid=${kid.id}`}>
                    View Activity
                  </NebulaButton>
                  <NebulaButton size="sm" variant="ghost" href={`/family/controls?kid=${kid.id}`}>
                    <Shield size={14} />
                    Controls
                  </NebulaButton>
                </div>
              </NebulaCard>
            </motion.div>
          ))}

          {/* Add Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kids.length * 0.1 }}
          >
            <NebulaCard
              className="cursor-pointer h-full min-h-[200px] flex items-center justify-center"
              glowColor="cyan"
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: 'rgba(0,255,213,0.1)',
                    border: '2px dashed rgba(0,255,213,0.3)',
                  }}
                  whileHover={{ scale: 1.1, borderStyle: 'solid' }}
                >
                  <Plus size={32} className="text-cyan-400" />
                </motion.div>
                <p className="text-white/70 font-medium">Add Child Profile</p>
                <p className="text-sm text-white/40 mt-1">Create a safe space for your child</p>
              </div>
            </NebulaCard>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: '⏰',
              title: 'Set Screen Time',
              desc: 'Manage daily limits',
              href: '/family/controls',
            },
            {
              icon: '📚',
              title: 'Content Filters',
              desc: 'Choose age-appropriate content',
              href: '/family/controls',
            },
            {
              icon: '📊',
              title: 'View Reports',
              desc: 'Weekly reading insights',
              href: '/family/activity',
            },
            {
              icon: '🔔',
              title: 'Notifications',
              desc: 'Activity alerts',
              href: '/family/settings',
            },
          ].map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <NebulaButton
                variant="ghost"
                fullWidth
                className="flex-col h-auto py-6"
                href={action.href}
              >
                <span className="text-3xl mb-2">{action.icon}</span>
                <span className="font-semibold">{action.title}</span>
                <span className="text-xs text-white/50 normal-case tracking-normal mt-1">
                  {action.desc}
                </span>
              </NebulaButton>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
