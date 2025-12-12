/**
 * AI Story Generation Service
 * Powered by OpenAI GPT-4 for generating interactive stories
 */

interface StoryPrompt {
  genre: string;
  theme?: string;
  characters?: string[];
  setting?: string;
  tone?: 'serious' | 'humorous' | 'dark' | 'lighthearted' | 'mysterious';
  length?: 'short' | 'medium' | 'long';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface GeneratedStory {
  title: string;
  description: string;
  chapters: GeneratedChapter[];
  metadata: {
    genre: string;
    estimatedReadTime: number;
    difficulty: string;
    tags: string[];
  };
}

interface GeneratedChapter {
  title: string;
  content: string;
  choices: GeneratedChoice[];
}

interface GeneratedChoice {
  text: string;
  consequence: string;
}

interface ContinuationRequest {
  storyContext: string;
  currentChapter: string;
  previousChoices: string[];
  direction?: string;
}

interface WritingSuggestion {
  type: 'grammar' | 'style' | 'plot' | 'character' | 'pacing';
  original: string;
  suggestion: string;
  reason: string;
  confidence: number;
}

export class AIStoryGenerator {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Generate a complete interactive story from a prompt
   */
  async generateStory(prompt: StoryPrompt): Promise<GeneratedStory> {
    const systemPrompt = this.buildSystemPrompt(prompt);
    const userPrompt = this.buildUserPrompt(prompt);

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseStoryResponse(response, prompt);
  }

  /**
   * Generate a single chapter continuation
   */
  async generateChapter(request: ContinuationRequest): Promise<GeneratedChapter> {
    const systemPrompt = `You are an expert interactive fiction writer. Continue the story based on the context and previous choices. Maintain consistency with the established narrative.`;

    const userPrompt = `
Story Context: ${request.storyContext}

Current Chapter: ${request.currentChapter}

Previous Choices Made:
${request.previousChoices.join('\n')}

${request.direction ? `Direction: ${request.direction}` : ''}

Generate the next chapter with 3-4 meaningful choices that impact the story.
`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseChapterResponse(response);
  }

  /**
   * Get AI writing suggestions for improvement
   */
  async getWritingSuggestions(content: string, focusAreas?: string[]): Promise<WritingSuggestion[]> {
    const systemPrompt = `You are an expert writing coach specializing in interactive fiction. Analyze the text and provide constructive suggestions for improvement.`;

    const userPrompt = `
Analyze this story content and provide suggestions:

${content}

${focusAreas ? `Focus on: ${focusAreas.join(', ')}` : 'Provide comprehensive feedback'}

Return suggestions in JSON format with: type, original, suggestion, reason, confidence (0-1)
`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseWritingSuggestions(response);
  }

  /**
   * Generate alternative story paths
   */
  async generateAlternatives(
    currentPath: string,
    count: number = 3
  ): Promise<Array<{ description: string; impact: string }>> {
    const systemPrompt = `You are a creative writing assistant. Generate alternative story paths that diverge from the current narrative.`;

    const userPrompt = `
Current Story Path:
${currentPath}

Generate ${count} alternative directions this story could take. Each should be unique and compelling.
Return as JSON array with: description, impact
`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return JSON.parse(response);
  }

  /**
   * Enhance existing content with AI
   */
  async enhanceContent(
    content: string,
    enhancement: 'expand' | 'condense' | 'dramatize' | 'clarify'
  ): Promise<string> {
    const enhancementInstructions = {
      expand: 'Add more detail, description, and depth to this content while maintaining the core narrative.',
      condense: 'Make this content more concise while preserving all key information and narrative beats.',
      dramatize: 'Increase the dramatic tension and emotional impact of this content.',
      clarify: 'Improve clarity and readability while maintaining the original meaning and style.',
    };

    const systemPrompt = `You are an expert editor. ${enhancementInstructions[enhancement]}`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ]);

