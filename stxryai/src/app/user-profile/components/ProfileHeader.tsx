'use client';

import { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import ReportModal from '@/components/moderation/ReportModal';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string | null;
    isPremium?: boolean;
    joinDate?: string;
    location?: string;
    website?: string;
  };
  stats: {
    storiesCompleted: number;
    totalChoices: number;
    readingStreak: number;
    achievements: number;
  };
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onAddFriend?: () => void;
  onMessage?: () => void;
}

const ProfileHeader = ({
  user,
  stats,
  isOwnProfile,
  onEditProfile,
  onAddFriend,
  onMessage,
}: ProfileHeaderProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-secondary to-accent relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <AppImage
                  src={user.avatar}
                  alt={`Profile photo of ${user.name} with professional headshot`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-card shadow-elevation-2"
                />
                {user.isPremium && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-card shadow-elevation-1">
                    <Icon name="SparklesIcon" size={16} className="text-background" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="font-heading text-2xl font-bold text-foreground">{user.name}</h1>
                  {user.isPremium && (
                    <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full border border-accent/30">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="text-sm text-foreground max-w-2xl">{user.bio}</p>}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="CalendarIcon" size={14} />
                    <span>Joined {user.joinDate}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPinIcon" size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-primary transition-smooth"
                    >
                      <Icon name="LinkIcon" size={14} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <button
                  onClick={onEditProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-smooth"
                >
                  <Icon name="PencilIcon" size={18} />
                  <span className="font-medium">Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                      isFollowing
                        ? 'bg-muted hover:bg-muted/80 text-foreground'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    <Icon name={isFollowing ? 'CheckIcon' : 'UserPlusIcon'} size={18} />
                    <span className="font-medium">{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  <button
                    onClick={onMessage}
                    className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-smooth"
                  >
                    <Icon name="ChatBubbleLeftIcon" size={18} />
                    <span className="font-medium">Message</span>
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-smooth"
                  >
                    <Icon name="FlagIcon" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.storiesCompleted}</div>
              <div className="text-xs text-muted-foreground mt-1">Stories Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {stats.totalChoices.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Choices</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-accent">{stats.readingStreak}</div>
              <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success">{stats.achievements}</div>
              <div className="text-xs text-muted-foreground mt-1">Achievements</div>
            </div>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contentId={user.id}
        contentType="user"
      />
    </>
  );
};

export default ProfileHeader;
