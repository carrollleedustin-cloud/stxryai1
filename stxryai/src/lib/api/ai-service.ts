/**
 * Unified AI Service Wrapper
 * Consolidates all AI-related API calls with consistent error handling, caching, and retry logic
 */

import { generateCompletion, generateText, streamCompletion, type AIMessage, type AICompletionOptions } from '@/lib/ai/client';
import { withErrorHandling, withRetry, rateLimiter } from './error-handler';
import { apiCache, withCache } from './cache';

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  cache?: boolean;
  cacheTTL?: number;
  stream?: boolean;
}

export interface StoryGenerationRequest {
  prompt: string;
  genre?: string;
  tone?: string;
  context?: string;
  narrativeStyle?: string;
  perspective?: string;
}

export interface CharacterGenerationRequest {
  name: string;
  role: string;
  backstory?: string;
  traits?: string[];
}

export interface ContentModerationRequest {
  content: string;
  contentType: 'story' | 'comment' | 'review';
}

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  suggestion?: string;
}

class AIService {
  private readonly SERVICE_NAME = 'ai';
  private readonly RATE_LIMIT = 100; // requests per minute
  private readonly RATE_WINDOW = 60 * 1000; // 1 minute

  /**
   * Generate story content using AI
   */
  async generateStoryContent(
    request: StoryGenerationRequest,
    options: AIServiceOptions = {}
  ) {
    return withErrorHandling(
      async () => {
        // Rate limiting
        await rateLimiter.waitForSlot(
          `${this.SERVICE_NAME}:story`,
          this.RATE_LIMIT,
          this.RATE_WINDOW
        );

        const systemPrompt = this.buildStorySystemPrompt(request);
        const userPrompt = this.buildStoryUserPrompt(request);

        if (options.stream) {
          return this.streamGeneration(systemPrompt, userPrompt, options);
        }

        // Check cache if enabled
        if (options.cache !== false) {
          const cacheKey = this.getCacheKey('story', request);
          const cached = apiCache.get(cacheKey, {
            ttl: options.cacheTTL || 24 * 60 * 60 * 1000, // 24 hours
            storage: 'both',
          });
          if (cached) return cached;
        }

        const result = await withRetry(
          () => generateText(userPrompt, systemPrompt, options.temperature),
          {
            maxRetries: 2,
            retryDelay: 1000,
            service: this.SERVICE_NAME,
          }
        );

        // Cache the result
        if (options.cache !== false) {
          const cacheKey = this.getCacheKey('story', request);
          apiCache.set(cacheKey, result, {
            ttl: options.cacheTTL || 24 * 60 * 60 * 1000,
            storage: 'both',
          });
        }

        return result;
      },
      {
        service: this.SERVICE_NAME,
        operation: 'generateStoryContent',
      }
    );
  }

  /**
   * Generate character description
   */
  async generateCharacter(
    request: CharacterGenerationRequest,
    options: AIServiceOptions = {}
  ) {
    return withErrorHandling(
      async () => {
        await rateLimiter.waitForSlot(
          `${this.SERVICE_NAME}:character`,
          this.RATE_LIMIT,
          this.RATE_WINDOW
        );

        const systemPrompt = 'You are an expert character designer for interactive fiction. Create detailed, compelling character descriptions.';
        const userPrompt = `Create a character description for:
Name: ${request.name}
Role: ${request.role}
${request.backstory ? `Backstory: ${request.backstory}` : ''}
${request.traits ? `Traits: ${request.traits.join(', ')}` : ''}

Provide a rich, engaging character description that includes personality, appearance, motivations, and potential story hooks.`;

        const result = await withRetry(
          () => generateText(userPrompt, systemPrompt, options.temperature || 0.8),
          {
            maxRetries: 2,
            retryDelay: 1000,
            service: this.SERVICE_NAME,
          }
        );

        return result;
      },
      {
        service: this.SERVICE_NAME,
        operation: 'generateCharacter',
      }
    );
  }

  /**
   * Moderate content for appropriateness
   */
  async moderateContent(
    request: ContentModerationRequest
  ): Promise<ModerationResult> {
    const response = await withErrorHandling(
      async () => {
        await rateLimiter.waitForSlot(
          `${this.SERVICE_NAME}:moderation`,
          this.RATE_LIMIT,
          this.RATE_WINDOW
        );

        const systemPrompt = `You are a content moderation AI. Analyze the following ${request.contentType} for inappropriate content including hate speech, violence, explicit content, harassment, or spam. Respond with a JSON object containing:
{
  "isAppropriate": boolean,
  "confidence": number (0-1),
  "flags": string[] (list of issues found),
  "suggestion": string (optional improvement suggestion)
}`;

        const result = await withRetry(
          () => generateText(request.content, systemPrompt, 0.3),
          {
            maxRetries: 2,
            retryDelay: 1000,
            service: this.SERVICE_NAME,
          }
        );

        return JSON.parse(result);
      },
      {
        service: this.SERVICE_NAME,
        operation: 'moderateContent',
      }
    );

    if (!response.success) {
      // Default to safe moderation on error
      return {
        isAppropriate: true,
        confidence: 0.5,
        flags: [],
      };
    }

    return response.data;
  }

