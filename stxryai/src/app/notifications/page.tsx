'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, ParticleField } from '@/components/void';
import { HolographicCard, GradientBorder, RevealOnScroll } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import { announcementService, Announcement } from '@/services/announcementService';

const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All', icon: 'BellIcon' },
  { id: 'unread', label: 'Unread', icon: 'BellAlertIcon' },
  { id: 'feature', label: 'Features', icon: 'SparklesIcon' },
  { id: 'maintenance', label: 'Maintenance', icon: 'WrenchScrewdriverIcon' },
  { id: 'info', label: 'Info', icon: 'InformationCircleIcon' },
];

export default function NotificationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Announcement[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication?redirect=/notifications');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        setIsLoading(true);
        const data = await announcementService.getForUser(
          user.id,
          profile?.subscription_tier || 'free'
        );
        setNotifications(data);
        setFilteredNotifications(data);
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [user, profile]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (activeFilter === 'unread') {
      setFilteredNotifications(notifications.filter((n) => !n.readBy.includes(user?.id || '')));
    } else {
      setFilteredNotifications(notifications.filter((n) => n.type === activeFilter));
    }
  }, [activeFilter, notifications, user]);

  const handleMarkAsRead = async (id: string) => {
    if (user) {
      await announcementService.markAsRead(id, user.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readBy: [...n.readBy, user.id] } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      for (const notification of notifications) {
        if (!notification.readBy.includes(user.id)) {
          await announcementService.markAsRead(notification.id, user.id);
        }
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, readBy: [...n.readBy, user.id] })));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return { icon: 'SparklesIcon', color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'maintenance':
        return { icon: 'WrenchScrewdriverIcon', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      case 'warning':
        return {
          icon: 'ExclamationTriangleIcon',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
        };
      case 'urgent':
        return { icon: 'ExclamationCircleIcon', color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'success':
        return { icon: 'CheckCircleIcon', color: 'text-green-400', bg: 'bg-green-500/20' };
      default:
        return { icon: 'InformationCircleIcon', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.readBy.includes(user?.id || '')).length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <VoidBackground variant="subtle" />
      <ParticleField particleCount={30} color="rgba(0, 245, 212, 0.15)" maxSize={1.5} />
      <EtherealNav />

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <RevealOnScroll>
          <div className="flex items-center justify-between mb-8">
            <div>
              <TemporalHeading level={1} accent className="mb-2">
                Notifications
              </TemporalHeading>
              <p className="text-text-secondary">
                Stay updated with announcements and platform news
              </p>
            </div>
            {unreadCount > 0 && (
              <SpectralButton variant="secondary" onClick={handleMarkAllAsRead}>
                <Icon name="CheckIcon" size={16} className="mr-2" />
                Mark All Read
              </SpectralButton>
            )}
          </div>
        </RevealOnScroll>

        {/* Filters */}
        <RevealOnScroll delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-8">
            {NOTIFICATION_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    activeFilter === filter.id
                      ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                      : 'bg-void-100/30 text-text-secondary border border-void-border hover:border-void-400'
                  }
                `}
              >
                <Icon name={filter.icon} size={16} />
                {filter.label}
                {filter.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-spectral-rose text-void-absolute text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-void-100/30 flex items-center justify-center">
                  <Icon name="BellIcon" size={40} className="text-void-400" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No Notifications</h3>
                <p className="text-text-secondary">
                  {activeFilter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const isRead = notification.readBy.includes(user?.id || '');
                const iconInfo = getNotificationIcon(notification.type);

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GradientBorder
                      className={`p-[1px] rounded-xl ${!isRead ? 'ring-1 ring-spectral-cyan/30' : ''}`}
                    >
                      <div
                        onClick={() => {
                          if (!isRead) handleMarkAsRead(notification.id);
                          if (notification.metadata?.linkUrl) {
                            router.push(notification.metadata.linkUrl);
                          }
                        }}
                        className={`
                          bg-void-100/30 backdrop-blur-xl rounded-xl p-5 cursor-pointer transition-all
                          ${!isRead ? 'bg-spectral-cyan/5' : ''}
                          hover:bg-void-100/50
                        `}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${iconInfo.bg} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon name={iconInfo.icon} size={24} className={iconInfo.color} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`font-semibold ${isRead ? 'text-text-secondary' : 'text-text-primary'}`}
                                >
                                  {notification.title}
                                </h3>
                                {notification.isPinned && (
                                  <span className="text-yellow-400">📌</span>
                                )}
                                {!isRead && (
                                  <span className="w-2 h-2 rounded-full bg-spectral-cyan animate-pulse" />
                                )}
                              </div>
                              <span className="text-sm text-text-tertiary whitespace-nowrap">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>

                            <p className="text-text-secondary mb-3">{notification.content}</p>

                            <div className="flex items-center gap-4">
                              {notification.metadata?.linkUrl && (
                                <span className="text-sm text-spectral-cyan flex items-center gap-1">
                                  <Icon name="ArrowRightIcon" size={14} />
                                  {notification.metadata.linkText || 'Learn More'}
                                </span>
                              )}
                              {notification.expiresAt && (
                                <span className="text-sm text-text-tertiary flex items-center gap-1">
                                  <Icon name="ClockIcon" size={14} />
                                  Expires {new Date(notification.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </GradientBorder>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Settings Link */}
        <RevealOnScroll delay={0.2}>
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">
              Want to customize your notification preferences?
            </p>
            <SpectralButton href="/settings" variant="secondary">
              <Icon name="CogIcon" size={16} className="mr-2" />
              Notification Settings
            </SpectralButton>
          </div>
        </RevealOnScroll>
      </main>
    </div>
  );
}
