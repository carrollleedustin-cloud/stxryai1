/**
 * Reading List & Collections Service
 * Manages user reading lists, collections, and editorial picks
 */

import { createClient } from '@/lib/supabase/client';

export interface ReadingList {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isDefault: boolean;
  listType: 'custom' | 'read_later' | 'favorites' | 'currently_reading' | 'completed';
  coverImageUrl: string | null;
  storyCount: number;
  followersCount: number;
  createdAt: string;
  stories?: ReadingListStory[];
}

export interface ReadingListStory {
  id: string;
  storyId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  authorName: string;
  genre: string;
  notes: string | null;
  addedAt: string;
}

export interface EditorialCollection {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  collectionType: 'staff_picks' | 'seasonal' | 'themed' | 'new_releases' | 'hidden_gems' | 'classics';
  isFeatured: boolean;
  stories: ReadingListStory[];
}

class ReadingListService {
  private supabase = createClient();

  /**
   * Get all reading lists for a user
   */
  async getUserLists(userId: string): Promise<ReadingList[]> {
    try {
      const { data, error } = await this.supabase
        .from('reading_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reading lists:', error);
        return [];
      }

      return (data || []).map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: list.is_public,
        isDefault: list.is_default,
        listType: list.list_type,
        coverImageUrl: list.cover_image_url,
        storyCount: list.story_count,
        followersCount: list.followers_count,
        createdAt: list.created_at,
      }));
    } catch (error) {
      console.error('Error in getUserLists:', error);
      return [];
    }
  }

  /**
   * Create a new reading list
   */
  async createList(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<ReadingList | null> {
    try {
      const { data, error } = await this.supabase
        .from('reading_lists')
        .insert({
          user_id: userId,
          name,
          description,
          is_public: isPublic,
          list_type: 'custom',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reading list:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        isPublic: data.is_public,
        isDefault: data.is_default,
        listType: data.list_type,
        coverImageUrl: data.cover_image_url,
        storyCount: 0,
        followersCount: 0,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error in createList:', error);
      return null;
    }
  }

  /**
   * Get or create default lists
   */
  async getOrCreateDefaultLists(userId: string): Promise<Record<string, ReadingList>> {
    const defaultListTypes = ['read_later', 'favorites', 'currently_reading', 'completed'] as const;
    const result: Record<string, ReadingList> = {};

    for (const listType of defaultListTypes) {
      // Check if exists
      const { data: existing } = await this.supabase
        .from('reading_lists')
        .select('*')
        .eq('user_id', userId)
        .eq('list_type', listType)
        .single();

      if (existing) {
        result[listType] = {
          id: existing.id,
          name: existing.name,
          description: existing.description,
          isPublic: existing.is_public,
          isDefault: true,
          listType: existing.list_type,
          coverImageUrl: existing.cover_image_url,
          storyCount: existing.story_count,
          followersCount: existing.followers_count,
          createdAt: existing.created_at,
        };
      } else {
        // Create default list
        const names: Record<string, string> = {
          read_later: 'Read Later',
          favorites: 'Favorites',
          currently_reading: 'Currently Reading',
          completed: 'Completed',
        };

        const { data: created } = await this.supabase
          .from('reading_lists')
          .insert({
            user_id: userId,
            name: names[listType],
            list_type: listType,
            is_default: true,
            is_public: false,
          })
          .select()
          .single();

        if (created) {
          result[listType] = {
            id: created.id,
            name: created.name,
            description: created.description,
            isPublic: created.is_public,
            isDefault: true,
            listType: created.list_type,
            coverImageUrl: created.cover_image_url,
            storyCount: 0,
            followersCount: 0,
            createdAt: created.created_at,
          };
        }
      }
    }

    return result;
  }

  /**
   * Get a single reading list with stories
   */
  async getListWithStories(listId: string): Promise<ReadingList | null> {
    try {
      const { data: list, error } = await this.supabase
        .from('reading_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (error || !list) {
        return null;
      }

      // Get stories in the list
      const { data: listStories } = await this.supabase
        .from('reading_list_stories')
        .select(`
          id,
          story_id,
          notes,
          added_at,
          stories!reading_list_stories_story_id_fkey (
            id, title, description, cover_image_url, genre,
            user_profiles!stories_author_id_fkey(display_name)
          )
        `)
        .eq('list_id', listId)
        .order('order_index', { ascending: true });

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: list.is_public,
        isDefault: list.is_default,
        listType: list.list_type,
        coverImageUrl: list.cover_image_url,
        storyCount: list.story_count,
        followersCount: list.followers_count,
        createdAt: list.created_at,
        stories: (listStories || []).map((ls) => {
          const story = ls.stories as any;
          return {
            id: ls.id,
            storyId: ls.story_id,
            title: story.title,
            description: story.description || '',
            coverImageUrl: story.cover_image_url || '',
            authorName: story.user_profiles?.display_name || 'Unknown',
            genre: story.genre || '',
            notes: ls.notes,
            addedAt: ls.added_at,
          };
        }),
      };
    } catch (error) {
      console.error('Error in getListWithStories:', error);
      return null;
    }
  }

  /**
   * Add a story to a reading list
   */
  async addStoryToList(listId: string, storyId: string, notes?: string): Promise<boolean> {
    try {
      // Check if already in list
      const { data: existing } = await this.supabase
        .from('reading_list_stories')
        .select('id')
        .eq('list_id', listId)
        .eq('story_id', storyId)
        .single();

      if (existing) {
        return true; // Already in list
      }

      // Get current max order
      const { data: maxOrder } = await this.supabase
        .from('reading_list_stories')
        .select('order_index')
        .eq('list_id', listId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const newOrder = (maxOrder?.order_index || 0) + 1;

      // Add to list
      const { error } = await this.supabase.from('reading_list_stories').insert({
        list_id: listId,
        story_id: storyId,
        notes,
        order_index: newOrder,
      });

      if (error) {
        console.error('Error adding story to list:', error);
        return false;
      }

      // Update story count
      await this.supabase.rpc('increment_list_story_count', { list_id: listId });

      return true;
    } catch (error) {
      console.error('Error in addStoryToList:', error);
      return false;
    }
  }

  /**
   * Remove a story from a reading list
   */
  async removeStoryFromList(listId: string, storyId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_list_stories')
        .delete()
        .eq('list_id', listId)
        .eq('story_id', storyId);

      if (error) {
        console.error('Error removing story from list:', error);
        return false;
      }

      // Update story count
      await this.supabase.rpc('decrement_list_story_count', { list_id: listId });

      return true;
    } catch (error) {
      console.error('Error in removeStoryFromList:', error);
      return false;
    }
  }

  /**
   * Quick add to "Read Later"
   */
  async addToReadLater(userId: string, storyId: string): Promise<boolean> {
    try {
      const defaultLists = await this.getOrCreateDefaultLists(userId);
      const readLaterList = defaultLists['read_later'];

      if (!readLaterList) {
        return false;
      }

      return await this.addStoryToList(readLaterList.id, storyId);
    } catch (error) {
      console.error('Error adding to read later:', error);
      return false;
    }
  }

  /**
   * Quick add to "Favorites"
   */
  async addToFavorites(userId: string, storyId: string): Promise<boolean> {
    try {
      const defaultLists = await this.getOrCreateDefaultLists(userId);
      const favoritesList = defaultLists['favorites'];

      if (!favoritesList) {
        return false;
      }

      return await this.addStoryToList(favoritesList.id, storyId);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  /**
   * Check if story is in any list
   */
  async getStoryListStatus(userId: string, storyId: string): Promise<Record<string, boolean>> {
    try {
      const { data: userLists } = await this.supabase
        .from('reading_lists')
        .select('id, list_type')
        .eq('user_id', userId);

      if (!userLists) return {};

      const listIds = userLists.map((l) => l.id);

      const { data: listStories } = await this.supabase
        .from('reading_list_stories')
        .select('list_id')
        .eq('story_id', storyId)
        .in('list_id', listIds);

      const inLists = new Set(listStories?.map((ls) => ls.list_id) || []);

      const status: Record<string, boolean> = {};
      for (const list of userLists) {
        status[list.list_type] = inLists.has(list.id);
      }

      return status;
    } catch (error) {
      console.error('Error getting story list status:', error);
      return {};
    }
  }

  /**
   * Update list details
   */
  async updateList(
    listId: string,
    updates: Partial<{ name: string; description: string; isPublic: boolean; coverImageUrl: string }>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_lists')
        .update({
          name: updates.name,
          description: updates.description,
          is_public: updates.isPublic,
          cover_image_url: updates.coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);

      return !error;
    } catch (error) {
      console.error('Error updating list:', error);
      return false;
    }
  }

  /**
   * Delete a reading list
   */
  async deleteList(listId: string): Promise<boolean> {
    try {
      // Can't delete default lists
      const { data: list } = await this.supabase
        .from('reading_lists')
        .select('is_default')
        .eq('id', listId)
        .single();

      if (list?.is_default) {
        return false;
      }

      const { error } = await this.supabase.from('reading_lists').delete().eq('id', listId);

      return !error;
    } catch (error) {
      console.error('Error deleting list:', error);
      return false;
    }
  }

  /**
   * Follow a public list
   */
  async followList(userId: string, listId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('reading_list_followers').insert({
        list_id: listId,
        user_id: userId,
      });

      if (!error) {
        await this.supabase.rpc('increment_list_followers', { list_id: listId });
      }

      return !error;
    } catch (error) {
      console.error('Error following list:', error);
      return false;
    }
  }

  /**
   * Unfollow a list
   */
  async unfollowList(userId: string, listId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_list_followers')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);

      if (!error) {
        await this.supabase.rpc('decrement_list_followers', { list_id: listId });
      }

      return !error;
    } catch (error) {
      console.error('Error unfollowing list:', error);
      return false;
    }
  }

  /**
   * Get popular public lists
   */
  async getPopularLists(limit: number = 10): Promise<ReadingList[]> {
    try {
      const { data } = await this.supabase
        .from('reading_lists')
        .select('*')
        .eq('is_public', true)
        .order('followers_count', { ascending: false })
        .limit(limit);

      return (data || []).map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: true,
        isDefault: list.is_default,
        listType: list.list_type,
        coverImageUrl: list.cover_image_url,
        storyCount: list.story_count,
        followersCount: list.followers_count,
        createdAt: list.created_at,
      }));
    } catch (error) {
      console.error('Error getting popular lists:', error);
      return [];
    }
  }

  /**
   * Get editorial/staff collections
   */
  async getEditorialCollections(featured: boolean = false): Promise<EditorialCollection[]> {
    try {
      let query = this.supabase
        .from('editorial_collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (featured) {
        query = query.eq('is_featured', true);
      }

      const { data: collections } = await query;

      if (!collections) return [];

      // Get stories for each collection
      const result: EditorialCollection[] = [];

      for (const collection of collections) {
        const { data: collectionStories } = await this.supabase
          .from('editorial_collection_stories')
          .select(`
            curator_note,
            stories!editorial_collection_stories_story_id_fkey (
              id, title, description, cover_image_url, genre,
              user_profiles!stories_author_id_fkey(display_name)
            )
          `)
          .eq('collection_id', collection.id)
          .order('order_index', { ascending: true });

        result.push({
          id: collection.id,
          title: collection.title,
          subtitle: collection.subtitle,
          description: collection.description,
          coverImageUrl: collection.cover_image_url,
          collectionType: collection.collection_type,
          isFeatured: collection.is_featured,
          stories: (collectionStories || []).map((cs) => {
            const story = cs.stories as any;
            return {
              id: story.id,
              storyId: story.id,
              title: story.title,
              description: story.description || '',
              coverImageUrl: story.cover_image_url || '',
              authorName: story.user_profiles?.display_name || 'Unknown',
              genre: story.genre || '',
              notes: cs.curator_note,
              addedAt: '',
            };
          }),
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting editorial collections:', error);
      return [];
    }
  }

  /**
   * Reorder stories in a list
   */
  async reorderStories(listId: string, storyIds: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < storyIds.length; i++) {
        await this.supabase
          .from('reading_list_stories')
          .update({ order_index: i })
          .eq('list_id', listId)
          .eq('story_id', storyIds[i]);
      }
      return true;
    } catch (error) {
      console.error('Error reordering stories:', error);
      return false;
    }
  }
}

export const readingListService = new ReadingListService();
