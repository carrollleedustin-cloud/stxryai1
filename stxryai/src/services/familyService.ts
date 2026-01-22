import { createClient } from '@/lib/supabase/client';

/**
 * FAMILY SERVICE
 * Handles all family-related database operations
 */

export interface FamilyProfile {
  id: string;
  parent_id: string;
  name: string;
  avatar: string;
  age: number;
  date_of_birth?: string;
  reading_level?: string;
  content_restrictions: string[];
  created_at: string;
  updated_at: string;
}

export interface FamilyStats {
  stories_read: number;
  time_this_week: number;
  total_achievements: number;
  current_streak: number;
  last_active: string;
}

export interface FamilyMember extends FamilyProfile {
  stats: FamilyStats;
}

/**
 * Get all family profiles for a parent user
 */
export async function getFamilyProfiles(parentId: string): Promise<{
  success: boolean;
  profiles?: FamilyMember[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Get family profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return { success: true, profiles: [] };
    }

    // Get stats for each profile
    const profilesWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const stats = await getFamilyMemberStats(profile.id);
        return {
          ...profile,
          stats: stats || {
            stories_read: 0,
            time_this_week: 0,
            total_achievements: 0,
            current_streak: 0,
            last_active: new Date().toISOString(),
          },
        };
      })
    );

    return { success: true, profiles: profilesWithStats };
  } catch (error: any) {
    console.error('Error fetching family profiles:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get statistics for a family member
 */
export async function getFamilyMemberStats(profileId: string): Promise<FamilyStats | null> {
  try {
    const supabase = createClient();

    // Get reading progress
    const { data: readingData, error: readingError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', profileId);

    if (readingError) throw readingError;

    // Get achievements
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', profileId);

    if (achievementsError) throw achievementsError;

    // Calculate stats
    const storiesRead = readingData?.filter((r) => r.completed).length || 0;

    // Calculate time this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentReading = readingData?.filter(
      (r) => new Date(r.last_read_at) > oneWeekAgo
    ) || [];

    const timeThisWeek = recentReading.reduce((total, r) => total + (r.time_spent || 0), 0);

    // Get last active
    const lastActive = readingData?.[0]?.last_read_at || new Date().toISOString();

    return {
      stories_read: storiesRead,
      time_this_week: timeThisWeek,
      total_achievements: achievementsData?.length || 0,
      current_streak: 0, // TODO: Implement streak calculation
      last_active: lastActive,
    };
  } catch (error) {
    console.error('Error fetching family member stats:', error);
    return null;
  }
}

/**
 * Create a new family profile
 */
export async function createFamilyProfile(
  parentId: string,
  profileData: Partial<FamilyProfile>
): Promise<{
  success: boolean;
  profile?: FamilyProfile;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('family_profiles')
      .insert({
        parent_id: parentId,
        name: profileData.name,
        avatar: profileData.avatar || '👤',
        age: profileData.age,
        date_of_birth: profileData.date_of_birth,
        reading_level: profileData.reading_level || 'beginner',
        content_restrictions: profileData.content_restrictions || [],
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error creating family profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a family profile
 */
export async function updateFamilyProfile(
  profileId: string,
  updates: Partial<FamilyProfile>
): Promise<{
  success: boolean;
  profile?: FamilyProfile;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('family_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error updating family profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a family profile
 */
export async function deleteFamilyProfile(profileId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('family_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting family profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get family overview statistics
 */
export async function getFamilyOverview(parentId: string): Promise<{
  success: boolean;
  overview?: {
    total_members: number;
    total_stories_read: number;
    total_time_this_week: number;
    weekly_growth: number;
  };
  error?: string;
}> {
  try {
    const { success, profiles } = await getFamilyProfiles(parentId);

    if (!success || !profiles) {
      return { success: false, error: 'Failed to fetch family profiles' };
    }

    const totalStoriesRead = profiles.reduce((sum, p) => sum + p.stats.stories_read, 0);
    const totalTimeThisWeek = profiles.reduce((sum, p) => sum + p.stats.time_this_week, 0);

    // TODO: Calculate actual weekly growth from historical data
    const weeklyGrowth = 24; // Placeholder

    return {
      success: true,
      overview: {
        total_members: profiles.length,
        total_stories_read: totalStoriesRead,
        total_time_this_week: totalTimeThisWeek,
        weekly_growth: weeklyGrowth,
      },
    };
  } catch (error: any) {
    console.error('Error fetching family overview:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format time ago string
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}
