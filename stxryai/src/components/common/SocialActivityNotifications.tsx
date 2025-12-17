'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Notification {
  id: string;
  type: 'friend_activity' | 'club_update' | 'story_discussion' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
  hasSpoiler?: boolean;
}

interface SocialActivityNotificationsProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  isInReadingSession?: boolean;
}

const SocialActivityNotifications = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  isInReadingSession = false,
}: SocialActivityNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_activity':
        return 'UserGroupIcon';
      case 'club_update':
        return 'ChatBubbleLeftRightIcon';
      case 'story_discussion':
        return 'ChatBubbleBottomCenterTextIcon';
      case 'achievement':
        return 'TrophyIcon';
      default:
        return 'BellIcon';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend_activity':
        return 'text-secondary';
      case 'club_update':
        return 'text-primary';
      case 'story_discussion':
        return 'text-accent';
      case 'achievement':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.hasSpoiler && !showSpoilers) {
      return;
    }
    onNotificationClick?.(notification);
    onMarkAsRead?.(notification.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
          isInReadingSession ? 'hover:bg-muted/30' : 'hover:bg-muted/50'
        }`}
      >
        <Icon
          name="BellIcon"
          size={24}
          className={unreadCount > 0 ? 'text-accent' : 'text-muted-foreground'}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs font-bold text-error-foreground shadow-elevation-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 z-[200] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="BellIcon" size={20} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-error/20 text-error rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs font-medium text-primary hover:text-secondary transition-smooth"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Icon name="BellSlashIcon" size={48} className="text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-smooth cursor-pointer ${
                        notification.isRead
                          ? 'hover:bg-muted/30'
                          : 'bg-primary/5 hover:bg-primary/10'
                      } ${notification.hasSpoiler && !showSpoilers ? 'opacity-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <AppImage
                              src={notification.avatar}
                              alt="User avatar"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30`}
                            >
                              <Icon
                                name={getNotificationIcon(notification.type)}
                                size={20}
                                className={getNotificationColor(notification.type)}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="ml-2 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>

                          {notification.hasSpoiler && !showSpoilers ? (
                            <div className="mt-1 flex items-center space-x-2">
                              <Icon name="EyeSlashIcon" size={14} className="text-warning" />
                              <p className="text-xs text-warning">Contains spoilers</p>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.some((n) => n.hasSpoiler) && (
              <div className="p-3 border-t border-border bg-muted/30">
                <button
                  onClick={() => setShowSpoilers(!showSpoilers)}
                  className="flex items-center space-x-2 text-xs font-medium text-warning hover:text-accent transition-smooth"
                >
                  <Icon name={showSpoilers ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                  <span>{showSpoilers ? 'Hide spoilers' : 'Show spoilers'}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SocialActivityNotifications;
