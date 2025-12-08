'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ActivityFeedItemProps {
  activity: {
    id: string;
    type: 'friend_completed' | 'club_update' | 'new_story' | 'achievement';
    user: {
      name: string;
      avatar?: string;
    };
    content: string;
    storyTitle?: string;
    storyId?: string;
    timestamp: string;
  };
}

const ActivityFeedItem = ({ activity }: ActivityFeedItemProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'friend_completed':
        return { name: 'CheckCircleIcon', color: 'text-success' };
      case 'club_update':
        return { name: 'UserGroupIcon', color: 'text-primary' };
      case 'new_story':
        return { name: 'SparklesIcon', color: 'text-accent' };
      case 'achievement':
        return { name: 'TrophyIcon', color: 'text-warning' };
      default:
        return { name: 'BellIcon', color: 'text-muted-foreground' };
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!isHydrated) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const icon = getActivityIcon();

  return (
    <div className="flex space-x-3 p-4 hover:bg-muted/30 rounded-lg transition-smooth">
      <div className="flex-shrink-0">
        {activity.user.avatar ? (
          <AppImage
            src={activity.user.avatar}
            alt={`${activity.user.name} profile picture`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30">
            <span className="text-sm font-semibold text-primary">
              {activity.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{activity.user.name}</span>{' '}
              <span className="text-muted-foreground">{activity.content}</span>
            </p>
            {activity.storyTitle && activity.storyId && (
              <Link
                href={`/story-reader?id=${activity.storyId}`}
                className="text-sm font-medium text-primary hover:text-secondary transition-smooth inline-block mt-1"
              >
                {activity.storyTitle}
              </Link>
            )}
          </div>
          <Icon
            name={icon.name as any}
            size={18}
            className={`${icon.color} flex-shrink-0 ml-2`}
          />
        </div>
        {isHydrated && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatTimestamp(activity.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedItem;