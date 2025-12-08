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

interface UserProfileInteractiveProps {
  initialUser: any;
  initialStats: any;
  initialAchievements: any[];
  initialStories: any[];
  initialChoicePatterns: any;
  initialGenrePreferences: any[];
  initialReadingTimes: any[];
  initialFriends: any[];
  initialClubs: any[];
  initialLists: any[];
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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

              <ReadingHistory stories={initialStories} />

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