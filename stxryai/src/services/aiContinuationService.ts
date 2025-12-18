/**
 * AI Story Continuation Service
 * Provides AI-powered suggestions for story continuation and chapter generation.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface StoryContext {
  storyId: string;
  title: string;
  genre: string;
  tone?: string;
  targetAudience?: string;
  previousChapters: ChapterSummary[];
  currentChapter?: ChapterContent;
  characters: Character[];
  plotPoints: PlotPoint[];
  userChoiceHistory?: UserChoice[];
}

export interface ChapterSummary {
  id: string;
  title: string;
  summary: string;
  keyEvents: string[];
  order: number;
}

export interface ChapterContent {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface Character {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  traits: string[];
  currentState?: string;
  relationships?: Record<string, string>;
}

export interface PlotPoint {
  description: string;
  resolved: boolean;
  importance: 'major' | 'minor' | 'subplot';
}

export interface UserChoice {
  chapterId: string;
  choiceText: string;
  consequence?: string;
}

export interface ContinuationSuggestion {
  id: string;
  type: 'chapter' | 'scene' | 'dialogue' | 'description' | 'choice';
  title?: string;
  content: string;
  preview: string;
  tone: string;
  wordCount: number;
  confidence: number;
  tags: string[];
}

export interface ChoiceSuggestion {
  text: string;
  consequence: string;
  tone: 'positive' | 'negative' | 'neutral' | 'dramatic';
  leadsToBranch: string;
}

export interface WritingPrompt {
  prompt: string;
  context: string;
  suggestions: string[];
  genre: string;
}

// Genre-specific writing styles
const GENRE_STYLES: Record<string, { tone: string; elements: string[] }> = {
  fantasy: {
    tone: 'epic and mystical',
    elements: ['magic systems', 'mythical creatures', 'quests', 'prophecies'],
  },
  'sci-fi': {
    tone: 'futuristic and thought-provoking',
    elements: ['technology', 'space exploration', 'AI', 'scientific concepts'],
  },
  romance: {
    tone: 'emotional and intimate',
    elements: ['relationships', 'tension', 'chemistry', 'emotional growth'],
  },
  mystery: {
    tone: 'suspenseful and intriguing',
    elements: ['clues', 'red herrings', 'revelations', 'detective work'],
  },
  horror: {
    tone: 'dark and unsettling',
    elements: ['tension building', 'fear', 'supernatural', 'psychological'],
  },
  adventure: {
    tone: 'exciting and action-packed',
    elements: ['exploration', 'danger', 'discovery', 'heroism'],
  },
  thriller: {
    tone: 'tense and fast-paced',
    elements: ['stakes', 'twists', 'danger', 'time pressure'],
  },
};

export const aiContinuationService = {
  /**
   * Generate continuation suggestions for a story
   */
  async generateContinuations(
    context: StoryContext,
    count: number = 3
  ): Promise<ContinuationSuggestion[]> {
    const genreStyle = GENRE_STYLES[context.genre.toLowerCase()] || GENRE_STYLES.adventure;

    // Build the prompt for the AI
    const prompt = this.buildContinuationPrompt(context, genreStyle);

    try {
      const response = await fetch('/api/ai/continue-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            genre: context.genre,
            tone: genreStyle.tone,
            characters: context.characters.map((c) => c.name),
            recentEvents: context.previousChapters.slice(-2).flatMap((c) => c.keyEvents),
          },
          count,
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      return data.suggestions || this.generateFallbackSuggestions(context, count);
    } catch (error) {
      console.error('Error generating continuations:', error);
      return this.generateFallbackSuggestions(context, count);
    }
  },

  /**
   * Build a prompt for story continuation
   */
  buildContinuationPrompt(
    context: StoryContext,
    genreStyle: { tone: string; elements: string[] }
  ): string {
    const recentChapters = context.previousChapters.slice(-3);
    const characterList = context.characters
      .map((c) => `${c.name} (${c.role}): ${c.traits.join(', ')}`)
      .join('\n');

    const unresolvedPlots = context.plotPoints
      .filter((p) => !p.resolved)
      .map((p) => p.description)
      .join('\n');

    return `
Story: "${context.title}"
Genre: ${context.genre}
Tone: ${genreStyle.tone}
Key Elements: ${genreStyle.elements.join(', ')}

Characters:
${characterList}

Recent Events:
${recentChapters.map((c) => `- ${c.title}: ${c.summary}`).join('\n')}

Unresolved Plot Points:
${unresolvedPlots || 'None specified'}

${context.currentChapter ? `Current Chapter Content:\n${context.currentChapter.content.slice(-500)}...` : ''}

Generate compelling continuation options that:
1. Maintain narrative consistency
2. Develop character arcs
3. Build tension appropriately
4. Include meaningful choices for the reader
    `.trim();
  },

  /**
   * Generate fallback suggestions when AI is unavailable
   */
  generateFallbackSuggestions(
    context: StoryContext,
    count: number
  ): ContinuationSuggestion[] {
    const genreStyle = GENRE_STYLES[context.genre.toLowerCase()] || GENRE_STYLES.adventure;
    const suggestions: ContinuationSuggestion[] = [];

    const templates = [
      {
        type: 'scene' as const,
        title: 'A Surprising Discovery',
        template: `The protagonist stumbles upon something unexpected that changes their understanding of the situation. This revelation connects to earlier events and raises new questions.`,
      },
      {
        type: 'dialogue' as const,
        title: 'A Crucial Conversation',
        template: `An important conversation takes place that reveals hidden motivations or important information. The dialogue builds tension and deepens character relationships.`,
      },
      {
        type: 'chapter' as const,
        title: 'Rising Action',
        template: `Events escalate as the characters face new challenges. The stakes are raised and difficult decisions must be made.`,
      },
      {
        type: 'choice' as const,
        title: 'A Pivotal Decision',
        template: `The protagonist faces a crucial choice that will significantly impact the story's direction. Both options have meaningful consequences.`,
      },
      {
        type: 'description' as const,
        title: 'Setting the Scene',
        template: `A vivid description of the environment that creates atmosphere and hints at upcoming events. The setting reflects the story's ${genreStyle.tone} tone.`,
      },
    ];

    for (let i = 0; i < Math.min(count, templates.length); i++) {
      const template = templates[i];
      suggestions.push({
        id: `suggestion-${Date.now()}-${i}`,
        type: template.type,
        title: template.title,
        content: template.template,
        preview: template.template.slice(0, 100) + '...',
        tone: genreStyle.tone,
        wordCount: template.template.split(' ').length,
        confidence: 0.7,
        tags: genreStyle.elements.slice(0, 2),
      });
    }

    return suggestions;
  },

  /**
   * Generate choice options for a story branch
   */
  async generateChoices(
    context: StoryContext,
    situation: string,
    count: number = 3
  ): Promise<ChoiceSuggestion[]> {
    try {
      const response = await fetch('/api/ai/generate-choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            genre: context.genre,
            characters: context.characters,
            situation,
          },
          count,
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      return data.choices || this.generateFallbackChoices(situation, count);
    } catch (error) {
      console.error('Error generating choices:', error);
      return this.generateFallbackChoices(situation, count);
    }
  },

  /**
   * Generate fallback choices
   */
  generateFallbackChoices(situation: string, count: number): ChoiceSuggestion[] {
    const fallbackChoices: ChoiceSuggestion[] = [
      {
        text: 'Take the cautious approach',
        consequence: 'A safer path that may take longer but reduces immediate risk.',
        tone: 'neutral',
        leadsToBranch: 'cautious-path',
      },
      {
        text: 'Act boldly and directly',
        consequence: 'A risky choice that could lead to quick success or dramatic failure.',
        tone: 'dramatic',
        leadsToBranch: 'bold-path',
      },
      {
        text: 'Seek help from others',
        consequence: 'Relying on allies may strengthen bonds but also create dependencies.',
        tone: 'positive',
        leadsToBranch: 'alliance-path',
      },
      {
        text: 'Investigate further first',
        consequence: 'Gathering more information before acting may reveal hidden opportunities.',
        tone: 'neutral',
        leadsToBranch: 'investigation-path',
      },
    ];

    return fallbackChoices.slice(0, count);
  },

  /**
   * Generate writing prompts for authors
   */
  async getWritingPrompts(
    genre: string,
    theme?: string
  ): Promise<WritingPrompt[]> {
    const genreStyle = GENRE_STYLES[genre.toLowerCase()] || GENRE_STYLES.adventure;

    const prompts: WritingPrompt[] = [
      {
        prompt: `Write an opening scene that immediately draws the reader into a ${genre} world.`,
        context: `Focus on creating atmosphere and introducing a compelling hook.`,
        suggestions: [
          'Start with action or conflict',
          'Use sensory details',
          'Introduce a mystery or question',
        ],
        genre,
      },
      {
        prompt: `Create a pivotal moment where the protagonist must make a difficult choice.`,
        context: `The decision should have meaningful consequences and reveal character.`,
        suggestions: [
          'Show internal conflict',
          'Make both options have trade-offs',
          'Connect to the theme',
        ],
        genre,
      },
      {
        prompt: `Write a dialogue scene that reveals hidden tensions between characters.`,
        context: `Use subtext and body language to convey what isn't being said directly.`,
        suggestions: [
          'Each character has their own agenda',
          'Include physical reactions',
          'Build to a revelation',
        ],
        genre,
      },
      {
        prompt: `Describe a setting that reflects the ${genreStyle.tone} tone of your story.`,
        context: `The environment should enhance mood and foreshadow events.`,
        suggestions: genreStyle.elements.map((e) => `Incorporate ${e}`),
        genre,
      },
    ];

    if (theme) {
      prompts.push({
        prompt: `Explore the theme of "${theme}" through a character's actions and choices.`,
        context: `Show don't tell - let the theme emerge through story events.`,
        suggestions: [
          'Use symbolism',
          'Create parallels between characters',
          'Build to a thematic climax',
        ],
        genre,
      });
    }

    return prompts;
  },

  /**
   * Analyze story for improvement suggestions
   */
  async analyzeStory(
    content: string,
    genre: string
  ): Promise<{
    strengths: string[];
    improvements: string[];
    pacing: 'slow' | 'balanced' | 'fast';
    readabilityScore: number;
  }> {
    // Basic analysis without AI
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / sentenceCount;

    const dialogueMatches = content.match(/["'].*?["']/g) || [];
    const dialogueRatio = dialogueMatches.length / sentenceCount;

    const paragraphs = content.split(/\n\n+/);
    const avgParagraphLength = wordCount / paragraphs.length;

    // Determine pacing
    let pacing: 'slow' | 'balanced' | 'fast' = 'balanced';
    if (avgSentenceLength > 25 || avgParagraphLength > 150) {
      pacing = 'slow';
    } else if (avgSentenceLength < 12 || dialogueRatio > 0.4) {
      pacing = 'fast';
    }

    // Calculate readability (simplified Flesch-Kincaid)
    const syllables = content.split(/[aeiou]/i).length - 1;
    const readabilityScore = Math.max(
      0,
      Math.min(100, 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount))
    );

    const strengths: string[] = [];
    const improvements: string[] = [];

    // Analyze strengths and improvements
    if (dialogueRatio > 0.2 && dialogueRatio < 0.5) {
      strengths.push('Good balance of dialogue and narrative');
    } else if (dialogueRatio < 0.1) {
      improvements.push('Consider adding more dialogue to break up narrative');
    } else if (dialogueRatio > 0.6) {
      improvements.push('Balance dialogue with more descriptive prose');
    }

    if (avgSentenceLength > 10 && avgSentenceLength < 20) {
      strengths.push('Varied sentence structure');
    } else if (avgSentenceLength > 25) {
      improvements.push('Break up longer sentences for better readability');
    }

    if (paragraphs.length > 3 && avgParagraphLength < 100) {
      strengths.push('Well-structured paragraphs');
    } else if (avgParagraphLength > 200) {
      improvements.push('Consider shorter paragraphs for easier reading');
    }

    return {
      strengths,
      improvements,
      pacing,
      readabilityScore: Math.round(readabilityScore),
    };
  },

  /**
   * Save a continuation to the database
   */
  async saveContinuation(
    storyId: string,
    userId: string,
    suggestion: ContinuationSuggestion,
    applied: boolean
  ): Promise<void> {
    await supabase.from('ai_continuations').insert({
      story_id: storyId,
      user_id: userId,
      suggestion_type: suggestion.type,
      content: suggestion.content,
      was_applied: applied,
      confidence_score: suggestion.confidence,
      created_at: new Date().toISOString(),
    });
  },

  /**
   * Get continuation history for a story
   */
  async getContinuationHistory(
    storyId: string
  ): Promise<Array<{ suggestion: ContinuationSuggestion; applied: boolean; createdAt: string }>> {
    const { data, error } = await supabase
      .from('ai_continuations')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching continuation history:', error);
      return [];
    }

    return (data || []).map((item) => ({
      suggestion: {
        id: item.id,
        type: item.suggestion_type,
        content: item.content,
        preview: item.content.slice(0, 100),
        tone: '',
        wordCount: item.content.split(' ').length,
        confidence: item.confidence_score,
        tags: [],
      },
      applied: item.was_applied,
      createdAt: item.created_at,
    }));
  },
};

export default aiContinuationService;
