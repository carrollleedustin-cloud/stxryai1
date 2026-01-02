'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface StoryAnalytics {
  storyId: string;
  title: string;
  views: number;
  reads: number;
  completions: number;
  averageRating: number;
  averageReadingTime: number;
  popularChoices: Array<{ choice: string; count: number; percentage: number }>;
  dropOffPoints: Array<{ chapter: string; percentage: number }>;
  engagementScore: number;
}

interface CreatorAnalyticsProps {
  userId: string;
  timeframe?: '7d' | '30d' | '90d' | 'all';
}

export function CreatorAnalytics({ userId, timeframe: initialTimeframe = '30d' }: CreatorAnalyticsProps) {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>(initialTimeframe);

  // Mock data - replace with actual API calls
  const overallStats = {
    totalStories: 12,
    totalViews: 15420,
    totalReads: 8930,
    totalCompletions: 3420,
    averageRating: 4.6,
    totalRevenue: 0,
    followers: 234,
  };

  const stories: StoryAnalytics[] = [];

  const metrics = [
    {
      label: 'Total Views',
      value: overallStats.totalViews.toLocaleString(),
      icon: '👁️',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      label: 'Total Reads',
      value: overallStats.totalReads.toLocaleString(),
      icon: '📖',
      change: '+8%',
      trend: 'up' as const,
    },
    {
      label: 'Completions',
      value: overallStats.totalCompletions.toLocaleString(),
      icon: '✅',
      change: '+15%',
      trend: 'up' as const,
    },
    {
      label: 'Avg. Rating',
      value: overallStats.averageRating.toFixed(1),
      icon: '⭐',
      change: '+0.2',
      trend: 'up' as const,
    },
    {
      label: 'Followers',
      value: overallStats.followers.toLocaleString(),
      icon: '👥',
      change: '+23',
      trend: 'up' as const,
    },
    {
      label: 'Engagement',
      value: '87%',
      icon: '📊',
      change: '+5%',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>📊</span>
            Creator Analytics
          </h2>
          <p className="text-muted-foreground">Track your story performance and reader engagement</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {tf === 'all' ? 'All Time' : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{metric.icon}</div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <Icon
                  name={metric.trend === 'up' ? 'ArrowUpIcon' : 'ArrowDownIcon'}
                  size={16}
                />
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Story Performance */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Story Performance</h3>
        <div className="space-y-4">
          {stories.map((story) => (
            <motion.div
              key={story.storyId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedStory(story.storyId)}
              className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{story.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>👁️ {story.views.toLocaleString()} views</span>
                    <span>📖 {story.reads.toLocaleString()} reads</span>
                    <span>✅ {story.completions.toLocaleString()} completions</span>
                    <span>⭐ {story.averageRating.toFixed(1)} rating</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{story.engagementScore}%</div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
              </div>

              {/* Popular Choices */}
              {story.popularChoices.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Most Popular Choices</p>
                  <div className="space-y-2">
                    {story.popularChoices.slice(0, 3).map((choice, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground">{choice.choice}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {choice.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${choice.percentage}%` }}
                              transition={{ delay: idx * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Story View */}
      {selectedStory && (
        <StoryDetailView
          storyId={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}

function StoryDetailView({
  storyId,
  onClose,
}: {
  storyId: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Detailed Analytics</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <Icon name="XMarkIcon" size={20} />
        </button>
      </div>
      {/* Detailed analytics would go here */}
    </motion.div>
  );
}

