/**
 * Enhanced AI Service
 * Provides smarter, more personalized AI interactions throughout the app.
 * Uses user context, reading history, and pet data for better responses.
 */

import { supabase } from '@/lib/supabase/client';
import { aiService } from '@/lib/api/ai-service';
import { generateText } from '@/lib/ai/client';

// =============================================================================
// TYPES
// =============================================================================

export interface UserContext {
  userId: string;
  username?: string;
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  favoriteGenres: string[];
  recentStories: { id: string; title: string; genre: string }[];
  totalStoriesRead: number;
  averageRating: number;
  readingSpeed?: 'slow' | 'medium' | 'fast';
  preferredTone?: 'serious' | 'playful' | 'mysterious' | 'balanced';
  petName?: string;
  petPersonality?: string;
}

export interface AIResponseOptions {
  context?: UserContext;
  style?: 'concise' | 'detailed' | 'conversational';
  creativity?: number; // 0-1
  includePersonalization?: boolean;
  maxLength?: number;
}

export interface SmartRecommendation {
  storyId: string;
  reason: string;
  matchScore: number;
  personalizedMessage: string;
}

export interface WritingFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  encouragement: string;
}

// =============================================================================
// ENHANCED AI SERVICE CLASS
// =============================================================================

class EnhancedAIService {
  /**
   * Get user context for personalized AI interactions
   */
  async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      // Fetch user data
      const [userResult, progressResult, ratingsResult, petResult] = await Promise.all([
        supabase.from('users').select('username, xp, level').eq('id', userId).single(),
        supabase
          .from('user_progress')
          .select('story_id, stories(id, title, genre)')
          .eq('user_id', userId)
          .eq('is_completed', true)
          .order('last_read_at', { ascending: false })
          .limit(10),
        supabase
          .from('ratings')
          .select('rating')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('user_pets').select('name, personality').eq('user_id', userId).single(),
      ]);

      const user = userResult.data;
      const progress = progressResult.data || [];
      const ratings = ratingsResult.data || [];
      const pet = petResult.data;

      // Calculate reading level based on XP
      const xp = user?.xp || 0;
      let readingLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (xp > 5000) readingLevel = 'advanced';
      else if (xp > 1000) readingLevel = 'intermediate';

      // Extract genres from completed stories
      const genres = progress.map((p: any) => p.stories?.genre).filter(Boolean) as string[];

