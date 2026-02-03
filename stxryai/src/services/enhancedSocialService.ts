/**
 * Enhanced Social Service
 * Author follows, activity feed, reading buddies
 */

import { createClient } from '@/lib/supabase/client';

export interface AuthorProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  storyCount: number;
  followerCount: number;
  isFollowing: boolean;
}

export interface ActivityItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  activityType: string;
  targetType: string | null;
  targetId: string | null;
  targetTitle: string | null;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface ReadingBuddy {
  id: string;
  buddyId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  currentlyReading: string | null;
  lastActive: string;
}

class EnhancedSocialService {
  private supabase = createClient();

  /**
   * Follow an author
   */
  async followAuthor(userId: string, authorId: string, enableNotifications: boolean = true): Promise<boolean> {
    try {
      if (userId === authorId) {
        return false; // Can't follow yourself
      }

      const { error } = await this.supabase.from('author_follows').insert({
        follower_id: userId,
        author_id: authorId,
        notifications_enabled: enableNotifications,
      });

      if (error) {
        console.error('Error following author:', error);
        return false;
      }

      // Create activity for author
      await this.createActivityItem(authorId, userId, 'followed_you');

      return true;
    } catch (error) {
      console.error('Error in followAuthor:', error);
      return false;
    }
  }

