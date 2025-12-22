/**
 * Canon-Aware AI Service
 * Integrates the Persistent Narrative Engine with AI generation
 * to provide context-aware, canon-respecting story generation.
 */

import { persistentNarrativeEngine } from './persistentNarrativeEngine';
import { aiService } from '@/lib/api/ai-service';
import type {
  GenerationContext,
  PersistentCharacter,
  CanonRule,
  NarrativeArc,
  CanonViolation,
  NarrativeGenerationRequest,
  NarrativeGenerationResult,
} from '@/types/narrativeEngine';

// ============================================================================
// TYPES
// ============================================================================

export interface CanonAwareGenerationOptions {
  seriesId: string;
  bookId?: string;
  chapterNumber?: number;
  
  // Generation type
  type: 'continuation' | 'dialogue' | 'description' | 'action' | 'chapter_outline' | 'scene';
  
  // Current content context
  currentContent?: string;
  previousContent?: string;
  
  // User prompt/direction
  prompt?: string;
  
  // Character focus
  characterIds?: string[];
  
  // Constraints
  wordCount?: { min: number; max: number };
  mustIncludeElements?: string[];
  mustAvoidElements?: string[];
  
  // Generation parameters
  temperature?: number;
  creativity?: 'low' | 'medium' | 'high';
}

export interface CanonAwareGenerationResult {
  success: boolean;
  content: string;
  wordCount: number;
  
  // Context used
  contextUsed: {
    charactersIncluded: string[];
    worldElementsReferenced: string[];
    arcsAdvanced: string[];
    rulesApplied: string[];
  };
  
  // Canon checking
  violations: CanonViolation[];
  warnings: string[];
  
  // Suggestions
  foreshadowingOpportunities?: string[];
  characterDevelopmentSuggestions?: string[];
}

// ============================================================================
// CANON-AWARE AI SERVICE
// ============================================================================

class CanonAwareAIService {
  /**
   * Generate content with full series context and canon awareness
   */
  async generateWithContext(options: CanonAwareGenerationOptions): Promise<CanonAwareGenerationResult> {
    const { seriesId, bookId, chapterNumber, type, currentContent, prompt, characterIds } = options;

    // Step 1: Compile generation context
    let context: GenerationContext | null = null;
    if (bookId) {
      try {
        context = await persistentNarrativeEngine.compileGenerationContext(
          seriesId,
          bookId,
          chapterNumber
        );
      } catch (error) {
        console.warn('Failed to compile context, proceeding without full context:', error);
      }
    }

    // Step 2: Get relevant characters
    let characters: PersistentCharacter[] = [];
    if (characterIds && characterIds.length > 0) {
      const allCharacters = await persistentNarrativeEngine.getSeriesCharacters(seriesId);
      characters = allCharacters.filter(c => characterIds.includes(c.id));
    } else if (context?.activeCharacters) {
      // Use active characters from context
      const allCharacters = await persistentNarrativeEngine.getSeriesCharacters(seriesId);
      characters = allCharacters.slice(0, 5); // Limit to main characters
    }

    // Step 3: Get applicable canon rules
    const rules = context?.canonRules || [];

    // Step 4: Build the system prompt with full context
    const systemPrompt = this.buildSystemPrompt(context, characters, rules, options);

    // Step 5: Build the user prompt
    const userPrompt = this.buildUserPrompt(options, characters);

    // Step 6: Generate content
    const result = await aiService.generateStoryContent(
      {
        prompt: userPrompt,
        genre: '', // Will be inferred from context
        tone: context?.toneGuidance || 'balanced',
        context: systemPrompt,
      },
      {
        temperature: this.getTemperature(options),
        cache: false, // Don't cache context-aware generations
      }
    );

    // Step 7: Check generated content for canon violations
    const generatedContent = result.success && typeof result.data === 'string' ? result.data : '';
    const violations = await this.checkCanonViolations(seriesId, bookId, generatedContent, context);

    // Step 8: Analyze content for metadata
    const wordCount = generatedContent.split(/\s+/).filter(Boolean).length;
    const charactersReferenced = this.extractCharacterReferences(generatedContent, characters);
    const warnings = this.generateWarnings(violations, context);

    return {
      success: result.success,
      content: generatedContent,
      wordCount,
      contextUsed: {
        charactersIncluded: characters.map(c => c.name),
        worldElementsReferenced: [], // TODO: Extract from content
        arcsAdvanced: context?.activeArcs.map(a => a.name) || [],
        rulesApplied: rules.map(r => r.ruleName || r.ruleDescription?.substring(0, 50) || 'unnamed rule'),
      },
      violations,
      warnings,
      foreshadowingOpportunities: context?.pendingPayoffs,
      characterDevelopmentSuggestions: this.suggestCharacterDevelopment(characters, context),
    };
  }

