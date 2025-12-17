'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

type NotificationType = 'story' | 'social' | 'achievement' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export default function NotificationCenter({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const [showPanel, setShowPanel] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <>
      {/* Notification Bell */}
      <NotificationBell count={unreadCount} onClick={() => setShowPanel(!showPanel)} />

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['all', 'story', 'social', 'achievement', 'system'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        filter === f
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Bar */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-b border-white/10 flex gap-2">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Mark all as read
                  </button>
                  <span className="text-gray-600">•</span>
                  <button onClick={onClearAll} className="text-sm text-gray-400 hover:text-white">
                    Clear all
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={onMarkAsRead}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyNotifications filter={filter} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Notification Bell Component
export function NotificationBell({ count = 0, onClick }: { count?: number; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative p-2 text-gray-400 hover:text-white transition-colors"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}

      {count > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full"
        />
      )}
    </motion.button>
  );
}

// Notification Item Component
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'story':
        return 'from-blue-600 to-cyan-600';
      case 'social':
        return 'from-purple-600 to-pink-600';
      case 'achievement':
        return 'from-yellow-600 to-orange-600';
      case 'system':
        return 'from-gray-600 to-gray-700';
      default:
        return 'from-purple-600 to-pink-600';
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const content = (
    <div
      className={`p-4 hover:bg-white/5 transition-all cursor-pointer ${
        !notification.read ? 'bg-purple-600/5' : ''
      }`}
      onClick={() => {
        if (!notification.read && onMarkAsRead) {
          onMarkAsRead(notification.id);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(notification.type)} flex items-center justify-center text-lg flex-shrink-0`}
        >
          {notification.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'} line-clamp-1`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{notification.message}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{timeAgo(notification.timestamp)}</span>

            {notification.actionUrl && (
              <Link href={notification.actionUrl}>
                <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                  {notification.actionLabel || 'View'}
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Actions (on hover) */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-1"
            >
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notification.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-red-400"
                title="Delete"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return content;
}

// Empty State Component
function EmptyNotifications({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-6xl mb-4">🔔</div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {filter === 'all' ? 'No Notifications' : `No ${filter} notifications`}
      </h3>
      <p className="text-gray-400 text-sm">
        {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications at the moment`}
      </p>
    </div>
  );
}

// Notification Badge (for inline use)
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full"
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  );
}
