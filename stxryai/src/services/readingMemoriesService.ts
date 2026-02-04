/**
 * Reading Memories Service
 * Capture and preserve memorable moments from stories
 * Create persistent emotional anchors that users can revisit
 */

import { createClient } from '@/lib/supabase/client';

export interface ReadingMemory {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  
  // The moment
  memoryType: 'choice' | 'quote' | 'character' | 'ending' | 'milestone' | 'emotion';
  title: string;
  description: string;
  
  // Context
  choiceText?: string;
  quoteText?: string;
  characterName?: string;
  emotionalTone: 'joy' | 'sadness' | 'excitement' | 'fear' | 'love' | 'triumph' | 'loss' | 'wonder';
  intensity: number; // 0-100
  
  // Visual
  screenshotUrl?: string;
  backgroundColor: string;
  accentColor: string;
  
  // Meta
  storyTitle: string;
  storyGenre: string;
  chapterTitle?: string;
  readingProgress: number;
  
  // Social
  isPublic: boolean;
  likes: number;
  
  // Timestamps
  capturedAt: string;
  storyDate: string; // When in the story this happened
}

export interface MemoryCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  memoryIds: string[];
  isPublic: boolean;
  theme: 'default' | 'romantic' | 'adventure' | 'dark' | 'whimsical' | 'epic';
  createdAt: string;
  updatedAt: string;
}

export interface AnniversaryReminder {
  id: string;
  userId: string;
  memoryId: string;
  memory: ReadingMemory;
  message: string;
  yearsAgo: number;
  reminderDate: string;
}

// Emotional tone colors
const emotionColors: Record<string, { bg: string; accent: string }> = {
  joy: { bg: '#FEF3C7', accent: '#F59E0B' },
  sadness: { bg: '#DBEAFE', accent: '#3B82F6' },
  excitement: { bg: '#FCE7F3', accent: '#EC4899' },
  fear: { bg: '#1F2937', accent: '#6B7280' },
  love: { bg: '#FDF2F8', accent: '#F472B6' },
  triumph: { bg: '#D1FAE5', accent: '#10B981' },
  loss: { bg: '#E5E7EB', accent: '#4B5563' },
  wonder: { bg: '#EDE9FE', accent: '#8B5CF6' },
};

class ReadingMemoriesService {
  private supabase = createClient();

