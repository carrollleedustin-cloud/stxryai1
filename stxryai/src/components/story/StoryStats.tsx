'use client';

import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

interface StoryStatsProps {
  views: number;
  likes: number;
  bookmarks: number;
  completions: number;
  averageRating: number;
  totalRatings: number;
  comments: number;
  shares: number;
  readTime: number;
  wordCount: number;
  chapters: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  genre?: string;
  tags?: string[];
  createdDate: Date;
  lastUpdated: Date;
}

export default function StoryStats({
  views,
  likes,
  bookmarks,
  completions,
  averageRating,
  totalRatings,
  comments,
  shares,
  readTime,
  wordCount,
  chapters,
  difficulty = 'medium',
  genre,
  tags = [],
  createdDate,
  lastUpdated,
}: StoryStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const difficultyConfig = {
    easy: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Easy Read' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Moderate' },
    hard: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Challenging' },
  };

  const difficultyInfo = difficultyConfig[difficulty];

  const mainStats = [
    { icon: 'EyeIcon', label: 'Views', value: formatNumber(views), color: 'text-blue-500' },
    { icon: 'HeartIcon', label: 'Likes', value: formatNumber(likes), color: 'text-red-500' },
    {
      icon: 'BookmarkIcon',
      label: 'Bookmarks',
      value: formatNumber(bookmarks),
      color: 'text-purple-500',
    },
    {
      icon: 'CheckCircleIcon',
      label: 'Completions',
      value: formatNumber(completions),
      color: 'text-green-500',
    },
  ];

  const engagementStats = [
    {
      icon: 'StarIcon',
      label: 'Rating',
      value: `${averageRating.toFixed(1)} (${formatNumber(totalRatings)})`,
      color: 'text-yellow-500',
    },
    {
      icon: 'ChatBubbleLeftIcon',
      label: 'Comments',
      value: formatNumber(comments),
      color: 'text-blue-500',
    },
    { icon: 'ShareIcon', label: 'Shares', value: formatNumber(shares), color: 'text-green-500' },
  ];

  const contentStats = [
    { icon: 'ClockIcon', label: 'Read Time', value: `${readTime} min`, color: 'text-orange-500' },
    {
      icon: 'DocumentTextIcon',
      label: 'Words',
      value: formatNumber(wordCount),
      color: 'text-purple-500',
    },
    { icon: 'BookOpenIcon', label: 'Chapters', value: chapters.toString(), color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={slideUp}
            whileHover={{ scale: 1.05, y: -4 }}
            className="bg-card border border-border rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-lg ${stat.color.replace('text', 'bg')}/10 flex items-center justify-center`}
              >
                <Icon name={stat.icon} size={20} className={stat.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Stats */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="ChartBarIcon" size={20} className="text-primary" />
          Detailed Statistics
        </h3>

        <div className="space-y-6">
          {/* Engagement */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Engagement</h4>
            <div className="grid grid-cols-3 gap-3">
              {engagementStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <Icon name={stat.icon} size={16} className={stat.color} />
                  <div>
                    <div className="text-sm font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Info */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Content</h4>
            <div className="grid grid-cols-3 gap-3">
              {contentStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <Icon name={stat.icon} size={16} className={stat.color} />
                  <div>
                    <div className="text-sm font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Metadata</h4>
            <div className="space-y-3">
              {/* Difficulty & Genre */}
              <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1.5 ${difficultyInfo.bg} rounded-lg`}>
                  <span className={`text-sm font-semibold ${difficultyInfo.color}`}>
                    {difficultyInfo.label}
                  </span>
                </div>
                {genre && (
                  <div className="px-3 py-1.5 bg-primary/10 rounded-lg">
                    <span className="text-sm font-semibold text-primary">{genre}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div key={tag} className="px-2 py-1 bg-muted border border-border rounded-lg">
                      <span className="text-xs text-foreground">#{tag}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CalendarIcon" size={14} />
                  <span>Created: {formatDate(createdDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="ArrowPathIcon" size={14} />
                  <span>Updated: {formatDate(lastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