  /**
   * Build system prompt with full narrative context
   */
  private buildSystemPrompt(
    context: GenerationContext | null,
    characters: PersistentCharacter[],
    rules: CanonRule[],
    options: CanonAwareGenerationOptions
  ): string {
    let systemPrompt = `You are an expert fiction writer assisting with a story series. 
Your role is to generate high-quality, consistent narrative content that respects established canon.

`;

    // Add tone and pacing guidance
    if (context) {
      if (context.toneGuidance) {
        systemPrompt += `TONE: ${context.toneGuidance}\n`;
      }
      if (context.pacingGuidance) {
        systemPrompt += `PACING: ${context.pacingGuidance}\n`;
      }
      if (context.themeReminders?.length > 0) {
        systemPrompt += `THEMES TO REINFORCE: ${context.themeReminders.join(', ')}\n`;
      }
      systemPrompt += '\n';
    }

    // Add character context
    if (characters.length > 0) {
      systemPrompt += `CHARACTERS IN THIS SCENE:\n`;
      characters.forEach(char => {
        systemPrompt += `\n• ${char.name} (${char.characterRole})\n`;
        if (char.currentStatus !== 'active') {
          systemPrompt += `  STATUS: ${char.currentStatus}\n`;
        }
        if (char.corePersonality?.traits?.length > 0) {
          systemPrompt += `  Personality: ${char.corePersonality.traits.join(', ')}\n`;
        }
        if (char.dialogueStyle) {
          systemPrompt += `  Speech Style: ${char.dialogueStyle}\n`;
        }
        if (char.speechPatterns?.length > 0) {
          systemPrompt += `  Speech Patterns: ${char.speechPatterns.join('; ')}\n`;
        }
        if (char.typicalExpressions?.length > 0) {
          systemPrompt += `  Expressions: "${char.typicalExpressions.slice(0, 3).join('", "')}"\n`;
        }
      });
      systemPrompt += '\n';
    }

    // Add active arcs context
    if (context?.activeArcs?.length > 0) {
      systemPrompt += `ACTIVE STORY ARCS (weave these in naturally):\n`;
      context.activeArcs.forEach(arc => {
        systemPrompt += `• ${arc.name} (${arc.status}, ${arc.completion}% complete)\n`;
      });
      systemPrompt += '\n';
    }

    // Add canon rules
    if (rules.length > 0) {
      systemPrompt += `CANON RULES (you MUST follow these):\n`;
      rules.forEach(rule => {
        const typeLabel = rule.ruleType?.toUpperCase() || 'RULE';
        systemPrompt += `• [${typeLabel}] ${rule.ruleDescription}\n`;
      });
      systemPrompt += '\n';
    }

    // Add pending foreshadowing
    if (context?.pendingPayoffs?.length > 0) {
      systemPrompt += `FORESHADOWING TO PAY OFF (if appropriate):\n`;
      context.pendingPayoffs.slice(0, 3).forEach(payoff => {
        systemPrompt += `• ${payoff}\n`;
      });
      systemPrompt += '\n';
    }

    // Add generation type instructions
    systemPrompt += this.getTypeInstructions(options.type);

    return systemPrompt;
  }

