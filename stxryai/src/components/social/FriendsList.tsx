'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userActivityService } from '@/services/userActivityService';
import Link from 'next/link';

interface Friend {
  id: string;
  friend: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    subscription_tier: string;
    stories_completed: number;
    total_reading_time: number;
  };
}

const FriendsList: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [friendsData, requestsData] = await Promise.all([
          userActivityService.getUserFriends(user.id),
          userActivityService.getPendingFriendRequests(user.id),
        ]);
        
        setFriends(friendsData as Friend[]);
        setPendingRequests(requestsData);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsData();
  }, [user]);

  const handleAcceptRequest = async (friendshipId: string) => {
    if (!user?.id) return;

    try {
      await userActivityService.acceptFriendRequest(friendshipId, user.id);
      // Refresh data
      const [friendsData, requestsData] = await Promise.all([
        userActivityService.getUserFriends(user.id),
        userActivityService.getPendingFriendRequests(user.id),
      ]);
      setFriends(friendsData as Friend[]);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Friend Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request: any) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {request.requester?.avatar_url ? (
                      <img 
                        src={request.requester.avatar_url} 
                        alt={request.requester.display_name || 'User avatar'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(request.requester?.display_name || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.requester?.display_name || request.requester?.username}
                      </p>
                      <p className="text-xs text-gray-500">@{request.requester?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't added any friends yet</p>
            <Link 
              href="/community-hub"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {friends.map((friendship) => (
              <Link 
                key={friendship.id}
                href={`/user-profile?userId=${friendship.friend.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-center space-x-3">
                  {friendship.friend.avatar_url ? (
                    <img 
                      src={friendship.friend.avatar_url} 
                      alt={friendship.friend.display_name || 'User avatar'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {friendship.friend.display_name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {friendship.friend.display_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{friendship.friend.username}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <span>📚 {friendship.friend.stories_completed} stories</span>
                      {friendship.friend.subscription_tier === 'premium' && (
                        <span className="text-purple-600 font-medium">✨ Premium</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;