'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  currentStory?: string;
  lastActive: string;
}

interface FriendsListProps {
  friends: Friend[];
  onRemoveFriend?: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
}

const FriendsList = ({
  friends,
  onRemoveFriend,
  onMessage,
}: FriendsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="UserGroupIcon" size={24} className="text-secondary" />
          <h2 className="font-heading text-xl font-bold text-foreground">
            Friends
          </h2>
          <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
            {friends.length}
          </span>
        </div>
      </div>

      <div className="relative mb-4">
        <Icon
          name="MagnifyingGlassIcon"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center space-x-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-smooth group"
          >
            <div className="relative flex-shrink-0">
              <AppImage
                src={friend.avatar}
                alt={`Profile photo of ${friend.name} with friendly smile`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                  friend.isOnline ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/user-profile?id=${friend.id}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-smooth truncate block"
              >
                {friend.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                @{friend.username}
              </p>
              {friend.currentStory ? (
                <div className="flex items-center space-x-1 mt-1">
                  <Icon
                    name="BookOpenIcon"
                    size={12}
                    className="text-accent flex-shrink-0"
                  />
                  <p className="text-xs text-accent truncate">
                    Reading: {friend.currentStory}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {friend.isOnline ? 'Online' : `Active ${friend.lastActive}`}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-smooth">
              <button
                onClick={() => onMessage?.(friend.id)}
                className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-smooth"
                title="Send message"
              >
                <Icon name="ChatBubbleLeftIcon" size={16} />
              </button>
              <button
                onClick={() => onRemoveFriend?.(friend.id)}
                className="p-2 bg-error/20 hover:bg-error/30 text-error rounded-lg transition-smooth"
                title="Remove friend"
              >
                <Icon name="UserMinusIcon" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFriends.length === 0 && (
        <div className="text-center py-8">
          <Icon
            name="UserGroupIcon"
            size={48}
            className="text-muted-foreground mx-auto mb-3"
          />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No friends found' : 'No friends yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsList;