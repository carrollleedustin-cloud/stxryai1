/**
 * Reading Progress Sync Service
 * Cross-device reading position synchronization
 */

import { createClient } from '@/lib/supabase/client';

export interface ReadingPosition {
  storyId: string;
  chapterId: string | null;
  scrollPosition: number;
  paragraphIndex: number;
  wordIndex: number;
  deviceId: string;
  deviceName: string;
  lastSyncedAt: string;
}

export interface ReadingHistoryItem {
  id: string;
  storyId: string;
  chapterId: string | null;
  actionType: 'started' | 'resumed' | 'completed_chapter' | 'completed_story' | 'bookmarked' | 'choice_made';
  metadata: Record<string, any>;
  createdAt: string;
  storyTitle?: string;
  chapterTitle?: string;
}

export interface ContinueReadingItem {
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  coverImageUrl: string;
  authorName: string;
  progressPercentage: number;
  currentChapter: string | null;
  lastReadAt: string;
}

class ReadingProgressSyncService {
  private supabase = createClient();
  private deviceId: string;
  private deviceName: string;

  constructor() {
    // Generate device ID (stored in localStorage)
    if (typeof window !== 'undefined') {
      this.deviceId = localStorage.getItem('stxryai_device_id') || this.generateDeviceId();
      localStorage.setItem('stxryai_device_id', this.deviceId);
      this.deviceName = this.getDeviceName();
    } else {
      this.deviceId = 'server';
      this.deviceName = 'Server';
    }
  }

  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substring(2, 15);
  }

  private getDeviceName(): string {
    if (typeof navigator === 'undefined') return 'Unknown';
    
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown Device';
  }

  /**
   * Get reading position for a story
   */
  async getReadingPosition(userId: string, storyId: string): Promise<ReadingPosition | null> {
    try {
      const { data, error } = await this.supabase
        .from('reading_positions')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reading position:', error);
        return null;
      }

      if (!data) return null;

      return {
        storyId: data.story_id,
        chapterId: data.chapter_id,
        scrollPosition: data.scroll_position,
        paragraphIndex: data.paragraph_index,
        wordIndex: data.word_index,
        deviceId: data.device_id,
        deviceName: data.device_name,
        lastSyncedAt: data.last_synced_at,
      };
    } catch (error) {
      console.error('Error in getReadingPosition:', error);
      return null;
    }
  }

  /**
   * Save reading position
   */
  async saveReadingPosition(
    userId: string,
    storyId: string,
    position: {
      chapterId?: string;
      scrollPosition?: number;
      paragraphIndex?: number;
      wordIndex?: number;
    }
  ): Promise<void> {
    try {
      await this.supabase.from('reading_positions').upsert({
        user_id: userId,
        story_id: storyId,
        chapter_id: position.chapterId,
        scroll_position: position.scrollPosition || 0,
        paragraph_index: position.paragraphIndex || 0,
        word_index: position.wordIndex || 0,
        device_id: this.deviceId,
        device_name: this.deviceName,
        last_synced_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving reading position:', error);
    }
  }

  /**
   * Record reading history event
   */
  async recordHistory(
    userId: string,
    storyId: string,
    actionType: ReadingHistoryItem['actionType'],
    chapterId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('reading_history').insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        action_type: actionType,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error recording reading history:', error);
    }
  }

  /**
   * Get reading history
   */
  async getReadingHistory(
    userId: string,
    limit: number = 50
  ): Promise<ReadingHistoryItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('reading_history')
        .select(`
          id,
          story_id,
          chapter_id,
          action_type,
          metadata,
          created_at,
          stories!reading_history_story_id_fkey (title),
          story_chapters!reading_history_chapter_id_fkey (title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching reading history:', error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.id,
        storyId: item.story_id,
        chapterId: item.chapter_id,
        actionType: item.action_type,
        metadata: item.metadata,
        createdAt: item.created_at,
        storyTitle: (item.stories as any)?.title,
        chapterTitle: (item.story_chapters as any)?.title,
      }));
    } catch (error) {
      console.error('Error in getReadingHistory:', error);
      return [];
    }
  }

  /**
   * Get continue reading list
   */
  async getContinueReading(userId: string, limit: number = 10): Promise<ContinueReadingItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('continue_reading')
        .select(`
          story_id,
          progress_percentage,
          last_read_at,
          stories!continue_reading_story_id_fkey (
            id, title, description, cover_image_url,
            user_profiles!stories_author_id_fkey (display_name)
          ),
          reading_positions!inner (chapter_id)
        `)
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching continue reading:', error);
        return [];
      }

      return (data || []).map((item) => {
        const story = item.stories as any;
        const position = Array.isArray(item.reading_positions) 
          ? item.reading_positions[0] 
          : item.reading_positions;
        
        return {
          storyId: item.story_id,
          storyTitle: story?.title || '',
          storyDescription: story?.description || '',
          coverImageUrl: story?.cover_image_url || '',
          authorName: story?.user_profiles?.display_name || 'Unknown',
          progressPercentage: item.progress_percentage,
          currentChapter: position?.chapter_id,
          lastReadAt: item.last_read_at,
        };
      });
    } catch (error) {
      console.error('Error in getContinueReading:', error);
      return [];
    }
  }

  /**
   * Update continue reading queue
   */
  async updateContinueReading(
    userId: string,
    storyId: string,
    progressPercentage: number
  ): Promise<void> {
    try {
      await this.supabase.from('continue_reading').upsert({
        user_id: userId,
        story_id: storyId,
        progress_percentage: progressPercentage,
        last_read_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating continue reading:', error);
    }
  }

  /**
   * Remove from continue reading (when completed)
   */
  async removeFromContinueReading(userId: string, storyId: string): Promise<void> {
    try {
      await this.supabase
        .from('continue_reading')
        .delete()
        .eq('user_id', userId)
        .eq('story_id', storyId);
    } catch (error) {
      console.error('Error removing from continue reading:', error);
    }
  }

  /**
   * Mark story as started
   */
  async startReading(userId: string, storyId: string, firstChapterId?: string): Promise<void> {
    // Record in history
    await this.recordHistory(userId, storyId, 'started', firstChapterId);
    
    // Add to continue reading
    await this.updateContinueReading(userId, storyId, 0);
    
    // Initialize position
    await this.saveReadingPosition(userId, storyId, {
      chapterId: firstChapterId,
      scrollPosition: 0,
      paragraphIndex: 0,
    });
  }

  /**
   * Mark chapter as completed
   */
  async completeChapter(
    userId: string,
    storyId: string,
    chapterId: string,
    progressPercentage: number,
    nextChapterId?: string
  ): Promise<void> {
    // Record in history
    await this.recordHistory(userId, storyId, 'completed_chapter', chapterId);
    
    // Update continue reading
    await this.updateContinueReading(userId, storyId, progressPercentage);
    
    // Update position to next chapter if provided
    if (nextChapterId) {
      await this.saveReadingPosition(userId, storyId, {
        chapterId: nextChapterId,
        scrollPosition: 0,
        paragraphIndex: 0,
      });
    }
  }

  /**
   * Mark story as completed
   */
  async completeStory(userId: string, storyId: string): Promise<void> {
    // Record in history
    await this.recordHistory(userId, storyId, 'completed_story');
    
    // Remove from continue reading
    await this.removeFromContinueReading(userId, storyId);
    
    // Update progress to 100%
    await this.supabase
      .from('user_reading_progress')
      .upsert({
        user_id: userId,
        story_id: storyId,
        progress_percentage: 100,
        completed: true,
        completed_at: new Date().toISOString(),
      });
  }

  /**
   * Record choice made
   */
  async recordChoice(
    userId: string,
    storyId: string,
    chapterId: string,
    choiceId: string,
    choiceText: string
  ): Promise<void> {
    await this.recordHistory(userId, storyId, 'choice_made', chapterId, {
      choice_id: choiceId,
      choice_text: choiceText,
    });
  }

  /**
   * Get reading stats
   */
  async getReadingStats(userId: string): Promise<{
    totalStoriesStarted: number;
    totalStoriesCompleted: number;
    totalChaptersRead: number;
    totalChoicesMade: number;
    favoriteGenre: string | null;
  }> {
    try {
      const { data: history } = await this.supabase
        .from('reading_history')
        .select('action_type, story_id')
        .eq('user_id', userId);

      if (!history) {
        return {
          totalStoriesStarted: 0,
          totalStoriesCompleted: 0,
          totalChaptersRead: 0,
          totalChoicesMade: 0,
          favoriteGenre: null,
        };
      }

      const started = history.filter((h) => h.action_type === 'started').length;
      const completed = history.filter((h) => h.action_type === 'completed_story').length;
      const chapters = history.filter((h) => h.action_type === 'completed_chapter').length;
      const choices = history.filter((h) => h.action_type === 'choice_made').length;

      // Get favorite genre
      const completedStoryIds = history
        .filter((h) => h.action_type === 'completed_story')
        .map((h) => h.story_id);

      let favoriteGenre: string | null = null;
      
      if (completedStoryIds.length > 0) {
        const { data: stories } = await this.supabase
          .from('stories')
          .select('genre')
          .in('id', completedStoryIds);

        const genreCounts: Record<string, number> = {};
        for (const story of stories || []) {
          if (story.genre) {
            genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
          }
        }

        const sorted = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);
        favoriteGenre = sorted[0]?.[0] || null;
      }

      return {
        totalStoriesStarted: started,
        totalStoriesCompleted: completed,
        totalChaptersRead: chapters,
        totalChoicesMade: choices,
        favoriteGenre,
      };
    } catch (error) {
      console.error('Error getting reading stats:', error);
      return {
        totalStoriesStarted: 0,
        totalStoriesCompleted: 0,
        totalChaptersRead: 0,
        totalChoicesMade: 0,
        favoriteGenre: null,
      };
    }
  }

  /**
   * Sync from another device
   */
  async getLastDeviceSync(userId: string, storyId: string): Promise<{
    deviceName: string;
    lastSyncedAt: string;
    isSameDevice: boolean;
  } | null> {
    const position = await this.getReadingPosition(userId, storyId);
    
    if (!position) return null;

    return {
      deviceName: position.deviceName,
      lastSyncedAt: position.lastSyncedAt,
      isSameDevice: position.deviceId === this.deviceId,
    };
  }
}

export const readingProgressSyncService = new ReadingProgressSyncService();
