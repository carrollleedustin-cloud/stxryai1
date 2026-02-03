/**
 * Enhanced AI Companion Service
 * Character chat, what-if scenarios, story recaps, mood recommendations
 */

import { createClient } from '@/lib/supabase/client';
import { generateCompletion } from '@/lib/ai/client';

export interface CharacterChatSession {
  id: string;
  storyId: string;
  characterName: string;
  characterPersona: string | null;
  messageCount: number;
  lastMessageAt: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  content: string;
  createdAt: string;
}

export interface WhatIfScenario {
  id: string;
  storyId: string;
  chapterId: string | null;
  prompt: string;
  generatedScenario: string | null;
  isSaved: boolean;
  createdAt: string;
}

export interface StoryRecap {
  id: string;
  storyId: string;
  recapType: 'quick' | 'detailed' | 'character_focused' | 'plot_focused';
  recapContent: string;
  chaptersCovered: string[];
  generatedAt: string;
}

class AICompanionEnhancedService {
  private supabase = createClient();

  /**
   * Start or resume character chat session
   */
  async getOrCreateChatSession(
    userId: string,
    storyId: string,
    characterName: string,
    characterDescription?: string
  ): Promise<CharacterChatSession | null> {
    try {
      // Check for existing session
      const { data: existing } = await this.supabase
        .from('character_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .eq('character_name', characterName)
        .eq('is_active', true)
        .single();

      if (existing) {
        return {
          id: existing.id,
          storyId: existing.story_id,
          characterName: existing.character_name,
          characterPersona: existing.character_persona,
          messageCount: existing.message_count,
          lastMessageAt: existing.last_message_at,
        };
      }

      // Create new session
      const persona = characterDescription || await this.generateCharacterPersona(storyId, characterName);

      const { data: newSession, error } = await this.supabase
        .from('character_chat_sessions')
        .insert({
          user_id: userId,
          story_id: storyId,
          character_name: characterName,
          character_persona: persona,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return {
        id: newSession.id,
        storyId: newSession.story_id,
        characterName: newSession.character_name,
        characterPersona: newSession.character_persona,
        messageCount: 0,
        lastMessageAt: null,
      };
    } catch (error) {
      console.error('Error in getOrCreateChatSession:', error);
      return null;
    }
  }

  /**
   * Generate character persona from story
   */
  private async generateCharacterPersona(storyId: string, characterName: string): Promise<string> {
    try {
      // Get story content to understand the character
      const { data: story } = await this.supabase
        .from('stories')
        .select('title, description, genre')
        .eq('id', storyId)
        .single();

      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select('content')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true })
        .limit(3);

      const storyContext = `Story: ${story?.title}\nGenre: ${story?.genre}\nDescription: ${story?.description}\n\nSample content: ${chapters?.map(c => c.content).join('\n').slice(0, 2000)}`;

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an expert at understanding fictional characters. Based on the story context, create a detailed persona for the character that can be used for interactive conversations.',
          },
          {
            role: 'user',
            content: `Create a persona for the character "${characterName}" from this story:\n\n${storyContext}\n\nInclude their personality traits, speaking style, motivations, and any quirks. Keep it under 500 words.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 600,
      });

      return response.content;
    } catch (error) {
      console.error('Error generating persona:', error);
      return `${characterName} - a character from the story.`;
    }
  }

  /**
   * Send message to character
   */
  async sendCharacterMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{ response: string; tokensUsed: number } | null> {
    try {
      // Get session details
      const { data: session } = await this.supabase
        .from('character_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return null;
      }

      // Get recent messages for context
      const { data: recentMessages } = await this.supabase
        .from('character_chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Reverse to get chronological order
      const history = (recentMessages || []).reverse();

      // Save user message
      await this.supabase.from('character_chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
      });

      // Generate character response
      const systemPrompt = `You are ${session.character_name}, a character from a story. Stay in character at all times.

Character Persona:
${session.character_persona}

Guidelines:
- Respond as if you ARE this character
- Use their speech patterns and personality
- Reference events from the story when relevant
- Be engaging and interesting
- Keep responses conversational (2-4 paragraphs max)`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.map((m) => ({
          role: m.role === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await generateCompletion({
        messages,
        temperature: 0.8,
        maxTokens: 500,
      });

      // Save character response
      await this.supabase.from('character_chat_messages').insert({
        session_id: sessionId,
        role: 'character',
        content: response.content,
        tokens_used: response.usage?.total_tokens || 0,
      });

      // Update session
      await this.supabase
        .from('character_chat_sessions')
        .update({
          message_count: session.message_count + 2,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return {
        response: response.content,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('Error in sendCharacterMessage:', error);
      return null;
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('character_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }

      return (data || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      }));
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  }

  /**
   * Generate what-if scenario
   */
  async generateWhatIfScenario(
    userId: string,
    storyId: string,
    chapterId: string | null,
    prompt: string
  ): Promise<WhatIfScenario | null> {
    try {
      // Get story context
      const { data: story } = await this.supabase
        .from('stories')
        .select('title, description, genre')
        .eq('id', storyId)
        .single();

      let chapterContent = '';
      if (chapterId) {
        const { data: chapter } = await this.supabase
          .from('story_chapters')
          .select('title, content')
          .eq('id', chapterId)
          .single();
        chapterContent = chapter?.content || '';
      }

      const systemPrompt = `You are a creative storytelling AI. Generate an alternative scenario based on the user's "what if" question. 

Story: ${story?.title}
Genre: ${story?.genre}
${chapterContent ? `Current chapter context: ${chapterContent.slice(0, 1500)}` : ''}

Create a compelling alternative scenario that:
- Stays true to the story's genre and tone
- Explores the consequences of the hypothetical
- Is engaging and well-written
- Is 2-4 paragraphs long`;

      const response = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `What if: ${prompt}` },
        ],
        temperature: 0.9,
        maxTokens: 800,
      });

      // Save scenario
      const { data: scenario, error } = await this.supabase
        .from('what_if_scenarios')
        .insert({
          user_id: userId,
          story_id: storyId,
          chapter_id: chapterId,
          prompt,
          generated_scenario: response.content,
          tokens_used: response.usage?.total_tokens || 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving scenario:', error);
        return null;
      }

      return {
        id: scenario.id,
        storyId: scenario.story_id,
        chapterId: scenario.chapter_id,
        prompt: scenario.prompt,
        generatedScenario: scenario.generated_scenario,
        isSaved: false,
        createdAt: scenario.created_at,
      };
    } catch (error) {
      console.error('Error in generateWhatIfScenario:', error);
      return null;
    }
  }

  /**
   * Save what-if scenario
   */
  async saveWhatIfScenario(scenarioId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('what_if_scenarios')
        .update({ is_saved: true })
        .eq('id', scenarioId);

      return !error;
    } catch (error) {
      console.error('Error saving scenario:', error);
      return false;
    }
  }

  /**
   * Get saved scenarios
   */
  async getSavedScenarios(userId: string, storyId?: string): Promise<WhatIfScenario[]> {
    try {
      let query = this.supabase
        .from('what_if_scenarios')
        .select('*')
        .eq('user_id', userId)
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

      if (storyId) {
        query = query.eq('story_id', storyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching saved scenarios:', error);
        return [];
      }

      return (data || []).map((s) => ({
        id: s.id,
        storyId: s.story_id,
        chapterId: s.chapter_id,
        prompt: s.prompt,
        generatedScenario: s.generated_scenario,
        isSaved: true,
        createdAt: s.created_at,
      }));
    } catch (error) {
      console.error('Error in getSavedScenarios:', error);
      return [];
    }
  }

  /**
   * Generate story recap
   */
  async generateStoryRecap(
    userId: string,
    storyId: string,
    recapType: 'quick' | 'detailed' | 'character_focused' | 'plot_focused' = 'quick'
  ): Promise<StoryRecap | null> {
    try {
      // Get story and chapters
      const { data: story } = await this.supabase
        .from('stories')
        .select('title, description, genre')
        .eq('id', storyId)
        .single();

      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select('id, title, content')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true });

      if (!chapters || chapters.length === 0) {
        return null;
      }

      // Get user's progress
      const { data: progress } = await this.supabase
        .from('user_reading_progress')
        .select('current_chapter_index')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single();

      const currentIndex = progress?.current_chapter_index || chapters.length - 1;
      const chaptersToSummarize = chapters.slice(0, currentIndex + 1);

      const recapPrompts = {
        quick: 'Create a brief 2-3 sentence recap of the story so far.',
        detailed: 'Create a detailed summary of each chapter the reader has completed.',
        character_focused: 'Summarize the story focusing on character development and relationships.',
        plot_focused: 'Summarize the main plot points and story progression.',
      };

      const content = chaptersToSummarize
        .map((c) => `Chapter: ${c.title}\n${c.content.slice(0, 1000)}`)
        .join('\n\n');

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a skilled summarizer. ${recapPrompts[recapType]}

Story: ${story?.title}
Genre: ${story?.genre}

Chapters to summarize:
${content}`,
          },
          {
            role: 'user',
            content: `Generate a ${recapType.replace('_', ' ')} recap.`,
          },
        ],
        temperature: 0.5,
        maxTokens: recapType === 'quick' ? 200 : 1000,
      });

      // Save recap
      const { data: recap, error } = await this.supabase
        .from('story_recaps')
        .insert({
          user_id: userId,
          story_id: storyId,
          recap_type: recapType,
          recap_content: response.content,
          chapters_covered: chaptersToSummarize.map((c) => c.id),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving recap:', error);
        return null;
      }

      return {
        id: recap.id,
        storyId: recap.story_id,
        recapType: recap.recap_type,
        recapContent: recap.recap_content,
        chaptersCovered: recap.chapters_covered,
        generatedAt: recap.generated_at,
      };
    } catch (error) {
      console.error('Error in generateStoryRecap:', error);
      return null;
    }
  }

  /**
   * Get mood-based recommendations
   */
  async getMoodRecommendations(
    userId: string,
    mood: string
  ): Promise<{ storyIds: string[]; reasoning: string }> {
    try {
      const moodMappings: Record<string, { genres: string[]; keywords: string[] }> = {
        happy: { genres: ['Comedy', 'Romance', 'Adventure'], keywords: ['uplifting', 'fun', 'lighthearted'] },
        sad: { genres: ['Drama', 'Literary Fiction'], keywords: ['emotional', 'touching', 'melancholic'] },
        excited: { genres: ['Thriller', 'Action', 'Adventure'], keywords: ['fast-paced', 'exciting', 'intense'] },
        relaxed: { genres: ['Slice of Life', 'Romance'], keywords: ['calm', 'peaceful', 'cozy'] },
        curious: { genres: ['Mystery', 'Sci-Fi', 'Fantasy'], keywords: ['intriguing', 'mysterious', 'imaginative'] },
        romantic: { genres: ['Romance', 'Drama'], keywords: ['love', 'passion', 'heartfelt'] },
        scared: { genres: ['Horror', 'Thriller'], keywords: ['scary', 'suspenseful', 'dark'] },
      };

      const moodConfig = moodMappings[mood.toLowerCase()] || moodMappings.happy;

      // Get stories matching mood
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, title, genre')
        .eq('is_published', true)
        .in('genre', moodConfig.genres)
        .limit(10);

      const storyIds = (stories || []).map((s) => s.id);
      const reasoning = `Based on your ${mood} mood, we've selected ${moodConfig.genres.join(', ')} stories that are ${moodConfig.keywords.join(', ')}.`;

      // Save recommendation
      await this.supabase.from('mood_recommendations').insert({
        user_id: userId,
        user_stated_mood: mood,
        recommended_stories: storyIds,
        reasoning,
      });

      return { storyIds, reasoning };
    } catch (error) {
      console.error('Error in getMoodRecommendations:', error);
      return { storyIds: [], reasoning: '' };
    }
  }

  /**
   * Get all user's chat sessions
   */
  async getUserChatSessions(userId: string): Promise<CharacterChatSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('character_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
      }

      return (data || []).map((s) => ({
        id: s.id,
        storyId: s.story_id,
        characterName: s.character_name,
        characterPersona: s.character_persona,
        messageCount: s.message_count,
        lastMessageAt: s.last_message_at,
      }));
    } catch (error) {
      console.error('Error in getUserChatSessions:', error);
      return [];
    }
  }
}

export const aiCompanionEnhancedService = new AICompanionEnhancedService();
