/**
 * Persistent Narrative Engine
 * The core system for multi-book series with persistent memory,
 * character evolution, worldbuilding archives, and canon enforcement.
 * 
 * This transforms story generation from a stateless operation into
 * a continuity-aware literary engine.
 */

import { createClient } from '@/lib/supabase/client';
import type {
  StorySeries,
  SeriesBook,
  PersistentCharacter,
  CharacterBookState,
  CharacterEvent,
  CharacterRelationship,
  WorldElement,
  WorldLocation,
  WorldSystem,
  WorldFaction,
  CanonRule,
  CanonViolation,
  NarrativeArc,
  TimelineEvent,
  ContinuityNote,
  RevisionRequest,
  GenerationContext,
  StoryMode,
  StoryModeConfig,
  NarrativeGenerationRequest,
  NarrativeGenerationResult,
  SeriesOverview,
  CharacterDashboard,
  CharacterStatus,
  ChangeType,
  CanonLockLevel,
  ArcStatus,
} from '@/types/narrativeEngine';

// ============================================================================
// PERSISTENT NARRATIVE ENGINE
// ============================================================================

export class PersistentNarrativeEngine {
  private supabase = createClient();

  // ==========================================================================
  // SERIES MANAGEMENT
  // ==========================================================================

  /**
   * Create a new story series
   */
  async createSeries(series: Partial<StorySeries>): Promise<StorySeries> {
    const { data, error } = await this.supabase
      .from('story_series')
      .insert({
        author_id: series.authorId,
        title: series.title,
        description: series.description,
        premise: series.premise,
        genre: series.genre,
        subgenres: series.subgenres || [],
        target_book_count: series.targetBookCount || 1,
        primary_themes: series.primaryThemes || [],
        secondary_themes: series.secondaryThemes || [],
        recurring_motifs: series.recurringMotifs || [],
        main_conflict: series.mainConflict,
        series_arc_summary: series.seriesArcSummary,
        planned_ending: series.plannedEnding,
        tone: series.tone || 'balanced',
        pacing: series.pacing || 'moderate',
        target_audience: series.targetAudience || 'adult',
        content_rating: series.contentRating || 'teen',
        cover_image_url: series.coverImageUrl,
        is_premium: series.isPremium || false,
        metadata: series.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create series: ${error.message}`);
    return this.mapSeries(data);
  }

  /**
   * Get series with full overview
   */
  async getSeriesOverview(seriesId: string): Promise<SeriesOverview> {
    const [series, books, characterCount, worldCount, arcCount, notes, violations] = await Promise.all([
      this.getSeries(seriesId),
      this.getSeriesBooks(seriesId),
      this.supabase.from('persistent_characters').select('id', { count: 'exact' }).eq('series_id', seriesId),
      this.supabase.from('world_elements').select('id', { count: 'exact' }).eq('series_id', seriesId),
      // Use correct Supabase PostgREST syntax for NOT IN filter (no quotes around enum values)
      this.supabase.from('narrative_arcs').select('id', { count: 'exact' }).eq('series_id', seriesId).not('arc_status', 'in', '(resolved,abandoned)'),
      this.supabase.from('continuity_notes').select('id', { count: 'exact' }).eq('series_id', seriesId).eq('is_resolved', false),
      this.supabase.from('canon_violations').select('id', { count: 'exact' }).eq('series_id', seriesId).eq('resolution_status', 'pending'),
    ]);

    const totalWordCount = books.reduce((sum, book) => sum + (book.currentWordCount || 0), 0);

    return {
      series: series!,
      books,
      characterCount: characterCount.count || 0,
      worldElementCount: worldCount.count || 0,
      activeArcCount: arcCount.count || 0,
      totalWordCount,
      continuityNotes: notes.count || 0,
      pendingViolations: violations.count || 0,
    };
  }

  /**
   * Get a single series
   */
  async getSeries(seriesId: string): Promise<StorySeries | null> {
    const { data, error } = await this.supabase
      .from('story_series')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (error) return null;
    return this.mapSeries(data);
  }

  /**
   * Get all series for an author
   */
  async getAuthorSeries(authorId: string): Promise<StorySeries[]> {
    const { data, error } = await this.supabase
      .from('story_series')
      .select('*')
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapSeries);
  }

  /**
   * Update series
   */
  async updateSeries(seriesId: string, updates: Partial<StorySeries>): Promise<StorySeries> {
    const { data, error } = await this.supabase
      .from('story_series')
      .update({
        title: updates.title,
        description: updates.description,
        premise: updates.premise,
        genre: updates.genre,
        subgenres: updates.subgenres,
        target_book_count: updates.targetBookCount,
        series_status: updates.seriesStatus,
        primary_themes: updates.primaryThemes,
        secondary_themes: updates.secondaryThemes,
        recurring_motifs: updates.recurringMotifs,
        main_conflict: updates.mainConflict,
        series_arc_summary: updates.seriesArcSummary,
        planned_ending: updates.plannedEnding,
        tone: updates.tone,
        pacing: updates.pacing,
        target_audience: updates.targetAudience,
        content_rating: updates.contentRating,
        cover_image_url: updates.coverImageUrl,
        is_published: updates.isPublished,
        is_premium: updates.isPremium,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', seriesId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSeries(data);
  }

  // ==========================================================================
  // BOOK MANAGEMENT
  // ==========================================================================

  /**
   * Create a new book in a series
   */
  async createBook(book: Partial<SeriesBook>): Promise<SeriesBook> {
    const { data, error } = await this.supabase
      .from('series_books')
      .insert({
        series_id: book.seriesId,
        story_id: book.storyId,
        author_id: book.authorId,
        book_number: book.bookNumber,
        title: book.title,
        subtitle: book.subtitle,
        book_premise: book.bookPremise,
        book_conflict: book.bookConflict,
        book_arc_summary: book.bookArcSummary,
        story_mode: book.storyMode || 'book',
        target_word_count: book.targetWordCount,
        target_chapter_count: book.targetChapterCount,
        status: book.status || 'planning',
        timeline_start: book.timelineStart,
        timeline_end: book.timelineEnd,
        time_skip_from_previous: book.timeSkipFromPrevious,
        metadata: book.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    // Update series book count
    await this.supabase.rpc('increment_series_book_count', { p_series_id: book.seriesId });

    return this.mapBook(data);
  }

  /**
   * Get all books in a series
   */
  async getSeriesBooks(seriesId: string): Promise<SeriesBook[]> {
    const { data, error } = await this.supabase
      .from('series_books')
      .select('*')
      .eq('series_id', seriesId)
      .order('book_number', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapBook);
  }

  /**
   * Get a single book
   */
  async getBook(bookId: string): Promise<SeriesBook | null> {
    const { data, error } = await this.supabase
      .from('series_books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (error) return null;
    return this.mapBook(data);
  }

  /**
   * Update book progress
   */
  async updateBookProgress(bookId: string, wordCount: number, chapterCount: number): Promise<void> {
    await this.supabase
      .from('series_books')
      .update({
        current_word_count: wordCount,
        current_chapter_count: chapterCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId);
  }

  // ==========================================================================
  // CHARACTER PERSISTENCE
  // ==========================================================================

  /**
   * Create a persistent character
   */
  async createCharacter(character: Partial<PersistentCharacter>): Promise<PersistentCharacter> {
    const { data, error } = await this.supabase
      .from('persistent_characters')
      .insert({
        series_id: character.seriesId,
        author_id: character.authorId,
        name: character.name,
        aliases: character.aliases || [],
        title: character.title,
        core_personality: character.corePersonality || {},
        backstory: character.backstory,
        motivation: character.motivation,
        fatal_flaw: character.fatalFlaw,
        physical_description: character.physicalDescription || {},
        age_at_series_start: character.ageAtSeriesStart,
        character_role: character.characterRole || 'supporting',
        first_appears_book: character.firstAppearsBook || 1,
        current_status: character.currentStatus || 'active',
        dialogue_style: character.dialogueStyle,
        speech_patterns: character.speechPatterns || [],
        vocabulary_level: character.vocabularyLevel || 'average',
        typical_expressions: character.typicalExpressions || [],
        canon_lock_level: character.canonLockLevel || 'soft',
        locked_attributes: character.lockedAttributes || [],
        is_ai_generated: character.isAiGenerated || false,
        metadata: character.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCharacter(data);
  }

  /**
   * Get all characters in a series
   */
  async getSeriesCharacters(seriesId: string): Promise<PersistentCharacter[]> {
    const { data, error } = await this.supabase
      .from('persistent_characters')
      .select('*')
      .eq('series_id', seriesId)
      .order('character_role', { ascending: true })
      .order('first_appears_book', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapCharacter);
  }

  /**
   * Get character with full dashboard data
   */
  async getCharacterDashboard(characterId: string): Promise<CharacterDashboard> {
    const character = await this.getCharacter(characterId);
    if (!character) throw new Error('Character not found');

    const [bookStates, events, relationships, arcs] = await Promise.all([
      this.getCharacterBookStates(characterId),
      this.getCharacterEvents(characterId),
      this.getCharacterRelationships(characterId),
      this.getCharacterArcs(characterId),
    ]);

    return {
      character,
      bookStates,
      events,
      relationships,
      arcInvolvement: arcs,
    };
  }

  /**
   * Get a single character
   */
  async getCharacter(characterId: string): Promise<PersistentCharacter | null> {
    const { data, error } = await this.supabase
      .from('persistent_characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) return null;
    return this.mapCharacter(data);
  }

  /**
   * Update character
   */
  async updateCharacter(characterId: string, updates: Partial<PersistentCharacter>): Promise<PersistentCharacter> {
    // Check for locked attributes
    const character = await this.getCharacter(characterId);
    if (character?.canonLockLevel === 'immutable') {
      throw new Error('Character is immutable and cannot be edited');
    }

    const { data, error } = await this.supabase
      .from('persistent_characters')
      .update({
        name: updates.name,
        aliases: updates.aliases,
        title: updates.title,
        core_personality: updates.corePersonality,
        backstory: updates.backstory,
        motivation: updates.motivation,
        fatal_flaw: updates.fatalFlaw,
        physical_description: updates.physicalDescription,
        age_at_series_start: updates.ageAtSeriesStart,
        character_role: updates.characterRole,
        current_status: updates.currentStatus,
        status_changed_at: updates.statusChangedAt,
        status_change_reason: updates.statusChangeReason,
        dialogue_style: updates.dialogueStyle,
        speech_patterns: updates.speechPatterns,
        vocabulary_level: updates.vocabularyLevel,
        typical_expressions: updates.typicalExpressions,
        canon_lock_level: updates.canonLockLevel,
        locked_attributes: updates.lockedAttributes,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)
      .select()
      .single();

    if (error) throw error;
    return this.mapCharacter(data);
  }

  /**
   * Record a character event (injury, transformation, etc.)
   */
  async recordCharacterEvent(event: Partial<CharacterEvent>): Promise<CharacterEvent> {
    const { data, error } = await this.supabase
      .from('character_events')
      .insert({
        character_id: event.characterId,
        book_id: event.bookId,
        chapter_id: event.chapterId,
        event_type: event.eventType,
        event_description: event.eventDescription,
        event_cause: event.eventCause,
        occurred_at_chapter: event.occurredAtChapter,
        in_universe_date: event.inUniverseDate,
        is_permanent: event.isPermanent ?? true,
        reversal_possible: event.reversalPossible ?? false,
        significance_level: event.significanceLevel || 5,
        previous_state: event.previousState || {},
        new_state: event.newState || {},
        canon_lock_level: event.canonLockLevel || 'soft',
        is_canon: event.isCanon ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    // If this is a status change, update the character
    if (event.eventType === 'status' && event.newState) {
      await this.updateCharacter(event.characterId!, {
        currentStatus: event.newState.status as CharacterStatus,
        statusChangedAt: new Date().toISOString(),
        statusChangeReason: event.eventDescription,
      });
    }

    return this.mapCharacterEvent(data);
  }

  /**
   * Get character state at a specific book
   */
  async getCharacterStateAtBook(characterId: string, bookNumber: number): Promise<any> {
    const { data, error } = await this.supabase.rpc('get_character_state_at_book', {
      p_character_id: characterId,
      p_book_number: bookNumber,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get character book states
   */
  async getCharacterBookStates(characterId: string): Promise<CharacterBookState[]> {
    const { data, error } = await this.supabase
      .from('character_book_states')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapCharacterBookState);
  }

  /**
   * Get character events
   */
  async getCharacterEvents(characterId: string): Promise<CharacterEvent[]> {
    const { data, error } = await this.supabase
      .from('character_events')
      .select('*')
      .eq('character_id', characterId)
      .order('occurred_at_chapter', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapCharacterEvent);
  }

  /**
   * Get character relationships
   */
  async getCharacterRelationships(characterId: string): Promise<Array<{ otherCharacter: PersistentCharacter; relationship: CharacterRelationship }>> {
    const { data, error } = await this.supabase
      .from('character_relationships')
      .select(`
        *,
        character_a:persistent_characters!character_a_id(*),
        character_b:persistent_characters!character_b_id(*)
      `)
      .or(`character_a_id.eq.${characterId},character_b_id.eq.${characterId}`);

    if (error) throw error;

    return (data || []).map((rel: any) => ({
      otherCharacter: this.mapCharacter(
        rel.character_a_id === characterId ? rel.character_b : rel.character_a
      ),
      relationship: this.mapRelationship(rel),
    }));
  }

  /**
   * Create or update a character relationship
   */
  async setCharacterRelationship(
    characterAId: string,
    characterBId: string,
    seriesId: string,
    relationship: Partial<CharacterRelationship>
  ): Promise<CharacterRelationship> {
    // Ensure consistent ordering
    const [firstId, secondId] = characterAId < characterBId 
      ? [characterAId, characterBId] 
      : [characterBId, characterAId];
    
    const isReversed = characterAId !== firstId;

    const { data, error } = await this.supabase
      .from('character_relationships')
      .upsert({
        character_a_id: firstId,
        character_b_id: secondId,
        series_id: seriesId,
        relationship_type_a_to_b: isReversed ? relationship.relationshipTypeBToA : relationship.relationshipTypeAToB,
        relationship_type_b_to_a: isReversed ? relationship.relationshipTypeAToB : relationship.relationshipTypeBToA,
        intensity_a_to_b: isReversed ? relationship.intensityBToA : relationship.intensityAToB,
        intensity_b_to_a: isReversed ? relationship.intensityAToB : relationship.intensityBToA,
        relationship_history: relationship.relationshipHistory,
        first_meeting_description: relationship.firstMeetingDescription,
        current_dynamic: relationship.currentDynamic,
        tension_points: relationship.tensionPoints || [],
        shared_history: relationship.sharedHistory || [],
        is_active: relationship.isActive ?? true,
        canon_lock_level: relationship.canonLockLevel || 'soft',
      }, {
        onConflict: 'character_a_id,character_b_id,series_id',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRelationship(data);
  }

  /**
   * Get arcs involving a character
   */
  async getCharacterArcs(characterId: string): Promise<NarrativeArc[]> {
    const { data, error } = await this.supabase
      .from('narrative_arcs')
      .select('*')
      .or(`primary_characters.cs.{${characterId}},secondary_characters.cs.{${characterId}}`);

    if (error) throw error;
    return (data || []).map(this.mapNarrativeArc);
  }

  // ==========================================================================
  // WORLDBUILDING ARCHIVE
  // ==========================================================================

  /**
   * Create a world element
   */
  async createWorldElement(element: Partial<WorldElement>): Promise<WorldElement> {
    const { data, error } = await this.supabase
      .from('world_elements')
      .insert({
        series_id: element.seriesId,
        author_id: element.authorId,
        parent_element_id: element.parentElementId,
        element_type: element.elementType,
        name: element.name,
        aliases: element.aliases || [],
        short_description: element.shortDescription,
        full_description: element.fullDescription,
        visual_description: element.visualDescription,
        category: element.category,
        tags: element.tags || [],
        related_elements: element.relatedElements || [],
        conflicts_with: element.conflictsWith || [],
        depends_on: element.dependsOn || [],
        rules: element.rules || { rules: [], constraints: [], exceptions: [] },
        introduced_in_book: element.introducedInBook,
        introduced_in_chapter: element.introducedInChapter,
        is_active: element.isActive ?? true,
        canon_lock_level: element.canonLockLevel || 'soft',
        metadata: element.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldElement(data);
  }

  /**
   * Get all world elements for a series
   */
  async getWorldElements(seriesId: string, type?: string): Promise<WorldElement[]> {
    let query = this.supabase
      .from('world_elements')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('element_type')
      .order('name');

    if (type) {
      query = query.eq('element_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapWorldElement);
  }

  /**
   * Get world element with hierarchy
   */
  async getWorldElementWithChildren(elementId: string): Promise<WorldElement & { children: WorldElement[] }> {
    const [element, children] = await Promise.all([
      this.supabase.from('world_elements').select('*').eq('id', elementId).single(),
      this.supabase.from('world_elements').select('*').eq('parent_element_id', elementId),
    ]);

    if (element.error) throw element.error;

    return {
      ...this.mapWorldElement(element.data),
      children: (children.data || []).map(this.mapWorldElement),
    };
  }

  /**
   * Update world element
   */
  async updateWorldElement(elementId: string, updates: Partial<WorldElement>): Promise<WorldElement> {
    const { data, error } = await this.supabase
      .from('world_elements')
      .update({
        name: updates.name,
        aliases: updates.aliases,
        short_description: updates.shortDescription,
        full_description: updates.fullDescription,
        visual_description: updates.visualDescription,
        category: updates.category,
        tags: updates.tags,
        related_elements: updates.relatedElements,
        conflicts_with: updates.conflictsWith,
        depends_on: updates.dependsOn,
        rules: updates.rules,
        is_active: updates.isActive,
        destroyed_in_book: updates.destroyedInBook,
        destruction_reason: updates.destructionReason,
        canon_lock_level: updates.canonLockLevel,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', elementId)
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldElement(data);
  }

  // ==========================================================================
  // CANON ENFORCEMENT
  // ==========================================================================

  /**
   * Create a canon rule
   */
  async createCanonRule(rule: Partial<CanonRule>): Promise<CanonRule> {
    const { data, error } = await this.supabase
      .from('canon_rules')
      .insert({
        series_id: rule.seriesId,
        author_id: rule.authorId,
        rule_category: rule.ruleCategory,
        rule_name: rule.ruleName,
        rule_description: rule.ruleDescription,
        rule_type: rule.ruleType || 'must',
        applies_to_entity_type: rule.appliesToEntityType,
        applies_to_entity_ids: rule.appliesToEntityIds || [],
        applies_from_book: rule.appliesFromBook || 1,
        applies_until_book: rule.appliesUntilBook,
        lock_level: rule.lockLevel || 'hard',
        violation_severity: rule.violationSeverity || 'error',
        violation_message: rule.violationMessage,
        valid_examples: rule.validExamples || [],
        invalid_examples: rule.invalidExamples || [],
        is_active: rule.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCanonRule(data);
  }

  /**
   * Get canon rules for a series
   */
  async getCanonRules(seriesId: string, bookNumber?: number): Promise<CanonRule[]> {
    let query = this.supabase
      .from('canon_rules')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('rule_category')
      .order('lock_level', { ascending: false });

    if (bookNumber !== undefined) {
      query = query
        .lte('applies_from_book', bookNumber)
        .or(`applies_until_book.is.null,applies_until_book.gte.${bookNumber}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapCanonRule);
  }

  /**
   * Check content for canon violations
   */
  async checkCanonViolations(
    seriesId: string,
    bookNumber: number,
    content: string,
    context?: {
      charactersInvolved?: string[];
      worldElementsReferenced?: string[];
    }
  ): Promise<CanonViolation[]> {
    const rules = await this.getCanonRules(seriesId, bookNumber);
    const violations: CanonViolation[] = [];

    // Get relevant character and world data
    const [characters, worldElements] = await Promise.all([
      context?.charactersInvolved 
        ? this.supabase.from('persistent_characters').select('*').in('id', context.charactersInvolved)
        : Promise.resolve({ data: [] }),
      context?.worldElementsReferenced
        ? this.supabase.from('world_elements').select('*').in('id', context.worldElementsReferenced)
        : Promise.resolve({ data: [] }),
    ]);

    // Check each rule
    for (const rule of rules) {
      const violation = await this.checkRuleViolation(rule, content, {
        characters: characters.data || [],
        worldElements: worldElements.data || [],
        bookNumber,
      });

      if (violation) {
        violations.push(violation);
      }
    }

    // Record violations
    if (violations.length > 0) {
      await this.supabase.from('canon_violations').insert(
        violations.map(v => ({
          rule_id: v.ruleId,
          series_id: seriesId,
          violation_type: v.violationType,
          violation_description: v.violationDescription,
          violating_content: v.violatingContent,
          detected_by: 'system',
        }))
      );
    }

    return violations;
  }

  /**
   * Check a single rule for violations
   */
  private async checkRuleViolation(
    rule: CanonRule,
    content: string,
    context: { characters: any[]; worldElements: any[]; bookNumber: number }
  ): Promise<CanonViolation | null> {
    const contentLower = content.toLowerCase();

    // Character-specific rules
    if (rule.ruleCategory === 'character') {
      for (const charData of context.characters) {
        // Check for deceased characters being described as alive
        if (charData.current_status === 'deceased') {
          const name = charData.name.toLowerCase();
          const aliveIndicators = [`${name} said`, `${name} walked`, `${name} looked`, `${name} smiled`];
          
          for (const indicator of aliveIndicators) {
            if (contentLower.includes(indicator)) {
              return {
                id: '',
                ruleId: rule.id,
                seriesId: rule.seriesId,
                violationType: 'character_status',
                violationDescription: `Character "${charData.name}" is deceased but appears to be alive in the content`,
                violatingContent: content.substring(
                  Math.max(0, contentLower.indexOf(indicator) - 50),
                  Math.min(content.length, contentLower.indexOf(indicator) + 100)
                ),
                detectedAt: new Date().toISOString(),
                detectedBy: 'system',
                resolutionStatus: 'pending',
                isIntentionalOverride: false,
              };
            }
          }
        }
      }
    }

    // World-specific rules
    if (rule.ruleCategory === 'world' || rule.ruleCategory === 'system') {
      for (const element of context.worldElements) {
        if (!element.is_active && element.destroyed_in_book && element.destroyed_in_book <= context.bookNumber) {
          const name = element.name.toLowerCase();
          if (contentLower.includes(name) && !contentLower.includes(`former ${name}`) && !contentLower.includes(`ruins of ${name}`)) {
            return {
              id: '',
              ruleId: rule.id,
              seriesId: rule.seriesId,
              violationType: 'world_element',
              violationDescription: `World element "${element.name}" was destroyed in Book ${element.destroyed_in_book} but is referenced as active`,
              violatingContent: content.substring(
                Math.max(0, contentLower.indexOf(name) - 50),
                Math.min(content.length, contentLower.indexOf(name) + 100)
              ),
              detectedAt: new Date().toISOString(),
              detectedBy: 'system',
              resolutionStatus: 'pending',
              isIntentionalOverride: false,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Resolve a canon violation
   */
  async resolveViolation(
    violationId: string,
    resolution: {
      status: 'resolved' | 'ignored' | 'overridden';
      action?: string;
      isIntentionalOverride?: boolean;
      overrideReason?: string;
    }
  ): Promise<void> {
    await this.supabase
      .from('canon_violations')
      .update({
        resolution_status: resolution.status,
        resolution_action: resolution.action,
        is_intentional_override: resolution.isIntentionalOverride || false,
        override_reason: resolution.overrideReason,
        resolved_at: new Date().toISOString(),
        resolved_by: 'author',
      })
      .eq('id', violationId);
  }

  // ==========================================================================
  // NARRATIVE ARCS
  // ==========================================================================

  /**
   * Create a narrative arc
   */
  async createNarrativeArc(arc: Partial<NarrativeArc>): Promise<NarrativeArc> {
    const { data, error } = await this.supabase
      .from('narrative_arcs')
      .insert({
        series_id: arc.seriesId,
        author_id: arc.authorId,
        arc_name: arc.arcName,
        arc_type: arc.arcType,
        arc_description: arc.arcDescription,
        starts_in_book: arc.startsInBook,
        ends_in_book: arc.endsInBook,
        starts_in_chapter: arc.startsInChapter,
        ends_in_chapter: arc.endsInChapter,
        arc_status: arc.arcStatus || 'setup',
        completion_percentage: arc.completionPercentage || 0,
        setup_points: arc.setupPoints || [],
        rising_action_points: arc.risingActionPoints || [],
        climax_point: arc.climaxPoint,
        falling_action_points: arc.fallingActionPoints || [],
        resolution_point: arc.resolutionPoint,
        primary_characters: arc.primaryCharacters || [],
        secondary_characters: arc.secondaryCharacters || [],
        related_arcs: arc.relatedArcs || [],
        themes: arc.themes || [],
        foreshadowing_elements: arc.foreshadowingElements || { plantedIn: [], payoffIn: [] },
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapNarrativeArc(data);
  }

  /**
   * Get narrative arcs for a series
   */
  async getNarrativeArcs(seriesId: string, status?: ArcStatus[]): Promise<NarrativeArc[]> {
    let query = this.supabase
      .from('narrative_arcs')
      .select('*')
      .eq('series_id', seriesId)
      .order('starts_in_book')
      .order('arc_type');

    if (status && status.length > 0) {
      query = query.in('arc_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapNarrativeArc);
  }

  /**
   * Update arc progress
   */
  async updateArcProgress(
    arcId: string,
    updates: {
      status?: ArcStatus;
      completionPercentage?: number;
      setupPoints?: string[];
      risingActionPoints?: string[];
      climaxPoint?: string;
      fallingActionPoints?: string[];
      resolutionPoint?: string;
    }
  ): Promise<NarrativeArc> {
    const { data, error } = await this.supabase
      .from('narrative_arcs')
      .update({
        arc_status: updates.status,
        completion_percentage: updates.completionPercentage,
        setup_points: updates.setupPoints,
        rising_action_points: updates.risingActionPoints,
        climax_point: updates.climaxPoint,
        falling_action_points: updates.fallingActionPoints,
        resolution_point: updates.resolutionPoint,
        updated_at: new Date().toISOString(),
      })
      .eq('id', arcId)
      .select()
      .single();

    if (error) throw error;
    return this.mapNarrativeArc(data);
  }

  // ==========================================================================
  // TIMELINE & CONTINUITY
  // ==========================================================================

  /**
   * Create a timeline event
   */
  async createTimelineEvent(event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .insert({
        series_id: event.seriesId,
        event_name: event.eventName,
        event_description: event.eventDescription,
        event_type: event.eventType || 'current',
        in_universe_date: event.inUniverseDate,
        relative_timing: event.relativeTiming,
        sequence_number: event.sequenceNumber,
        referenced_in_books: event.referencedInBooks || [],
        first_mentioned_book: event.firstMentionedBook,
        first_mentioned_chapter: event.firstMentionedChapter,
        involved_characters: event.involvedCharacters || [],
        involved_factions: event.involvedFactions || [],
        involved_locations: event.involvedLocations || [],
        consequences: event.consequences || [],
        leads_to_events: event.leadsToEvents || [],
        caused_by_events: event.causedByEvents || [],
        is_canon: event.isCanon ?? true,
        canon_lock_level: event.canonLockLevel || 'soft',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTimelineEvent(data);
  }

  /**
   * Get timeline for a series
   */
  async getTimeline(seriesId: string): Promise<TimelineEvent[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_canon', true)
      .order('sequence_number', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapTimelineEvent);
  }

  /**
   * Create a continuity note
   */
  async createContinuityNote(note: Partial<ContinuityNote>): Promise<ContinuityNote> {
    const { data, error } = await this.supabase
      .from('continuity_notes')
      .insert({
        series_id: note.seriesId,
        author_id: note.authorId,
        note_type: note.noteType,
        note_title: note.noteTitle,
        note_content: note.noteContent,
        referenced_book: note.referencedBook,
        referenced_chapter: note.referencedChapter,
        referenced_characters: note.referencedCharacters || [],
        referenced_elements: note.referencedElements || [],
        priority: note.priority || 'medium',
        is_resolved: note.isResolved || false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapContinuityNote(data);
  }

  /**
   * Get continuity notes
   */
  async getContinuityNotes(seriesId: string, unresolvedOnly: boolean = false): Promise<ContinuityNote[]> {
    let query = this.supabase
      .from('continuity_notes')
      .select('*')
      .eq('series_id', seriesId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (unresolvedOnly) {
      query = query.eq('is_resolved', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapContinuityNote);
  }

  // ==========================================================================
  // GENERATION CONTEXT
  // ==========================================================================

  /**
   * Compile generation context for AI
   */
  async compileGenerationContext(
    seriesId: string,
    bookId: string,
    chapterNumber?: number
  ): Promise<GenerationContext> {
    // Use database function for efficient context compilation
    const { data: contextId, error } = await this.supabase.rpc('compile_generation_context', {
      p_series_id: seriesId,
      p_book_id: bookId,
      p_chapter_number: chapterNumber,
    });

    if (error) throw error;

    // Fetch the compiled context
    const { data: context } = await this.supabase
      .from('generation_contexts')
      .select('*')
      .eq('id', contextId)
      .single();

    return this.mapGenerationContext(context);
  }

  /**
   * Get the most recent valid context
   */
  async getValidContext(seriesId: string, bookId?: string): Promise<GenerationContext | null> {
    let query = this.supabase
      .from('generation_contexts')
      .select('*')
      .eq('series_id', seriesId)
      .gt('valid_until', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1);

    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    const { data } = await query.single();
    return data ? this.mapGenerationContext(data) : null;
  }

  // ==========================================================================
  // REVISION & PROPAGATION
  // ==========================================================================

  /**
   * Create a revision request
   */
  async createRevisionRequest(request: Partial<RevisionRequest>): Promise<RevisionRequest> {
    const { data, error } = await this.supabase
      .from('revision_requests')
      .insert({
        series_id: request.seriesId,
        author_id: request.authorId,
        revision_type: request.revisionType,
        revision_description: request.revisionDescription,
        affects_entity_type: request.affectsEntityType,
        affects_entity_id: request.affectsEntityId,
        affects_books: request.affectsBooks || [],
        old_value: request.oldValue || {},
        new_value: request.newValue || {},
        propagation_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRevisionRequest(data);
  }

  /**
   * Analyze revision impact
   */
  async analyzeRevisionImpact(requestId: string): Promise<{
    affectedChapters: string[];
    requiredChanges: Record<string, Array<{ type: string; description: string; suggestedEdit: string }>>;
  }> {
    // Update status to analyzing
    await this.supabase
      .from('revision_requests')
      .update({ propagation_status: 'analyzing' })
      .eq('id', requestId);

    const { data: request } = await this.supabase
      .from('revision_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Revision request not found');

    // Find affected chapters based on entity type
    let affectedChapters: string[] = [];
    const requiredChanges: Record<string, Array<{ type: string; description: string; suggestedEdit: string }>> = {};

    if (request.affects_entity_type === 'character') {
      // Find chapters where character appears
      const { data: chapters } = await this.supabase
        .from('chapters')
        .select('id, content, chapter_number')
        .textSearch('content', request.old_value.name || '');

      affectedChapters = chapters?.map((c: any) => c.id) || [];

      // Analyze each chapter for required changes
      for (const chapter of chapters || []) {
        const changes = this.analyzeChapterForCharacterChange(
          chapter.content,
          request.old_value,
          request.new_value
        );
        if (changes.length > 0) {
          requiredChanges[chapter.id] = changes;
        }
      }
    }

    // Update request with analysis results
    await this.supabase
      .from('revision_requests')
      .update({
        propagation_status: 'ready',
        affected_chapters: affectedChapters,
        required_changes: requiredChanges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    return { affectedChapters, requiredChanges };
  }

  /**
   * Analyze a chapter for character changes
   */
  private analyzeChapterForCharacterChange(
    content: string,
    oldValue: Record<string, any>,
    newValue: Record<string, any>
  ): Array<{ type: string; description: string; suggestedEdit: string }> {
    const changes: Array<{ type: string; description: string; suggestedEdit: string }> = [];

    // Name change
    if (oldValue.name !== newValue.name && content.includes(oldValue.name)) {
      changes.push({
        type: 'name_change',
        description: `Replace "${oldValue.name}" with "${newValue.name}"`,
        suggestedEdit: content.replace(new RegExp(oldValue.name, 'g'), newValue.name),
      });
    }

    // Physical description changes
    if (oldValue.physicalDescription && newValue.physicalDescription) {
      const oldFeatures = oldValue.physicalDescription.distinguishingFeatures || [];
      const newFeatures = newValue.physicalDescription.distinguishingFeatures || [];
      
      for (const feature of oldFeatures) {
        if (!newFeatures.includes(feature) && content.toLowerCase().includes(feature.toLowerCase())) {
          changes.push({
            type: 'physical_description',
            description: `Remove or update reference to "${feature}"`,
            suggestedEdit: `Review description of ${oldValue.name}'s physical appearance`,
          });
        }
      }
    }

    return changes;
  }

  /**
   * Apply a propagated change
   */
  async applyPropagatedChange(changeId: string): Promise<void> {
    const { data: change } = await this.supabase
      .from('propagated_changes')
      .select('*')
      .eq('id', changeId)
      .single();

    if (!change) throw new Error('Change not found');

    // Apply the change to the chapter
    await this.supabase
      .from('chapters')
      .update({ content: change.updated_content })
      .eq('id', change.chapter_id);

    // Mark change as applied
    await this.supabase
      .from('propagated_changes')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .eq('id', changeId);
  }

  // ==========================================================================
  // MAPPING FUNCTIONS
  // ==========================================================================

  private mapSeries(data: any): StorySeries {
    return {
      id: data.id,
      authorId: data.author_id,
      title: data.title,
      description: data.description,
      premise: data.premise,
      genre: data.genre,
      subgenres: data.subgenres || [],
      targetBookCount: data.target_book_count,
      currentBookCount: data.current_book_count,
      seriesStatus: data.series_status,
      primaryThemes: data.primary_themes || [],
      secondaryThemes: data.secondary_themes || [],
      recurringMotifs: data.recurring_motifs || [],
      mainConflict: data.main_conflict,
      seriesArcSummary: data.series_arc_summary,
      plannedEnding: data.planned_ending,
      tone: data.tone,
      pacing: data.pacing,
      targetAudience: data.target_audience,
      contentRating: data.content_rating,
      coverImageUrl: data.cover_image_url,
      isPublished: data.is_published,
      isPremium: data.is_premium,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapBook(data: any): SeriesBook {
    return {
      id: data.id,
      seriesId: data.series_id,
      storyId: data.story_id,
      authorId: data.author_id,
      bookNumber: data.book_number,
      title: data.title,
      subtitle: data.subtitle,
      bookPremise: data.book_premise,
      bookConflict: data.book_conflict,
      bookArcSummary: data.book_arc_summary,
      bookResolution: data.book_resolution,
      storyMode: data.story_mode,
      targetWordCount: data.target_word_count,
      targetChapterCount: data.target_chapter_count,
      currentWordCount: data.current_word_count || 0,
      currentChapterCount: data.current_chapter_count || 0,
      status: data.status,
      timelineStart: data.timeline_start,
      timelineEnd: data.timeline_end,
      timeSkipFromPrevious: data.time_skip_from_previous,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCharacter(data: any): PersistentCharacter {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      name: data.name,
      aliases: data.aliases || [],
      title: data.title,
      corePersonality: data.core_personality || {},
      backstory: data.backstory,
      motivation: data.motivation,
      fatalFlaw: data.fatal_flaw,
      physicalDescription: data.physical_description || {},
      ageAtSeriesStart: data.age_at_series_start,
      characterRole: data.character_role,
      firstAppearsBook: data.first_appears_book,
      currentStatus: data.current_status,
      statusChangedAt: data.status_changed_at,
      statusChangeReason: data.status_change_reason,
      dialogueStyle: data.dialogue_style,
      speechPatterns: data.speech_patterns || [],
      vocabularyLevel: data.vocabulary_level,
      typicalExpressions: data.typical_expressions || [],
      canonLockLevel: data.canon_lock_level,
      lockedAttributes: data.locked_attributes || [],
      isAiGenerated: data.is_ai_generated,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCharacterBookState(data: any): CharacterBookState {
    return {
      id: data.id,
      characterId: data.character_id,
      bookId: data.book_id,
      statusAtStart: data.status_at_start,
      ageAtBook: data.age_at_book,
      locationAtStart: data.location_at_start,
      physicalChanges: data.physical_changes || [],
      appearanceNotes: data.appearance_notes,
      mentalState: data.mental_state,
      emotionalArc: data.emotional_arc,
      beliefsAtStart: data.beliefs_at_start || {},
      beliefsAtEnd: data.beliefs_at_end || {},
      keyRelationships: data.key_relationships || {},
      bookGoal: data.book_goal,
      internalConflict: data.internal_conflict,
      externalConflict: data.external_conflict,
      arcType: data.arc_type,
      arcStatus: data.arc_status,
      arcResolution: data.arc_resolution,
      wordCount: data.word_count || 0,
      sceneCount: data.scene_count || 0,
      chapterAppearances: data.chapter_appearances || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCharacterEvent(data: any): CharacterEvent {
    return {
      id: data.id,
      characterId: data.character_id,
      bookId: data.book_id,
      chapterId: data.chapter_id,
      eventType: data.event_type,
      eventDescription: data.event_description,
      eventCause: data.event_cause,
      occurredAtChapter: data.occurred_at_chapter,
      inUniverseDate: data.in_universe_date,
      isPermanent: data.is_permanent,
      reversalPossible: data.reversal_possible,
      significanceLevel: data.significance_level,
      previousState: data.previous_state || {},
      newState: data.new_state || {},
      canonLockLevel: data.canon_lock_level,
      isCanon: data.is_canon,
      createdAt: data.created_at,
    };
  }

  private mapRelationship(data: any): CharacterRelationship {
    return {
      id: data.id,
      characterAId: data.character_a_id,
      characterBId: data.character_b_id,
      seriesId: data.series_id,
      relationshipTypeAToB: data.relationship_type_a_to_b,
      intensityAToB: data.intensity_a_to_b,
      relationshipTypeBToA: data.relationship_type_b_to_a,
      intensityBToA: data.intensity_b_to_a,
      relationshipHistory: data.relationship_history,
      firstMeetingDescription: data.first_meeting_description,
      currentDynamic: data.current_dynamic,
      tensionPoints: data.tension_points || [],
      sharedHistory: data.shared_history || [],
      isActive: data.is_active,
      endedInBook: data.ended_in_book,
      endingReason: data.ending_reason,
      canonLockLevel: data.canon_lock_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapWorldElement(data: any): WorldElement {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      parentElementId: data.parent_element_id,
      elementType: data.element_type,
      name: data.name,
      aliases: data.aliases || [],
      shortDescription: data.short_description,
      fullDescription: data.full_description,
      visualDescription: data.visual_description,
      category: data.category,
      tags: data.tags || [],
      relatedElements: data.related_elements || [],
      conflictsWith: data.conflicts_with || [],
      dependsOn: data.depends_on || [],
      rules: data.rules || { rules: [], constraints: [], exceptions: [] },
      introducedInBook: data.introduced_in_book,
      introducedInChapter: data.introduced_in_chapter,
      isActive: data.is_active,
      destroyedInBook: data.destroyed_in_book,
      destructionReason: data.destruction_reason,
      canonLockLevel: data.canon_lock_level,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCanonRule(data: any): CanonRule {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      ruleCategory: data.rule_category,
      ruleName: data.rule_name,
      ruleDescription: data.rule_description,
      ruleType: data.rule_type,
      appliesToEntityType: data.applies_to_entity_type,
      appliesToEntityIds: data.applies_to_entity_ids || [],
      appliesFromBook: data.applies_from_book,
      appliesUntilBook: data.applies_until_book,
      lockLevel: data.lock_level,
      violationSeverity: data.violation_severity,
      violationMessage: data.violation_message,
      validExamples: data.valid_examples || [],
      invalidExamples: data.invalid_examples || [],
      isActive: data.is_active,
      supersededBy: data.superseded_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapNarrativeArc(data: any): NarrativeArc {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      arcName: data.arc_name,
      arcType: data.arc_type,
      arcDescription: data.arc_description,
      startsInBook: data.starts_in_book,
      endsInBook: data.ends_in_book,
      startsInChapter: data.starts_in_chapter,
      endsInChapter: data.ends_in_chapter,
      arcStatus: data.arc_status,
      completionPercentage: data.completion_percentage,
      setupPoints: data.setup_points || [],
      risingActionPoints: data.rising_action_points || [],
      climaxPoint: data.climax_point,
      fallingActionPoints: data.falling_action_points || [],
      resolutionPoint: data.resolution_point,
      primaryCharacters: data.primary_characters || [],
      secondaryCharacters: data.secondary_characters || [],
      relatedArcs: data.related_arcs || [],
      themes: data.themes || [],
      foreshadowingElements: data.foreshadowing_elements || { plantedIn: [], payoffIn: [] },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapTimelineEvent(data: any): TimelineEvent {
    return {
      id: data.id,
      seriesId: data.series_id,
      eventName: data.event_name,
      eventDescription: data.event_description,
      eventType: data.event_type,
      inUniverseDate: data.in_universe_date,
      relativeTiming: data.relative_timing,
      sequenceNumber: data.sequence_number,
      referencedInBooks: data.referenced_in_books || [],
      firstMentionedBook: data.first_mentioned_book,
      firstMentionedChapter: data.first_mentioned_chapter,
      involvedCharacters: data.involved_characters || [],
      involvedFactions: data.involved_factions || [],
      involvedLocations: data.involved_locations || [],
      consequences: data.consequences || [],
      leadsToEvents: data.leads_to_events || [],
      causedByEvents: data.caused_by_events || [],
      isCanon: data.is_canon,
      canonLockLevel: data.canon_lock_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapContinuityNote(data: any): ContinuityNote {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      noteType: data.note_type,
      noteTitle: data.note_title,
      noteContent: data.note_content,
      referencedBook: data.referenced_book,
      referencedChapter: data.referenced_chapter,
      referencedCharacters: data.referenced_characters || [],
      referencedElements: data.referenced_elements || [],
      priority: data.priority,
      isResolved: data.is_resolved,
      resolution: data.resolution,
      resolvedAt: data.resolved_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapRevisionRequest(data: any): RevisionRequest {
    return {
      id: data.id,
      seriesId: data.series_id,
      authorId: data.author_id,
      revisionType: data.revision_type,
      revisionDescription: data.revision_description,
      affectsEntityType: data.affects_entity_type,
      affectsEntityId: data.affects_entity_id,
      affectsBooks: data.affects_books || [],
      oldValue: data.old_value || {},
      newValue: data.new_value || {},
      propagationStatus: data.propagation_status,
      affectedChapters: data.affected_chapters || [],
      requiredChanges: data.required_changes || {},
      aiAnalysis: data.ai_analysis,
      aiSuggestedChanges: data.ai_suggested_changes || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapGenerationContext(data: any): GenerationContext {
    return {
      id: data.id,
      seriesId: data.series_id,
      bookId: data.book_id,
      chapterId: data.chapter_id,
      contextType: data.context_type,
      worldState: data.world_state || {},
      activeCharacters: data.active_characters || [],
      relationshipMap: data.relationship_map || [],
      activeArcs: data.active_arcs || [],
      recentEvents: data.recent_events || {},
      canonRules: data.canon_rules || [],
      lockedElements: data.locked_elements || [],
      toneGuidance: data.tone_guidance,
      pacingGuidance: data.pacing_guidance,
      themeReminders: data.theme_reminders || [],
      pendingPayoffs: data.pending_payoffs || [],
      generatedAt: data.generated_at,
      validUntil: data.valid_until,
    };
  }
}

// Export singleton instance
export const persistentNarrativeEngine = new PersistentNarrativeEngine();