  /**
   * Unfollow an author
   */
  async unfollowAuthor(userId: string, authorId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('author_follows')
        .delete()
        .eq('follower_id', userId)
        .eq('author_id', authorId);

      return !error;
    } catch (error) {
      console.error('Error in unfollowAuthor:', error);
      return false;
    }
  }

  /**
   * Check if following an author
   */
  async isFollowing(userId: string, authorId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('author_follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('author_id', authorId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get authors the user follows
   */
  async getFollowedAuthors(userId: string): Promise<AuthorProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('author_follows')
        .select(`
          author_id,
          user_profiles!author_follows_author_id_fkey (
            id, display_name, username, avatar_url, bio
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching followed authors:', error);
        return [];
      }

      return await Promise.all(
        (data || []).map(async (follow) => {
          const profile = follow.user_profiles as any;
          
          // Get story count
          const { count } = await this.supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', profile.id)
            .eq('is_published', true);

          // Get follower count
          const { count: followerCount } = await this.supabase
            .from('author_follows')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', profile.id);

          return {
            id: profile.id,
            displayName: profile.display_name || 'Unknown',
            username: profile.username || '',
            avatarUrl: profile.avatar_url,
            bio: profile.bio,
            storyCount: count || 0,
            followerCount: followerCount || 0,
            isFollowing: true,
          };
        })
      );
    } catch (error) {
      console.error('Error in getFollowedAuthors:', error);
      return [];
    }
  }

  /**
   * Get author's followers
   */
  async getAuthorFollowers(authorId: string, userId?: string): Promise<AuthorProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('author_follows')
        .select(`
          follower_id,
          user_profiles!author_follows_follower_id_fkey (
            id, display_name, username, avatar_url, bio
          )
        `)
        .eq('author_id', authorId)
        .limit(50);

      if (error) {
        console.error('Error fetching author followers:', error);
        return [];
      }

      const followers = await Promise.all(
        (data || []).map(async (follow) => {
          const profile = follow.user_profiles as any;
          
          let isFollowing = false;
          if (userId) {
            isFollowing = await this.isFollowing(userId, profile.id);
          }

          return {
            id: profile.id,
            displayName: profile.display_name || 'Unknown',
            username: profile.username || '',
            avatarUrl: profile.avatar_url,
            bio: profile.bio,
            storyCount: 0,
            followerCount: 0,
            isFollowing,
          };
        })
      );

      return followers;
    } catch (error) {
      console.error('Error in getAuthorFollowers:', error);
      return [];
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(userId: string, limit: number = 50): Promise<ActivityItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('activity_feed')
        .select(`
          *,
          user_profiles!activity_feed_actor_id_fkey (display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity feed:', error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.id,
        actorId: item.actor_id,
        actorName: (item.user_profiles as any)?.display_name,
        actorAvatarUrl: (item.user_profiles as any)?.avatar_url,
        activityType: item.activity_type,
        targetType: item.target_type,
        targetId: item.target_id,
        targetTitle: item.metadata?.title,
        metadata: item.metadata || {},
        isRead: item.is_read,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error in getActivityFeed:', error);
      return [];
    }
  }

  /**
   * Create activity item
   */
  async createActivityItem(
    userId: string,
    actorId: string | null,
    activityType: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('activity_feed').insert({
        user_id: userId,
        actor_id: actorId,
        activity_type: activityType,
        target_type: targetType,
        target_id: targetId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error creating activity item:', error);
    }
  }

  /**
   * Mark activities as read
   */
  async markActivitiesAsRead(userId: string, activityIds?: string[]): Promise<void> {
    try {
      let query = this.supabase
        .from('activity_feed')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (activityIds && activityIds.length > 0) {
        query = query.in('id', activityIds);
      }

      await query;
    } catch (error) {
      console.error('Error marking activities as read:', error);
    }
  }

  /**
   * Get unread activity count
   */
  async getUnreadActivityCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send reading buddy request
   */
  async sendBuddyRequest(userId: string, buddyId: string): Promise<boolean> {
    try {
      if (userId === buddyId) {
        return false;
      }

      const { error } = await this.supabase.from('reading_buddies').insert({
        user_id: userId,
        buddy_id: buddyId,
        status: 'pending',
      });

      if (error) {
        console.error('Error sending buddy request:', error);
        return false;
      }

      // Create activity for buddy
      await this.createActivityItem(buddyId, userId, 'buddy_request');

      return true;
    } catch (error) {
      console.error('Error in sendBuddyRequest:', error);
      return false;
    }
  }

  /**
   * Accept buddy request
   */
  async acceptBuddyRequest(userId: string, requesterId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_buddies')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('user_id', requesterId)
        .eq('buddy_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error accepting buddy request:', error);
        return false;
      }

      // Create reciprocal relationship
      await this.supabase.from('reading_buddies').insert({
        user_id: userId,
        buddy_id: requesterId,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      });

      // Create activity
      await this.createActivityItem(requesterId, userId, 'buddy_accepted');

      return true;
    } catch (error) {
      console.error('Error in acceptBuddyRequest:', error);
      return false;
    }
  }

  /**
   * Decline buddy request
   */
  async declineBuddyRequest(userId: string, requesterId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_buddies')
        .update({ status: 'declined' })
        .eq('user_id', requesterId)
        .eq('buddy_id', userId)
        .eq('status', 'pending');

      return !error;
    } catch (error) {
      console.error('Error in declineBuddyRequest:', error);
      return false;
    }
  }

  /**
   * Get reading buddies
   */
  async getReadingBuddies(userId: string): Promise<ReadingBuddy[]> {
    try {
      const { data, error } = await this.supabase
        .from('reading_buddies')
        .select(`
          *,
          user_profiles!reading_buddies_buddy_id_fkey (
            id, display_name, username, avatar_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching reading buddies:', error);
        return [];
      }

      return (data || []).map((buddy) => {
        const profile = buddy.user_profiles as any;
        return {
          id: buddy.id,
          buddyId: buddy.buddy_id,
          displayName: profile?.display_name || 'Unknown',
          username: profile?.username || '',
          avatarUrl: profile?.avatar_url,
          status: buddy.status,
          currentlyReading: null, // Would need to join with continue_reading
          lastActive: buddy.accepted_at,
        };
      });
    } catch (error) {
      console.error('Error in getReadingBuddies:', error);
      return [];
    }
  }

  /**
   * Get pending buddy requests
   */
  async getPendingBuddyRequests(userId: string): Promise<ReadingBuddy[]> {
    try {
      const { data, error } = await this.supabase
        .from('reading_buddies')
        .select(`
          *,
          user_profiles!reading_buddies_user_id_fkey (
            id, display_name, username, avatar_url
          )
        `)
        .eq('buddy_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      return (data || []).map((request) => {
        const profile = request.user_profiles as any;
        return {
          id: request.id,
          buddyId: request.user_id,
          displayName: profile?.display_name || 'Unknown',
          username: profile?.username || '',
          avatarUrl: profile?.avatar_url,
          status: request.status,
          currentlyReading: null,
          lastActive: request.requested_at,
        };
      });
    } catch (error) {
      console.error('Error in getPendingBuddyRequests:', error);
      return [];
    }
  }

  /**
   * Broadcast activity to followers
   */
  async broadcastToFollowers(
    authorId: string,
    activityType: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Get all followers with notifications enabled
      const { data: followers } = await this.supabase
        .from('author_follows')
        .select('follower_id')
        .eq('author_id', authorId)
        .eq('notifications_enabled', true);

      if (!followers || followers.length === 0) {
        return;
      }

      // Create activity items for all followers
      const activities = followers.map((f) => ({
        user_id: f.follower_id,
        actor_id: authorId,
        activity_type: activityType,
        target_type: targetType,
        target_id: targetId,
        metadata: metadata || {},
      }));

      await this.supabase.from('activity_feed').insert(activities);
    } catch (error) {
      console.error('Error broadcasting to followers:', error);
    }
  }

  /**
   * Toggle follow notifications
   */
  async toggleFollowNotifications(userId: string, authorId: string, enabled: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('author_follows')
        .update({ notifications_enabled: enabled })
        .eq('follower_id', userId)
        .eq('author_id', authorId);

      return !error;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return false;
    }
  }

  /**
   * Get clubs/book clubs
   */
  async getClubs(options?: {
    category?: string;
    search?: string;
    limit?: number;
  }): Promise<{ clubs: any[]; total: number }> {
    try {
      let query = this.supabase
        .from('book_clubs')
        .select('*, owner:user_profiles!book_clubs_owner_id_fkey(id, display_name, avatar_url)', { count: 'exact' })
        .eq('is_public', true);

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('member_count', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching clubs:', error);
        return { clubs: [], total: 0 };
      }

      return {
        clubs: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error in getClubs:', error);
      return { clubs: [], total: 0 };
    }
  }

  /**
   * Create a new club
   */
  async createClub(userId: string, clubData: {
    name: string;
    description?: string;
    coverImageUrl?: string;
    isPublic?: boolean;
    maxMembers?: number;
  }): Promise<{ success: boolean; clubId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('book_clubs')
        .insert({
          name: clubData.name,
          description: clubData.description,
          cover_image_url: clubData.coverImageUrl,
          owner_id: userId,
          is_public: clubData.isPublic ?? true,
          max_members: clubData.maxMembers ?? 100,
          member_count: 1,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating club:', error);
        return { success: false, error: error.message };
      }

      // Add owner as first member
      await this.supabase.from('book_club_members').insert({
        club_id: data.id,
        user_id: userId,
        role: 'owner',
      });

      return { success: true, clubId: data.id };
    } catch (error) {
      console.error('Error in createClub:', error);
      return { success: false, error: 'Failed to create club' };
    }
  }

  /**
   * Join a club
   */
  async joinClub(userId: string, clubId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('book_club_members').insert({
        club_id: clubId,
        user_id: userId,
        role: 'member',
      });

      if (!error) {
        // Increment member count
        await this.supabase.rpc('increment_club_members', { club_id: clubId });
      }

      return !error;
    } catch (error) {
      console.error('Error joining club:', error);
      return false;
    }
  }

  /**
   * Leave a club
   */
  async leaveClub(userId: string, clubId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('book_club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (!error) {
        // Decrement member count
        await this.supabase.rpc('decrement_club_members', { club_id: clubId });
      }

      return !error;
    } catch (error) {
      console.error('Error leaving club:', error);
      return false;
    }
  }
}

export const enhancedSocialService = new EnhancedSocialService();