  /**
   * Capture a new reading memory
   */
  async captureMemory(
    userId: string,
    data: {
      storyId: string;
      chapterId: string;
      memoryType: ReadingMemory['memoryType'];
      title: string;
      description: string;
      choiceText?: string;
      quoteText?: string;
      characterName?: string;
      emotionalTone: ReadingMemory['emotionalTone'];
      intensity: number;
      storyTitle: string;
      storyGenre: string;
      chapterTitle?: string;
      readingProgress: number;
      isPublic?: boolean;
    }
  ): Promise<ReadingMemory | null> {
    try {
      const colors = emotionColors[data.emotionalTone] || emotionColors.wonder;

      const { data: memory, error } = await this.supabase
        .from('reading_memories')
        .insert({
          user_id: userId,
          story_id: data.storyId,
          chapter_id: data.chapterId,
          memory_type: data.memoryType,
          title: data.title,
          description: data.description,
          choice_text: data.choiceText,
          quote_text: data.quoteText,
          character_name: data.characterName,
          emotional_tone: data.emotionalTone,
          intensity: data.intensity,
          background_color: colors.bg,
          accent_color: colors.accent,
          story_title: data.storyTitle,
          story_genre: data.storyGenre,
          chapter_title: data.chapterTitle,
          reading_progress: data.readingProgress,
          is_public: data.isPublic || false,
          story_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error capturing memory:', error);
        return null;
      }

      return this.mapMemory(memory);
    } catch (error) {
      console.error('Error in captureMemory:', error);
      return null;
    }
  }

  /**
   * Auto-detect memorable moments from reading context
   */
  detectMemorableMoment(context: {
    choiceText?: string;
    narrativeText?: string;
    recentEvents?: string[];
    emotionalIntensity?: number;
    isEnding?: boolean;
    isFirstChapter?: boolean;
    characterIntroduced?: string;
    majorPlotPoint?: boolean;
  }): { shouldCapture: boolean; type: ReadingMemory['memoryType']; reason: string } | null {
    // High emotional intensity triggers
    if (context.emotionalIntensity && context.emotionalIntensity > 80) {
      return { shouldCapture: true, type: 'emotion', reason: 'Intense emotional moment' };
    }

    // Ending triggers
    if (context.isEnding) {
      return { shouldCapture: true, type: 'ending', reason: 'Story ending reached' };
    }

    // Major plot point
    if (context.majorPlotPoint) {
      return { shouldCapture: true, type: 'milestone', reason: 'Major plot development' };
    }

    // Character introduction
    if (context.characterIntroduced) {
      return { shouldCapture: true, type: 'character', reason: `Met ${context.characterIntroduced}` };
    }

    // Significant choice detection
    if (context.choiceText && context.choiceText.length > 50) {
      const significantKeywords = ['decide', 'choose', 'fate', 'forever', 'never', 'always', 'final'];
      if (significantKeywords.some(k => context.choiceText!.toLowerCase().includes(k))) {
        return { shouldCapture: true, type: 'choice', reason: 'Significant choice made' };
      }
    }

    // Quote detection - look for impactful text
    if (context.narrativeText) {
      const quotePatterns = [
        /[""][^""]{20,150}[""]/g, // Quoted speech
        /[.!?]\s*[""][^""]+[""]/, // End quotes
      ];
      
      for (const pattern of quotePatterns) {
        const matches = context.narrativeText.match(pattern);
        if (matches && matches.length > 0) {
          return { shouldCapture: true, type: 'quote', reason: 'Memorable quote detected' };
        }
      }
    }

    return null;
  }

  /**
   * Get user's memories
   */
  async getUserMemories(
    userId: string,
    options?: {
      storyId?: string;
      memoryType?: ReadingMemory['memoryType'];
      emotionalTone?: ReadingMemory['emotionalTone'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ memories: ReadingMemory[]; total: number }> {
    try {
      let query = this.supabase
        .from('reading_memories')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('captured_at', { ascending: false });

      if (options?.storyId) {
        query = query.eq('story_id', options.storyId);
      }
      if (options?.memoryType) {
        query = query.eq('memory_type', options.memoryType);
      }
      if (options?.emotionalTone) {
        query = query.eq('emotional_tone', options.emotionalTone);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching memories:', error);
        return { memories: [], total: 0 };
      }

      return {
        memories: (data || []).map(this.mapMemory),
        total: count || 0,
      };
    } catch (error) {
      console.error('Error in getUserMemories:', error);
      return { memories: [], total: 0 };
    }
  }

  /**
   * Get a single memory by ID
   */
  async getMemory(memoryId: string): Promise<ReadingMemory | null> {
    try {
      const { data, error } = await this.supabase
        .from('reading_memories')
        .select('*')
        .eq('id', memoryId)
        .single();

      if (error) {
        console.error('Error fetching memory:', error);
        return null;
      }

      return this.mapMemory(data);
    } catch (error) {
      console.error('Error in getMemory:', error);
      return null;
    }
  }

  /**
   * Update memory visibility
   */
  async updateMemoryVisibility(memoryId: string, userId: string, isPublic: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_memories')
        .update({ is_public: isPublic })
        .eq('id', memoryId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating memory visibility:', error);
      return false;
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reading_memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  /**
   * Create a memory collection
   */
  async createCollection(
    userId: string,
    data: {
      name: string;
      description: string;
      theme?: MemoryCollection['theme'];
      memoryIds?: string[];
      isPublic?: boolean;
    }
  ): Promise<MemoryCollection | null> {
    try {
      const { data: collection, error } = await this.supabase
        .from('memory_collections')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          theme: data.theme || 'default',
          memory_ids: data.memoryIds || [],
          is_public: data.isPublic || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating collection:', error);
        return null;
      }

      return this.mapCollection(collection);
    } catch (error) {
      console.error('Error in createCollection:', error);
      return null;
    }
  }

  /**
   * Get user's collections
   */
  async getUserCollections(userId: string): Promise<MemoryCollection[]> {
    try {
      const { data, error } = await this.supabase
        .from('memory_collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching collections:', error);
        return [];
      }

      return (data || []).map(this.mapCollection);
    } catch (error) {
      console.error('Error in getUserCollections:', error);
      return [];
    }
  }

  /**
   * Add memory to collection
   */
  async addToCollection(collectionId: string, userId: string, memoryId: string): Promise<boolean> {
    try {
      const { data: collection } = await this.supabase
        .from('memory_collections')
        .select('memory_ids')
        .eq('id', collectionId)
        .eq('user_id', userId)
        .single();

      if (!collection) return false;

      const memoryIds = collection.memory_ids || [];
      if (!memoryIds.includes(memoryId)) {
        memoryIds.push(memoryId);
      }

      const { error } = await this.supabase
        .from('memory_collections')
        .update({ 
          memory_ids: memoryIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error adding to collection:', error);
      return false;
    }
  }

  /**
   * Get anniversary reminders (memories from this day in previous years)
   */
  async getAnniversaryReminders(userId: string): Promise<AnniversaryReminder[]> {
    try {
      const today = new Date();
      const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // This query finds memories captured on this day in previous years
      const { data, error } = await this.supabase
        .from('reading_memories')
        .select('*')
        .eq('user_id', userId)
        .like('captured_at', `%-${monthDay}%`)
        .order('captured_at', { ascending: true });

      if (error) {
        console.error('Error fetching anniversaries:', error);
        return [];
      }

      const reminders: AnniversaryReminder[] = [];
      const currentYear = today.getFullYear();

      for (const memory of data || []) {
        const capturedDate = new Date(memory.captured_at);
        const yearsAgo = currentYear - capturedDate.getFullYear();

        if (yearsAgo > 0) {
          const messages = [
            `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago, you experienced this moment in "${memory.story_title}"`,
            `On this day ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago, you made a choice that mattered`,
            `Remember this? It's been ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} since this magical moment`,
          ];

          reminders.push({
            id: `anniversary-${memory.id}`,
            userId: memory.user_id,
            memoryId: memory.id,
            memory: this.mapMemory(memory),
            message: messages[Math.floor(Math.random() * messages.length)],
            yearsAgo,
            reminderDate: today.toISOString(),
          });
        }
      }

      return reminders;
    } catch (error) {
      console.error('Error in getAnniversaryReminders:', error);
      return [];
    }
  }

  /**
   * Get public memories for a story (for social discovery)
   */
  async getStoryPublicMemories(
    storyId: string,
    options?: { limit?: number; emotionalTone?: string }
  ): Promise<ReadingMemory[]> {
    try {
      let query = this.supabase
        .from('reading_memories')
        .select('*')
        .eq('story_id', storyId)
        .eq('is_public', true)
        .order('likes', { ascending: false })
        .limit(options?.limit || 20);

      if (options?.emotionalTone) {
        query = query.eq('emotional_tone', options.emotionalTone);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching public memories:', error);
        return [];
      }

      return (data || []).map(this.mapMemory);
    } catch (error) {
      console.error('Error in getStoryPublicMemories:', error);
      return [];
    }
  }

  /**
   * Like a public memory
   */
  async likeMemory(memoryId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existing } = await this.supabase
        .from('memory_likes')
        .select('id')
        .eq('memory_id', memoryId)
        .eq('user_id', userId)
        .single();

      if (existing) return false;

      // Add like
      await this.supabase.from('memory_likes').insert({
        memory_id: memoryId,
        user_id: userId,
      });

      // Increment counter
      await this.supabase.rpc('increment_memory_likes', { memory_id: memoryId });

      return true;
    } catch (error) {
      console.error('Error liking memory:', error);
      return false;
    }
  }

  /**
   * Generate a shareable memory card
   */
  generateMemoryCard(memory: ReadingMemory): {
    html: string;
    shareText: string;
    shareUrl: string;
  } {
    const html = `
      <div style="
        background: linear-gradient(135deg, ${memory.backgroundColor}, ${memory.accentColor}20);
        padding: 24px;
        border-radius: 16px;
        max-width: 400px;
        font-family: system-ui;
      ">
        <div style="font-size: 24px; margin-bottom: 12px;">${this.getEmotionEmoji(memory.emotionalTone)}</div>
        <h3 style="color: ${memory.accentColor}; margin: 0 0 8px;">${memory.title}</h3>
        <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">${memory.description}</p>
        ${memory.quoteText ? `<blockquote style="border-left: 3px solid ${memory.accentColor}; padding-left: 12px; margin: 0 0 16px; font-style: italic;">"${memory.quoteText}"</blockquote>` : ''}
        <div style="font-size: 12px; color: #6B7280;">
          From "${memory.storyTitle}" • ${new Date(memory.capturedAt).toLocaleDateString()}
        </div>
      </div>
    `;

    const shareText = `A memorable moment from "${memory.storyTitle}" on StxryAI: "${memory.title}"`;
    const shareUrl = `https://stxryai.com/memories/${memory.id}`;

    return { html, shareText, shareUrl };
  }

  private getEmotionEmoji(tone: string): string {
    const emojis: Record<string, string> = {
      joy: '✨',
      sadness: '😢',
      excitement: '🎉',
      fear: '😨',
      love: '💕',
      triumph: '🏆',
      loss: '💔',
      wonder: '🌟',
    };
    return emojis[tone] || '📚';
  }

  private mapMemory(data: any): ReadingMemory {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      memoryType: data.memory_type,
      title: data.title,
      description: data.description,
      choiceText: data.choice_text,
      quoteText: data.quote_text,
      characterName: data.character_name,
      emotionalTone: data.emotional_tone,
      intensity: data.intensity,
      screenshotUrl: data.screenshot_url,
      backgroundColor: data.background_color,
      accentColor: data.accent_color,
      storyTitle: data.story_title,
      storyGenre: data.story_genre,
      chapterTitle: data.chapter_title,
      readingProgress: data.reading_progress,
      isPublic: data.is_public,
      likes: data.likes || 0,
      capturedAt: data.captured_at || data.created_at,
      storyDate: data.story_date,
    };
  }

  private mapCollection(data: any): MemoryCollection {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      memoryIds: data.memory_ids || [],
      isPublic: data.is_public,
      theme: data.theme,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const readingMemoriesService = new ReadingMemoriesService();