  /**
   * Generate writing suggestions
   */
  async generateWritingSuggestions(
    text: string,
    suggestionType: 'improve' | 'continue' | 'rewrite' | 'expand',
    options: AIServiceOptions = {}
  ) {
    return withErrorHandling(
      async () => {
        await rateLimiter.waitForSlot(
          `${this.SERVICE_NAME}:suggestions`,
          this.RATE_LIMIT,
          this.RATE_WINDOW
        );

        const systemPrompts = {
          improve: `You are an expert writing coach specializing in interactive fiction. Analyze the text and provide an improved version that:
- Enhances clarity and flow
- Strengthens word choice and imagery
- Maintains the author's unique voice and style
- Adds subtle emotional depth
- Improves pacing and rhythm
Keep the same meaning and plot points, just make it more polished and engaging.`,

          continue: `You are a creative storytelling AI specialized in interactive narratives. Continue the story naturally by:
- Maintaining consistent character voices and motivations
- Following the established tone and pacing
- Introducing logical next events or revelations
- Creating natural dialogue and descriptions
- Building tension or resolving conflicts appropriately
- Adding sensory details and emotional resonance
Write 2-3 paragraphs that feel like a seamless continuation.`,

          rewrite: `You are a master editor for interactive fiction. Rewrite this text to be significantly more engaging by:
- Creating stronger opening hooks
- Using more vivid, specific descriptions
- Adding emotional stakes and character depth
- Improving sentence variety and rhythm
- Removing unnecessary words
- Adding tension and intrigue
Transform it into something readers can't put down while keeping the core events.`,

          expand: `You are a detail-oriented story developer. Expand this text with rich, immersive details by:
- Adding sensory descriptions (sight, sound, smell, touch, taste)
- Developing character thoughts and emotions
- Building atmosphere and mood
- Including relevant world-building details
- Adding character actions and reactions
- Creating vivid scene-setting
Triple the length while maintaining perfect pacing. Make readers feel like they're living the story.`,
        };

        const result = await withRetry(
          () => generateText(text, systemPrompts[suggestionType], options.temperature || 0.7),
          {
            maxRetries: 2,
            retryDelay: 1000,
            service: this.SERVICE_NAME,
          }
        );

        return result;
      },
      {
        service: this.SERVICE_NAME,
        operation: 'generateWritingSuggestions',
      }
    );
  }

  /**
   * Analyze story for insights
   */
  async analyzeStory(
    storyText: string,
    analysisType: 'pacing' | 'emotion' | 'characters' | 'themes'
  ) {
    return withErrorHandling(
      async () => {
        await rateLimiter.waitForSlot(
          `${this.SERVICE_NAME}:analysis`,
          this.RATE_LIMIT,
          this.RATE_WINDOW
        );

        const systemPrompts = {
          pacing: 'Analyze the pacing of this story. Identify slow and fast sections, and provide suggestions for improvement.',
          emotion: 'Analyze the emotional arc of this story. Identify emotional beats and their intensity.',
          characters: 'Analyze the characters in this story. Evaluate their depth, development, and relationships.',
          themes: 'Analyze the themes in this story. Identify major and minor themes and how they\'re developed.',
        };

        const result = await withRetry(
          () => generateText(storyText, systemPrompts[analysisType], 0.5),
          {
            maxRetries: 2,
            retryDelay: 1000,
            service: this.SERVICE_NAME,
          }
        );

        return result;
      },
      {
        service: this.SERVICE_NAME,
        operation: 'analyzeStory',
      }
    );
  }

  /**
   * Stream AI generation for real-time feedback
   */
  private async *streamGeneration(
    systemPrompt: string,
    userPrompt: string,
    options: AIServiceOptions
  ): AsyncGenerator<string> {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const completionOptions: AICompletionOptions = {
      messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      model: options.model,
    };

    yield* streamCompletion(completionOptions);
  }

