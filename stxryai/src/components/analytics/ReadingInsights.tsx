'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ReadingInsight {
  id: string;
  type: 'trend' | 'achievement' | 'milestone' | 'recommendation';
  title: string;
  description: string;
  value?: string | number;
  icon: string;
  color: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ReadingInsightsProps {
  insights: ReadingInsight[];
  className?: string;
}

export function ReadingInsights({ insights, className = '' }: ReadingInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Insights', icon: '📊' },
    { id: 'trend', label: 'Trends', icon: '📈' },
    { id: 'achievement', label: 'Achievements', icon: '🏆' },
    { id: 'milestone', label: 'Milestones', icon: '🎯' },
    { id: 'recommendation', label: 'Recommendations', icon: '💡' },
  ];

  const filteredInsights = selectedCategory
    ? insights.filter((i) => i.type === selectedCategory)
    : insights;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>💡</span>
            Reading Insights
          </h2>
          <p className="text-muted-foreground">Discover patterns in your reading habits</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              (selectedCategory === null && category.id === 'all') ||
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            <span>{category.icon}</span>
            {category.label}
          </motion.button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-card border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
              insight.type === 'achievement'
                ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                : insight.type === 'milestone'
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center text-2xl`}>
                {insight.icon}
              </div>
              {insight.value !== undefined && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{insight.value}</div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">{insight.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>

            {insight.action && (
              <motion.button
                onClick={insight.action.onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
              >
                {insight.action.label}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No insights available yet. Keep reading to unlock insights!</p>
        </div>
      )}
    </div>
  );
}

// Pre-built insight generators
export function generateReadingInsights(data: {
  totalStoriesRead: number;
  totalReadingTime: number;
  favoriteGenre?: string;
  averageRating?: number;
  currentStreak?: number;
  longestStreak?: number;
}): ReadingInsight[] {
  const insights: ReadingInsight[] = [];

  // Milestones
  if (data.totalStoriesRead >= 10) {
    insights.push({
      id: 'milestone-10',
      type: 'milestone',
      title: '10 Stories Read!',
      description: 'You\'ve completed 10 stories. Keep up the great reading!',
      value: '10',
      icon: '🎉',
      color: 'from-green-500 to-emerald-500',
    });
  }

  if (data.totalStoriesRead >= 50) {
    insights.push({
      id: 'milestone-50',
      type: 'milestone',
      title: '50 Stories Milestone!',
      description: 'You\'re a dedicated reader! 50 stories completed.',
      value: '50',
      icon: '🌟',
      color: 'from-purple-500 to-pink-500',
    });
  }

  // Trends
  if (data.favoriteGenre) {
    insights.push({
      id: 'favorite-genre',
      type: 'trend',
      title: 'Favorite Genre',
      description: `You love ${data.favoriteGenre} stories! Most of your reads are in this genre.`,
      value: data.favoriteGenre,
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
    });
  }

  // Achievements
  if (data.currentStreak && data.currentStreak >= 7) {
    insights.push({
      id: 'week-streak',
      type: 'achievement',
      title: 'Week Streak!',
      description: `You've read for ${data.currentStreak} days in a row. Amazing dedication!`,
      value: `${data.currentStreak} days`,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
    });
  }

  // Recommendations
  insights.push({
    id: 'reading-time',
    type: 'recommendation',
    title: 'Reading Time',
    description: `You've spent ${Math.round(data.totalReadingTime / 60)} hours reading. That's impressive!`,
    value: `${Math.round(data.totalReadingTime / 60)}h`,
    icon: '⏱️',
    color: 'from-indigo-500 to-purple-500',
    action: {
      label: 'View Stats',
      onClick: () => {},
    },
  });

  return insights;
}
