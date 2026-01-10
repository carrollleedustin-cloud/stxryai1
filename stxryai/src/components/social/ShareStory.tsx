'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface ShareStoryProps {
  storyId: string;
  storyTitle: string;
  storyDescription?: string;
  coverImage?: string;
  currentChapter?: number;
  currentChoice?: string;
  variant?: 'button' | 'icon' | 'dropdown';
  className?: string;
}

export function ShareStory({
  storyId,
  storyTitle,
  storyDescription,
  coverImage,
  currentChapter,
  currentChoice,
  variant = 'button',
  className = '',
}: ShareStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/story-reader?storyId=${storyId}${
    currentChapter ? `&chapter=${currentChapter}` : ''
  }`;

  const shareText = currentChoice
    ? `I just made a choice in "${storyTitle}": ${currentChoice}`
    : `Check out "${storyTitle}" on StxryAI!`;

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'from-blue-400 to-blue-600',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
      },
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'from-blue-600 to-blue-800',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
      },
    },
    {
      name: 'Reddit',
      icon: '🤖',
      color: 'from-orange-500 to-red-600',
      action: () => {
        const url = `https://reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
      },
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'from-blue-700 to-blue-900',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
      },
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      color: 'from-gray-500 to-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      },
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'from-purple-500 to-pink-500',
      action: () => {
        const subject = encodeURIComponent(`Check out "${storyTitle}"`);
        const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      setIsOpen(true);
    }
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <motion.button
          onClick={navigator.share ? handleNativeShare : () => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 hover:bg-muted rounded-lg transition-colors ${className}`}
          aria-label="Share story"
        >
          <Icon name="ShareIcon" size={20} />
        </motion.button>
        <ShareDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shareOptions={shareOptions}
        />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 bg-card border border-border rounded-lg font-medium flex items-center gap-2 ${className}`}
        >
          <Icon name="ShareIcon" size={20} />
          Share
        </motion.button>
        <ShareDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shareOptions={shareOptions}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={navigator.share ? handleNativeShare : () => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2 ${className}`}
      >
        <Icon name="ShareIcon" size={20} />
        Share Story
      </motion.button>
      <ShareDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} shareOptions={shareOptions} />
    </div>
  );
}

function ShareDropdown({
  isOpen,
  onClose,
  shareOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  shareOptions: Array<{ name: string; icon: string; color: string; action: () => void }>;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    option.action();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center text-xl`}
                  >
                    {option.icon}
                  </div>
                  <span className="font-medium text-foreground">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
