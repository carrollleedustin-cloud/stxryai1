/**
 * Story Mode Manager
 * Handles the different story modes (Book, Novel, Series) with their unique
 * configurations, pacing intelligence, and structural expectations.
 */

import { persistentNarrativeEngine } from './persistentNarrativeEngine';
import type {
  StoryMode,
  StoryModeConfig,
  BookModeConfig,
  NovelModeConfig,
  SeriesModeConfig,
  GenerationContext,
  NarrativeGenerationRequest,
  NarrativeGenerationResult,
  NarrativeArc,
  PersistentCharacter,
  CharacterEvent,
  ArcStatus,
} from '@/types/narrativeEngine';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_BOOK_CONFIG: BookModeConfig = {
  mode: 'book',
  targetWordCount: 80000,
  targetChapterCount: 20,
  chapterWordTarget: 4000,
  useOutline: true,
  useBeatSheet: true,
  enablePOVTracking: true,
  enableSubplots: true,
  enableThematicCallbacks: true,
  pacingStyle: 'variable',
  chapterCliffhangers: true,
};

export const DEFAULT_NOVEL_CONFIG: NovelModeConfig = {
  mode: 'novel',
  targetWordCount: 100000,
  targetChapterCount: 30,
  povStyle: 'rotating',
  primaryPOVCharacters: [],
  maxConcurrentSubplots: 4,
  subplotIntegration: 'tight',
  characterEvolutionDepth: 'moderate',
  enableSlowBurn: true,
  toneVariance: 'moderate',
  emotionalRange: ['hope', 'despair', 'wonder', 'tension', 'triumph'],
  thematicResonance: true,
  recurringImagery: [],
};

export const DEFAULT_SERIES_CONFIG: SeriesModeConfig = {
  mode: 'series',
  targetBooks: 3,
  averageWordsPerBook: 90000,
  seriesStructure: 'continuous',
  bookArcsPerSeriesArc: 3,
  enableLongForeshadowing: true,
  foreshadowingHorizon: 2,
  recurringAntagonists: true,
  antagonistEvolution: true,
  characterPersistenceLevel: 'full',
  enableCharacterRotation: false,
  worldChangeRate: 'gradual',
  seriesClimaxBook: 3,
  denouementBooks: 0,
};

// ============================================================================
// STORY MODE MANAGER
// ============================================================================

export class StoryModeManager {
  private engine = persistentNarrativeEngine;

  // ==========================================================================
  // MODE CONFIGURATION
  // ==========================================================================

  /**
   * Get default config for a mode
   */
  getDefaultConfig(mode: StoryMode): StoryModeConfig {
    switch (mode) {
      case 'book':
        return { ...DEFAULT_BOOK_CONFIG };
      case 'novel':
        return { ...DEFAULT_NOVEL_CONFIG };
      case 'series':
        return { ...DEFAULT_SERIES_CONFIG };
      default:
        return { ...DEFAULT_BOOK_CONFIG };
    }
  }

  /**
   * Validate and merge config with defaults
   */
  validateConfig(config: Partial<StoryModeConfig>): StoryModeConfig {
    const mode = config.mode || 'book';
    const defaults = this.getDefaultConfig(mode);
    return { ...defaults, ...config } as StoryModeConfig;
  }

  // ==========================================================================
  // OUTLINE GENERATION
  // ==========================================================================

  /**
   * Generate a book outline based on mode
   */
  async generateOutline(
    seriesId: string,
    bookId: string,
    config: StoryModeConfig,
    premise: string
  ): Promise<BookOutline> {
    const context = await this.engine.compileGenerationContext(seriesId, bookId);
    
    switch (config.mode) {
      case 'book':
        return this.generateBookOutline(context, config as BookModeConfig, premise);
      case 'novel':
        return this.generateNovelOutline(context, config as NovelModeConfig, premise);
      case 'series':
        return this.generateSeriesBookOutline(context, config as SeriesModeConfig, premise);
      default:
        return this.generateBookOutline(context, config as BookModeConfig, premise);
    }
  }

