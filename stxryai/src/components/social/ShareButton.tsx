'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { toast } from '@/lib/utils/toast';

interface ShareButtonProps {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  onShare?: (platform: string) => void;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareButton({
  title,
  description,
  url,
  hashtags = [],
  onShare,
  variant = 'button',
  size = 'md'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareLinks = {
    twitter: () => {
      const text = encodeURIComponent(title);
      const tags = hashtags.join(',');
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}${tags ? `&hashtags=${tags}` : ''}`;
    },
    facebook: () => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
    linkedin: () => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    },
    reddit: () => {
      return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    },
    email: () => {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${description}\n\n${url}`);
      return `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-600' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-800' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-900' },
    { id: 'reddit', name: 'Reddit', icon: '🔴', color: 'from-orange-500 to-red-600' },
    { id: 'email', name: 'Email', icon: '✉️', color: 'from-gray-600 to-gray-800' }
  ];

  const handleShare = (platformId: string) => {
    const link = shareLinks[platformId as keyof typeof shareLinks]();
    window.open(link, '_blank', 'width=600,height=400');
    onShare?.(platformId);
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!', 'Share link copied to clipboard');
      onShare?.('clipboard');
    } catch (error) {
      toast.error('Failed to copy', 'Could not copy link to clipboard');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        onShare?.('native');
      } catch (error) {
        // User cancelled share
      }
    }
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="relative">
      {variant === 'button' ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`${sizeClasses[size]} bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2`}
        >
          <Icon name="ShareIcon" size={iconSizes[size]} />
          Share
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Share"
        >
          <Icon name="ShareIcon" size={iconSizes[size]} className="text-muted-foreground" />
        </motion.button>
      )}

      {/* Share Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Share this story</h3>
              </div>

              {/* Native Share (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-muted)' }}
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 p-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                    📱
                  </div>
                  <span className="font-medium text-foreground">Share via...</span>
                </motion.button>
              )}

              {/* Platform Buttons */}
              <div className="p-2">
                {platforms.map((platform) => (
                  <motion.button
                    key={platform.id}
                    whileHover={{ backgroundColor: 'var(--color-muted)' }}
                    onClick={() => handleShare(platform.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center text-xl`}>
                      {platform.icon}
                    </div>
                    <span className="font-medium text-foreground">{platform.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Icon name="ClipboardDocumentIcon" size={16} />
                    Copy
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