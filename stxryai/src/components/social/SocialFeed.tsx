'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userActivityService } from '@/services/userActivityService';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, unknown>;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

const SocialFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const data = await userActivityService.getFriendActivities(user.id, 50);
        setActivities(data);
        setError(null);
      } catch (err) {
        console.error('Error loading social feed:', err);
        setError('Failed to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const getActivityIcon = (activityType: string): string => {
    const icons: Record<string, string> = {
      'story_completed': '🎉',
      'choice_made': '⭐',
      'achievement_earned': '🏆',
      'club_joined': '👥',
      'review_posted': '💬',
      'story_created': '✍️',
      'friend_added': '🤝',
      'event_joined': '📅',
      'reading_list_created': '📚',
    };
    return icons[activityType] || '📌';
  };

  const getActivityDescription = (activity: Activity): string => {
    const { activity_type, activity_data } = activity;
    const username = activity.user_profiles?.display_name || activity.user_profiles?.username || 'User';

    switch (activity_type) {
      case 'story_completed':
        return `${username} completed "${activity_data.story_title}"`;
      case 'choice_made':
        return `${username} made an important choice in "${activity_data.story_title}"`;
      case 'achievement_earned':
        return `${username} earned the "${activity_data.badge_name}" badge`;
      case 'club_joined':
        return `${username} joined "${activity_data.club_name}"`;
      case 'review_posted':
        return `${username} reviewed "${activity_data.story_title}"`;
      case 'story_created':
        return `${username} published a new story: "${activity_data.story_title}"`;
      case 'friend_accepted':
        return `${username} made a new friend`;
      case 'event_joined':
        return `${username} is attending "${activity_data.event_title}"`;
      case 'reading_list_created':
        return `${username} created a new reading list: "${activity_data.list_name}"`;
      default:
        return `${username} had an activity`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 mb-4">No recent activity from your friends</p>
        <p className="text-sm text-gray-400">Add friends to see their activity here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {activity.user_profiles?.avatar_url ? (
                <img 
                  src={activity.user_profiles.avatar_url} 
                  alt={activity.user_profiles.display_name || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {(activity.user_profiles?.display_name || activity.user_profiles?.username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="mr-2">{getActivityIcon(activity.activity_type)}</span>
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialFeed;