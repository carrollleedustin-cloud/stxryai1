/**
 * Story Echoes Service
 * Creates social proof by showing what other readers are doing
 * "You are not alone in this universe"
 */

import { createClient } from '@/lib/supabase/client';

export interface ChoiceEcho {
  choiceId: string;
  choiceText: string;
  totalSelections: number;
  percentage: number;
  recentReaders: number; // How many in last 24h
  isPopular: boolean;
  isRare: boolean; // Less than 10% selected
  trend: 'rising' | 'falling' | 'stable';
}

export interface GhostReader {
  id: string;
  silhouetteType: 'blob' | 'human' | 'creature' | 'spark';
  color: string;
  position: number; // Progress in the current chapter (0-100)
  speed: 'slow' | 'normal' | 'fast';
  isAhead: boolean;
}

export interface LiveActivity {
  id: string;
  type: 'reading' | 'choice' | 'finishing' | 'starting' | 'emotional_moment';
  storyId: string;
  storyTitle: string;
  chapterId?: string;
  chapterTitle?: string;
  choiceText?: string;
  emotionalTone?: string;
  timestamp: string;
  anonymousId: string; // For privacy
}

export interface StoryMomentum {
  storyId: string;
  currentReaders: number;
  readersToday: number;
  completionsToday: number;
  popularityTrend: 'hot' | 'rising' | 'stable' | 'cooling';
  emotionalPulse: {
    joy: number;
    sadness: number;
    excitement: number;
    fear: number;
  };
}

export interface ChoiceTimestamp {
  choiceId: string;
  choiceText: string;
  madeAt: string;
  readersWhoChoseThis: number;
  notableChoosers?: string[]; // "A premium reader chose this"
}

export interface PathDivergence {
  choiceId: string;
  choiceText: string;
  yourPath: boolean;
  pathPopularity: number;
  uniqueEndingsFromPath: number;
  famousPathTakers?: string[];
}

// Ghost reader color palette
const ghostColors = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#6366F1', // Indigo
];

class StoryEchoesService {
  private supabase = createClient();

