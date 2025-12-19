'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { chapterCommentService, type ChapterComment, type ChapterCommentStats } from '@/services/chapterCommentService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface ChapterCommentsProps {
  chapterId: string;
  className?: string;
}

export function ChapterComments({ chapterId, className = '' }: ChapterCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [stats, setStats] = useState<ChapterCommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked' | 'most_replies'>('newest');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
    loadStats();
  }, [chapterId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await chapterCommentService.getChapterComments(chapterId, {
        parentId: null,
        sortBy,
      });
      setComments(data);

      // Load liked status for all comments
      if (user) {
        const likedSet = new Set<string>();
        await Promise.all(
          data.map(async (comment) => {
            const liked = await chapterCommentService.hasUserLiked(comment.id, user.id);
            if (liked) likedSet.add(comment.id);
          })
        );
        setLikedComments(likedSet);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await chapterCommentService.getChapterStats(chapterId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      await chapterCommentService.createComment(chapterId, user.id, {
        content: newComment,
      });
      setNewComment('');
      toast.success('Comment posted!');
      loadComments();
      loadStats();
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      toast.error(error.message || 'Failed to post comment');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      await chapterCommentService.createComment(chapterId, user.id, {
        content: replyContent,
        parentCommentId: parentId,
      });
      setReplyingTo(null);
      setReplyContent('');
      toast.success('Reply posted!');
      loadComments();
      loadStats();
    } catch (error: any) {
      console.error('Failed to post reply:', error);
      toast.error(error.message || 'Failed to post reply');
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Please log in to like comments');
      return;
    }

    try {
      const isLiked = likedComments.has(commentId);
      if (isLiked) {
        await chapterCommentService.unlikeComment(commentId, user.id);
        setLikedComments((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      } else {
        await chapterCommentService.likeComment(commentId, user.id);
        setLikedComments((prev) => new Set(prev).add(commentId));
      }
      loadComments();
    } catch (error: any) {
      console.error('Failed to like comment:', error);
      toast.error(error.message || 'Failed to like comment');
    }
  };

  const loadReplies = async (commentId: string) => {
    if (expandedReplies.has(commentId)) {
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
      return;
    }

    setExpandedReplies((prev) => new Set(prev).add(commentId));
  };

  if (loading && comments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="ChatBubbleLeftRightIcon" size={24} />
            Chapter Discussion
          </h3>
          {stats && (
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalComments} comments • {stats.uniqueCommenters} participants
              {stats.authorReplies > 0 && ` • ${stats.authorReplies} author replies`}
            </p>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_liked">Most Liked</option>
          <option value="most_replies">Most Replies</option>
        </select>
      </div>

      {/* New Comment Form */}
      {user && (
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this chapter..."
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none mb-3"
          />
          <div className="flex justify-end">
            <motion.button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
            </motion.button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
            <Icon name="ChatBubbleLeftRightIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              index={index}
              user={user}
              isLiked={likedComments.has(comment.id)}
              isReplying={replyingTo === comment.id}
              replyContent={replyContent}
              onReplyChange={setReplyContent}
              onReply={() => setReplyingTo(comment.id)}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
              onSubmitReply={() => handleReply(comment.id)}
              onLike={() => handleLike(comment.id)}
              onToggleReplies={() => loadReplies(comment.id)}
              isExpanded={expandedReplies.has(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: ChapterComment;
  index: number;
  user: any;
  isLiked: boolean;
  isReplying: boolean;
  replyContent: string;
  onReplyChange: (content: string) => void;
  onReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onLike: () => void;
  onToggleReplies: () => void;
  isExpanded: boolean;
}

function CommentItem({
  comment,
  index,
  user,
  isLiked,
  isReplying,
  replyContent,
  onReplyChange,
  onReply,
  onCancelReply,
  onSubmitReply,
  onLike,
  onToggleReplies,
  isExpanded,
}: CommentItemProps) {
  const [replies, setReplies] = useState<ChapterComment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (isExpanded && comment.replyCount > 0) {
      loadReplies();
    }
  }, [isExpanded, comment.id]);

  const loadReplies = async () => {
    try {
      setLoadingReplies(true);
      const data = await chapterCommentService.getReplies(comment.id);
      setReplies(data);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-card border-2 border-border rounded-xl p-4 ${
        comment.isPinned ? 'border-yellow-400 dark:border-yellow-600' : ''
      }`}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {comment.isPinned && (
            <Icon name="PinIcon" size={16} className="text-yellow-500" />
          )}
          {comment.authorReplied && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              Author Replied
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Comment Content */}
      <div className="mb-3">
        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
        {comment.isEdited && (
          <span className="text-xs text-muted-foreground">(edited)</span>
        )}
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 transition-colors ${
            isLiked
              ? 'text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name={isLiked ? 'HeartIcon' : 'HeartIcon'} size={18} />
          <span>{comment.likeCount}</span>
        </button>

        <button
          onClick={onToggleReplies}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name="ChatBubbleLeftIcon" size={18} />
          <span>{comment.replyCount} replies</span>
        </button>

        {user && (
          <button
            onClick={onReply}
            className="text-muted-foreground hover:text-foreground"
          >
            Reply
          </button>
        )}
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <textarea
              value={replyContent}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancelReply}
                className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={onSubmitReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                Post Reply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border space-y-3"
          >
            {loadingReplies ? (
              <div className="text-center py-4 text-muted-foreground">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No replies yet</div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="pl-4 border-l-2 border-border">
                  <div className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <button
                      onClick={() => onLike()}
                      className="flex items-center gap-1"
                    >
                      <Icon name="HeartIcon" size={14} />
                      <span>{reply.likeCount}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

