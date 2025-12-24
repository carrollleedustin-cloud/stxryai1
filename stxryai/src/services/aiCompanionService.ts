/**
 * AI Companion Service
 * Manages AI story companions that remember reader choices and grow with the story.
 * Provides personalized interactions based on reading history and preferences.
 */

import { supabase } from '@/lib/supabase/client';
import { aiService } from '@/lib/api/ai-service';

// ============================================================================
// TYPES
// ============================================================================

export interface ReaderSession {
  id: string;
  storyId: string;
  readerId: string;
  currentChapterId?: string;
  totalChoicesMade: number;
  sessionStartedAt: string;
  lastActivityAt: string;
  isCompleted: boolean;
  companionEnabled: boolean;
  companionRelationshipLevel: number;
  companionMemory: CompanionMemory;
}

export interface CompanionMemory {
  readerName?: string;
  preferredTone?: 'serious' | 'playful' | 'mysterious' | 'supportive';
  notableChoices: NotableChoice[];
  emotionalMoments: string[];
  questionsAsked: string[];
  hintsGiven: string[];
  insideJokes: string[];
  readerPreferences: Record<string, any>;
}

export interface NotableChoice {
  chapterTitle: string;
  choiceText: string;
  timestamp: string;
  wasCustom: boolean;
  emotionalImpact?: 'positive' | 'negative' | 'neutral' | 'surprising';
}

export interface ChoiceRecord {
  id: string;
  sessionId: string;
  chapterId: string;
  choiceType: 'preset' | 'custom' | 'ai_generated';
  choiceText: string;
  choiceIndex?: number;
  customInput?: string;
  aiResponseContent?: string;
  choiceMadeAt: string;
  timeSpentReadingMs?: number;
}

export interface CompanionPersona {
  id: string;
  name: string;
  personalityType: 'guide' | 'friend' | 'mentor' | 'trickster' | 'mystery';
  personalityTraits: string[];
  speechStyle: string;
  backstory?: string;
  helpfulnessLevel: number;
  humorLevel: number;
  mysteryLevel: number;
}

export interface CompanionMessage {
  type: 'greeting' | 'hint' | 'reaction' | 'encouragement' | 'warning' | 'recap' | 'question';
  message: string;
  emotion?: string;
}

// ============================================================================
// AI COMPANION SERVICE
// ============================================================================

class AICompanionService {
  /**
   * Get or create a reader's story session
   */
  async getOrCreateSession(storyId: string, readerId: string): Promise<ReaderSession | null> {
    try {
      // Check for existing session
      const { data: existing, error: findError } = await supabase
        .from('reader_story_sessions')
        .select('*')
        .eq('story_id', storyId)
        .eq('reader_id', readerId)
        .single();

      if (existing && !findError) {
        // Update last activity
        await supabase
          .from('reader_story_sessions')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', existing.id);

        return this.mapSession(existing);
      }

      // Get story settings to check companion config
      const { data: story } = await supabase
        .from('stories')
        .select('enable_ai_companion, companion_name, companion_personality')
        .eq('id', storyId)
        .single();

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('reader_story_sessions')
        .insert({
          story_id: storyId,
          reader_id: readerId,
          companion_enabled: story?.enable_ai_companion || false,
          companion_memory: { notableChoices: [], emotionalMoments: [], questionsAsked: [], hintsGiven: [], insideJokes: [], readerPreferences: {} },
        })
        .select()
        .single();

      if (createError) throw createError;
      return this.mapSession(newSession);
    } catch (error) {
      console.error('Error getting/creating session:', error);
      return null;
    }
  }

  /**
   * Record a choice made by the reader
   */
  async recordChoice(
    sessionId: string,
    chapterId: string,
    choice: {
      type: 'preset' | 'custom' | 'ai_generated';
      text: string;
      index?: number;
      customInput?: string;
      timeSpentMs?: number;
    }
  ): Promise<ChoiceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('reader_choice_history')
        .insert({
          session_id: sessionId,
          chapter_id: chapterId,
          choice_type: choice.type,
          choice_text: choice.text,
          choice_index: choice.index,
          custom_input: choice.customInput,
          time_spent_reading_ms: choice.timeSpentMs,
        })
        .select()
        .single();

      if (error) throw error;

      // Update session stats
      await supabase
        .from('reader_story_sessions')
        .update({
          current_chapter_id: chapterId,
          total_choices_made: supabase.rpc('increment_choices', { session_id: sessionId }),
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return this.mapChoiceRecord(data);
    } catch (error) {
      console.error('Error recording choice:', error);
      return null;
    }
  }

