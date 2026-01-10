'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { announcementService, Announcement } from '@/services/announcementService';

/**
 * GLOBAL ANNOUNCEMENT BANNER
 * Displays pinned or urgent announcements at the top of the page.
 * Dismissible by users, but persists across sessions for important announcements.
 */
export default function GlobalAnnouncementBanner() {
  const { user, profile } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      // Get announcements for user
      const userId = user?.id || 'guest';
      const tier = profile?.subscription_tier || 'free';
      const announcements = await announcementService.getForUser(userId, tier);

      // Find pinned or urgent announcement that hasn't been dismissed
      const pinnedOrUrgent = announcements.find(
        (a) =>
          (a.isPinned || a.type === 'urgent' || a.type === 'maintenance') &&
          !localStorage.getItem(`dismissed_announcement_${a.id}`)
      );

      if (pinnedOrUrgent) {
        setAnnouncement(pinnedOrUrgent);
      }
    };

    fetchAnnouncement();
  }, [user, profile]);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');
      setIsDismissed(true);
    }
  };

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
          border: 'border-red-500/30',
          icon: '🚨',
          textColor: 'text-red-400',
        };
      case 'maintenance':
        return {
          bg: 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20',
          border: 'border-orange-500/30',
          icon: '🔧',
          textColor: 'text-orange-400',
        };
      case 'feature':
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
          border: 'border-purple-500/30',
          icon: '✨',
          textColor: 'text-purple-400',
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          icon: '✅',
          textColor: 'text-green-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20',
          border: 'border-spectral-cyan/30',
          icon: 'ℹ️',
          textColor: 'text-spectral-cyan',
        };
    }
  };

  if (!announcement || isDismissed) return null;

  const style = getAnnouncementStyle(announcement.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`
          fixed top-20 left-0 right-0 z-40
          ${style.bg} ${style.border}
          border-b backdrop-blur-md
        `}
      >
        <div className="container-void py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl flex-shrink-0">{style.icon}</span>
              <div className="min-w-0">
                <span className={`font-semibold ${style.textColor}`}>{announcement.title}</span>
                <span className="text-text-secondary ml-2 hidden sm:inline">
                  {announcement.content.length > 100
                    ? announcement.content.substring(0, 100) + '...'
                    : announcement.content}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {announcement.metadata?.linkUrl && (
                <Link
                  href={announcement.metadata.linkUrl}
                  className={`text-sm font-medium ${style.textColor} hover:underline`}
                >
                  {announcement.metadata.linkText || 'Learn More'} →
                </Link>
              )}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-void-mist transition-colors text-text-tertiary hover:text-text-primary"
                aria-label="Dismiss announcement"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
