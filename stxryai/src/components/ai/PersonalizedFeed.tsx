'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';
import { Recommendation } from '@/lib/ai/recommendationEngine';

interface Story {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  coverImage?: string;
  genre: string;
  tags: string[];
  description: string;
  rating: number;
  totalRatings: number;
  views: number;
  readTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isNew?: boolean;
  isTrending?: boolean;
  isBookmarked?: boolean;
}

interface PersonalizedFeedProps {
  recommendations: (Recommendation & { story: Story })[];
  onStoryClick: (storyId: string) => void;
  onBookmark?: (storyId: string) => void;
  onDismiss?: (storyId: string) => void;
  loading?: boolean;
}

export default function PersonalizedFeed({
  recommendations,
  onStoryClick,
  onBookmark,
  onDismiss,
  loading = false
}: PersonalizedFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'personalized' | 'trending' | 'new'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'For You', icon: 'SparklesIcon', color: 'text-purple-500' },
    { id: 'personalized', label: 'Personalized', icon: 'UserIcon', color: 'text-blue-500' },
    { id: 'trending', label: 'Trending', icon: 'FireIcon', color: 'text-orange-500' },
    { id: 'new', label: 'New Releases', icon: 'BoltIcon', color: 'text-green-500' }
  ];

  const filteredRecommendations = recommendations
    .filter(rec => !dismissedIds.has(rec.story.id))
    .filter(rec => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'personalized') return rec.category === 'personalized';
      if (selectedCategory === 'trending') return rec.story.isTrending;
      if (selectedCategory === 'new') return rec.story.isNew;
      return true;
    });

  const handleDismiss = (storyId: string) => {
    setDismissedIds(prev => new Set(prev).add(storyId));
    onDismiss?.(storyId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCategoryBadge = (rec: Recommendation & { story: Story }) => {
    if (rec.story.isNew) return { label: 'NEW', color: 'from-green-500 to-emerald-500' };
    if (rec.story.isTrending) return { label: 'TRENDING', color: 'from-orange-500 to-red-500' };
    if (rec.category === 'personalized') return { label: 'FOR YOU', color: 'from-purple-500 to-pink-500' };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icon name="SparklesIcon" size={28} className="text-purple-500" />
            Your Personalized Feed
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stories curated just for you based on your preferences
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id as typeof selectedCategory)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon name={category.icon} size={16} className={selectedCategory === category.id ? '' : category.color} />
            {category.label}
          </motion.button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="w-full h-48 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Icon name="InformationCircleIcon" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-2">No recommendations available</h3>
          <p className="text-sm text-muted-foreground">
            Try reading more stories to get personalized recommendations
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRecommendations.map((rec, index) => {
            const story = rec.story;
            const badge = getCategoryBadge(rec);

            return (
              <motion.div
                key={story.id}
                variants={slideUp}
                whileHover={{ y: -8 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => onStoryClick(story.id)}
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📚
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                    {badge && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`px-2 py-1 bg-gradient-to-r ${badge.color} rounded-full shadow-lg`}
                      >
                        <span className="text-xs font-bold text-white">{badge.label}</span>
                      </motion.div>
                    )}

                    {/* Dismiss Button */}
                    {onDismiss && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(story.id);
                        }}
                        className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors"
                      >
                        <Icon name="XMarkIcon" size={14} className="text-white" />
                      </motion.button>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  {onBookmark && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(story.id);
                      }}
                      className="absolute bottom-2 right-2 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors"
                    >
                      <Icon
                        name="BookmarkIcon"
                        size={16}
                        variant={story.isBookmarked ? 'solid' : 'outline'}
                        className={story.isBookmarked ? 'text-yellow-500' : 'text-white'}
                      />
                    </motion.button>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title & Author */}
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {story.authorAvatar ? (
                      <img
                        src={story.authorAvatar}
                        alt={story.author}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white">
                        {story.author[0]}
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground">{story.author}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="StarIcon" size={12} variant="solid" className="text-yellow-500" />
                      <span className="font-medium text-foreground">{story.rating.toFixed(1)}</span>
                      <span>({formatNumber(story.totalRatings)})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="EyeIcon" size={12} />
                      <span>{formatNumber(story.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="ClockIcon" size={12} />
                      <span>{story.readTime}m</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.description}
                  </p>

                  {/* Tags & Genre */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {story.genre}
                    </span>
                    {story.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Recommendation Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Icon name="SparklesIcon" size={14} className="text-purple-500" />
                      <span className="text-xs text-muted-foreground">{rec.reason}</span>
                    </div>
                    <div className={`text-xs font-medium ${getDifficultyColor(story.difficulty)}`}>
                      {story.difficulty.toUpperCase()}
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.confidence * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Load More */}
      {!loading && filteredRecommendations.length > 0 && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <Icon name="ArrowPathIcon" size={16} />
            Load More Recommendations
          </motion.button>
        </div>
      )}
    </div>
  );
}
