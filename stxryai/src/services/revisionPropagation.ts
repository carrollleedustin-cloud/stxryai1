/**
 * Revision Propagation Service
 * Allows retroactive continuity adjustments that propagate intelligently
 * across the entire series. One change ripples outward, updating references,
 * character behavior, and world logic automatically.
 */

import { createClient } from '@/lib/supabase/client';
import { persistentNarrativeEngine } from './persistentNarrativeEngine';
import type {
  RevisionRequest,
  PropagatedChange,
  PersistentCharacter,
  WorldElement,
  CharacterRelationship,
} from '@/types/narrativeEngine';

// ============================================================================
// REVISION PROPAGATION SERVICE
// ============================================================================

export class RevisionPropagationService {
  private supabase = createClient();
  private engine = persistentNarrativeEngine;

  // ==========================================================================
  // REVISION REQUEST CREATION
  // ==========================================================================

  /**
   * Create a revision request for a character change
   */
  async createCharacterRevision(
    seriesId: string,
    authorId: string,
    characterId: string,
    changes: CharacterChangeRequest
  ): Promise<RevisionRequest> {
    const character = await this.engine.getCharacter(characterId);
    if (!character) throw new Error('Character not found');

    return this.createRevisionRequest({
      seriesId,
      authorId,
      revisionType: 'character_change',
      revisionDescription: changes.description,
      affectsEntityType: 'character',
      affectsEntityId: characterId,
      affectsBooks: changes.affectsBooks || [],
      oldValue: this.extractCharacterValues(character, changes.changedFields),
      newValue: changes.newValues,
    });
  }

  /**
   * Create a revision request for a world element change
   */
  async createWorldRevision(
    seriesId: string,
    authorId: string,
    elementId: string,
    changes: WorldChangeRequest
  ): Promise<RevisionRequest> {
    const { data: element } = await this.supabase
      .from('world_elements')
      .select('*')
      .eq('id', elementId)
      .single();

    if (!element) throw new Error('World element not found');

    return this.createRevisionRequest({
      seriesId,
      authorId,
      revisionType: 'world_change',
      revisionDescription: changes.description,
      affectsEntityType: 'world_element',
      affectsEntityId: elementId,
      affectsBooks: changes.affectsBooks || [],
      oldValue: this.extractElementValues(element, changes.changedFields),
      newValue: changes.newValues,
    });
  }

  /**
   * Create a retcon (retroactive continuity fix)
   */
  async createRetcon(
    seriesId: string,
    authorId: string,
    retcon: RetconRequest
  ): Promise<RevisionRequest> {
    return this.createRevisionRequest({
      seriesId,
      authorId,
      revisionType: 'retcon',
      revisionDescription: retcon.description,
      affectsEntityType: retcon.entityType,
      affectsEntityId: retcon.entityId,
      affectsBooks: retcon.affectsBooks || [],
      oldValue: retcon.originalFact,
      newValue: retcon.newFact,
    });
  }

  /**
   * Create a consistency fix
   */
  async createConsistencyFix(
    seriesId: string,
    authorId: string,
    fix: ConsistencyFixRequest
  ): Promise<RevisionRequest> {
    return this.createRevisionRequest({
      seriesId,
      authorId,
      revisionType: 'consistency_fix',
      revisionDescription: fix.description,
      affectsEntityType: fix.entityType,
      affectsEntityId: fix.entityId,
      affectsBooks: fix.affectsBooks || [],
      oldValue: fix.inconsistentValue,
      newValue: fix.consistentValue,
    });
  }

