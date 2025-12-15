'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  isEdited?: boolean;
}

interface CommentSystemProps {
  storyId: string;
  comments: Comment[];
  currentUserId?: string;
  onPostComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CommentSystem({
  storyId,
  comments,
  currentUserId,
  onPostComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  isLoading = false
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      await onPostComment(newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await onEditComment(commentId, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="ChatBubbleLeftRightIcon" size={28} />
          Comments ({comments.length})
        </h2>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* New Comment Input */}
      {currentUserId && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/500 characters
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostComment}
              disabled={!newComment.trim() || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isLoading ? 'Posting...' : 'Post Comment'}
            </motion.button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isEditing={editingId === comment.id}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onStartEdit={() => startEditing(comment)}
              onSaveEdit={() => handleEditComment(comment.id)}
              onCancelEdit={cancelEditing}
              onDelete={() => onDeleteComment(comment.id)}
              onLike={() => onLikeComment(comment.id)}
              onReply={() => setReplyingTo(comment.id)}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="py-12 text-center">
          <Icon name="ChatBubbleLeftRightIcon" size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground mb-2">No comments yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onLike: () => void;
  onReply: () => void;
  formatTimeAgo: (date: Date) => string;
}

import ReportModal from '@/components/moderation/ReportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

export interface Comment {
//... (rest of the file is the same)

function CommentCard({
  comment,
  currentUserId,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onLike,
  onReply,
  formatTimeAgo
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const isOwner = currentUserId === comment.userId;

  return (
    <>
      <motion.div variants={slideUp} className="group">
        <div className="flex gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt={comment.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                comment.displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{comment.displayName}</span>
              <span className="text-xs text-muted-foreground">@{comment.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  rows={3}
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSaveEdit}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancelEdit}
                    className="px-3 py-1 bg-muted text-foreground rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <p className="text-foreground mb-2 whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLike}
                className={`flex items-center gap-1 text-sm ${
                  comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                } transition-colors`}
              >
                <Icon
                  name="HeartIcon"
                  size={16}
                  variant={comment.isLiked ? 'solid' : 'outline'}
                />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReply}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon name="ChatBubbleLeftIcon" size={16} />
                Reply
              </motion.button>

              {!isOwner && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Icon name="FlagIcon" size={16} />
                  Report
                </motion.button>
              )}

              {isOwner && !isEditing && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onStartEdit}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon name="PencilIcon" size={16} />
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onDelete}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Icon name="TrashIcon" size={16} />
                    Delete
                  </motion.button>
                </>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-primary hover:underline"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>

                <AnimatePresence>
                  {showReplies && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 mt-3 space-y-3 border-l-2 border-border pl-4"
                    >
                      {comment.replies.map((reply) => (
                        <CommentCard
                          key={reply.id}
                          comment={reply}
                          currentUserId={currentUserId}
                          isEditing={false}
                          editContent=""
                          onEditContentChange={() => {}}
                          onStartEdit={() => {}}
                          onSaveEdit={() => {}}
                          onCancelEdit={() => {}}
                          onDelete={() => {}}
                          onLike={() => {}}
                          onReply={() => {}}
                          formatTimeAgo={formatTimeAgo}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contentId={comment.id}
        contentType="comment"
      />
    </>
  );
}