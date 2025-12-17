'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  spoiler: boolean;
}

interface Thread {
  id: string;
  title: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  tags: string[];
}

interface DiscussionThreadsProps {
  storyId: string;
  threads?: Thread[];
  onCreateThread?: (title: string, content: string, tags: string[]) => void;
  onComment?: (threadId: string, content: string, parentId?: string) => void;
  onLike?: (threadId: string) => void;
}

export default function DiscussionThreads({
  storyId,
  threads = [],
  onCreateThread,
  onComment,
  onLike,
}: DiscussionThreadsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Discussions</h2>
          <p className="text-gray-400">{threads.length} threads</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg"
        >
          + New Thread
        </motion.button>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2 mb-6">
        {['recent', 'popular', 'trending'].map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === sort
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {sort.charAt(0).toUpperCase() + sort.slice(1)}
          </button>
        ))}
      </div>

      {/* Threads List */}
      {threads.length > 0 ? (
        <div className="space-y-3">
          {threads.map((thread, index) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              index={index}
              onClick={() => setSelectedThread(thread)}
            />
          ))}
        </div>
      ) : (
        <EmptyThreads onCreate={() => setShowCreateModal(true)} />
      )}

      {/* Create Thread Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateThreadModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(title, content, tags) => {
              onCreateThread?.(title, content, tags);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Thread Detail View */}
      <AnimatePresence>
        {selectedThread && (
          <ThreadDetailModal
            thread={selectedThread}
            onClose={() => setSelectedThread(null)}
            onComment={onComment}
            onLike={onLike}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Thread Card Component
function ThreadCard({
  thread,
  index,
  onClick,
}: {
  thread: Thread;
  index: number;
  onClick: () => void;
}) {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/10 group"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10">
            {thread.user.avatar ? (
              <img
                src={thread.user.avatar}
                alt={thread.user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                {thread.user.displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start gap-2 mb-2">
            {thread.isPinned && <span className="text-yellow-400 text-sm flex-shrink-0">📌</span>}
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
              {thread.title}
            </h3>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="font-medium text-gray-300">{thread.user.displayName}</span>
            <span>•</span>
            <span>Level {thread.user.level}</span>
            <span>•</span>
            <span>{timeAgo(thread.timestamp)}</span>
          </div>

          {/* Preview */}
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{thread.content}</p>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-600/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span>👁️</span>
              {thread.views}
            </span>
            <span className="flex items-center gap-1">
              <span>💬</span>
              {thread.comments}
            </span>
            <span className="flex items-center gap-1">
              <span>❤️</span>
              {thread.likes}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty State
function EmptyThreads({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-4">💬</div>
      <h3 className="text-xl font-semibold text-white mb-2">No Discussions Yet</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Be the first to start a conversation about this story!
      </p>
      <button
        onClick={onCreate}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
      >
        Start a Discussion
      </button>
    </div>
  );
}

// Create Thread Modal
function CreateThreadModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, content: string, tags: string[]) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      onCreate(title, content, tags);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Create Discussion</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{content.length} / 1000</div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Tags (max 5)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none"
                disabled={tags.length >= 5}
              />
              <button
                onClick={addTag}
                disabled={tags.length >= 5}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center gap-2 border border-purple-600/30"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((_, index) => index !== i))}
                    className="text-purple-400 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Thread
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Thread Detail Modal (placeholder - would show full thread with comments)
function ThreadDetailModal({
  thread,
  onClose,
  onComment,
  onLike,
}: {
  thread: Thread;
  onClose: () => void;
  onComment?: (threadId: string, content: string) => void;
  onLike?: (threadId: string) => void;
}) {
  const [commentText, setCommentText] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{thread.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Thread content would go here */}
        <div className="text-center py-12 text-gray-400">
          <p>Full thread view with comments coming soon...</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
