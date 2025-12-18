/**
 * Story Collections Service
 * Allows users to create and manage curated story collections/playlists.
 */

import { supabase } from '@/lib/supabase/client';
import { Story } from '@/types/database';

// Types
export interface StoryCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_public: boolean;
  is_featured: boolean;
  story_count: number;
  follower_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionStory {
  id: string;
  collection_id: string;
  story_id: string;
  position: number;
  added_at: string;
  note?: string;
  story?: Story;
}

export interface CollectionFollower {
  id: string;
  collection_id: string;
  user_id: string;
  followed_at: string;
}

export interface CollectionWithStories extends StoryCollection {
  stories: CollectionStory[];
  creator?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const collectionService = {
  /**
   * Create a new collection
   */
  async createCollection(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<StoryCollection | null> {
    const { data, error } = await supabase
      .from('story_collections')
      .insert({
        user_id: userId,
        name,
        description,
        is_public: isPublic,
        is_featured: false,
        story_count: 0,
        follower_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      return null;
    }

    return data;
  },

  /**
   * Get user's collections
   */
  async getUserCollections(userId: string): Promise<StoryCollection[]> {
    const { data, error } = await supabase
      .from('story_collections')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get a collection with its stories
   */
  async getCollectionWithStories(
    collectionId: string
  ): Promise<CollectionWithStories | null> {
    const { data: collection, error: collectionError } = await supabase
      .from('story_collections')
      .select(
        `
        *,
        creator:user_id (
          id,
          display_name,
          avatar_url
        )
      `
      )
      .eq('id', collectionId)
      .single();

    if (collectionError || !collection) {
      console.error('Error fetching collection:', collectionError);
      return null;
    }

    const { data: stories, error: storiesError } = await supabase
      .from('collection_stories')
      .select(
        `
        *,
        story:story_id (
          id,
          title,
          description,
          cover_image_url,
          genre,
          rating,
          view_count,
          estimated_duration
        )
      `
      )
      .eq('collection_id', collectionId)
      .order('position', { ascending: true });

    if (storiesError) {
      console.error('Error fetching collection stories:', storiesError);
    }

    return {
      ...collection,
      stories: stories || [],
    } as CollectionWithStories;
  },

  /**
   * Add a story to a collection
   */
  async addStoryToCollection(
    collectionId: string,
    storyId: string,
    note?: string
  ): Promise<boolean> {
    // Get current max position
    const { data: existing } = await supabase
      .from('collection_stories')
      .select('position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existing?.[0]?.position ?? 0 + 1;

    const { error } = await supabase.from('collection_stories').insert({
      collection_id: collectionId,
      story_id: storyId,
      position: nextPosition,
      note,
    });

    if (error) {
      console.error('Error adding story to collection:', error);
      return false;
    }

    // Update story count
    await supabase.rpc('increment_collection_story_count', {
      collection_id: collectionId,
    });

    return true;
  },

  /**
   * Remove a story from a collection
   */
  async removeStoryFromCollection(
    collectionId: string,
    storyId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('collection_stories')
      .delete()
      .eq('collection_id', collectionId)
      .eq('story_id', storyId);

    if (error) {
      console.error('Error removing story from collection:', error);
      return false;
    }

    // Update story count
    await supabase.rpc('decrement_collection_story_count', {
      collection_id: collectionId,
    });

    return true;
  },

  /**
   * Reorder stories in a collection
   */
  async reorderCollectionStories(
    collectionId: string,
    storyIds: string[]
  ): Promise<boolean> {
    const updates = storyIds.map((storyId, index) => ({
      collection_id: collectionId,
      story_id: storyId,
      position: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('collection_stories')
        .update({ position: update.position })
        .eq('collection_id', update.collection_id)
        .eq('story_id', update.story_id);

      if (error) {
        console.error('Error reordering collection:', error);
        return false;
      }
    }

    return true;
  },

  /**
   * Update collection details
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<Pick<StoryCollection, 'name' | 'description' | 'is_public' | 'cover_image_url'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('story_collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', collectionId);

    if (error) {
      console.error('Error updating collection:', error);
      return false;
    }

    return true;
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: string): Promise<boolean> {
    // Delete collection stories first
    await supabase
      .from('collection_stories')
      .delete()
      .eq('collection_id', collectionId);

    // Delete followers
    await supabase
      .from('collection_followers')
      .delete()
      .eq('collection_id', collectionId);

    // Delete collection
    const { error } = await supabase
      .from('story_collections')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error('Error deleting collection:', error);
      return false;
    }

    return true;
  },

  /**
   * Follow a public collection
   */
  async followCollection(
    collectionId: string,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase.from('collection_followers').insert({
      collection_id: collectionId,
      user_id: userId,
    });

    if (error) {
      console.error('Error following collection:', error);
      return false;
    }

    await supabase.rpc('increment_collection_follower_count', {
      collection_id: collectionId,
    });

    return true;
  },

  /**
   * Unfollow a collection
   */
  async unfollowCollection(
    collectionId: string,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('collection_followers')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unfollowing collection:', error);
      return false;
    }

    await supabase.rpc('decrement_collection_follower_count', {
      collection_id: collectionId,
    });

    return true;
  },

  /**
   * Check if user follows a collection
   */
  async isFollowingCollection(
    collectionId: string,
    userId: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from('collection_followers')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
      .single();

    return !!data;
  },

  /**
   * Get collections user is following
   */
  async getFollowedCollections(userId: string): Promise<StoryCollection[]> {
    const { data, error } = await supabase
      .from('collection_followers')
      .select(
        `
        collection:collection_id (
          *,
          creator:user_id (
            display_name,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching followed collections:', error);
      return [];
    }

    return data?.map((d) => d.collection as unknown as StoryCollection) || [];
  },

  /**
   * Get featured/popular public collections
   */
  async getFeaturedCollections(limit: number = 10): Promise<StoryCollection[]> {
    const { data, error } = await supabase
      .from('story_collections')
      .select(
        `
        *,
        creator:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq('is_public', true)
      .order('follower_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured collections:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Search public collections
   */
  async searchCollections(query: string): Promise<StoryCollection[]> {
    const { data, error } = await supabase
      .from('story_collections')
      .select(
        `
        *,
        creator:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq('is_public', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('follower_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching collections:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Quick add to "Read Later" collection
   */
  async addToReadLater(userId: string, storyId: string): Promise<boolean> {
    // Find or create "Read Later" collection
    let { data: readLater } = await supabase
      .from('story_collections')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Read Later')
      .single();

    if (!readLater) {
      const newCollection = await this.createCollection(
        userId,
        'Read Later',
        'Stories saved for later reading',
        false
      );
      if (!newCollection) return false;
      readLater = { id: newCollection.id };
    }

    return this.addStoryToCollection(readLater.id, storyId);
  },

  /**
   * Quick add to "Favorites" collection
   */
  async addToFavorites(userId: string, storyId: string): Promise<boolean> {
    // Find or create "Favorites" collection
    let { data: favorites } = await supabase
      .from('story_collections')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Favorites')
      .single();

    if (!favorites) {
      const newCollection = await this.createCollection(
        userId,
        'Favorites',
        'My favorite stories',
        false
      );
      if (!newCollection) return false;
      favorites = { id: newCollection.id };
    }

    return this.addStoryToCollection(favorites.id, storyId);
  },
};

export default collectionService;