  /**
   * Build user prompt based on generation type
   */
  private buildUserPrompt(
    options: CanonAwareGenerationOptions,
    characters: PersistentCharacter[]
  ): string {
    const { type, currentContent, previousContent, prompt, wordCount } = options;
    let userPrompt = '';

    switch (type) {
      case 'continuation':
        if (previousContent) {
          userPrompt += `Previous context:\n${previousContent.slice(-1000)}\n\n`;
        }
        if (currentContent) {
          userPrompt += `Current text:\n${currentContent}\n\n`;
        }
        userPrompt += `Continue this naturally${prompt ? `. Direction: ${prompt}` : ''}.`;
        break;

      case 'dialogue':
        userPrompt = `Write a dialogue scene between ${characters.map(c => c.name).join(' and ')}.`;
        if (currentContent) {
          userPrompt += `\n\nContext: ${currentContent}`;
        }
        if (prompt) {
          userPrompt += `\n\nScene: ${prompt}`;
        }
        break;

      case 'description':
        userPrompt = `Write a vivid, immersive description.`;
        if (currentContent) {
          userPrompt += `\n\nContext: ${currentContent}`;
        }
        if (prompt) {
          userPrompt += `\n\nDescribe: ${prompt}`;
        }
        break;

      case 'action':
        userPrompt = `Write a dynamic action sequence.`;
        if (characters.length > 0) {
          userPrompt += ` Characters involved: ${characters.map(c => c.name).join(', ')}.`;
        }
        if (currentContent) {
          userPrompt += `\n\nContext: ${currentContent}`;
        }
        if (prompt) {
          userPrompt += `\n\nAction: ${prompt}`;
        }
        break;

      case 'chapter_outline':
        userPrompt = `Create a detailed chapter outline.`;
        if (currentContent) {
          userPrompt += `\n\nStory so far: ${currentContent}`;
        }
        if (prompt) {
          userPrompt += `\n\nChapter focus: ${prompt}`;
        }
        break;

      case 'scene':
        userPrompt = `Write a complete scene.`;
        if (characters.length > 0) {
          userPrompt += ` Featuring: ${characters.map(c => c.name).join(', ')}.`;
        }
        if (prompt) {
          userPrompt += `\n\nScene: ${prompt}`;
        }
        break;
    }

    if (wordCount) {
      userPrompt += `\n\nTarget length: ${wordCount.min}-${wordCount.max} words.`;
    }

    return userPrompt;
  }

  /**
   * Get generation type-specific instructions
   */
  private getTypeInstructions(type: string): string {
    const instructions: Record<string, string> = {
      continuation: `
GENERATION TYPE: Story Continuation
- Continue seamlessly from where the text ends
- Maintain consistent voice and style
- Advance the narrative naturally
- Include sensory details and emotional depth
`,
      dialogue: `
GENERATION TYPE: Character Dialogue
- Write natural, character-specific dialogue
- Each character should have a distinct voice
- Include appropriate dialogue tags and action beats
- Show character emotions through word choice and body language
`,
      description: `
GENERATION TYPE: Descriptive Passage
- Paint a vivid picture with sensory details
- Use evocative language that fits the story's tone
- Balance description with narrative momentum
- Appeal to multiple senses
`,
      action: `
GENERATION TYPE: Action Sequence
- Use short, punchy sentences for fast pacing
- Focus on physical movement and tension
- Show character reactions and decisions in motion
- Build to a climactic moment
`,
      chapter_outline: `
GENERATION TYPE: Chapter Outline
- Create a structured outline with clear beats
- Include character moments and plot progression
- Note where to plant foreshadowing
- Identify emotional highs and lows
`,
      scene: `
GENERATION TYPE: Complete Scene
- Write a self-contained scene with beginning, middle, end
- Balance dialogue, action, and description
- Include character development moments
- End with a hook or transition
`,
    };

    return instructions[type] || '';
  }

  /**
   * Check generated content for canon violations
   */
  private async checkCanonViolations(
    seriesId: string,
    bookId: string | undefined,
    content: string,
    context: GenerationContext | null
  ): Promise<CanonViolation[]> {
    if (!bookId || !content) return [];

    try {
      // Get book number for context
      const book = bookId ? await persistentNarrativeEngine.getBook(bookId) : null;
      const bookNumber = book?.bookNumber || 1;

      // Use the engine's violation checking
      const violations = await persistentNarrativeEngine.checkCanonViolations(
        seriesId,
        bookNumber,
        content
      );

      return violations;
    } catch (error) {
      console.warn('Canon violation check failed:', error);
      return [];
    }
  }

  /**
   * Extract character references from generated content
   */
  private extractCharacterReferences(content: string, characters: PersistentCharacter[]): string[] {
    const referenced: string[] = [];
    const contentLower = content.toLowerCase();

    for (const char of characters) {
      if (contentLower.includes(char.name.toLowerCase())) {
        referenced.push(char.name);
      }
      for (const alias of char.aliases || []) {
        if (contentLower.includes(alias.toLowerCase())) {
          if (!referenced.includes(char.name)) {
            referenced.push(char.name);
          }
        }
      }
    }

    return referenced;
  }

  /**
   * Generate warnings based on violations and context
   */
  private generateWarnings(violations: CanonViolation[], context: GenerationContext | null): string[] {
    const warnings: string[] = [];

    // Add violation-based warnings
    violations.forEach(v => {
      if (v.violationDescription) {
        warnings.push(`Canon issue: ${v.violationDescription}`);
      }
    });

    // Add context-based warnings
    if (context?.activeArcs.some(arc => arc.completion > 90 && arc.status !== 'resolved')) {
      warnings.push('Some arcs are near completion - consider payoff moments');
    }

    return warnings;
  }

  /**
   * Suggest character development opportunities
   */
  private suggestCharacterDevelopment(
    characters: PersistentCharacter[],
    context: GenerationContext | null
  ): string[] {
    const suggestions: string[] = [];

    for (const char of characters) {
      if (char.fatalFlaw) {
        suggestions.push(`${char.name}'s fatal flaw (${char.fatalFlaw}) could be tested`);
      }
      if (char.motivation) {
        suggestions.push(`${char.name}'s motivation: ${char.motivation}`);
      }
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get temperature based on options
   */
  private getTemperature(options: CanonAwareGenerationOptions): number {
    if (options.temperature !== undefined) return options.temperature;

    switch (options.creativity) {
      case 'low': return 0.5;
      case 'high': return 0.9;
      default: return 0.7;
    }
  }

  /**
   * Generate dialogue with character voice consistency
   */
  async generateCharacterDialogue(
    seriesId: string,
    characterIds: string[],
    situation: string,
    bookId?: string
  ): Promise<CanonAwareGenerationResult> {
    return this.generateWithContext({
      seriesId,
      bookId,
      type: 'dialogue',
      characterIds,
      prompt: situation,
    });
  }

  /**
   * Continue story with full context awareness
   */
  async continueStory(
    seriesId: string,
    bookId: string,
    currentContent: string,
    direction?: string
  ): Promise<CanonAwareGenerationResult> {
    return this.generateWithContext({
      seriesId,
      bookId,
      type: 'continuation',
      currentContent,
      prompt: direction,
    });
  }

  /**
   * Generate a scene with specific characters
   */
  async generateScene(
    seriesId: string,
    bookId: string,
    characterIds: string[],
    sceneDescription: string
  ): Promise<CanonAwareGenerationResult> {
    return this.generateWithContext({
      seriesId,
      bookId,
      type: 'scene',
      characterIds,
      prompt: sceneDescription,
    });
  }
}

// Export singleton instance
export const canonAwareAIService = new CanonAwareAIService();

