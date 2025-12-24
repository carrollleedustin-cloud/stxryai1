import { supabase } from '@/lib/supabase/client';
import {
  insertUserActivity,
  insertUserFriendship,
  updateUserFriendshipById,
  insertReadingList,
  insertReadingListItem,
  deleteReadingListItemByKeys,
} from '@/lib/supabase/typed';
import { withTimeout, isConnectionError, getConnectionErrorMessage } from '@/lib/supabase/timeout';

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, unknown>;
  created_at: string;
}

interface ActivityWithProfile extends UserActivity {
  users?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface ReadingList {
  id: string;
  user_id: string;
  list_name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface FriendshipData {
  friend_id: string;
}

export const userActivityService = {
  // Get user's personal activity feed
  async getUserActivities(userId: string, limit: number = 20): Promise<ActivityWithProfile[]> {
    try {
      const queryPromise = supabase
        .from('user_activities')
        .select(`*,users (username,display_name,avatar_url)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await withTimeout(
        queryPromise,
        { timeout: 8000, errorMessage: 'Request timed out while loading activities' }
      );

      if (error) {
        if (isConnectionError(error)) {
          throw new Error(getConnectionErrorMessage(error));
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      if (isConnectionError(error)) {
        throw new Error(getConnectionErrorMessage(error));
      }
      throw error;
    }
  },

  // Get friend activities for social feed
  async getFriendActivities(userId: string, limit: number = 50): Promise<ActivityWithProfile[]> {
    try {
      // First get user's friend IDs
      const { data: friendships, error: friendError } = await supabase
        .from('user_friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (friendError) throw friendError;

      const friendIds = friendships?.map((f: FriendshipData) => f.friend_id) || [];

      // Include user's own activities
      friendIds.push(userId);

      // Get activities from friends and user
      const { data, error } = await supabase
        .from('user_activities')
        .select(`*,users (username,display_name,avatar_url)`)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching friend activities:', error);
      throw error;
    }
  },

  // Log a new activity
  async createActivity(
    userId: string,
    activityType: string,
    activityData: Record<string, unknown>
  ): Promise<UserActivity> {
    try {
      const { data, error } = await insertUserActivity({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData as unknown as any,
      } as any);

      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  // Get user's friends with detailed profiles
  async getUserFriends(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_friendships')
        .select(
          `
          *,
          friend:friend_id (
            id,
            username,
            display_name,
            avatar_url,
            subscription_tier,
            stories_completed,
            total_reading_time
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user friends:', error);
      throw error;
    }
  },

  // Get pending friend requests
  async getPendingFriendRequests(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_friendships')
        .select(
          `
          *,
          requester:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      throw error;
    }
  },

  // Send friend request
  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    try {
      const { data, error } = await insertUserFriendship({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;

      await this.createActivity(userId, 'friend_request_sent', { friend_id: friendId });

      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: string, userId: string): Promise<void> {
    try {
      const { data, error } = await updateUserFriendshipById(friendshipId, { status: 'accepted' });

      if (error) throw error;

      await this.createActivity(userId, 'friend_accepted', { friendship_id: friendshipId });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Get user's reading lists
  async getReadingLists(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_reading_lists')
        .select(
          `*,items:reading_list_items (id,story:story_id (id,title,cover_image_url,genre,rating,author:user_id (username,display_name)))`
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reading lists:', error);
      throw error;
    }
  },

  // Create new reading list
  async createReadingList(
    userId: string,
    listName: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<ReadingList> {
    try {
      const { data, error } = await insertReadingList({
        user_id: userId,
        list_name: listName,
        description,
        is_public: isPublic,
      });

      if (error) throw error;

      const created = Array.isArray(data) ? data[0] : data;
      await this.createActivity(userId, 'reading_list_created', {
        list_id: created.id,
        list_name: listName,
      });

      return created;
    } catch (error) {
      console.error('Error creating reading list:', error);
      throw error;
    }
  },

  // Add story to reading list
  async addToReadingList(listId: string, storyId: string, userId: string): Promise<void> {
    try {
      const { data, error } = await insertReadingListItem({ list_id: listId, story_id: storyId });

      if (error) throw error;

      await this.createActivity(userId, 'story_added_to_list', {
        list_id: listId,
        story_id: storyId,
      });
    } catch (error) {
      console.error('Error adding to reading list:', error);
      throw error;
    }
  },

  // Remove story from reading list
  async removeFromReadingList(listId: string, storyId: string): Promise<void> {
    try {
      const { data, error } = await deleteReadingListItemByKeys(listId, storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from reading list:', error);
      throw error;
    }
  },
};
