'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { toast } from '@/lib/utils/toast';

export interface Bookmark {
  id: string;
  storyId: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  note?: string;
  choicePath?: string[]; // Path of choices made to reach this point
  choiceId?: string; // The specific choice that led here
  createdAt: Date;
}

interface BookmarkButtonProps {
  storyId: string;
  currentChapterId?: string;
  currentChapterNumber?: number;
  currentChapterTitle?: string;
  currentChoiceId?: string;
  choicePath?: string[];
  isBookmarked: boolean;
  bookmarkCount?: number;
  onBookmark: (data?: { note?: string; choiceId?: string; choicePath?: string[] }) => Promise<void>;
  onRemoveBookmark: () => Promise<void>;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function BookmarkButton({
  storyId,
  currentChapterId,
  currentChapterNumber,
  currentChapterTitle,
  currentChoiceId,
  choicePath,
  isBookmarked,
  bookmarkCount = 0,
  onBookmark,
  onRemoveBookmark,
  variant = 'button',
  size = 'md',
  showCount = true,
}: BookmarkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookmark = async () => {
    if (isBookmarked) {
      try {
        setIsSubmitting(true);
        await onRemoveBookmark();
        toast.success('Bookmark removed', 'This story has been removed from your bookmarks');
      } catch (error) {
        toast.error('Failed to remove bookmark', 'Please try again');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleSaveBookmark = async () => {
    try {
      setIsSubmitting(true);
      await onBookmark({
        note: note || undefined,
        choiceId: currentChoiceId,
        choicePath: choicePath,
      });
      setNote('');
      setIsOpen(false);
      toast.success('Bookmark saved!', 'You can find this story in your bookmarks');
    } catch (error) {
      toast.error('Failed to save bookmark', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className="relative">
      {variant === 'button' ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBookmark}
          disabled={isSubmitting}
          className={`${sizeClasses[size]} rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isBookmarked
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <Icon
            name="BookmarkIcon"
            size={iconSizes[size]}
            variant={isBookmarked ? 'solid' : 'outline'}
          />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          {showCount && bookmarkCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isBookmarked ? 'bg-yellow-600' : 'bg-background'
              }`}
            >
              {bookmarkCount}
            </span>
          )}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.1, rotate: isBookmarked ? 0 : 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
          disabled={isSubmitting}
          className="p-2 hover:bg-muted rounded-lg transition-colors relative"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Icon
            name="BookmarkIcon"
            size={iconSizes[size]}
            variant={isBookmarked ? 'solid' : 'outline'}
            className={isBookmarked ? 'text-yellow-500' : 'text-muted-foreground'}
          />
          {showCount && bookmarkCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {bookmarkCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Bookmark Note Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-yellow-400 to-orange-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icon name="BookmarkIcon" size={24} variant="solid" />
                    Add Bookmark
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Icon name="XMarkIcon" size={20} className="text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Chapter Info */}
                {currentChapterNumber && currentChapterTitle && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="BookOpenIcon" size={16} className="text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Bookmarking at:
                      </span>
                    </div>
                    <p className="font-semibold text-foreground">
                      Chapter {currentChapterNumber}: {currentChapterTitle}
                    </p>
                    {choicePath && choicePath.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Choice Path:</p>
                        <div className="flex flex-wrap gap-1">
                          {choicePath.map((choice, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                            >
                              {idx + 1}. {choice}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Note Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add a note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Why did you bookmark this? What are your thoughts?"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {note.length}/500 characters
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveBookmark}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Bookmark'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
