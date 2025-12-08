import { supabase } from '@/lib/supabase/client';

interface UserStats {
  stories_completed: number;
  total_reading_time: number;
  choices_made: number;
  badges_earned: number;
  clubs_joined: number;
}

interface SocialNotification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
}

interface LeaderboardData {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  stories_completed: number;
}

export const socialService = {
  // Get user statistics for profile display
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get user profile stats
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('stories_completed, total_reading_time, choices_made')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get badges count
      const { count: badgesCount, error: badgesError } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      // Get clubs count
      const { count: clubsCount, error: clubsError } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (clubsError) throw clubsError;

      return {
        stories_completed: profile.stories_completed || 0,
        total_reading_time: profile.total_reading_time || 0,
        choices_made: profile.choices_made || 0,
        badges_earned: badgesCount || 0,
        clubs_joined: clubsCount || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Search for users to add as friends
  async searchUsers(searchTerm: string, currentUserId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url, subscription_tier')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq('id', currentUserId)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get reading leaderboard
  async getReadingLeaderboard(timeframe: 'weekly' | 'monthly' | 'all-time' = 'all-time', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url, stories_completed')
        .order('stories_completed', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Add rank to entries
      return (data || []).map((entry: LeaderboardData, index: number) => ({
        user_id: entry.id,
        username: entry.username,
        display_name: entry.display_name,
        avatar_url: entry.avatar_url,
        score: entry.stories_completed,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // Get active community events
  async getUpcomingEvents(limit: number = 10) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          host:host_id (
            username,
            display_name,
            avatar_url
          ),
          club:club_id (
            name,
            cover_image_url
          ),
          participants:event_participants (
            count
          )
        `)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Join a community event
  async joinEvent(eventId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          rsvp_status: 'attending',
        });

      if (error) throw error;

      // Update participant count
      await supabase.rpc('increment_event_participants', { event_id: eventId });
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  // Get trending discussions
  async getTrendingDiscussions(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('discussion_forums')
        .select(`
          *,
          creator:created_by (
            username,
            display_name,
            avatar_url
          ),
          club:club_id (
            name
          )
        `)
        .order('view_count', { ascending: false })
        .order('reply_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending discussions:', error);
      throw error;
    }
  },

  // Post in a discussion forum
  async postDiscussionReply(forumId: string, userId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          forum_id: forumId,
          user_id: userId,
          content: content,
        });

      if (error) throw error;

      // Update reply count
      await supabase.rpc('increment_forum_replies', { forum_id: forumId });
    } catch (error) {
      console.error('Error posting discussion reply:', error);
      throw error;
    }
  },

  // Get user's clubs
  async getUserClubs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          *,
          club:club_id (
            id,
            name,
            description,
            cover_image_url,
            member_count,
            status,
            creator:creator_id (
              username,
              display_name
            )
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      throw error;
    }
  },

  // Discover new clubs to join
  async discoverClubs(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('reading_clubs')
        .select(`
          *,
          creator:creator_id (
            username,
            display_name
          )
        `)
        .eq('is_private', false)
        .eq('status', 'active')
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error discovering clubs:', error);
      throw error;
    }
  },

  // Join a club
  async joinClub(clubId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: userId,
          role: 'member',
        });

      if (error) throw error;

      // Update member count
      await supabase.rpc('increment_club_members', { club_id: clubId });
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  },
};