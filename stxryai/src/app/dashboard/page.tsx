'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NebulaCard } from '@/components/nebula/NebulaCard';
import { NebulaButton } from '@/components/nebula/NebulaButton';
import { NebulaTitle, AnimatedCounter } from '@/components/nebula/NebulaText';
import {
  BookOpen,
  PenTool,
  TrendingUp,
  Users,
  Star,
  Clock,
  Plus,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';

/**
 * UNIFIED CREATOR DASHBOARD
 * Central hub for story creation, management, and analytics
 * Replaces the old "Story Creation Studio" with a more intuitive dashboard approach
 */

interface DashboardStats {
  totalStories: number;
  totalReads: number;
  totalLikes: number;
  activeDrafts: number;
  weeklyGrowth: number;
}

interface RecentStory {
  id: string;
  title: string;
  status: 'draft' | 'published';
  reads: number;
  lastEdited: string;
  coverImage?: string;
}

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalStories: 0,
    totalReads: 0,
    totalLikes: 0,
    activeDrafts: 0,
    weeklyGrowth: 0,
  });
  const [recentStories, setRecentStories] = useState<RecentStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    // TODO: Replace with real Supabase queries
    // Placeholder data for now
    setStats({
      totalStories: 12,
      totalReads: 1547,
      totalLikes: 234,
      activeDrafts: 3,
      weeklyGrowth: 24,
    });

    setRecentStories([
      {
        id: '1',
        title: 'The Dragon\'s Secret',
        status: 'published',
        reads: 456,
        lastEdited: '2 hours ago',
      },
      {
        id: '2',
        title: 'Mystery of the Lost Kingdom',
        status: 'draft',
        reads: 0,
        lastEdited: '1 day ago',
      },
      {
        id: '3',
        title: 'Space Adventure Chronicles',
        status: 'published',
        reads: 789,
        lastEdited: '3 days ago',
      },
    ]);

    setLoading(false);
  };

  const quickActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'New Story',
      description: 'Start from scratch',
      href: '/dashboard/create',
      color: 'cyan',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'AI Assistant',
      description: 'Get AI help',
      href: '/dashboard/create?ai=true',
      color: 'violet',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Templates',
      description: 'Use a template',
      href: '/dashboard/templates',
      color: 'pink',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Series',
      description: 'Manage series',
      href: '/writers-desk',
      color: 'gold',
    },
  ];

  const statCards = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Total Stories',
      value: stats.totalStories,
      color: 'cyan',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Total Reads',
      value: stats.totalReads,
      color: 'violet',
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: 'Total Likes',
      value: stats.totalLikes,
      color: 'pink',
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      label: 'Active Drafts',
      value: stats.activeDrafts,
      color: 'gold',
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spectral-cyan mx-auto mb-4"></div>
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-absolute">
      <div className="container-void py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <NebulaTitle size="md" gradient="aurora">
              Creator Dashboard
            </NebulaTitle>
            <p className="text-white/60 mt-2">
              Welcome back! Ready to create something amazing?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NebulaButton
              variant="ghost"
              icon={<BarChart3 className="w-4 h-4" />}
              href="/dashboard/analytics"
            >
              Analytics
            </NebulaButton>
            <NebulaButton
              variant="ghost"
              icon={<Settings className="w-4 h-4" />}
              href="/dashboard/settings"
            >
              Settings
            </NebulaButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NebulaCard glowColor={stat.color as any}>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}
                  >
                    <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">
                      <AnimatedCounter end={stat.value} />
                    </p>
                  </div>
                </div>
              </NebulaCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-spectral-cyan" />
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <NebulaCard
                  glowColor={action.color as any}
                  hover3D
                  className="cursor-pointer h-full"
                  onClick={() => router.push(action.href)}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-${action.color}-500/20`}
                    >
                      <div className={`text-${action.color}-400`}>{action.icon}</div>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{action.label}</h3>
                    <p className="text-sm text-white/50">{action.description}</p>
                  </div>
                </NebulaCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Stories */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-spectral-violet" />
              Recent Stories
            </h2>
            <NebulaButton variant="ghost" size="sm" href="/dashboard/stories">
              View All
            </NebulaButton>
          </div>

          <div className="space-y-3">
            {recentStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <NebulaCard hover3D className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Story Icon/Cover */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-spectral-cyan/20 to-spectral-violet/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-spectral-cyan" />
                    </div>

                    {/* Story Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 truncate">{story.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            story.status === 'published'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {story.status}
                        </span>
                        {story.status === 'published' && (
                          <span className="text-white/40">{story.reads} reads</span>
                        )}
                        <span className="text-white/40">• {story.lastEdited}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <NebulaButton
                        size="sm"
                        variant="ghost"
                        href={`/dashboard/edit/${story.id}`}
                      >
                        Edit
                      </NebulaButton>
                    </div>
                  </div>
                </NebulaCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Growth Insight */}
        <section>
          <NebulaCard glowColor="violet" className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Your stories are growing! 🎉
                </h3>
                <p className="text-white/60 mb-3">
                  You've seen a <span className="text-green-400 font-semibold">+{stats.weeklyGrowth}%</span> increase in reads this week.
                  Keep up the great work!
                </p>
                <NebulaButton size="sm" href="/dashboard/analytics">
                  View Detailed Analytics
                </NebulaButton>
              </div>
            </div>
          </NebulaCard>
        </section>
      </div>
    </div>
  );
}