    return response;
  }

  /**
   * Generate character dialogue
   */
  async generateDialogue(
    characterName: string,
    characterTraits: string[],
    situation: string,
    tone: string
  ): Promise<string> {
    const systemPrompt = `You are a character dialogue specialist. Write authentic, compelling dialogue.`;

    const userPrompt = `
Character: ${characterName}
Traits: ${characterTraits.join(', ')}
Situation: ${situation}
Tone: ${tone}

Generate a natural dialogue response for this character in this situation.
`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return response;
  }

  /**
   * Generate story outline
   */
  async generateOutline(
    concept: string,
    targetChapters: number
  ): Promise<Array<{ chapterNumber: number; title: string; summary: string; keyEvents: string[] }>> {
    const systemPrompt = `You are a story architect. Create detailed, well-structured story outlines.`;

    const userPrompt = `
Story Concept: ${concept}
Target Chapters: ${targetChapters}

Create a detailed chapter-by-chapter outline. Return as JSON array with: chapterNumber, title, summary, keyEvents
`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return JSON.parse(response);
  }

  /**
   * Private helper methods
   */

  private buildSystemPrompt(prompt: StoryPrompt): string {
    return `You are an expert interactive fiction writer specializing in ${prompt.genre} stories.
You create engaging, choice-driven narratives with meaningful consequences.
Your stories have ${prompt.tone || 'balanced'} tone and are suitable for ${prompt.difficulty || 'medium'} difficulty readers.
Always return responses in valid JSON format.`;
  }

  private buildUserPrompt(prompt: StoryPrompt): string {
    const parts = [
      `Generate an interactive ${prompt.length || 'medium'}-length story with the following parameters:`,
      `Genre: ${prompt.genre}`,
    ];

    if (prompt.theme) parts.push(`Theme: ${prompt.theme}`);
    if (prompt.characters?.length) parts.push(`Characters: ${prompt.characters.join(', ')}`);
    if (prompt.setting) parts.push(`Setting: ${prompt.setting}`);
    if (prompt.tone) parts.push(`Tone: ${prompt.tone}`);

    parts.push(`
Create a story with:
- A compelling title and description
- 3-5 chapters with branching paths
- 3-4 meaningful choices per chapter
- Consistent world-building and character development

Return as JSON with structure: { title, description, chapters: [{ title, content, choices: [{ text, consequence }] }], metadata }
`);

    return parts.join('\n');
  }

  private async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4-turbo-preview'
  ): Promise<string> {
    if (!this.apiKey) {
      // Fallback to mock data for development
      return this.getMockResponse(messages);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return this.getMockResponse(messages);
    }
  }

  private getMockResponse(messages: Array<{ role: string; content: string }>): string {
    // Return mock data for development/testing
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    if (lastMessage.includes('generate') && lastMessage.includes('story')) {
      return JSON.stringify({
        title: 'The Quantum Paradox',
        description: 'A mind-bending sci-fi adventure where your choices shape reality itself.',
        chapters: [
          {
            title: 'The Discovery',
            content:
              'You wake up in a sterile laboratory, your head pounding. The last thing you remember is the experiment...',
            choices: [
              {
                text: 'Search the laboratory for clues',
                consequence: 'You discover a hidden terminal with encrypted files.',
              },
              {
                text: 'Try to escape immediately',
                consequence: 'You trigger an alarm system.',
              },
              {
                text: 'Call out for help',
                consequence: 'A mysterious figure appears in the shadows.',
              },
            ],
          },
        ],
        metadata: {
          genre: 'sci-fi',
          estimatedReadTime: 15,
          difficulty: 'medium',
          tags: ['mystery', 'science-fiction', 'thriller'],
        },
      });
    }

    return JSON.stringify({ success: true, message: 'Mock response' });
  }

  private parseStoryResponse(response: string, prompt: StoryPrompt): GeneratedStory {
    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || 'Untitled Story',
        description: parsed.description || '',
        chapters: parsed.chapters || [],
        metadata: {
          genre: prompt.genre,
          estimatedReadTime: this.calculateReadTime(parsed.chapters || []),
          difficulty: prompt.difficulty || 'medium',
          tags: parsed.metadata?.tags || [prompt.genre],
        },
      };
    } catch (error) {
      console.error('Failed to parse story response:', error);
      throw new Error('Invalid story generation response');
    }
  }

  private parseChapterResponse(response: string): GeneratedChapter {
    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || 'Chapter',
        content: parsed.content || '',
        choices: parsed.choices || [],
      };
    } catch (error) {
      console.error('Failed to parse chapter response:', error);
      throw new Error('Invalid chapter generation response');
    }
  }

  private parseWritingSuggestions(response: string): WritingSuggestion[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse writing suggestions:', error);
      return [];
    }
  }

  private calculateReadTime(chapters: GeneratedChapter[]): number {
    const totalWords = chapters.reduce((sum, chapter) => {
      const words = chapter.content.split(/\s+/).length;
      return sum + words;
    }, 0);

    // Average reading speed: 200 words per minute
    return Math.ceil(totalWords / 200);
  }
}

// Export singleton instance
export const aiStoryGenerator = new AIStoryGenerator();