  /**
   * Build system prompt for story generation
   */
  private buildStorySystemPrompt(request: StoryGenerationRequest): string {
    let prompt = 'You are a creative fiction writer specializing in interactive storytelling.';

    // Genre-specific expertise
    const genreExpertise: Record<string, string> = {
      'childrens-adventure': 'You write delightful stories for children ages 3-8, using simple language, fun characters, and positive messages. Every sentence sparks imagination and wonder.',
      'childrens-educational': 'You create educational stories for children ages 5-10 that teach important lessons through engaging narratives. You make learning fun and memorable.',
      'middle-grade': 'You write exciting adventures for readers ages 8-12, balancing action with character development and age-appropriate themes.',
      'fantasy': 'You craft epic fantasy tales with rich magic systems, complex world-building, and memorable quests. Your stories blend wonder with depth.',
      'scifi': 'You write hard science fiction that explores technology, space, and the future. Your stories are scientifically grounded yet imaginative.',
      'cyberpunk': 'You create gritty cyberpunk narratives set in neon-lit dystopias where technology and humanity collide. Your prose is sharp and atmospheric.',
      'mystery': 'You write compelling mysteries with clever clues, red herrings, and satisfying reveals. Every detail matters in your intricate plots.',
      'horror': 'You create chilling horror that builds dread through atmosphere, psychological tension, and unexpected scares. You understand the art of fear.',
      'romance': 'You write heartfelt romance with authentic emotions, compelling chemistry, and satisfying relationship development.',
      'thriller': 'You craft high-stakes thrillers with relentless pacing, shocking twists, and edge-of-your-seat suspense.',
      'steampunk': 'You write Victorian-era stories infused with steam-powered technology, adventure, and period-appropriate language with modern sensibilities.',
      'historical': 'You write historically accurate fiction that brings past eras to life with rich detail, authentic dialogue, and emotional resonance.',
      'western': 'You craft Western tales with authentic frontier spirit, moral complexity, and vivid depictions of the Old West.',
      'postapocalyptic': 'You write post-apocalyptic survival stories that explore humanity, hope, and resilience in the face of devastation.',
      'superhero': 'You create superhero stories that balance spectacular action with character depth and moral dilemmas about power and responsibility.',
    };

    const genreKey = request.genre?.toLowerCase().replace(/\s+/g, '-') || '';
    if (genreExpertise[genreKey]) {
      prompt += ' ' + genreExpertise[genreKey];
    } else if (request.genre) {
      prompt += ` You excel at writing ${request.genre} stories with authentic genre elements and tropes.`;
    }

    // Tone-specific guidance
    if (request.tone) {
      const toneGuidance: Record<string, string> = {
        'dark': 'Your tone is dark and intense, exploring shadows and moral complexity.',
        'lighthearted': 'Your tone is fun and upbeat, bringing joy and laughter to readers.',
        'serious': 'Your tone is thoughtful and deep, exploring meaningful themes with gravity.',
        'humorous': 'Your tone is witty and comedic, finding humor in situations and character interactions.',
        'adventurous': 'Your tone is exciting and energetic, capturing the thrill of adventure.',
        'mysterious': 'Your tone is enigmatic and cryptic, weaving mystery into every scene.',
        'romantic': 'Your tone is passionate and emotional, exploring the depths of love and connection.',
        'gritty': 'Your tone is raw and realistic, showing life without softening the edges.',
        'whimsical': 'Your tone is playful and fantastical, celebrating wonder and imagination.',
      };

      prompt += ' ' + (toneGuidance[request.tone] || `Your writing has a ${request.tone} tone.`);
    }

    // Narrative style guidance
    if (request.narrativeStyle) {
      const styleGuidance: Record<string, string> = {
        'action-driven': 'Focus on fast-paced events, exciting sequences, and dynamic progression.',
        'character-focused': 'Delve deep into character psychology, motivations, and internal conflicts.',
        'atmospheric': 'Emphasize mood, setting, and sensory details to create immersive ambiance.',
        'dialogue-heavy': 'Drive the story through character conversations and interactions.',
        'philosophical': 'Explore big questions, existential themes, and intellectual depth.',
        'cinematic': 'Write with visual storytelling techniques, showing rather than telling.',
        'poetic': 'Use lyrical, beautiful language with careful attention to rhythm and imagery.',
        'minimalist': 'Write with sparse, direct prose that conveys maximum meaning with minimum words.',
      };

      prompt += ' ' + (styleGuidance[request.narrativeStyle] || `Use ${request.narrativeStyle} storytelling techniques.`);
    }

    prompt += ' Create engaging, immersive narrative content that draws readers in and makes every choice meaningful.';

    return prompt;
  }

  /**
   * Build user prompt for story generation
   */
  private buildStoryUserPrompt(request: StoryGenerationRequest): string {
    let prompt = request.prompt;

    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }

    return prompt;
  }

  /**
   * Generate cache key for requests
   */
  private getCacheKey(type: string, request: any): string {
    return `ai:${type}:${JSON.stringify(request)}`;
  }

  /**
   * Clear AI cache
   */
  clearCache(): void {
    apiCache.clear({ prefix: 'ai:' });
  }
}

export const aiService = new AIService();
