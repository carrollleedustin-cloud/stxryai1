'use client';

import { motion } from 'framer-motion';
import { getLevelFromXP } from '@/lib/gamification/xpSystem';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  totalXP: number;
  storiesCreated: number;
  storiesCompleted: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
  isPremium?: boolean;
}

interface UserProfileCardProps {
  user: UserProfile;
  currentUserId?: string;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  variant?: 'compact' | 'full';
}

export default function UserProfileCard({
  user,
  currentUserId,
  onFollow,
  onUnfollow,
  onViewProfile,
  variant = 'full',
}: UserProfileCardProps) {
  const level = getLevelFromXP(user.totalXP);
  const isOwnProfile = currentUserId === user.id;

  const handleFollowToggle = async () => {
    if (!currentUserId) return;

    try {
      if (user.isFollowing) {
        await onUnfollow?.(user.id);
      } else {
        await onFollow?.(user.id);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:shadow-lg transition-all"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>
          {user.isPremium && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Icon name="SparklesIcon" size={12} className="text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewProfile?.(user.id)}
              className="font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {user.displayName}
            </button>
            <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold">
              {level.badge} {level.level}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        {/* Follow Button */}
        {!isOwnProfile && currentUserId && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFollowToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              user.isFollowing
                ? 'bg-muted text-foreground hover:bg-muted/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />

      <div className="p-6 -mt-12">
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-card overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>
          {user.isPremium && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center gap-1"
            >
              <Icon name="SparklesIcon" size={14} className="text-white" />
              <span className="text-xs font-bold text-white">PRO</span>
            </motion.div>
          )}
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-foreground mb-1">{user.displayName}</h3>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>

        {/* Level Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold mb-4">
          <span>{level.badge}</span>
          <span>
            Level {level.level} - {level.title}
          </span>
        </div>

        {/* Bio */}
        {user.bio && <p className="text-foreground mb-4 line-clamp-3">{user.bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{user.storiesCreated}</div>
            <div className="text-xs text-muted-foreground">Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{user.followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{user.following}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isOwnProfile && currentUserId ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFollowToggle}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  user.isFollowing
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {user.isFollowing ? (
                  <>
                    <Icon name="CheckIcon" size={16} className="inline mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <Icon name="UserPlusIcon" size={16} className="inline mr-2" />
                    Follow
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewProfile?.(user.id)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                <Icon name="UserIcon" size={16} className="inline mr-2" />
                Profile
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewProfile?.(user.id)}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View Full Profile
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
