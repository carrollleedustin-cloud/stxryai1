/**
 * Enhanced Social Features Service
 * Includes: Clubs, Stories, Social Interactions, Messaging, Events
 */

import { supabase } from '@/lib/supabase/client';

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  is_private: boolean;
  cover_image_url?: string;
  tags: string[];
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  author_id: string;
  title: string;
  description: string;
  genre: string;
  difficulty: string;
  cover_image_url?: string;
  is_premium: boolean;
  is_published: boolean;
  estimated_duration: number;
  view_count: number;
  play_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface SocialEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'author_qa' | 'writing_workshop' | 'reading_marathon' | 'book_club';
  scheduled_start: string;
  scheduled_end: string;
  host_id: string;
  max_participants: number;
  participant_count: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
}

class EnhancedSocialService {
  // ============================================================================
  // CLUBS
  // ============================================================================

  async createClub(clubData: Omit<Club, 'id' | 'created_at' | 'updated_at' | 'member_count'>) {
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create club');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  async getClubs(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/clubs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching clubs:', error);
      throw error;
    }
  }

  async joinClub(clubId: string) {
    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join club');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  }

  async leaveClub(clubId: string) {
    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave club');
      }

      return await response.json();
    } catch (error) {
      console.error('Error leaving club:', error);
      throw error;
    }
  }

  async getUserClubs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('club:reading_clubs(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      throw error;
    }
  }

  // ============================================================================
  // STORIES
  // ============================================================================

  async createStory(storyData: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'play_count' | 'like_count'>) {
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create story');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async getUserStories(userId: string, filters?: { published?: boolean; limit?: number; offset?: number }) {
    try {
      const params = new URLSearchParams();
      if (filters?.published !== undefined) params.append('published', filters.published.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/stories?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  async publishStory(storyId: string) {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({ is_published: true })
        .eq('id', storyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error publishing story:', error);
      throw error;
    }
  }

  async likeStory(storyId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: likeError } = await supabase
        .from('story_likes')
        .insert({ user_id: user.id, story_id: storyId });

      if (likeError && !likeError.message.includes('duplicate')) throw likeError;

      // Increment like count
      const { data: story } = await supabase
        .from('stories')
        .select('like_count')
        .eq('id', storyId)
        .single();

      if (story) {
        await supabase
          .from('stories')
          .update({ like_count: (story.like_count || 0) + 1 })
          .eq('id', storyId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error liking story:', error);
      throw error;
    }
  }

  async bookmarkStory(storyId: string, folder: string = 'default') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('story_bookmarks')
        .insert({
          user_id: user.id,
          story_id: storyId,
          folder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bookmarking story:', error);
      throw error;
    }
  }

  // ============================================================================
  // SOCIAL INTERACTIONS
  // ============================================================================

  async followUser(userId: string) {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('user_activity').insert({
        user_id: currentUser.id,
        activity_type: 'follower_new',
        metadata: { followed_user_id: userId },
      });

      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(userId: string) {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getUserFollowers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower:user_profiles!follower_id(*)')
        .eq('following_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  async getUserFollowing(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following:user_profiles!following_id(*)')
        .eq('follower_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }

  // ============================================================================
  // DIRECT MESSAGING
  // ============================================================================

  async sendDirectMessage(recipientId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          message_type: messageType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getDirectMessages(userId: string, limit: number = 50) {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // ============================================================================
  // SOCIAL EVENTS
  // ============================================================================

  async createEvent(eventData: Omit<SocialEvent, 'id' | 'created_at' | 'participant_count'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('live_events')
        .insert({
          ...eventData,
          host_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('scheduled_start', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async registerForEvent(eventId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  // ============================================================================
  // SOCIAL FEED
  // ============================================================================

  async getSocialFeed(limit: number = 20, offset: number = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get activities from followed users
      const { data: followingIds } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followedUserIds = followingIds?.map(f => f.following_id) || [];

      const { data, error } = await supabase
        .from('user_activity')
        .select('*, users(username, display_name, avatar_url)')
        .in('user_id', [...followedUserIds, user.id])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching social feed:', error);
      throw error;
    }
  }
}

export const enhancedSocialService = new EnhancedSocialService();
