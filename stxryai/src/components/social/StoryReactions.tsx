'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface StoryReactionsProps {
  storyId: string;
  chapterId?: string;
  reactions: Reaction[];
  onReaction: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  showCount?: boolean;
  variant?: 'inline' | 'popover';
}

const COMMON_REACTIONS = ['❤️', '🔥', '😮', '😂', '😢', '👏', '💯', '🎉'];

export function StoryReactions({
  storyId,
  chapterId,
  reactions,
  onReaction,
  onRemoveReaction,
  showCount = true,
  variant = 'inline',
}: StoryReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    const existingReaction = reactions.find((r) => r.emoji === emoji);
    if (existingReaction?.userReacted && onRemoveReaction) {
      onRemoveReaction(emoji);
    } else {
      onReaction(emoji);
    }
    setIsOpen(false);
  };

  if (variant === 'popover') {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-card border border-border rounded-lg font-medium flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <span>😊</span>
          <span>React</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-2xl z-50"
              >
                <div className="grid grid-cols-4 gap-2">
                  {COMMON_REACTIONS.map((emoji) => {
                    const reaction = reactions.find((r) => r.emoji === emoji);
                    return (
                      <motion.button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        onMouseEnter={() => setHoveredEmoji(emoji)}
                        onMouseLeave={() => setHoveredEmoji(null)}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 text-2xl rounded-lg transition-all ${
                          reaction?.userReacted
                            ? 'bg-primary/20 ring-2 ring-primary'
                            : hoveredEmoji === emoji
                              ? 'bg-muted'
                              : ''
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {COMMON_REACTIONS.map((emoji) => {
        const reaction = reactions.find((r) => r.emoji === emoji);
        const count = reaction?.count || 0;
        const userReacted = reaction?.userReacted || false;

        if (!showCount && count === 0 && !userReacted) return null;

        return (
          <motion.button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className={`relative px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              userReacted ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span className="text-xl">{emoji}</span>
            {showCount && count > 0 && (
              <span className="text-sm font-medium text-foreground">{count}</span>
            )}
            {userReacted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              />
            )}
          </motion.button>
        );
      })}

      {/* Add Custom Reaction */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        title="Add custom reaction"
      >
        <Icon name="PlusIcon" size={16} />
      </motion.button>
    </div>
  );
}
