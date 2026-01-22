'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';
import UserProfileInteractive from './components/UserProfileInteractive';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadUserData() {
      if (loading) return;
      
      if (!user || !profile) {
        router.push('/authentication');
        return;
      }

      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          console.error('Supabase client not available');
          setIsLoading(false);
          return;
        }

        // Fetch user stats from database
        const [
          { data: storiesData },
          { data: choicesData },
          { data: streakData },
          { data: achievementsData },
        ] = await Promise.all([
          supabase
            .from('reading_progress')
            .select('story_id')
            .eq('user_id', user.id)
            .eq('is_completed', true),
          supabase
            .from('reading_progress')
            .select('choices_made')
            .eq('user_id', user.id),
          supabase
            .from('user_reading_streaks')
            .select('current_streak')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', user.id),
        ]);

        const totalChoices = choicesData?.reduce((sum, item) => sum + (item.choices_made || 0), 0) || 0;

        setUserData({
          id: user.id,
          name: profile.display_name || profile.username || 'User',
          username: profile.username || 'user',
          avatar: profile.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          bio: profile.bio || 'No bio yet. Edit your profile to add one!',
          isPremium: profile.subscription_tier !== 'free',
          joinDate: new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          location: profile.location || null,
          website: profile.website || null,
        });

        setStats({
          storiesCompleted: storiesData?.length || 0,
          totalChoices: totalChoices,
          readingStreak: streakData?.current_streak || 0,
          achievements: achievementsData?.length || 0,
        });

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [user, profile, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <UserProfileInteractive
      initialUser={userData}
      initialStats={stats}
      initialAchievements={[]}
      initialStories={[]}
      initialChoicePatterns={{ cautious: 0, bold: 0, balanced: 0, chaotic: 0 }}
      initialGenrePreferences={[]}
      initialReadingTimes={[]}
      initialFriends={[]}
      initialClubs={[]}
      initialLists={[]}
    />
  );
}
