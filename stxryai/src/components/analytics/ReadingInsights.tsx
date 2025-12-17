'use client';

import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

interface ReadingInsight {
  id: string;
  type: 'achievement' | 'milestone' | 'recommendation' | 'pattern' | 'comparison';
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
  actionUrl?: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
  color: string;
}

interface ReadingPattern {
  bestDay: string;
  bestTime: string;
  averageSession: number;
  preferredLength: 'short' | 'medium' | 'long';
  readingSpeed: number; // words per minute
  consistency: number; // 0-100
}

interface ReadingInsightsProps {
  insights: ReadingInsight[];
  genreDistribution: GenreStats[];
  readingPattern: ReadingPattern;
  totalBooks: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  completionRate: number;
}

export default function ReadingInsights({
  insights,
  genreDistribution,
  readingPattern,
  totalBooks,
  totalMinutes,
  currentStreak,
  longestStreak,
  averageRating,
  completionRate,
}: ReadingInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'TrophyIcon';
      case 'milestone':
        return 'FlagIcon';
      case 'recommendation':
        return 'LightBulbIcon';
      case 'pattern':
        return 'ChartBarIcon';
      case 'comparison':
        return 'ScaleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-yellow-500 to-orange-500';
      case 'milestone':
        return 'from-purple-500 to-pink-500';
      case 'recommendation':
        return 'from-blue-500 to-cyan-500';
      case 'pattern':
        return 'from-green-500 to-emerald-500';
      case 'comparison':
        return 'from-indigo-500 to-violet-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return { icon: 'ArrowTrendingUpIcon', color: 'text-green-500' };
      case 'down':
        return { icon: 'ArrowTrendingDownIcon', color: 'text-red-500' };
      case 'stable':
        return { icon: 'MinusIcon', color: 'text-yellow-500' };
      default:
        return null;
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPreferredLengthLabel = (length: string): string => {
    switch (length) {
      case 'short':
        return 'Quick Reads (< 30min)';
      case 'medium':
        return 'Medium Stories (30-60min)';
      case 'long':
        return 'Epic Tales (> 60min)';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Books Read',
            value: totalBooks.toString(),
            icon: 'BookOpenIcon',
            color: 'text-blue-500',
          },
          {
            label: 'Total Time',
            value: formatTime(totalMinutes),
            icon: 'ClockIcon',
            color: 'text-purple-500',
          },
          {
            label: 'Current Streak',
            value: `${currentStreak} days`,
            icon: 'FireIcon',
            color: 'text-orange-500',
          },
          {
            label: 'Avg Rating',
            value: averageRating.toFixed(1),
            icon: 'StarIcon',
            color: 'text-yellow-500',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={slideUp}
            className="bg-card border border-border rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${stat.color.replace('text', 'bg')}/10 flex items-center justify-center`}
              >
                <Icon name={stat.icon} size={16} className={stat.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Key Insights */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="SparklesIcon" size={20} className="text-primary" />
          Your Reading Insights
        </h3>

        <div className="space-y-3">
          {insights.map((insight, index) => {
            const trendInfo = getTrendIcon(insight.trend);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="bg-muted/50 border border-border rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${getInsightColor(insight.type)} flex items-center justify-center`}
                  >
                    <span className="text-2xl">{insight.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-foreground">{insight.title}</h4>
                      {insight.value && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                          {insight.value}
                        </span>
                      )}
                      {trendInfo && (
                        <Icon name={trendInfo.icon} size={16} className={trendInfo.color} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.actionLabel && (
                      <button className="mt-2 text-sm font-medium text-primary hover:underline">
                        {insight.actionLabel} →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reading Patterns */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="ChartPieIcon" size={20} className="text-primary" />
          Your Reading Patterns
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pattern Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CalendarIcon" size={16} className="text-blue-500" />
                <span className="text-sm text-muted-foreground">Most Active Day</span>
              </div>
              <span className="font-bold text-foreground">{readingPattern.bestDay}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="ClockIcon" size={16} className="text-purple-500" />
                <span className="text-sm text-muted-foreground">Preferred Time</span>
              </div>
              <span className="font-bold text-foreground">{readingPattern.bestTime}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="BoltIcon" size={16} className="text-yellow-500" />
                <span className="text-sm text-muted-foreground">Reading Speed</span>
              </div>
              <span className="font-bold text-foreground">{readingPattern.readingSpeed} wpm</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="BookmarkIcon" size={16} className="text-green-500" />
                <span className="text-sm text-muted-foreground">Preferred Length</span>
              </div>
              <span className="font-bold text-foreground text-xs">
                {getPreferredLengthLabel(readingPattern.preferredLength)}
              </span>
            </div>

            {/* Consistency Meter */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="ChartBarIcon" size={16} className="text-orange-500" />
                  <span className="text-sm text-muted-foreground">Consistency</span>
                </div>
                <span className="font-bold text-foreground">{readingPattern.consistency}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readingPattern.consistency}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
            </div>
          </div>

          {/* Genre Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Genre Preferences</h4>
            <div className="space-y-3">
              {genreDistribution.map((genre, index) => (
                <div key={genre.genre}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{genre.genre}</span>
                    <span className="text-sm text-muted-foreground">{genre.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${genre.percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: genre.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Genre Diversity Score */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="SparklesIcon" size={16} className="text-purple-500" />
                <span className="text-sm font-semibold text-foreground">Genre Diversity</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {genreDistribution.length >= 5
                  ? "Excellent! You're exploring many genres 🌟"
                  : genreDistribution.length >= 3
                    ? 'Good variety! Try exploring more genres 📚'
                    : 'Consider branching out to new genres 🚀'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="TrophyIcon" size={20} className="text-primary" />
          Performance Metrics
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Completion Rate */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - completionRate / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">Completion Rate</p>
            <p className="text-xs text-muted-foreground mt-1">Stories finished vs started</p>
          </div>

          {/* Streak Record */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-foreground mb-1">{longestStreak}</div>
            <p className="text-sm font-medium text-foreground">Longest Streak</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentStreak === longestStreak
                ? "You're on fire! 🎉"
                : `Current: ${currentStreak} days`}
            </p>
          </div>

          {/* Average Session */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatTime(readingPattern.averageSession)}
            </div>
            <p className="text-sm font-medium text-foreground">Avg Session</p>
            <p className="text-xs text-muted-foreground mt-1">
              {readingPattern.averageSession > 30 ? 'Deep reader 📖' : 'Quick sessions ⚡'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