  /**
   * Generate a standard book outline
   */
  private async generateBookOutline(
    context: GenerationContext,
    config: BookModeConfig,
    premise: string
  ): Promise<BookOutline> {
    const chapterCount = config.targetChapterCount;
    const chapters: ChapterOutline[] = [];

    // Three-act structure
    const actBreaks = {
      actOne: Math.floor(chapterCount * 0.25),
      actTwo: Math.floor(chapterCount * 0.75),
      actThree: chapterCount,
    };

    // Generate chapter outlines
    for (let i = 1; i <= chapterCount; i++) {
      const act = i <= actBreaks.actOne ? 1 : i <= actBreaks.actTwo ? 2 : 3;
      const chapterType = this.getChapterType(i, chapterCount, act);

      chapters.push({
        chapterNumber: i,
        title: `Chapter ${i}`,
        act,
        chapterType,
        targetWordCount: config.chapterWordTarget,
        beatSheet: config.useBeatSheet ? this.generateChapterBeats(chapterType) : undefined,
        povCharacter: undefined,
        endWithCliffhanger: config.chapterCliffhangers && i < chapterCount && i % 3 === 0,
        scenes: [],
        notes: '',
      });
    }

    return {
      bookId: context.bookId || '',
      premise,
      threeActStructure: {
        actOne: {
          chapters: chapters.filter(c => c.act === 1),
          goal: 'Establish world, characters, and inciting incident',
        },
        actTwo: {
          chapters: chapters.filter(c => c.act === 2),
          goal: 'Rising action, complications, midpoint shift',
        },
        actThree: {
          chapters: chapters.filter(c => c.act === 3),
          goal: 'Climax and resolution',
        },
      },
      chapters,
      config,
    };
  }

  /**
   * Generate a novel outline with deeper narrative control
   */
  private async generateNovelOutline(
    context: GenerationContext,
    config: NovelModeConfig,
    premise: string
  ): Promise<BookOutline> {
    const baseOutline = await this.generateBookOutline(
      context,
      { ...DEFAULT_BOOK_CONFIG, targetChapterCount: config.targetChapterCount, targetWordCount: config.targetWordCount },
      premise
    );

    // Enhance with novel-specific features
    const povCharacters = config.primaryPOVCharacters.length > 0 
      ? config.primaryPOVCharacters 
      : context.activeCharacters.filter(c => c.role === 'protagonist' || c.role === 'deuteragonist').map(c => c.id);

    // Assign POV characters in rotation if rotating POV
    if (config.povStyle === 'rotating' && povCharacters.length > 0) {
      baseOutline.chapters.forEach((chapter, index) => {
        chapter.povCharacter = povCharacters[index % povCharacters.length];
      });
    }

    // Add subplot integration points
    const subplotIntegrationChapters = this.calculateSubplotIntegration(
      baseOutline.chapters.length,
      config.maxConcurrentSubplots,
      config.subplotIntegration
    );

    baseOutline.chapters.forEach((chapter, index) => {
      chapter.subplotFocus = subplotIntegrationChapters[index];
    });

    // Add thematic callbacks
    if (config.thematicResonance) {
      const themeCheckpoints = this.calculateThemeCheckpoints(baseOutline.chapters.length);
      themeCheckpoints.forEach(checkpoint => {
        if (baseOutline.chapters[checkpoint]) {
          baseOutline.chapters[checkpoint].thematicMoment = true;
        }
      });
    }

    return {
      ...baseOutline,
      config,
      novelFeatures: {
        povRotation: config.povStyle === 'rotating',
        primaryPOVCharacters: povCharacters,
        subplotIntegration: config.subplotIntegration,
        emotionalBeats: this.planEmotionalBeats(baseOutline.chapters.length, config.emotionalRange),
      },
    };
  }

