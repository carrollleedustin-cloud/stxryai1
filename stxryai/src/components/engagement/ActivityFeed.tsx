'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  activityFeedService,
  ActivityFeedItem,
  ActivityType,
} from '@/services/activityFeedService';
import { getRelativeTime } from '@/lib/utils';

// ========================================
// TYPES
// ========================================

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
  showFilters?: boolean;
  friendsOnly?: boolean;
  compact?: boolean;
}

// ========================================
// ACTIVITY TYPE CONFIG
// ========================================

const ACTIVITY_CONFIG: Record<ActivityType, { icon: string; color: string; bgColor: string }> = {
  story_started: { icon: '📖', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  story_completed: { icon: '🏁', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  chapter_read: { icon: '📑', color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
  choice_made: { icon: '🔀', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  achievement_earned: { icon: '🏆', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  level_up: { icon: '⬆️', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  streak_milestone: { icon: '🔥', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  challenge_completed: { icon: '🎯', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  review_posted: { icon: '✍️', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  friend_added: { icon: '🤝', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  club_joined: { icon: '👥', color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  story_bookmarked: { icon: '🔖', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  story_liked: { icon: '❤️', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

const FILTER_OPTIONS: Array<{ label: string; types: ActivityType[] }> = [
  { label: 'All', types: [] },
  { label: 'Reading', types: ['story_started', 'story_completed', 'chapter_read'] },
  {
    label: 'Achievements',
    types: ['achievement_earned', 'level_up', 'streak_milestone', 'challenge_completed'],
  },
  { label: 'Social', types: ['friend_added', 'club_joined', 'review_posted'] },
];

// ========================================
// COMPONENT
// ========================================

export function ActivityFeed({
  className = '',
  maxItems = 20,
  showFilters = true,
  friendsOnly = false,
  compact = false,
}: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<number>(0);

  const fetchActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const filterTypes = FILTER_OPTIONS[activeFilter].types;
      const data = await activityFeedService.getFeed(user.id, {
        types: filterTypes.length > 0 ? filterTypes : undefined,
        friendsOnly,
        limit: maxItems,
      });

      setActivities(data);
    } catch (err) {
      console.error('Error fetching activity feed:', err);
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeFilter, friendsOnly, maxItems]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = activityFeedService.subscribeToFeed(user.id, (newActivity) => {
      setActivities((prev) => [newActivity, ...prev.slice(0, maxItems - 1)]);
    });

    return () => unsubscribe();
  }, [user?.id, maxItems]);

  if (!user) {
    return (
      <div className={`rounded-xl bg-void-900/50 border border-void-800 p-6 ${className}`}>
        <p className="text-center text-void-400">Sign in to see activity</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-void-900/50 border border-void-800 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-void-800 flex items-center justify-between">
        <h3 className="font-semibold text-void-100 flex items-center gap-2">
          <span className="text-xl">📡</span>
          Activity Feed
        </h3>
        <button
          onClick={fetchActivities}
          className="p-2 rounded-lg hover:bg-void-800 transition-colors text-void-400 hover:text-void-100"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-2 border-b border-void-800 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_OPTIONS.map((filter, index) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(index)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === index
                  ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                  : 'bg-void-800/50 text-void-400 border border-transparent hover:text-void-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`${compact ? 'max-h-80' : 'max-h-[500px]'} overflow-y-auto`}>
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-10 h-10 rounded-full bg-void-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-void-800 rounded w-3/4" />
                  <div className="h-3 bg-void-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchActivities}
              className="text-spectral-cyan hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-void-400">
            <p className="text-2xl mb-2">🦗</p>
            <p>No activity yet</p>
            <p className="text-sm mt-1">Start reading to see your activity here!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} compact={compact} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="px-4 py-3 border-t border-void-800">
          <Link
            href="/community-hub"
            className="text-sm text-spectral-cyan hover:underline flex items-center justify-center gap-1"
          >
            View all activity
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

// ========================================
// ACTIVITY ITEM COMPONENT
// ========================================

interface ActivityItemProps {
  activity: ActivityFeedItem;
  compact?: boolean;
  index: number;
}

function ActivityItem({ activity, compact, index }: ActivityItemProps) {
  const { user } = useAuth();
  const config = ACTIVITY_CONFIG[activity.activityType];
  const storyUrl = activity.metadata.storyId
    ? `/story-reader?id=${activity.metadata.storyId}`
    : null;

  const [hasLiked, setHasLiked] = useState(activity.hasLiked || false);
  const [likesCount, setLikesCount] = useState(activity.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState(activity.comments || []);

  const handleLike = async () => {
    if (!user) return;
    const result = await activityFeedService.likeActivity(user.id, activity.id);
    setHasLiked(result.liked);
    setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentContent.trim()) return;

    const newComment = await activityFeedService.addComment(user.id, activity.id, commentContent);
    setComments((prev) => [...prev, newComment]);
    setCommentContent('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`
        border-b border-void-800/50 last:border-b-0 hover:bg-void-800/30 transition-colors
        ${compact ? 'px-3 py-2' : 'px-4 py-3'}
      `}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {activity.userAvatar ? (
            <img
              src={activity.userAvatar}
              alt={activity.username}
              className={`rounded-full object-cover ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
            />
          ) : (
            <div
              className={`rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-950 font-bold ${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}`}
            >
              {activity.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-void-100 ${compact ? 'text-sm' : ''}`}>
                <span className="font-medium">{activity.username}</span>
                <span className="text-void-400 ml-1">{activity.description}</span>
              </p>

              {/* Story preview */}
              {activity.metadata.storyTitle && storyUrl && !compact && (
                <Link
                  href={storyUrl}
                  className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-void-800/50 hover:bg-void-800 transition-colors group"
                >
                  {activity.metadata.storyCover && (
                    <img
                      src={activity.metadata.storyCover as string}
                      alt=""
                      className="w-12 h-16 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-void-200 group-hover:text-spectral-cyan transition-colors truncate">
                      {activity.metadata.storyTitle}
                    </p>
                    <p className="text-xs text-void-500">Click to read</p>
                  </div>
                </Link>
              )}

              {/* Achievement preview */}
              {activity.metadata.achievementName && !compact && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-2xl">{activity.metadata.achievementIcon || '🏆'}</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      {activity.metadata.achievementName}
                    </p>
                    {activity.metadata.xpEarned && (
                      <p className="text-xs text-void-400">+{activity.metadata.xpEarned} XP</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Activity type icon */}
            <div className={`flex-shrink-0 p-1.5 rounded-full ${config.bgColor}`}>
              <span className={compact ? 'text-sm' : 'text-base'}>{config.icon}</span>
            </div>
          </div>

          {/* Social Interactions */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                hasLiked ? 'text-red-400' : 'text-void-400 hover:text-void-100'
              }`}
            >
              <svg
                className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likesCount > 0 && <span>{likesCount}</span>}
              {compact ? '' : 'Like'}
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs text-void-400 hover:text-void-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {comments.length > 0 && <span>{comments.length}</span>}
              {compact ? '' : 'Comment'}
            </button>

            <div className="flex-1" />

            <span className="text-[10px] text-void-500 font-mono uppercase tracking-wider">
              {getRelativeTime(activity.createdAt)}
            </span>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="space-y-3 pt-3 border-t border-void-800/50">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="flex-shrink-0">
                        {comment.userAvatar ? (
                          <img
                            src={comment.userAvatar}
                            alt={comment.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-void-800 flex items-center justify-center text-[10px] text-void-300">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-void-900/50 rounded-lg p-2 text-xs">
                        <p className="font-medium text-void-200 mb-0.5">{comment.username}</p>
                        <p className="text-void-400">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1 bg-void-950 border border-void-800 rounded-lg px-3 py-1.5 text-xs text-void-100 focus:outline-none focus:border-spectral-cyan/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!commentContent.trim()}
                      className="px-3 py-1.5 bg-void-800 hover:bg-void-700 disabled:opacity-50 text-void-100 rounded-lg text-xs transition-colors"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default ActivityFeed;