      const genreCounts = genres.reduce((acc: Record<string, number>, genre: string) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});

      const favoriteGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([genre]) => genre);

      // Calculate average rating
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        userId,
        username: user?.username,
        readingLevel,
        favoriteGenres,
        recentStories: progress.slice(0, 5).map((p: any) => ({
          id: p.story_id,
          title: p.stories?.title || '',
          genre: p.stories?.genre || '',
        })),
        totalStoriesRead: progress.length,
        averageRating: Math.round(avgRating * 10) / 10,
        petName: pet?.name,
        petPersonality: pet?.personality,
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Generate personalized story recommendations
   */
  async getSmartRecommendations(userId: string, count: number = 5): Promise<SmartRecommendation[]> {
    try {
      const context = await this.getUserContext(userId);
      if (!context) return [];

      // Get stories user hasn't read
      const { data: unreadStories } = await supabase
        .from('stories')
        .select('id, title, genre, description, rating, view_count')
        .eq('is_published', true)
        .not('id', 'in', `(${context.recentStories.map((s) => s.id).join(',') || 'null'})`)
        .order('rating', { ascending: false })
        .limit(50);

      if (!unreadStories || unreadStories.length === 0) return [];

      // Score stories based on user preferences
      const scoredStories = unreadStories.map((story) => {
        let score = story.rating * 20; // Base score from rating

        // Boost if matches favorite genre
        if (context.favoriteGenres.includes(story.genre)) {
          score += 30;
        }

        // Adjust based on user's typical ratings
        if (context.averageRating > 4 && story.rating >= 4.5) {
          score += 15;
        }

        // Add some variety
        score += Math.random() * 10;

        return { ...story, score };
      });

      // Sort by score and take top recommendations
      const topStories = scoredStories.sort((a, b) => b.score - a.score).slice(0, count);

      // Generate personalized messages
      const recommendations: SmartRecommendation[] = await Promise.all(
        topStories.map(async (story) => {
          const reason = this.generateReasonText(story, context);
          const personalizedMessage = context.petName
            ? `${context.petName} thinks you'd love this ${story.genre} adventure!`
            : `Based on your love for ${context.favoriteGenres[0] || story.genre}, you'll enjoy this!`;

          return {
            storyId: story.id,
            reason,
            matchScore: Math.round(story.score),
            personalizedMessage,
          };
        })
      );

      return recommendations;
    } catch (error) {
      console.error('Error getting smart recommendations:', error);
      return [];
    }
  }

  /**
   * Generate AI-powered writing feedback
   */
  async getWritingFeedback(
    content: string,
    genre: string,
    userId?: string
  ): Promise<WritingFeedback> {
    try {
      const context = userId ? await this.getUserContext(userId) : null;

      let systemPrompt = `You are an encouraging and insightful writing coach. Analyze the following ${genre} story content and provide constructive feedback.`;

      if (context) {
        systemPrompt += `\n\nThe writer's profile:
- Reading level: ${context.readingLevel}
- Favorite genres: ${context.favoriteGenres.join(', ')}
- Stories read: ${context.totalStoriesRead}
${context.petName ? `- Has a companion named ${context.petName} who is ${context.petPersonality}` : ''}`;
      }

      systemPrompt += `\n\nProvide feedback in this JSON format:
{
  "overallScore": <1-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2"],
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "encouragement": "<personalized encouraging message>"
}`;

      const result = await generateText(
        `Analyze this ${genre} story:\n\n${content.slice(0, 3000)}`,
        systemPrompt,
        0.7
      );

      try {
        const feedback = JSON.parse(result);
        return {
          overallScore: Math.min(100, Math.max(1, feedback.overallScore || 70)),
          strengths: feedback.strengths || ['Good effort!'],
          improvements: feedback.improvements || [],
          suggestions: feedback.suggestions || [],
          encouragement: feedback.encouragement || "Keep writing, you're doing great!",
        };
      } catch {
        // Fallback if parsing fails
        return {
          overallScore: 75,
          strengths: ['Creative storytelling', 'Engaging narrative'],
          improvements: ['Consider pacing', 'Develop characters further'],
          suggestions: ['Add more sensory details', "Show don't tell"],
          encouragement: 'Your writing shows promise! Keep developing your voice.',
        };
      }
    } catch (error) {
      console.error('Error getting writing feedback:', error);
      return {
        overallScore: 70,
        strengths: ['Good effort'],
        improvements: [],
        suggestions: [],
        encouragement: 'Keep writing!',
      };
    }
  }

  /**
   * Generate personalized story continuation suggestions
   */
  async getContinuationSuggestions(
    currentContent: string,
    genre: string,
    userId?: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      const context = userId ? await this.getUserContext(userId) : null;

      let systemPrompt = `You are a creative story assistant helping write a ${genre} story.`;

      if (context) {
        systemPrompt += ` The reader enjoys ${context.favoriteGenres.join(', ')} stories`;
        if (context.preferredTone) {
          systemPrompt += ` with a ${context.preferredTone} tone`;
        }
        if (context.petName) {
          systemPrompt += `. Their companion ${context.petName} (who is ${context.petPersonality}) is along for the adventure`;
        }
        systemPrompt += '.';
      }

      systemPrompt += `\n\nGenerate ${count} creative, engaging options for what could happen next in the story. Each should be a brief action or event (1-2 sentences). Format as a numbered list.`;

      const result = await generateText(
        `Story so far:\n\n${currentContent.slice(-1500)}\n\nWhat could happen next?`,
        systemPrompt,
        0.85
      );

      // Parse the suggestions
      const lines = result.split('\n').filter((line) => line.trim());
      const suggestions = lines
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((line) => line.length > 10)
        .slice(0, count);

      return suggestions.length > 0
        ? suggestions
        : [
            'The protagonist discovers an unexpected ally.',
            'A mysterious object reveals a hidden truth.',
            'The path ahead splits into two dangerous choices.',
          ];
    } catch (error) {
      console.error('Error getting continuation suggestions:', error);
      return [
        'Something unexpected happens.',
        'A new character appears.',
        'The situation takes a dramatic turn.',
      ];
    }
  }

  /**
   * Generate reading recap based on user's journey
   */
  async generateReadingRecap(
    userId: string,
    storyId: string,
    choiceHistory: string[]
  ): Promise<string> {
    try {
      const context = await this.getUserContext(userId);

      const { data: story } = await supabase
        .from('stories')
        .select('title, genre')
        .eq('id', storyId)
        .single();

      if (!story) return 'Your reading journey awaits...';

      let systemPrompt = `You are a storyteller creating a personalized recap of a reader's journey through "${story.title}" (${story.genre}).`;

      if (context?.petName) {
        systemPrompt += ` Their companion ${context.petName} (${context.petPersonality}) was with them.`;
      }

      systemPrompt += `\n\nCreate a brief, engaging 2-3 sentence recap that celebrates their journey and the choices they made. Be warm and encouraging.`;

      const result = await generateText(
        `Choices made during the story:\n${choiceHistory.slice(-10).join('\n')}`,
        systemPrompt,
        0.8
      );

      return result || `You've completed an incredible journey through "${story.title}"!`;
    } catch (error) {
      console.error('Error generating reading recap:', error);
      return "What an adventure you've had!";
    }
  }

  /**
   * Generate pet dialogue based on context
   */
  async generatePetDialogue(
    userId: string,
    trigger: 'reading' | 'achievement' | 'streak' | 'idle' | 'story_complete',
    additionalContext?: string
  ): Promise<string> {
    try {
      const { data: pet } = await supabase
        .from('user_pets')
        .select('name, personality, base_type, evolution_stage, stats')
        .eq('user_id', userId)
        .single();

      if (!pet) return '';

      const personalityPrompts: Record<string, string> = {
        energetic: 'Respond with high energy and enthusiasm!',
        calm: 'Respond peacefully and thoughtfully.',
        curious: 'Respond with wonder and questions.',
        playful: 'Respond with humor and playfulness.',
        wise: 'Respond with wisdom and sage advice.',
        mischievous: 'Respond with a hint of mischief.',
        shy: 'Respond timidly but sweetly.',
        brave: 'Respond with courage and confidence.',
        dreamy: 'Respond with a dreamy, whimsical tone.',
        loyal: 'Respond with devoted affection.',
      };

      const triggerContexts: Record<string, string> = {
        reading: 'Your companion just started reading a new story',
        achievement: 'Your companion just unlocked an achievement',
        streak: `Your companion maintained their reading streak (${pet.stats?.currentStreak || 1} days)`,
        idle: "Your companion hasn't interacted in a while",
        story_complete: 'Your companion just finished a story',
      };

      const systemPrompt = `You are ${pet.name}, a ${pet.evolution_stage} ${pet.base_type} companion. ${personalityPrompts[pet.personality] || 'Be friendly.'}
      
Keep responses short (1-2 sentences max), charming, and in character. Use asterisks for actions like *bounces happily*.`;

      const result = await generateText(
        `${triggerContexts[trigger]}. ${additionalContext || ''} What do you say?`,
        systemPrompt,
        0.9
      );

      return result || `*${pet.name} looks at you happily*`;
    } catch (error) {
      console.error('Error generating pet dialogue:', error);
      return '';
    }
  }

  /**
   * Generate smart search suggestions
   */
  async getSearchSuggestions(query: string, userId?: string): Promise<string[]> {
    try {
      const context = userId ? await this.getUserContext(userId) : null;

      // Base suggestions from query
      const baseSuggestions = [`${query} stories`, `${query} adventure`, `best ${query}`];

      // Add personalized suggestions
      if (context && context.favoriteGenres.length > 0) {
        baseSuggestions.push(
          `${query} ${context.favoriteGenres[0]}`,
          `${context.favoriteGenres[0]} like ${query}`
        );
      }

      return baseSuggestions.slice(0, 5);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private generateReasonText(story: any, context: UserContext): string {
    const reasons: string[] = [];

    if (context.favoriteGenres.includes(story.genre)) {
      reasons.push(`Matches your love for ${story.genre}`);
    }

    if (story.rating >= 4.5) {
      reasons.push('Highly rated by readers');
    }

    if (story.view_count > 10000) {
      reasons.push('Popular choice');
    }

    return reasons.length > 0 ? reasons[0] : 'New adventure awaits';
  }
}

// Export singleton
export const enhancedAIService = new EnhancedAIService();