  /**
   * Get choice statistics for a specific choice point
   */
  async getChoiceEchoes(
    storyId: string,
    chapterId: string,
    choicePointId: string
  ): Promise<ChoiceEcho[]> {
    try {
      const { data, error } = await this.supabase
        .from('choice_statistics')
        .select('*')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId)
        .eq('choice_point_id', choicePointId);

      if (error) {
        console.error('Error fetching choice echoes:', error);
        return [];
      }

      const totalSelections = (data || []).reduce((sum, c) => sum + c.selection_count, 0);

      return (data || []).map(choice => {
        const percentage = totalSelections > 0 
          ? Math.round((choice.selection_count / totalSelections) * 100) 
          : 0;
        
        return {
          choiceId: choice.choice_id,
          choiceText: choice.choice_text,
          totalSelections: choice.selection_count,
          percentage,
          recentReaders: choice.recent_selections || 0,
          isPopular: percentage > 50,
          isRare: percentage < 10 && totalSelections > 100,
          trend: this.calculateTrend(choice.selection_count, choice.previous_count),
        };
      });
    } catch (error) {
      console.error('Error in getChoiceEchoes:', error);
      return [];
    }
  }

  /**
   * Record a choice made by a user
   */
  async recordChoice(
    userId: string,
    storyId: string,
    chapterId: string,
    choicePointId: string,
    choiceId: string,
    choiceText: string
  ): Promise<void> {
    try {
      // Record the individual choice
      await this.supabase.from('reader_choices').insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        choice_point_id: choicePointId,
        choice_id: choiceId,
        choice_text: choiceText,
      });

      // Update aggregated statistics
      await this.supabase.rpc('increment_choice_count', {
        p_story_id: storyId,
        p_chapter_id: chapterId,
        p_choice_point_id: choicePointId,
        p_choice_id: choiceId,
        p_choice_text: choiceText,
      });

      // Broadcast to real-time listeners
      await this.broadcastActivity({
        type: 'choice',
        storyId,
        chapterId,
        choiceText: choiceText.substring(0, 50) + (choiceText.length > 50 ? '...' : ''),
      });
    } catch (error) {
      console.error('Error recording choice:', error);
    }
  }

  /**
   * Get ghost readers for current chapter
   * These are anonymous representations of other readers
   */
  async getGhostReaders(
    storyId: string,
    chapterId: string,
    currentProgress: number
  ): Promise<GhostReader[]> {
    try {
      // Get recent reading activity for this chapter
      const { data, error } = await this.supabase
        .from('active_reading_sessions')
        .select('id, progress, reading_speed')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId)
        .neq('progress', currentProgress) // Don't show self
        .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 min
        .limit(10);

      if (error) {
        console.error('Error fetching ghost readers:', error);
        return [];
      }

      return (data || []).map((session, index) => ({
        id: `ghost-${session.id}`,
        silhouetteType: this.getRandomSilhouette(),
        color: ghostColors[index % ghostColors.length],
        position: session.progress,
        speed: this.mapReadingSpeed(session.reading_speed),
        isAhead: session.progress > currentProgress,
      }));
    } catch (error) {
      console.error('Error in getGhostReaders:', error);
      return [];
    }
  }

  /**
   * Update user's reading session
   */
  async updateReadingSession(
    userId: string,
    storyId: string,
    chapterId: string,
    progress: number,
    readingSpeed?: number
  ): Promise<void> {
    try {
      await this.supabase.from('active_reading_sessions').upsert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        progress,
        reading_speed: readingSpeed,
        last_active: new Date().toISOString(),
      }, {
        onConflict: 'user_id,story_id,chapter_id',
      });
    } catch (error) {
      console.error('Error updating reading session:', error);
    }
  }

  /**
   * Get live activity feed for a story
   */
  async getLiveActivity(
    storyId: string,
    limit: number = 10
  ): Promise<LiveActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('story_activity_feed')
        .select('*')
        .eq('story_id', storyId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching live activity:', error);
        return [];
      }

      return (data || []).map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        storyId: activity.story_id,
        storyTitle: activity.story_title,
        chapterId: activity.chapter_id,
        chapterTitle: activity.chapter_title,
        choiceText: activity.choice_text,
        emotionalTone: activity.emotional_tone,
        timestamp: activity.timestamp,
        anonymousId: activity.anonymous_id,
      }));
    } catch (error) {
      console.error('Error in getLiveActivity:', error);
      return [];
    }
  }

  /**
   * Get story momentum metrics
   */
  async getStoryMomentum(storyId: string): Promise<StoryMomentum | null> {
    try {
      const { data, error } = await this.supabase
        .from('story_momentum')
        .select('*')
        .eq('story_id', storyId)
        .single();

      if (error) {
        console.error('Error fetching story momentum:', error);
        return null;
      }

      return {
        storyId: data.story_id,
        currentReaders: data.current_readers,
        readersToday: data.readers_today,
        completionsToday: data.completions_today,
        popularityTrend: this.calculatePopularityTrend(data),
        emotionalPulse: data.emotional_pulse || { joy: 0, sadness: 0, excitement: 0, fear: 0 },
      };
    } catch (error) {
      console.error('Error in getStoryMomentum:', error);
      return null;
    }
  }

  /**
   * Record emotional moment for story pulse
   */
  async recordEmotionalMoment(
    storyId: string,
    emotion: 'joy' | 'sadness' | 'excitement' | 'fear'
  ): Promise<void> {
    try {
      await this.supabase.rpc('increment_emotional_pulse', {
        p_story_id: storyId,
        p_emotion: emotion,
      });
    } catch (error) {
      console.error('Error recording emotional moment:', error);
    }
  }

  /**
   * Get choice timestamps for margin display
   */
  async getChoiceTimestamps(
    storyId: string,
    chapterId: string
  ): Promise<ChoiceTimestamp[]> {
    try {
      const { data, error } = await this.supabase
        .from('reader_choices')
        .select('choice_id, choice_text, created_at')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching choice timestamps:', error);
        return [];
      }

      // Group by choice
      const choiceMap = new Map<string, { text: string; timestamps: string[]; count: number }>();
      
      for (const choice of data || []) {
        const existing = choiceMap.get(choice.choice_id);
        if (existing) {
          existing.timestamps.push(choice.created_at);
          existing.count++;
        } else {
          choiceMap.set(choice.choice_id, {
            text: choice.choice_text,
            timestamps: [choice.created_at],
            count: 1,
          });
        }
      }

      return Array.from(choiceMap.entries()).map(([id, data]) => ({
        choiceId: id,
        choiceText: data.text,
        madeAt: data.timestamps[0], // Most recent
        readersWhoChoseThis: data.count,
      }));
    } catch (error) {
      console.error('Error in getChoiceTimestamps:', error);
      return [];
    }
  }

  /**
   * Get path divergence for comparing with friends
   */
  async getPathDivergence(
    userId: string,
    friendId: string,
    storyId: string
  ): Promise<PathDivergence[]> {
    try {
      // Get user's choices
      const { data: userChoices } = await this.supabase
        .from('reader_choices')
        .select('choice_id, choice_text')
        .eq('user_id', userId)
        .eq('story_id', storyId);

      // Get friend's choices
      const { data: friendChoices } = await this.supabase
        .from('reader_choices')
        .select('choice_id, choice_text')
        .eq('user_id', friendId)
        .eq('story_id', storyId);

      if (!userChoices || !friendChoices) return [];

      const userChoiceIds = new Set(userChoices.map(c => c.choice_id));
      const friendChoiceIds = new Set(friendChoices.map(c => c.choice_id));

      // Find divergence points
      const allChoices = [...userChoices, ...friendChoices];
      const uniqueChoices = new Map<string, { text: string; yourPath: boolean }>();

      for (const choice of allChoices) {
        if (!uniqueChoices.has(choice.choice_id)) {
          uniqueChoices.set(choice.choice_id, {
            text: choice.choice_text,
            yourPath: userChoiceIds.has(choice.choice_id),
          });
        }
      }

      return Array.from(uniqueChoices.entries())
        .filter(([id]) => userChoiceIds.has(id) !== friendChoiceIds.has(id))
        .map(([id, data]) => ({
          choiceId: id,
          choiceText: data.text,
          yourPath: data.yourPath,
          pathPopularity: 50, // Would need actual data
          uniqueEndingsFromPath: 3, // Would need actual data
        }));
    } catch (error) {
      console.error('Error in getPathDivergence:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time story activity
   */
  subscribeToStoryActivity(
    storyId: string,
    callback: (activity: LiveActivity) => void
  ): () => void {
    const channel = this.supabase
      .channel(`story-activity-${storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'story_activity_feed',
          filter: `story_id=eq.${storyId}`,
        },
        (payload) => {
          callback({
            id: payload.new.id,
            type: payload.new.activity_type,
            storyId: payload.new.story_id,
            storyTitle: payload.new.story_title,
            chapterId: payload.new.chapter_id,
            chapterTitle: payload.new.chapter_title,
            choiceText: payload.new.choice_text,
            emotionalTone: payload.new.emotional_tone,
            timestamp: payload.new.timestamp,
            anonymousId: payload.new.anonymous_id,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Generate "Someone just made the opposite choice" notification
   */
  async checkOppositeChoice(
    userId: string,
    storyId: string,
    chapterId: string,
    choicePointId: string,
    choiceId: string
  ): Promise<{ happened: boolean; message: string } | null> {
    try {
      // Get the other choices at this point
      const { data: allChoices } = await this.supabase
        .from('reader_choices')
        .select('choice_id, choice_text, created_at')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId)
        .eq('choice_point_id', choicePointId)
        .neq('choice_id', choiceId)
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString()) // Last minute
        .limit(1);

      if (allChoices && allChoices.length > 0) {
        const oppositeChoice = allChoices[0];
        return {
          happened: true,
          message: `Someone just chose "${oppositeChoice.choice_text.substring(0, 30)}..." instead`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking opposite choice:', error);
      return null;
    }
  }

  /**
   * Broadcast activity to real-time feed
   */
  private async broadcastActivity(activity: Partial<LiveActivity>): Promise<void> {
    try {
      const anonymousId = `reader-${Math.random().toString(36).substring(7)}`;
      
      await this.supabase.from('story_activity_feed').insert({
        story_id: activity.storyId,
        activity_type: activity.type,
        chapter_id: activity.chapterId,
        choice_text: activity.choiceText,
        emotional_tone: activity.emotionalTone,
        anonymous_id: anonymousId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error broadcasting activity:', error);
    }
  }

  private calculateTrend(current: number, previous: number): 'rising' | 'falling' | 'stable' {
    if (!previous) return 'stable';
    const change = (current - previous) / previous;
    if (change > 0.1) return 'rising';
    if (change < -0.1) return 'falling';
    return 'stable';
  }

  private getRandomSilhouette(): GhostReader['silhouetteType'] {
    const types: GhostReader['silhouetteType'][] = ['blob', 'human', 'creature', 'spark'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private mapReadingSpeed(speed: number | null): 'slow' | 'normal' | 'fast' {
    if (!speed) return 'normal';
    if (speed < 150) return 'slow';
    if (speed > 250) return 'fast';
    return 'normal';
  }

  private calculatePopularityTrend(data: any): 'hot' | 'rising' | 'stable' | 'cooling' {
    const { readers_today, readers_yesterday, current_readers } = data;
    
    if (current_readers > 50 && readers_today > readers_yesterday * 1.5) return 'hot';
    if (readers_today > readers_yesterday * 1.1) return 'rising';
    if (readers_today < readers_yesterday * 0.8) return 'cooling';
    return 'stable';
  }
}

export const storyEchoesService = new StoryEchoesService();