  /**
   * Generate an outline for a book within a series
   */
  private async generateSeriesBookOutline(
    context: GenerationContext,
    config: SeriesModeConfig,
    premise: string
  ): Promise<BookOutline> {
    // Convert series config to novel config while preserving series-specific settings
    const novelConfig: NovelModeConfig = {
      ...DEFAULT_NOVEL_CONFIG,
      targetWordCount: config.averageWordsPerBook,
      // Map series structure to subplot integration
      subplotIntegration: config.seriesStructure === 'episodic' ? 'episodic' : 
                          config.seriesStructure === 'anthology' ? 'loose' : 'tight',
      // Use full character evolution for series with full persistence
      characterEvolutionDepth: config.characterPersistenceLevel === 'full' ? 'dramatic' :
                               config.characterPersistenceLevel === 'selective' ? 'moderate' : 'subtle',
      enableSlowBurn: config.enableLongForeshadowing,
    };
    
    const baseOutline = await this.generateNovelOutline(
      context,
      novelConfig,
      premise
    );

    // Series-specific enhancements
    const activeArcs = context.activeArcs || [];
    const seriesPosition = await this.determineSeriesPosition(context);

    // Plan foreshadowing
    const foreshadowingPlan = config.enableLongForeshadowing
      ? this.planForeshadowing(baseOutline.chapters.length, config.foreshadowingHorizon, seriesPosition)
      : [];

    // Plan arc progression
    const arcProgression = this.planArcProgression(activeArcs, baseOutline.chapters.length, seriesPosition);

    // Add series-level considerations
    baseOutline.chapters.forEach((chapter, index) => {
      chapter.foreshadowing = foreshadowingPlan.filter(f => f.chapterIndex === index);
      chapter.arcBeats = arcProgression.filter(a => a.chapterIndex === index);
      
      // Mark chapters that should reference previous books
      if (seriesPosition.bookNumber > 1 && index < 3) {
        chapter.shouldReferenceHistory = true;
      }
    });

    return {
      ...baseOutline,
      config,
      seriesFeatures: {
        bookNumber: seriesPosition.bookNumber,
        isSeriesClimaxBook: seriesPosition.bookNumber === config.seriesClimaxBook,
        foreshadowingPlan,
        arcProgression,
        previousBookCallbacks: seriesPosition.bookNumber > 1,
        setupForNextBook: seriesPosition.bookNumber < config.targetBooks,
      },
    };
  }

  // ==========================================================================
  // CHAPTER GENERATION
  // ==========================================================================

  /**
   * Generate a chapter with full context awareness
   */
  async generateChapter(
    request: NarrativeGenerationRequest,
    chapterOutline: ChapterOutline
  ): Promise<NarrativeGenerationResult> {
    const { seriesId, bookId, context, modeConfig } = request;

    // Build the generation prompt based on mode
    const prompt = this.buildChapterPrompt(chapterOutline, context, modeConfig);

    // Include continuity constraints
    const constraints = this.buildContinuityConstraints(context);

    // Integrate with AI service for content generation
    let generatedContent = '';
    let result: NarrativeGenerationResult;

    // Check if AI is configured
    if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
      try {
        const { generateCompletion } = await import('@/lib/ai/client');
        
        const systemPrompt = `Expert narrative writer. Generate story content.
Requirements:
- Follow chapter outline
- Maintain continuity
- Respect character/world constraints
- Advance arcs appropriately
- Use foreshadowing
Return ONLY narrative text.`;

        const fullPrompt = `${prompt}\n\nConstraints:\n${JSON.stringify(constraints, null, 2)}`;

        const response = await generateCompletion({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullPrompt },
          ],
          temperature: (modeConfig as any)?.creativity || 0.8,
          maxTokens: (modeConfig as any)?.maxTokens || 2000,
          model: 'gpt-4o',
        });