  /**
   * Get reader's choice history for a session
   */
  async getChoiceHistory(sessionId: string, limit = 20): Promise<ChoiceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('reader_choice_history')
        .select('*, chapters(title)')
        .eq('session_id', sessionId)
        .order('choice_made_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(this.mapChoiceRecord);
    } catch (error) {
      console.error('Error getting choice history:', error);
      return [];
    }
  }

  /**
   * Update companion memory with new information
   */
  async updateCompanionMemory(
    sessionId: string,
    updates: Partial<CompanionMemory>
  ): Promise<boolean> {
    try {
      // Get current memory
      const { data: session } = await supabase
        .from('reader_story_sessions')
        .select('companion_memory')
        .eq('id', sessionId)
        .single();

      const currentMemory = session?.companion_memory || {};
      const newMemory = { ...currentMemory, ...updates };

      // Merge arrays instead of replacing
      if (updates.notableChoices) {
        newMemory.notableChoices = [
          ...(currentMemory.notableChoices || []),
          ...updates.notableChoices,
        ].slice(-50); // Keep last 50
      }
      if (updates.emotionalMoments) {
        newMemory.emotionalMoments = [
          ...(currentMemory.emotionalMoments || []),
          ...updates.emotionalMoments,
        ].slice(-20);
      }

      const { error } = await supabase
        .from('reader_story_sessions')
        .update({ companion_memory: newMemory })
        .eq('id', sessionId);

      return !error;
    } catch (error) {
      console.error('Error updating companion memory:', error);
      return false;
    }
  }

  /**
   * Generate a companion message based on context
   */
  async generateCompanionMessage(
    session: ReaderSession,
    persona: CompanionPersona,
    context: {
      trigger: 'greeting' | 'choice_made' | 'chapter_start' | 'stuck' | 'milestone';
      currentChapter?: string;
      lastChoice?: string;
      storyProgress?: number;
    }
  ): Promise<CompanionMessage | null> {
    try {
      const memory = session.companionMemory;
      const relationship = session.companionRelationshipLevel;

      // Build context for AI
      let systemPrompt = `You are ${persona.name}, an AI story companion with the following traits:
- Personality: ${persona.personalityType}
- Traits: ${persona.personalityTraits.join(', ')}
- Speech Style: ${persona.speechStyle}
- Helpfulness: ${persona.helpfulnessLevel}/10
- Humor: ${persona.humorLevel}/10

You have a relationship level of ${relationship}/100 with this reader.
`;

      if (memory.notableChoices.length > 0) {
        systemPrompt += `\nRecent reader choices:\n`;
        memory.notableChoices.slice(-3).forEach(c => {
          systemPrompt += `- "${c.choiceText}" (${c.wasCustom ? 'custom' : 'preset'})\n`;
        });
      }

      if (memory.readerName) {
        systemPrompt += `\nThe reader's name is ${memory.readerName}.`;
      }

      let userPrompt = '';
      switch (context.trigger) {
        case 'greeting':
          userPrompt = session.totalChoicesMade === 0
            ? 'Introduce yourself to a new reader starting this story.'
            : `Welcome back a reader who has made ${session.totalChoicesMade} choices so far.`;
          break;
        case 'choice_made':
          userPrompt = `React to the reader choosing: "${context.lastChoice}". Be brief (1-2 sentences).`;
          break;
        case 'chapter_start':
          userPrompt = `The reader is starting chapter: "${context.currentChapter}". Give a brief, intriguing hint or comment.`;
          break;
        case 'stuck':
          userPrompt = 'The reader seems stuck. Offer a subtle hint without spoiling anything.';
          break;
        case 'milestone':
          userPrompt = `Celebrate the reader reaching ${context.storyProgress}% through the story!`;
          break;
      }

      const result = await aiService.generateStoryContent(
        {
          prompt: userPrompt,
          context: systemPrompt,
          genre: '',
          tone: persona.personalityType === 'trickster' ? 'playful' : 'balanced',
        },
        { temperature: 0.8, cache: false }
      );

      if (result.success && typeof result.data === 'string') {
        return {
          type: context.trigger === 'greeting' ? 'greeting' : 
                context.trigger === 'stuck' ? 'hint' :
                context.trigger === 'milestone' ? 'encouragement' : 'reaction',
          message: result.data.trim(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error generating companion message:', error);
      return null;
    }
  }

  /**
   * Generate AI response for custom choice (infinite story mode)
   */
  async generateStoryFromCustomChoice(
    storyId: string,
    sessionId: string,
    customChoice: string,
    context: {
      currentChapterContent: string;
      storyTitle: string;
      genre: string;
      previousChoices: string[];
    }
  ): Promise<{ content: string; choices: string[] } | null> {
    try {
      const systemPrompt = `You are continuing an interactive story called "${context.storyTitle}" (${context.genre}).

Previous context:
${context.currentChapterContent.slice(-1500)}

The reader has chosen to: "${customChoice}"

Previous reader choices: ${context.previousChoices.slice(-5).join(', ')}

Continue the story based on their custom choice. Write 200-400 words of engaging narrative, then provide 3 new choice options.

Format:
[STORY]
(your narrative continuation)
[/STORY]

[CHOICES]
1. First choice
2. Second choice  
3. Third choice
[/CHOICES]`;

      const result = await aiService.generateStoryContent(
        {
          prompt: 'Continue the story based on the reader\'s custom choice.',
          context: systemPrompt,
          genre: context.genre,
          tone: 'immersive',
        },
        { temperature: 0.75, cache: false }
      );

      if (result.success && typeof result.data === 'string') {
        const content = result.data;
        
        // Parse story and choices
        const storyMatch = content.match(/\[STORY\]([\s\S]*?)\[\/STORY\]/);
        const choicesMatch = content.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);
        
        const storyContent = storyMatch ? storyMatch[1].trim() : content;
        const choicesText = choicesMatch ? choicesMatch[1].trim() : '';
        
        const choices = choicesText
          .split('\n')
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);

        // Store the dynamic branch
        await supabase
          .from('dynamic_story_branches')
          .insert({
            story_id: storyId,
            branch_title: `Custom: ${customChoice.slice(0, 50)}`,
            branch_content: storyContent,
            reader_choice_text: customChoice,
            was_custom_choice: true,
          });

        // Record the AI response in choice history
        await supabase
          .from('reader_choice_history')
          .update({ ai_response_content: storyContent })
          .eq('session_id', sessionId)
          .order('choice_made_at', { ascending: false })
          .limit(1);

        return {
          content: storyContent,
          choices: choices.length >= 3 ? choices : [
            'Continue exploring',
            'Take a different approach',
            'Wait and observe',
          ],
        };
      }

      return null;
    } catch (error) {
      console.error('Error generating story from custom choice:', error);
      return null;
    }
  }

  /**
   * Check if user can use custom choices based on tier
   */
  async canUseCustomChoices(storyId: string, userId: string): Promise<boolean> {
    try {
      // Get story's custom choice tier
      const { data: story } = await supabase
        .from('stories')
        .select('custom_choice_tier')
        .eq('id', storyId)
        .single();

      if (!story) return false;
      
      const tier = story.custom_choice_tier;
      if (tier === 'none') return false;
      if (tier === 'all') return true;

      // Get user's subscription tier
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const userTier = profile?.subscription_tier || 'free';

      if (tier === 'premium' && ['premium', 'creator_pro', 'enterprise'].includes(userTier)) return true;
      if (tier === 'creator_pro' && ['creator_pro', 'enterprise'].includes(userTier)) return true;

      return false;
    } catch (error) {
      console.error('Error checking custom choice access:', error);
      return false;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapSession(data: any): ReaderSession {
    return {
      id: data.id,
      storyId: data.story_id,
      readerId: data.reader_id,
      currentChapterId: data.current_chapter_id,
      totalChoicesMade: data.total_choices_made || 0,
      sessionStartedAt: data.session_started_at,
      lastActivityAt: data.last_activity_at,
      isCompleted: data.is_completed || false,
      companionEnabled: data.companion_enabled || false,
      companionRelationshipLevel: data.companion_relationship_level || 0,
      companionMemory: data.companion_memory || {},
    };
  }

  private mapChoiceRecord(data: any): ChoiceRecord {
    return {
      id: data.id,
      sessionId: data.session_id,
      chapterId: data.chapter_id,
      choiceType: data.choice_type,
      choiceText: data.choice_text,
      choiceIndex: data.choice_index,
      customInput: data.custom_input,
      aiResponseContent: data.ai_response_content,
      choiceMadeAt: data.choice_made_at,
      timeSpentReadingMs: data.time_spent_reading_ms,
    };
  }
}

// Export singleton
export const aiCompanionService = new AICompanionService();