  /**
   * Core revision request creation
   */
  private async createRevisionRequest(params: {
    seriesId: string;
    authorId: string;
    revisionType: string;
    revisionDescription: string;
    affectsEntityType: string;
    affectsEntityId: string;
    affectsBooks: number[];
    oldValue: Record<string, any>;
    newValue: Record<string, any>;
  }): Promise<RevisionRequest> {
    const { data, error } = await this.supabase
      .from('revision_requests')
      .insert({
        series_id: params.seriesId,
        author_id: params.authorId,
        revision_type: params.revisionType,
        revision_description: params.revisionDescription,
        affects_entity_type: params.affectsEntityType,
        affects_entity_id: params.affectsEntityId,
        affects_books: params.affectsBooks,
        old_value: params.oldValue,
        new_value: params.newValue,
        propagation_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRevisionRequest(data);
  }

  // ==========================================================================
  // IMPACT ANALYSIS
  // ==========================================================================

  /**
   * Analyze the impact of a revision
   */
  async analyzeRevisionImpact(requestId: string): Promise<ImpactAnalysis> {
    // Update status
    await this.updateRequestStatus(requestId, 'analyzing');

    const request = await this.getRevisionRequest(requestId);
    if (!request) throw new Error('Revision request not found');

    const analysis: ImpactAnalysis = {
      requestId,
      affectedChapters: [],
      affectedElements: [],
      requiredChanges: {},
      cascadingEffects: [],
      riskLevel: 'low',
      estimatedChanges: 0,
    };

    // Find affected chapters
    const affectedChapters = await this.findAffectedChapters(request);
    analysis.affectedChapters = affectedChapters;

    // Find affected related elements
    const affectedElements = await this.findAffectedElements(request);
    analysis.affectedElements = affectedElements;

    // Analyze required changes per chapter
    for (const chapter of affectedChapters) {
      const changes = await this.analyzeChapterChanges(chapter, request);
      if (changes.length > 0) {
        analysis.requiredChanges[chapter.id] = changes;
        analysis.estimatedChanges += changes.length;
      }
    }

    // Analyze cascading effects
    analysis.cascadingEffects = await this.analyzeCascadingEffects(request, affectedElements);

    // Calculate risk level
    analysis.riskLevel = this.calculateRiskLevel(analysis);

    // Update request with analysis
    await this.supabase
      .from('revision_requests')
      .update({
        propagation_status: 'ready',
        affected_chapters: affectedChapters.map(c => c.id),
        required_changes: analysis.requiredChanges,
        ai_analysis: JSON.stringify(analysis),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    return analysis;
  }

  /**
   * Find chapters affected by the revision
   */
  private async findAffectedChapters(request: RevisionRequest): Promise<AffectedChapter[]> {
    const affectedChapters: AffectedChapter[] = [];

    // Get the entity being changed
    const entityName = await this.getEntityName(request.affectsEntityType, request.affectsEntityId);
    if (!entityName) return [];

    // Get all chapters that might reference this entity
    const { data: chapters } = await this.supabase
      .from('chapters')
      .select('id, story_id, title, content, chapter_number')
      .ilike('content', `%${entityName}%`);

    for (const chapter of chapters || []) {
      // Check if chapter is in affected books
      const book = await this.getBookForChapter(chapter.story_id);
      if (request.affectsBooks.length > 0 && book && !request.affectsBooks.includes(book.bookNumber)) {
        continue;
      }

      // Count occurrences
      const occurrences = (chapter.content.match(new RegExp(entityName, 'gi')) || []).length;

      affectedChapters.push({
        id: chapter.id,
        storyId: chapter.story_id,
        title: chapter.title,
        chapterNumber: chapter.chapter_number,
        occurrences,
        contentPreview: this.extractRelevantContext(chapter.content, entityName),
      });
    }

    return affectedChapters.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Find related elements that might be affected
   */
  private async findAffectedElements(request: RevisionRequest): Promise<AffectedElement[]> {
    const affected: AffectedElement[] = [];

    if (request.affectsEntityType === 'character') {
      // Find relationships
      const { data: relationships } = await this.supabase
        .from('character_relationships')
        .select('*')
        .or(`character_a_id.eq.${request.affectsEntityId},character_b_id.eq.${request.affectsEntityId}`);

      for (const rel of relationships || []) {
        affected.push({
          elementType: 'relationship',
          elementId: rel.id,
          reason: 'Character is part of this relationship',
          impactLevel: 'medium',
        });
      }

      // Find narrative arcs
      const { data: arcs } = await this.supabase
        .from('narrative_arcs')
        .select('*')
        .or(`primary_characters.cs.{${request.affectsEntityId}},secondary_characters.cs.{${request.affectsEntityId}}`);

      for (const arc of arcs || []) {
        affected.push({
          elementType: 'narrative_arc',
          elementId: arc.id,
          reason: 'Character is involved in this arc',
          impactLevel: arc.primary_characters?.includes(request.affectsEntityId) ? 'high' : 'low',
        });
      }
    }

    if (request.affectsEntityType === 'world_element') {
      // Find dependent elements
      const { data: dependents } = await this.supabase
        .from('world_elements')
        .select('*')
        .contains('depends_on', [request.affectsEntityId]);

      for (const dep of dependents || []) {
        affected.push({
          elementType: 'world_element',
          elementId: dep.id,
          reason: 'Element depends on the changed element',
          impactLevel: 'high',
        });
      }

      // Find related elements
      const { data: related } = await this.supabase
        .from('world_elements')
        .select('*')
        .contains('related_elements', [request.affectsEntityId]);

      for (const rel of related || []) {
        affected.push({
          elementType: 'world_element',
          elementId: rel.id,
          reason: 'Element is related to the changed element',
          impactLevel: 'low',
        });
      }
    }

    return affected;
  }

  /**
   * Analyze changes needed for a specific chapter
   */
  private async analyzeChapterChanges(
    chapter: AffectedChapter,
    request: RevisionRequest
  ): Promise<ChapterChange[]> {
    const changes: ChapterChange[] = [];
    const content = await this.getChapterContent(chapter.id);
    if (!content) return [];

    // Analyze based on revision type
    switch (request.revisionType) {
      case 'character_change':
        changes.push(...this.analyzeCharacterChanges(content, request));
        break;
      case 'world_change':
        changes.push(...this.analyzeWorldChanges(content, request));
        break;
      case 'retcon':
        changes.push(...this.analyzeRetconChanges(content, request));
        break;
      case 'consistency_fix':
        changes.push(...this.analyzeConsistencyChanges(content, request));
        break;
    }

    return changes;
  }

  /**
   * Analyze character-related changes needed
   */
  private analyzeCharacterChanges(content: string, request: RevisionRequest): ChapterChange[] {
    const changes: ChapterChange[] = [];
    const oldValues = request.oldValue;
    const newValues = request.newValue;

    // Name change
    if (oldValues.name !== newValues.name) {
      const nameRegex = new RegExp(oldValues.name, 'gi');
      const matches = content.match(nameRegex);
      if (matches && matches.length > 0) {
        changes.push({
          changeType: 'text_replacement',
          description: `Replace "${oldValues.name}" with "${newValues.name}"`,
          originalText: oldValues.name,
          suggestedText: newValues.name,
          occurrences: matches.length,
          autoApplicable: true,
        });
      }
    }

    // Dialogue style change
    if (oldValues.dialogueStyle !== newValues.dialogueStyle) {
      // Find dialogue attributed to this character
      const dialogueRegex = new RegExp(`"[^"]*"\\s*(${oldValues.name}|he|she)\\s+said`, 'gi');
      const dialogues = content.match(dialogueRegex);
      if (dialogues && dialogues.length > 0) {
        changes.push({
          changeType: 'dialogue_style',
          description: `Update dialogue style from "${oldValues.dialogueStyle}" to "${newValues.dialogueStyle}"`,
          originalText: '',
          suggestedText: '',
          occurrences: dialogues.length,
          autoApplicable: false,
          requiresReview: true,
        });
      }
    }

    // Physical description change
    if (oldValues.physicalDescription && newValues.physicalDescription) {
      const oldFeatures = oldValues.physicalDescription.distinguishingFeatures || [];
      const newFeatures = newValues.physicalDescription.distinguishingFeatures || [];
      
      for (const feature of oldFeatures) {
        if (!newFeatures.includes(feature)) {
          const featureLower = feature.toLowerCase();
          if (content.toLowerCase().includes(featureLower)) {
            changes.push({
              changeType: 'description_update',
              description: `Remove or update reference to "${feature}"`,
              originalText: feature,
              suggestedText: '',
              occurrences: 1,
              autoApplicable: false,
              requiresReview: true,
            });
          }
        }
      }
    }

    return changes;
  }

  /**
   * Analyze world-related changes needed
   */
  private analyzeWorldChanges(content: string, request: RevisionRequest): ChapterChange[] {
    const changes: ChapterChange[] = [];
    const oldValues = request.oldValue;
    const newValues = request.newValue;

    // Name change
    if (oldValues.name !== newValues.name) {
      const nameRegex = new RegExp(oldValues.name, 'gi');
      const matches = content.match(nameRegex);
      if (matches && matches.length > 0) {
        changes.push({
          changeType: 'text_replacement',
          description: `Replace "${oldValues.name}" with "${newValues.name}"`,
          originalText: oldValues.name,
          suggestedText: newValues.name,
          occurrences: matches.length,
          autoApplicable: true,
        });
      }
    }

    // Description change
    if (oldValues.shortDescription !== newValues.shortDescription) {
      const oldDesc = oldValues.shortDescription?.toLowerCase() || '';
      if (content.toLowerCase().includes(oldDesc)) {
        changes.push({
          changeType: 'description_update',
          description: 'Update world element description',
          originalText: oldValues.shortDescription,
          suggestedText: newValues.shortDescription,
          occurrences: 1,
          autoApplicable: false,
          requiresReview: true,
        });
      }
    }

    return changes;
  }

  /**
   * Analyze retcon changes needed
   */
  private analyzeRetconChanges(content: string, request: RevisionRequest): ChapterChange[] {
    const changes: ChapterChange[] = [];
    const oldFact = JSON.stringify(request.oldValue);
    const newFact = JSON.stringify(request.newValue);

    // Find any text that references the old fact
    for (const [key, value] of Object.entries(request.oldValue)) {
      if (typeof value === 'string' && content.toLowerCase().includes(value.toLowerCase())) {
        const newValue = request.newValue[key];
        if (newValue && newValue !== value) {
          changes.push({
            changeType: 'retcon',
            description: `Retcon: Change "${value}" to "${newValue}"`,
            originalText: value,
            suggestedText: newValue,
            occurrences: (content.match(new RegExp(value, 'gi')) || []).length,
            autoApplicable: false,
            requiresReview: true,
            isRetcon: true,
          });
        }
      }
    }

    return changes;
  }

  /**
   * Analyze consistency fix changes needed
   */
  private analyzeConsistencyChanges(content: string, request: RevisionRequest): ChapterChange[] {
    const changes: ChapterChange[] = [];

    for (const [key, value] of Object.entries(request.oldValue)) {
      if (typeof value === 'string' && content.toLowerCase().includes(value.toLowerCase())) {
        const consistentValue = request.newValue[key];
        if (consistentValue && consistentValue !== value) {
          changes.push({
            changeType: 'consistency_fix',
            description: `Fix inconsistency: "${value}" should be "${consistentValue}"`,
            originalText: value,
            suggestedText: consistentValue,
            occurrences: (content.match(new RegExp(value, 'gi')) || []).length,
            autoApplicable: true,
          });
        }
      }
    }

    return changes;
  }

  /**
   * Analyze cascading effects
   */
  private async analyzeCascadingEffects(
    request: RevisionRequest,
    affectedElements: AffectedElement[]
  ): Promise<CascadingEffect[]> {
    const effects: CascadingEffect[] = [];

    for (const element of affectedElements) {
      if (element.impactLevel === 'high') {
        effects.push({
          elementType: element.elementType,
          elementId: element.elementId,
          effectDescription: `Changes may cascade to ${element.elementType}: ${element.reason}`,
          severity: 'warning',
          requiresReview: true,
        });
      }
    }

    // Check for potential story logic breaks
    if (request.revisionType === 'character_change') {
      const character = await this.engine.getCharacter(request.affectsEntityId);
      if (character?.characterRole === 'protagonist' || character?.characterRole === 'antagonist') {
        effects.push({
          elementType: 'story_logic',
          elementId: request.affectsEntityId,
          effectDescription: 'Changing a main character may affect core story logic',
          severity: 'critical',
          requiresReview: true,
        });
      }
    }

    return effects;
  }

  // ==========================================================================
  // PROPAGATION EXECUTION
  // ==========================================================================

  /**
   * Execute the propagation of changes
   */
  async executePropagation(requestId: string, options: PropagationOptions = {}): Promise<PropagationResult> {
    await this.updateRequestStatus(requestId, 'in_progress');

    const request = await this.getRevisionRequest(requestId);
    if (!request) throw new Error('Revision request not found');

    const result: PropagationResult = {
      requestId,
      status: 'completed',
      changesApplied: 0,
      changesFailed: 0,
      changesSkipped: 0,
      appliedChanges: [],
      failedChanges: [],
      skippedChanges: [],
    };

    try {
      // Apply changes to each affected chapter
      for (const [chapterId, changes] of Object.entries(request.requiredChanges)) {
        for (const change of changes) {
          const changeResult = await this.applyChange(chapterId, change, options);
          
          if (changeResult.status === 'applied') {
            result.changesApplied++;
            result.appliedChanges.push({ chapterId, change: changeResult });
          } else if (changeResult.status === 'failed') {
            result.changesFailed++;
            result.failedChanges.push({ chapterId, change: changeResult, error: changeResult.error });
          } else {
            result.changesSkipped++;
            result.skippedChanges.push({ chapterId, change: changeResult, reason: changeResult.reason });
          }
        }
      }

      // Update the source entity
      await this.applyEntityUpdate(request);

      await this.updateRequestStatus(requestId, 'completed');
    } catch (error) {
      await this.updateRequestStatus(requestId, 'failed');
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Apply a single change to a chapter
   */
  private async applyChange(
    chapterId: string,
    change: ChapterChange,
    options: PropagationOptions
  ): Promise<ChangeResult> {
    // Skip if requires review and auto-only mode
    if (change.requiresReview && options.autoOnly) {
      return {
        status: 'skipped',
        reason: 'Requires manual review',
        change,
      };
    }

    // Skip if not auto-applicable and auto-only mode
    if (!change.autoApplicable && options.autoOnly) {
      return {
        status: 'skipped',
        reason: 'Not auto-applicable',
        change,
      };
    }

    try {
      const { data: chapter } = await this.supabase
        .from('chapters')
        .select('content')
        .eq('id', chapterId)
        .single();

      if (!chapter) {
        return {
          status: 'failed',
          error: 'Chapter not found',
          change,
        };
      }

      let newContent = chapter.content;

      if (change.changeType === 'text_replacement' && change.autoApplicable) {
        newContent = newContent.replace(
          new RegExp(change.originalText, 'gi'),
          change.suggestedText
        );
      }

      // Update chapter
      await this.supabase
        .from('chapters')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapterId);

      // Record the propagated change
      await this.supabase
        .from('propagated_changes')
        .insert({
          revision_request_id: options.requestId,
          chapter_id: chapterId,
          change_type: change.changeType,
          original_content: chapter.content,
          updated_content: newContent,
          status: 'applied',
          applied_at: new Date().toISOString(),
        });

      return {
        status: 'applied',
        change,
        newContent: change.suggestedText,
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        change,
      };
    }
  }

  /**
   * Apply update to the source entity
   */
  private async applyEntityUpdate(request: RevisionRequest): Promise<void> {
    const table = this.getTableForEntityType(request.affectsEntityType);
    
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(request.newValue)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updateData[snakeKey] = value;
    }
    updateData.updated_at = new Date().toISOString();

    await this.supabase
      .from(table)
      .update(updateData)
      .eq('id', request.affectsEntityId);
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getRevisionRequest(requestId: string): Promise<RevisionRequest | null> {
    const { data, error } = await this.supabase
      .from('revision_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) return null;
    return this.mapRevisionRequest(data);
  }

  private async updateRequestStatus(requestId: string, status: string): Promise<void> {
    await this.supabase
      .from('revision_requests')
      .update({
        propagation_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);
  }

  private async getEntityName(entityType: string, entityId: string): Promise<string | null> {
    const table = this.getTableForEntityType(entityType);
    const nameField = entityType === 'character' ? 'name' : 
                      entityType === 'world_element' ? 'name' : 'name';

    const { data } = await this.supabase
      .from(table)
      .select(nameField)
      .eq('id', entityId)
      .single();

    return data?.[nameField] || null;
  }

  private async getBookForChapter(storyId: string): Promise<{ bookNumber: number } | null> {
    const { data } = await this.supabase
      .from('series_books')
      .select('book_number')
      .eq('story_id', storyId)
      .single();

    return data ? { bookNumber: data.book_number } : null;
  }

  private async getChapterContent(chapterId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('chapters')
      .select('content')
      .eq('id', chapterId)
      .single();

    return data?.content || null;
  }

  private extractRelevantContext(content: string, term: string, contextLength: number = 200): string {
    const index = content.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(content.length, index + term.length + contextLength / 2);
    
    let context = content.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';
    
    return context;
  }

  private extractCharacterValues(character: PersistentCharacter, fields: string[]): Record<string, any> {
    const values: Record<string, any> = {};
    for (const field of fields) {
      values[field] = (character as any)[field];
    }
    return values;
  }

  private extractElementValues(element: any, fields: string[]): Record<string, any> {
    const values: Record<string, any> = {};
    for (const field of fields) {
      // Convert snake_case to camelCase for consistency
      const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      values[camelField] = element[field];
    }
    return values;
  }

  private getTableForEntityType(entityType: string): string {
    const tables: Record<string, string> = {
      character: 'persistent_characters',
      world_element: 'world_elements',
      relationship: 'character_relationships',
      timeline_event: 'timeline_events',
    };
    return tables[entityType] || entityType;
  }

  private calculateRiskLevel(analysis: ImpactAnalysis): 'low' | 'medium' | 'high' | 'critical' {
    const totalChanges = analysis.estimatedChanges;
    const cascadingCount = analysis.cascadingEffects.length;
    const criticalEffects = analysis.cascadingEffects.filter(e => e.severity === 'critical').length;

    if (criticalEffects > 0) return 'critical';
    if (totalChanges > 50 || cascadingCount > 10) return 'high';
    if (totalChanges > 20 || cascadingCount > 5) return 'medium';
    return 'low';
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
}

// ============================================================================
// TYPES
// ============================================================================

export interface CharacterChangeRequest {
  description: string;
  changedFields: string[];
  newValues: Record<string, any>;
  affectsBooks?: number[];
}

export interface WorldChangeRequest {
  description: string;
  changedFields: string[];
  newValues: Record<string, any>;
  affectsBooks?: number[];
}

export interface RetconRequest {
  description: string;
  entityType: string;
  entityId: string;
  originalFact: Record<string, any>;
  newFact: Record<string, any>;
  affectsBooks?: number[];
}

export interface ConsistencyFixRequest {
  description: string;
  entityType: string;
  entityId: string;
  inconsistentValue: Record<string, any>;
  consistentValue: Record<string, any>;
  affectsBooks?: number[];
}

export interface ImpactAnalysis {
  requestId: string;
  affectedChapters: AffectedChapter[];
  affectedElements: AffectedElement[];
  requiredChanges: Record<string, ChapterChange[]>;
  cascadingEffects: CascadingEffect[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedChanges: number;
}

export interface AffectedChapter {
  id: string;
  storyId: string;
  title: string;
  chapterNumber: number;
  occurrences: number;
  contentPreview: string;
}

export interface AffectedElement {
  elementType: string;
  elementId: string;
  reason: string;
  impactLevel: 'low' | 'medium' | 'high';
}

export interface ChapterChange {
  changeType: 'text_replacement' | 'dialogue_style' | 'description_update' | 'retcon' | 'consistency_fix';
  description: string;
  originalText: string;
  suggestedText: string;
  occurrences: number;
  autoApplicable: boolean;
  requiresReview?: boolean;
  isRetcon?: boolean;
}

export interface CascadingEffect {
  elementType: string;
  elementId: string;
  effectDescription: string;
  severity: 'info' | 'warning' | 'critical';
  requiresReview: boolean;
}

export interface PropagationOptions {
  requestId?: string;
  autoOnly?: boolean;
  dryRun?: boolean;
  skipReview?: boolean;
}

export interface PropagationResult {
  requestId: string;
  status: 'completed' | 'failed' | 'partial';
  changesApplied: number;
  changesFailed: number;
  changesSkipped: number;
  appliedChanges: Array<{ chapterId: string; change: ChangeResult }>;
  failedChanges: Array<{ chapterId: string; change: ChangeResult; error?: string }>;
  skippedChanges: Array<{ chapterId: string; change: ChangeResult; reason?: string }>;
  error?: string;
}

export interface ChangeResult {
  status: 'applied' | 'failed' | 'skipped';
  change: ChapterChange;
  newContent?: string;
  error?: string;
  reason?: string;
}

// Export singleton
export const revisionPropagation = new RevisionPropagationService();

