'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import ProfileHeader from './ProfileHeader';
import AchievementBadges from './AchievementBadges';
import ReadingHistory from './ReadingHistory';
import PlayStyleAnalysis from './PlayStyleAnalysis';
import FriendsList from './FriendsList';
import ClubMemberships from './ClubMemberships';
import ReadingLists from './ReadingLists';
import { UserProfile, Story, Achievement } from '@/types/database';
import { ReadingClub } from '@/services/communityService';

// Define specific interfaces for props
export interface UserStats {
  storiesCompleted: number;
  choicesMade: number;
  readingStreak: number;
  totalReadingTime: number;
}

export interface UserAchievement extends Achievement {
  progress: number;
  total: number;
  unlocked: boolean;
}

export interface ChoicePatterns {
  decisionBias: string;
  riskAversion: number;
  explorationVsCompletion: string;
}

export interface GenrePreferences {
  genre: string;
  affinity: number;
}

export interface ReadingTimeData {
  hour: number;
  storiesRead: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
}

export interface UserReadingList {
  id: string;
  name: string;
  description?: string;
  storyCount: number;
  isPublic: boolean;
}

interface UserProfileInteractiveProps {
  initialUser: UserProfile;
  initialStats: UserStats;
  initialAchievements: UserAchievement[];
  initialStories: Story[];
  initialChoicePatterns: ChoicePatterns;
  initialGenrePreferences: GenrePreferences[];
  initialReadingTimes: ReadingTimeData[];
  initialFriends: Friend[];
  initialClubs: ReadingClub[];
  initialLists: UserReadingList[];
}

const UserProfileInteractive = ({
  initialUser,
  initialStats,
  initialAchievements,
  initialStories,
  initialChoicePatterns,
  initialGenrePreferences,
  initialReadingTimes,
  initialFriends,
  initialClubs,
  initialLists,
}: UserProfileInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    const fetchReadingHistory = async () => {
      const history = await userProgressService.getAllUserProgress(initialUser.id);
      setReadingHistory(history || []);
    };
    fetchReadingHistory();
  }, [initialUser.id]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-card/95 backdrop-blur-glass border-b border-border" />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-4" />
              <div className="h-32 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleRemoveFriend = (friendId: string) => {
    console.log('Remove friend:', friendId);
  };

  const handleMessage = (friendId: string) => {
    console.log('Message friend:', friendId);
  };

  const handleCreateList = () => {
    console.log('Create list clicked');
  };

  const handleEditList = (listId: string) => {
    console.log('Edit list:', listId);
  };

  const handleDeleteList = (listId: string) => {
    console.log('Delete list:', listId);
  };

  const handleTogglePrivacy = (listId: string) => {
    console.log('Toggle privacy:', listId);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <ProfileHeader
            user={initialUser}
            stats={initialStats}
            isOwnProfile={true}
            onEditProfile={handleEditProfile}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AchievementBadges
                achievements={initialAchievements}
                totalAchievements={50}
              />

              <ReadingHistory stories={readingHistory} />

              <PlayStyleAnalysis
                choicePatterns={initialChoicePatterns}
                genrePreferences={initialGenrePreferences}
                readingTimes={initialReadingTimes}
              />

              <ReadingLists
                lists={initialLists}
                onCreateList={handleCreateList}
                onEditList={handleEditList}
                onDeleteList={handleDeleteList}
                onTogglePrivacy={handleTogglePrivacy}
              />
            </div>

            <div className="space-y-6">
              <FriendsList
                friends={initialFriends}
                onRemoveFriend={handleRemoveFriend}
                onMessage={handleMessage}
              />

              <ClubMemberships clubs={initialClubs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileInteractive;