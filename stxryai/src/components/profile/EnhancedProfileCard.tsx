'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  subscriptionTier: 'free' | 'premium' | 'creator_pro';
  stats: {
    storiesRead: number;
    storiesCreated: number;
    followers: number;
    following: number;
    achievements: number;
    readingStreak: number;
  };
  badges: string[];
  joinedDate: Date;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

interface EnhancedProfileCardProps {
  profile: UserProfile;
  variant?: 'full' | 'compact' | 'mini';
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
}

export default function EnhancedProfileCard({
  profile,
  variant = 'full',
  onFollow,
  onUnfollow,
  onMessage,
}: EnhancedProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'mini') {
    return <MiniProfileCard profile={profile} />;
  }

  if (variant === 'compact') {
    return <CompactProfileCard profile={profile} onFollow={onFollow} onUnfollow={onUnfollow} />;
  }

  const tierColors = {
    free: 'from-gray-600 to-gray-700',
    premium: 'from-yellow-600 to-orange-600',
    creator_pro: 'from-purple-600 to-pink-600',
  };

  const tierLabels = {
    free: 'Free',
    premium: 'Premium',
    creator_pro: 'Creator Pro',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
    >
      {/* Cover / Header */}
      <div className={`h-32 bg-gradient-to-r ${tierColors[profile.subscriptionTier]} relative`}>
        {/* Tier Badge */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-white/20">
            ✨ {tierLabels[profile.subscriptionTier]}
          </div>
        </div>

        {/* Level Badge */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl border-4 border-gray-900 shadow-xl">
            {profile.level}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-12 pb-6 px-6 text-center">
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl text-white">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name & Username */}
        <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h2>
        <p className="text-gray-400 mb-3">@{profile.username}</p>

        {/* XP Progress */}
        <div className="mb-4 px-8">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Level {profile.level}</span>
            <span>{profile.xp} / {profile.xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto">
            {profile.bio}
          </p>
        )}

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {profile.badges.slice(0, 5).map((badge, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-lg"
                title={badge}
              >
                {badge}
              </div>
            ))}
            {profile.badges.length > 5 && (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-400">
                +{profile.badges.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatItem
            icon="📚"
            label="Stories Read"
            value={profile.stats.storiesRead}
          />
          <StatItem
            icon="✍️"
            label="Created"
            value={profile.stats.storiesCreated}
          />
          <StatItem
            icon="🏆"
            label="Achievements"
            value={profile.stats.achievements}
          />
        </div>

        {/* Social Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <button className="text-gray-300 hover:text-white transition-colors">
            <span className="font-bold">{profile.stats.followers}</span>
            <span className="text-gray-500 ml-1">Followers</span>
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            <span className="font-bold">{profile.stats.following}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </button>
        </div>

        {/* Action Buttons */}
        {!profile.isOwnProfile && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={profile.isFollowing ? onUnfollow : onFollow}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                profile.isFollowing
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMessage}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 font-semibold transition-all"
            >
              Message
            </motion.button>
          </div>
        )}

        {profile.isOwnProfile && (
          <Link href="/settings">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 font-semibold transition-all"
            >
              Edit Profile
            </motion.button>
          </Link>
        )}
      </div>

      {/* Additional Info (Expandable) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-6 bg-white/5 text-gray-400 hover:text-white text-sm transition-all border-t border-white/10"
      >
        {isExpanded ? 'Show Less' : 'Show More'} {isExpanded ? '▲' : '▼'}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-6 py-4 bg-white/5 border-t border-white/10 space-y-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-400">🔥 Reading Streak</span>
            <span className="text-white font-semibold">{profile.stats.readingStreak} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">📅 Joined</span>
            <span className="text-white">{profile.joinedDate.toLocaleDateString()}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Stat Item Component
function StatItem({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

// Compact Profile Card
function CompactProfileCard({
  profile,
  onFollow,
  onUnfollow,
}: {
  profile: UserProfile;
  onFollow?: () => void;
  onUnfollow?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{profile.displayName}</h4>
          <p className="text-sm text-gray-400 truncate">@{profile.username}</p>
        </div>

        {/* Follow Button */}
        {!profile.isOwnProfile && (
          <button
            onClick={profile.isFollowing ? onUnfollow : onFollow}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              profile.isFollowing
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {profile.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Mini Profile Card (for mentions, comments)
function MiniProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <Link href={`/profile/${profile.username}`}>
      <div className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white">@{profile.username}</span>
      </div>
    </Link>
  );
}