        generatedContent = response.content;
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Fall through to placeholder content
      }
    }

    // If AI generation failed or isn't configured, use placeholder
    if (!generatedContent) {
      generatedContent = `[Content generation requires AI API key configuration]`;
    }

    // Build result structure
    result = {
      success: !!generatedContent && !generatedContent.includes('[Content generation requires'),
      content: generatedContent,
      wordCount: generatedContent.split(/\s+/).length,
      charactersInvolved: this.extractCharactersFromContent(generatedContent, context),
      worldElementsReferenced: this.extractWorldElementsFromContent(generatedContent, context),
      arcsAdvanced: this.identifyArcProgressFromContent(generatedContent, context),
      suggestedCharacterEvents: [],
      suggestedWorldChanges: [],
      potentialViolations: [],
      foreshadowingPlanted: [],
      foreshadowingPaidOff: [],
    };

    // Check for canon violations ONLY if content was actually generated
    // Canon checking on empty content is meaningless and would always pass
    if (result.content && result.content.length > 0) {
      const violations = await this.engine.checkCanonViolations(
        seriesId,
        chapterOutline.chapterNumber,
        result.content,
        {
          charactersInvolved: result.charactersInvolved.map(c => c.id),
          worldElementsReferenced: result.worldElementsReferenced.map(e => e.id),
        }
      );
      result.potentialViolations = violations;
    }

    return result;
  }

  /**
   * Build the chapter generation prompt
   */
  private buildChapterPrompt(
    outline: ChapterOutline,
    context: GenerationContext,
    config: StoryModeConfig
  ): string {
    const parts: string[] = [];

    // Chapter structure
    parts.push(`=== CHAPTER ${outline.chapterNumber}: ${outline.title} ===`);
    parts.push(`Act: ${outline.act}`);
    parts.push(`Chapter Type: ${outline.chapterType}`);
    parts.push(`Target Word Count: ${outline.targetWordCount}`);

    // POV
    if (outline.povCharacter) {
      const povChar = context.activeCharacters.find(c => c.id === outline.povCharacter);
      if (povChar) {
        parts.push(`\nPOV Character: ${povChar.name}`);
        parts.push(`- Role: ${povChar.role}`);
        parts.push(`- Personality: ${JSON.stringify(povChar.corePersonality)}`);
      }
    }

    // Beat sheet
    if (outline.beatSheet && outline.beatSheet.length > 0) {
      parts.push('\n=== BEAT SHEET ===');
      outline.beatSheet.forEach((beat, i) => {
        parts.push(`${i + 1}. ${beat.beat}: ${beat.description}`);
      });
    }

    // Active characters in this chapter
    parts.push('\n=== ACTIVE CHARACTERS ===');
    context.activeCharacters.forEach(char => {
      parts.push(`- ${char.name} (${char.role}): ${char.status}`);
    });

    // Relevant world elements
    if (Object.keys(context.worldState).length > 0) {
      parts.push('\n=== WORLD STATE ===');
      parts.push(JSON.stringify(context.worldState, null, 2));
    }

    // Active arcs
    if (context.activeArcs.length > 0) {
      parts.push('\n=== ACTIVE NARRATIVE ARCS ===');
      context.activeArcs.forEach(arc => {
        parts.push(`- ${arc.name} (${arc.type}): ${arc.status} - ${arc.completion}% complete`);
      });
    }

    // Canon constraints
    if (context.canonRules.length > 0) {
      parts.push('\n=== CANON RULES (MUST RESPECT) ===');
      context.canonRules.forEach(rule => {
        parts.push(`- [${rule.lockLevel}] ${rule.ruleName}: ${rule.ruleDescription}`);
      });
    }

    // Tone and pacing
    if (context.toneGuidance) {
      parts.push(`\nTone: ${context.toneGuidance}`);
    }
    if (context.pacingGuidance) {
      parts.push(`Pacing: ${context.pacingGuidance}`);
    }

    // Thematic reminders
    if (context.themeReminders.length > 0) {
      parts.push('\n=== THEMES TO REINFORCE ===');
      context.themeReminders.forEach(theme => {
        parts.push(`- ${theme}`);
      });
    }

    // Pending payoffs
    if (context.pendingPayoffs.length > 0) {
      parts.push('\n=== FORESHADOWING TO POTENTIALLY PAY OFF ===');
      context.pendingPayoffs.forEach(payoff => {
        parts.push(`- ${payoff}`);
      });
    }

    // Cliffhanger instruction
    if (outline.endWithCliffhanger) {
      parts.push('\n*** END THIS CHAPTER WITH A CLIFFHANGER ***');
    }

    return parts.join('\n');
  }

  /**
   * Build continuity constraints
   */
  private buildContinuityConstraints(context: GenerationContext): ContinuityConstraints {
    return {
      charactersPresent: context.activeCharacters,
      lockedElements: context.lockedElements,
      canonRules: context.canonRules,
      pendingPayoffs: context.pendingPayoffs,
      activeRelationships: context.relationshipMap,
    };
  }

  // ==========================================================================
  // REVISION & CONSISTENCY
  // ==========================================================================

  /**
   * Analyze a chapter for consistency issues
   */
  async analyzeChapterConsistency(
    seriesId: string,
    bookId: string,
    chapterId: string,
    content: string
  ): Promise<ConsistencyReport> {
    const context = await this.engine.compileGenerationContext(seriesId, bookId);
    
    const issues: ConsistencyIssue[] = [];
    const contentLower = content.toLowerCase();

    // Check character consistency
    for (const character of context.activeCharacters) {
      // Deceased character check
      if (character.status === 'deceased') {
        const name = character.name.toLowerCase();
        if (contentLower.includes(`${name} said`) || contentLower.includes(`${name} walked`)) {
          issues.push({
            type: 'character_status',
            severity: 'error',
            description: `${character.name} is deceased but appears alive in this chapter`,
            characterId: character.id,
          });
        }
      }
    }

    // Check relationship consistency
    for (const rel of context.relationshipMap) {
      // Check if enemy characters are described as friends
      if (rel.relationshipTypeAToB === 'enemy' || rel.relationshipTypeBToA === 'enemy') {
        // This would need NLP analysis in practice
      }
    }

    // Check timeline consistency
    // This would analyze dates and temporal references

    return {
      chapterId,
      issueCount: issues.length,
      issues,
      isConsistent: issues.filter(i => i.severity === 'error').length === 0,
    };
  }

  /**
   * Suggest revisions for consistency
   */
  async suggestRevisions(
    report: ConsistencyReport
  ): Promise<RevisionSuggestion[]> {
    return report.issues.map(issue => ({
      issueId: issue.type,
      suggestion: this.generateRevisionSuggestion(issue),
      priority: issue.severity === 'error' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low',
      autoApplicable: issue.severity === 'warning',
    }));
  }

  private generateRevisionSuggestion(issue: ConsistencyIssue): string {
    switch (issue.type) {
      case 'character_status':
        return `Consider using past tense or memories when referencing ${issue.description}`;
      case 'relationship':
        return `Adjust dialogue/interactions to reflect the current relationship status`;
      case 'timeline':
        return `Verify temporal references match established timeline`;
      default:
        return `Review and correct the consistency issue: ${issue.description}`;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getChapterType(
    chapterNum: number,
    totalChapters: number,
    act: number
  ): ChapterType {
    // Opening
    if (chapterNum === 1) return 'opening';
    
    // Closing
    if (chapterNum === totalChapters) return 'climax';
    
    // Inciting incident (usually chapter 2-3)
    if (chapterNum <= 3 && act === 1) return 'inciting_incident';
    
    // First plot point (end of act 1)
    if (act === 1 && chapterNum === Math.floor(totalChapters * 0.25)) return 'plot_point';
    
    // Midpoint
    if (chapterNum === Math.floor(totalChapters * 0.5)) return 'midpoint';
    
    // Second plot point (end of act 2)
    if (act === 2 && chapterNum === Math.floor(totalChapters * 0.75)) return 'plot_point';
    
    // Dark moment (just before climax)
    if (act === 3 && chapterNum === totalChapters - 2) return 'dark_moment';
    
    return 'development';
  }

  private generateChapterBeats(chapterType: ChapterType): Beat[] {
    const beats: Record<ChapterType, Beat[]> = {
      opening: [
        { beat: 'Hook', description: 'Grab reader attention immediately' },
        { beat: 'World Introduction', description: 'Establish setting and tone' },
        { beat: 'Character Introduction', description: 'Introduce protagonist' },
        { beat: 'Status Quo', description: 'Show normal world before change' },
      ],
      inciting_incident: [
        { beat: 'Disruption', description: 'Something breaks the status quo' },
        { beat: 'Reaction', description: 'Character responds to change' },
        { beat: 'Stakes Establishment', description: 'Show what could be lost' },
      ],
      development: [
        { beat: 'Scene Goal', description: 'Character has clear objective' },
        { beat: 'Conflict', description: 'Obstacle prevents easy success' },
        { beat: 'Complication', description: 'Situation becomes more complex' },
        { beat: 'Resolution/Hook', description: 'Scene ends with new question' },
      ],
      plot_point: [
        { beat: 'Build-up', description: 'Tension increases toward turning point' },
        { beat: 'Turn', description: 'Major shift in story direction' },
        { beat: 'Reaction', description: 'Characters process the change' },
        { beat: 'New Direction', description: 'Story commits to new path' },
      ],
      midpoint: [
        { beat: 'False Victory/Defeat', description: 'Apparent success or failure' },
        { beat: 'Revelation', description: 'Major truth uncovered' },
        { beat: 'Shift', description: 'Character moves from reactive to proactive' },
        { beat: 'Stakes Raise', description: 'Consequences become more severe' },
      ],
      dark_moment: [
        { beat: 'All Is Lost', description: 'Lowest point for protagonist' },
        { beat: 'Reflection', description: 'Character examines their journey' },
        { beat: 'Revelation', description: 'Key insight or realization' },
        { beat: 'Decision', description: 'Choice to fight on' },
      ],
      climax: [
        { beat: 'Confrontation Setup', description: 'Final battle begins' },
        { beat: 'Ultimate Test', description: 'Everything on the line' },
        { beat: 'Resolution', description: 'Conflict resolved' },
        { beat: 'Aftermath', description: 'New status quo established' },
      ],
    };

    return beats[chapterType] || beats.development;
  }

  private calculateSubplotIntegration(
    totalChapters: number,
    maxSubplots: number,
    integration: 'tight' | 'loose' | 'episodic'
  ): (number | undefined)[] {
    const result: (number | undefined)[] = new Array(totalChapters).fill(undefined);
    
    switch (integration) {
      case 'tight':
        // Subplots appear frequently
        for (let i = 0; i < totalChapters; i++) {
          if (i % 2 === 1) {
            result[i] = i % maxSubplots;
          }
        }
        break;
      case 'loose':
        // Subplots appear occasionally
        for (let i = 0; i < totalChapters; i++) {
          if (i % 4 === 0) {
            result[i] = Math.floor(i / 4) % maxSubplots;
          }
        }
        break;
      case 'episodic':
        // Each subplot gets dedicated chapters
        const chaptersPerSubplot = Math.floor(totalChapters / maxSubplots);
        for (let i = 0; i < maxSubplots; i++) {
          result[i * chaptersPerSubplot] = i;
        }
        break;
    }

    return result;
  }

  private calculateThemeCheckpoints(totalChapters: number): number[] {
    return [
      0, // Opening
      Math.floor(totalChapters * 0.25), // First plot point
      Math.floor(totalChapters * 0.5), // Midpoint
      Math.floor(totalChapters * 0.75), // Second plot point
      totalChapters - 1, // Climax
    ];
  }

  private planEmotionalBeats(
    totalChapters: number,
    emotionalRange: string[]
  ): Record<number, string> {
    const beats: Record<number, string> = {};
    
    // Handle empty emotional range - provide sensible defaults
    const effectiveRange = emotionalRange.length > 0 
      ? emotionalRange 
      : ['tension', 'hope', 'despair', 'determination', 'triumph'];
    const rangeLength = effectiveRange.length;

    for (let i = 0; i < totalChapters; i++) {
      // Create emotional variety while building toward climax
      const progressRatio = i / totalChapters;
      let emotionIndex: number;

      if (progressRatio < 0.25) {
        // Act 1: Mix of hope and tension
        emotionIndex = i % 2 === 0 ? 0 : Math.min(3, rangeLength - 1);
      } else if (progressRatio < 0.75) {
        // Act 2: Cycle through range
        emotionIndex = i % rangeLength;
      } else {
        // Act 3: Build to triumph
        emotionIndex = Math.min(i % rangeLength, rangeLength - 1);
      }

      if (effectiveRange[emotionIndex]) {
        beats[i] = effectiveRange[emotionIndex];
      }
    }

    return beats;
  }

  private async determineSeriesPosition(
    context: GenerationContext
  ): Promise<{ bookNumber: number; totalBooks: number }> {
    // In practice, this would fetch from the series
    // For now, return a default
    return { bookNumber: 1, totalBooks: 3 };
  }

  private planForeshadowing(
    totalChapters: number,
    horizon: number,
    position: { bookNumber: number; totalBooks: number }
  ): ForeshadowingPlan[] {
    const plans: ForeshadowingPlan[] = [];

    if (position.bookNumber < position.totalBooks) {
      // Plant seeds for future books
      const plantingPoints = [
        Math.floor(totalChapters * 0.2),
        Math.floor(totalChapters * 0.5),
        Math.floor(totalChapters * 0.8),
      ];

      plantingPoints.forEach((chapter, index) => {
        plans.push({
          chapterIndex: chapter,
          type: 'plant',
          element: `Future seed ${index + 1}`,
          payoffBook: position.bookNumber + Math.min(index + 1, horizon),
        });
      });
    }

    return plans;
  }

  private planArcProgression(
    activeArcs: GenerationContext['activeArcs'],
    totalChapters: number,
    position: { bookNumber: number; totalBooks: number }
  ): ArcProgressionPlan[] {
    const plans: ArcProgressionPlan[] = [];

    activeArcs.forEach(arc => {
      const progressNeeded = 100 - arc.completion;
      const chaptersForArc = Math.ceil((progressNeeded / 100) * totalChapters);
      const beatInterval = Math.floor(totalChapters / Math.max(chaptersForArc, 1));

      for (let i = 0; i < chaptersForArc; i++) {
        plans.push({
          chapterIndex: Math.min(i * beatInterval, totalChapters - 1),
          arcId: arc.id,
          arcName: arc.name,
          beatType: this.determineArcBeatType(arc.status, i, chaptersForArc),
        });
      }
    });

    return plans;
  }

  private determineArcBeatType(
    currentStatus: ArcStatus,
    beatIndex: number,
    totalBeats: number
  ): string {
    const progressRatio = beatIndex / totalBeats;

    switch (currentStatus) {
      case 'setup':
        return progressRatio < 0.5 ? 'establishment' : 'complication';
      case 'rising':
        return progressRatio < 0.7 ? 'escalation' : 'crisis';
      case 'climax':
        return 'confrontation';
      case 'falling':
        return 'consequence';
      default:
        return 'development';
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface BookOutline {
  bookId: string;
  premise: string;
  threeActStructure: {
    actOne: { chapters: ChapterOutline[]; goal: string };
    actTwo: { chapters: ChapterOutline[]; goal: string };
    actThree: { chapters: ChapterOutline[]; goal: string };
  };
  chapters: ChapterOutline[];
  config: StoryModeConfig;
  novelFeatures?: {
    povRotation: boolean;
    primaryPOVCharacters: string[];
    subplotIntegration: string;
    emotionalBeats: Record<number, string>;
  };
  seriesFeatures?: {
    bookNumber: number;
    isSeriesClimaxBook: boolean;
    foreshadowingPlan: ForeshadowingPlan[];
    arcProgression: ArcProgressionPlan[];
    previousBookCallbacks: boolean;
    setupForNextBook: boolean;
  };
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  act: number;
  chapterType: ChapterType;
  targetWordCount: number;
  beatSheet?: Beat[];
  povCharacter?: string;
  endWithCliffhanger: boolean;
  scenes: SceneOutline[];
  notes: string;
  subplotFocus?: number;
  thematicMoment?: boolean;
  shouldReferenceHistory?: boolean;
  foreshadowing?: ForeshadowingPlan[];
  arcBeats?: ArcProgressionPlan[];
}

export interface SceneOutline {
  sceneNumber: number;
  location: string;
  characters: string[];
  goal: string;
  conflict: string;
  outcome: string;
}

export interface Beat {
  beat: string;
  description: string;
}

export type ChapterType = 
  | 'opening'
  | 'inciting_incident'
  | 'development'
  | 'plot_point'
  | 'midpoint'
  | 'dark_moment'
  | 'climax';

export interface ForeshadowingPlan {
  chapterIndex: number;
  type: 'plant' | 'reminder' | 'payoff';
  element: string;
  payoffBook?: number;
}

export interface ArcProgressionPlan {
  chapterIndex: number;
  arcId: string;
  arcName: string;
  beatType: string;
}

export interface ContinuityConstraints {
  charactersPresent: GenerationContext['activeCharacters'];
  lockedElements: string[];
  canonRules: GenerationContext['canonRules'];
  pendingPayoffs: string[];
  activeRelationships: GenerationContext['relationshipMap'];
}

export interface ConsistencyReport {
  chapterId: string;
  issueCount: number;
  issues: ConsistencyIssue[];
  isConsistent: boolean;
}

export interface ConsistencyIssue {
  type: 'character_status' | 'relationship' | 'timeline' | 'world' | 'dialogue' | 'other';
  severity: 'error' | 'warning' | 'suggestion';
  description: string;
  characterId?: string;
  location?: { start: number; end: number };
}

export interface RevisionSuggestion {
  issueId: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  autoApplicable: boolean;
}

// Add helper methods to StoryModeManager class
// These methods are used by the AI generation integration
const addHelperMethods = (manager: StoryModeManager) => {
  (manager as any).extractCharactersFromContent = function(content: string, context: GenerationContext): string[] {
    const mentioned: string[] = [];
    const contentLower = content.toLowerCase();
    
    for (const character of context.activeCharacters) {
      const nameLower = character.name.toLowerCase();
      if (contentLower.includes(nameLower)) {
        mentioned.push(character.id);
      }
    }
    
    return mentioned;
  };

  (manager as any).extractWorldElementsFromContent = function(content: string, context: GenerationContext): string[] {
    const mentioned: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Check for world elements (locations, items, concepts) from context
    if (context.worldElements) {
      for (const element of context.worldElements) {
        const nameLower = element.name?.toLowerCase() || '';
        if (nameLower && contentLower.includes(nameLower)) {
          mentioned.push(element.id);
        }
      }
    }
    
    return mentioned;
  };

  (manager as any).identifyArcProgressFromContent = function(content: string, context: GenerationContext): string[] {
    const advanced: string[] = [];
    
    // Simple heuristic: if content mentions arc-related keywords or characters
    // In a full implementation, this would use more sophisticated analysis
    if (context.activeArcs) {
      for (const arc of context.activeArcs) {
        // Check if content is substantial (likely advanced the arc)
        if (content.length > 500) {
          advanced.push(arc.id);
        }
      }
    }
    
    return advanced;
  };
};

// Export singleton
export const storyModeManager = new StoryModeManager();
addHelperMethods(storyModeManager);

