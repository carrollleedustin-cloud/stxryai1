'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { announcementService, Announcement } from '@/services/announcementService';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'announcement' | 'message' | 'achievement' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
  iconColor?: string;
}

// Mock notifications for demonstration
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Alexandra Chen sent you a message',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    isRead: false,
    actionUrl: '/messages',
    icon: 'ChatBubbleLeftIcon',
    iconColor: 'text-spectral-cyan',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You earned "Bookworm" for reading 10 stories',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    isRead: false,
    actionUrl: '/achievements',
    icon: 'TrophyIcon',
    iconColor: 'text-yellow-400',
  },
  {
    id: '3',
    type: 'social',
    title: 'New Follower',
    message: 'Marcus Rodriguez started following you',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    isRead: true,
    actionUrl: '/user-profile/scifiexplorer',
    icon: 'UserPlusIcon',
    iconColor: 'text-purple-400',
  },
  {
    id: '4',
    type: 'system',
    title: 'Story Published',
    message: 'Your story "The Last Dawn" is now live',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true,
    actionUrl: '/story-library',
    icon: 'BookOpenIcon',
    iconColor: 'text-green-400',
  },
];

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length + announcements.length;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (user) {
        const activeAnnouncements = await announcementService.getActiveForUser(user.id);
        setAnnouncements(activeAnnouncements);
      }
    };
    fetchAnnouncements();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismissAnnouncement = async (id: string) => {
    if (user) {
      await announcementService.dismiss(id, user.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'info':
        return { icon: 'InformationCircleIcon', color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'feature':
        return { icon: 'SparklesIcon', color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'success':
        return { icon: 'CheckCircleIcon', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'warning':
        return {
          icon: 'ExclamationTriangleIcon',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
        };
      case 'urgent':
        return { icon: 'ExclamationCircleIcon', color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'maintenance':
        return { icon: 'WrenchScrewdriverIcon', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      default:
        return { icon: 'BellIcon', color: 'text-void-400', bg: 'bg-void-500/20' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-void-900/50 border border-void-700/50 hover:border-spectral-cyan/50 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon name="BellIcon" size={20} className="text-void-300" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-spectral-cyan text-void-950 text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-h-[70vh] bg-void-950/95 backdrop-blur-xl border border-void-700/50 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-void-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-void-100">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.some((n) => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-spectral-cyan hover:text-spectral-cyan/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/settings?tab=notifications"
                  className="p-1 hover:bg-void-800/50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="CogIcon" size={16} className="text-void-400" />
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
              {/* Announcements Section */}
              {announcements.length > 0 && (
                <div className="border-b border-void-800/50">
                  <div className="px-4 py-2 bg-void-900/50">
                    <span className="text-xs text-void-500 uppercase tracking-wider">
                      Announcements
                    </span>
                  </div>
                  {announcements.slice(0, 3).map((announcement) => {
                    const { icon, color, bg } = getAnnouncementIcon(announcement.type);
                    return (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 hover:bg-void-900/30 transition-colors border-b border-void-800/30 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon name={icon} size={20} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-void-100 truncate">
                                {announcement.title}
                              </p>
                              {announcement.isPinned && (
                                <Icon
                                  name="PinIcon"
                                  size={12}
                                  className="text-yellow-400 flex-shrink-0"
                                />
                              )}
                            </div>
                            <p className="text-sm text-void-400 line-clamp-2 mt-1">
                              {announcement.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-void-500">
                                {formatTimeAgo(announcement.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {announcement.metadata?.linkUrl && (
                                  <Link
                                    href={announcement.metadata.linkUrl}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs text-spectral-cyan hover:underline"
                                  >
                                    {announcement.metadata.linkText || 'View'}
                                  </Link>
                                )}
                                <button
                                  onClick={() => dismissAnnouncement(announcement.id)}
                                  className="text-xs text-void-500 hover:text-void-300"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Notifications Section */}
              <div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-void-900/50">
                    <span className="text-xs text-void-500 uppercase tracking-wider">Recent</span>
                  </div>
                )}

                {notifications.length === 0 && announcements.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void-800/50 flex items-center justify-center">
                      <Icon name="BellIcon" size={32} className="text-void-500" />
                    </div>
                    <p className="text-void-400">No notifications</p>
                    <p className="text-xs text-void-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.actionUrl || '#'}
                      onClick={() => {
                        markAsRead(notification.id);
                        setIsOpen(false);
                      }}
                      className={`
                        block p-4 hover:bg-void-900/30 transition-colors border-b border-void-800/30 last:border-b-0
                        ${!notification.isRead ? 'bg-spectral-cyan/5' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${notification.type === 'message' ? 'bg-spectral-cyan/20' : ''}
                          ${notification.type === 'achievement' ? 'bg-yellow-500/20' : ''}
                          ${notification.type === 'social' ? 'bg-purple-500/20' : ''}
                          ${notification.type === 'system' ? 'bg-green-500/20' : ''}
                        `}
                        >
                          <Icon
                            name={notification.icon || 'BellIcon'}
                            size={20}
                            className={notification.iconColor || 'text-void-400'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium truncate ${!notification.isRead ? 'text-void-100' : 'text-void-300'}`}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-spectral-cyan flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-void-400 truncate mt-0.5">
                            {notification.message}
                          </p>
                          <span className="text-xs text-void-500 mt-1 block">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-void-800/50 bg-void-900/50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block w-full py-2 text-center text-sm text-spectral-cyan hover:text-spectral-cyan/80 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
