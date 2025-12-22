/**
 * Canon Enforcer Service
 * Guards the internal logic of the narrative aggressively.
 * No contradictions unless the author *chooses* to break reality.
 * Lore isn't flavor text; it's infrastructure.
 */

import { createClient } from '@/lib/supabase/client';
import { persistentNarrativeEngine } from './persistentNarrativeEngine';
import { worldbuildingArchive } from './worldbuildingArchive';
import type {
  CanonRule,
  CanonViolation,
  CanonLockLevel,
  PersistentCharacter,
  WorldElement,
  GenerationContext,
} from '@/types/narrativeEngine';

// ============================================================================
// CANON ENFORCER SERVICE
// ============================================================================

export class CanonEnforcer {
  private supabase = createClient();
  private engine = persistentNarrativeEngine;
  private world = worldbuildingArchive;

  // ==========================================================================
  // CANON RULE MANAGEMENT
  // ==========================================================================

  /**
   * Define a new canon rule
   */
  async defineRule(rule: DefineRuleInput): Promise<CanonRule> {
    // Validate rule doesn't conflict with existing rules
    const existingRules = await this.getRulesForCategory(rule.seriesId, rule.ruleCategory);
    const conflicts = this.findRuleConflicts(rule, existingRules);
    
    if (conflicts.length > 0) {
      throw new Error(`Rule conflicts with existing rules: ${conflicts.map(c => c.ruleName).join(', ')}`);
    }

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
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCanonRule(data);
  }

  /**
   * Lock an element as canon
   */
  async lockElement(
    entityType: 'character' | 'world_element' | 'relationship' | 'timeline_event',
    entityId: string,
    lockLevel: CanonLockLevel,
    lockedAttributes?: string[]
  ): Promise<void> {
    const table = this.getTableForEntityType(entityType);
    
    await this.supabase
      .from(table)
      .update({
        canon_lock_level: lockLevel,
        locked_attributes: lockedAttributes || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId);
  }

  /**
   * Declare a fact as immutable
   */
  async declareImmutableFact(
    seriesId: string,
    authorId: string,
    fact: {
      category: string;
      name: string;
      description: string;
      entityType?: string;
      entityId?: string;
    }
  ): Promise<CanonRule> {
    return this.defineRule({
      seriesId,
      authorId,
      ruleCategory: fact.category as any,
      ruleName: fact.name,
      ruleDescription: fact.description,
      ruleType: 'must',
      lockLevel: 'immutable',
      violationSeverity: 'critical',
      violationMessage: `This is an immutable fact that cannot be changed: ${fact.description}`,
      appliesToEntityType: fact.entityType,
      appliesToEntityIds: fact.entityId ? [fact.entityId] : [],
    });
  }

  /**
   * Get all rules for a series
   */
  async getSeriesRules(seriesId: string): Promise<CanonRule[]> {
    const { data, error } = await this.supabase
      .from('canon_rules')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('lock_level', { ascending: false })
      .order('rule_category');

    if (error) throw error;
    return (data || []).map(this.mapCanonRule);
  }

  /**
   * Get rules for a specific category
   */
  async getRulesForCategory(
    seriesId: string,
    category: string
  ): Promise<CanonRule[]> {
    const { data, error } = await this.supabase
      .from('canon_rules')
      .select('*')
      .eq('series_id', seriesId)
      .eq('rule_category', category)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map(this.mapCanonRule);
  }

  // ==========================================================================
  // CANON ENFORCEMENT
  // ==========================================================================

  /**
   * Enforce canon on generated content
   */
  async enforceCanon(
    seriesId: string,
    bookNumber: number,
    content: string,
    context: EnforcementContext
  ): Promise<EnforcementResult> {
    const violations: CanonViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Get applicable rules
    const rules = await this.getApplicableRules(seriesId, bookNumber);

    // Character enforcement
    if (context.charactersInvolved && context.charactersInvolved.length > 0) {
      const characterViolations = await this.enforceCharacterCanon(
        content,
        context.charactersInvolved,
        rules.filter(r => r.ruleCategory === 'character'),
        bookNumber
      );
      violations.push(...characterViolations);
    }

    // World element enforcement
    if (context.worldElementsReferenced && context.worldElementsReferenced.length > 0) {
      const worldViolations = await this.enforceWorldCanon(
        content,
        context.worldElementsReferenced,
        rules.filter(r => r.ruleCategory === 'world' || r.ruleCategory === 'system'),
        bookNumber
      );
      violations.push(...worldViolations);
    }

    // Timeline enforcement
    if (context.timelineReferences && context.timelineReferences.length > 0) {
      const timelineViolations = await this.enforceTimelineCanon(
        content,
        context.timelineReferences,
        rules.filter(r => r.ruleCategory === 'timeline'),
        bookNumber
      );
      violations.push(...timelineViolations);
    }

    // Relationship enforcement
    if (context.relationshipsInvolved && context.relationshipsInvolved.length > 0) {
      const relationshipViolations = await this.enforceRelationshipCanon(
        content,
        context.relationshipsInvolved,
        rules.filter(r => r.ruleCategory === 'relationship')
      );
      violations.push(...relationshipViolations);
    }

    // General rule enforcement
    const generalViolations = await this.enforceGeneralRules(
      content,
      rules.filter(r => !['character', 'world', 'system', 'timeline', 'relationship'].includes(r.ruleCategory))
    );
    violations.push(...generalViolations);

    // Record violations
    if (violations.length > 0) {
      await this.recordViolations(seriesId, violations);
    }

    // Generate suggestions for fixing violations
    for (const violation of violations) {
      const suggestion = this.generateFixSuggestion(violation);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return {
      isCanonCompliant: violations.filter(v => 
        v.violationType === 'critical' || v.violationType === 'error'
      ).length === 0,
      violations,
      warnings,
      suggestions,
      enforcedAt: new Date().toISOString(),
    };
  }

  /**
   * Get rules applicable to a specific book
   */
  async getApplicableRules(seriesId: string, bookNumber: number): Promise<CanonRule[]> {
    const { data, error } = await this.supabase
      .from('canon_rules')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .lte('applies_from_book', bookNumber)
      .or(`applies_until_book.is.null,applies_until_book.gte.${bookNumber}`);

    if (error) throw error;
    return (data || []).map(this.mapCanonRule);
  }

  /**
   * Enforce character-specific canon
   */
  private async enforceCharacterCanon(
    content: string,
    characterIds: string[],
    rules: CanonRule[],
    bookNumber: number
  ): Promise<CanonViolation[]> {
    const violations: CanonViolation[] = [];
    const contentLower = content.toLowerCase();

    for (const characterId of characterIds) {
      const character = await this.engine.getCharacter(characterId);
      if (!character) continue;

      const nameLower = character.name.toLowerCase();

      // Check character status violations
      if (character.currentStatus === 'deceased') {
        const alivePatterns = [
          `${nameLower} said`,
          `${nameLower} walked`,
          `${nameLower} ran`,
          `${nameLower} smiled`,
          `${nameLower} looked`,
          `${nameLower} spoke`,
          `${nameLower} asked`,
          `${nameLower} replied`,
        ];

        for (const pattern of alivePatterns) {
          if (contentLower.includes(pattern)) {
            violations.push(this.createViolation({
              ruleId: undefined,
              seriesId: character.seriesId!,
              violationType: 'character_status',
              description: `Character "${character.name}" is deceased but is described performing living actions`,
              content: this.extractContext(content, contentLower.indexOf(pattern)),
              severity: character.canonLockLevel === 'immutable' ? 'critical' : 'error',
            }));
            break;
          }
        }
      }

      // Check for physical description violations
      if (character.physicalDescription) {
        const events = await this.engine.getCharacterEvents(characterId);
        const physicalEvents = events.filter(e => e.eventType === 'physical' && e.isPermanent);

        for (const event of physicalEvents) {
          // Check if the content contradicts the physical change
          const contradictions = this.findPhysicalContradictions(
            content,
            character,
            event
          );
          violations.push(...contradictions);
        }
      }

      // Check locked attributes
      if (character.lockedAttributes && character.lockedAttributes.length > 0) {
        for (const attr of character.lockedAttributes) {
          const attrViolation = await this.checkLockedAttributeViolation(
            content,
            character,
            attr
          );
          if (attrViolation) {
            violations.push(attrViolation);
          }
        }
      }

      // Check character-specific rules
      const characterRules = rules.filter(r => 
        r.appliesToEntityIds.includes(characterId) ||
        r.appliesToEntityType === 'character'
      );

      for (const rule of characterRules) {
        const ruleViolation = this.checkRuleViolation(content, rule, { character });
        if (ruleViolation) {
          violations.push(ruleViolation);
        }
      }
    }

    return violations;
  }

  /**
   * Enforce world element canon
   */
  private async enforceWorldCanon(
    content: string,
    elementIds: string[],
    rules: CanonRule[],
    bookNumber: number
  ): Promise<CanonViolation[]> {
    const violations: CanonViolation[] = [];
    const contentLower = content.toLowerCase();

    for (const elementId of elementIds) {
      const element = await this.world.getElement(elementId);
      if (!element) continue;

      const nameLower = element.name.toLowerCase();

      // Check if destroyed element is referenced as active
      if (!element.isActive && element.destroyedInBook && element.destroyedInBook <= bookNumber) {
        // Check if content references it as still existing
        const activePatterns = [
          `in ${nameLower}`,
          `at ${nameLower}`,
          `the ${nameLower} stands`,
          `${nameLower} is`,
        ];

        for (const pattern of activePatterns) {
          if (contentLower.includes(pattern)) {
            // Check if it's a historical reference
            const historicalIndicators = ['was', 'used to', 'once', 'former', 'ruins'];
            const context = this.extractContext(content, contentLower.indexOf(pattern), 100);
            const isHistorical = historicalIndicators.some(ind => 
              context.toLowerCase().includes(ind)
            );

            if (!isHistorical) {
              violations.push(this.createViolation({
                ruleId: undefined,
                seriesId: element.seriesId,
                violationType: 'world_element',
                description: `"${element.name}" was destroyed in Book ${element.destroyedInBook} but is referenced as still existing`,
                content: context,
                severity: element.canonLockLevel === 'immutable' ? 'critical' : 'error',
              }));
              break;
            }
          }
        }
      }

      // Check element rules
      if (element.rules && element.rules.rules.length > 0) {
        for (const rule of element.rules.rules) {
          // This is a simplified check - would need NLP for thorough analysis
          const ruleKeywords = rule.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const mentionsRule = ruleKeywords.some(kw => contentLower.includes(kw));
          
          if (mentionsRule) {
            // Check if the rule is being violated
            const violatesRule = this.checkRuleText(content, rule, element.rules.constraints);
            if (violatesRule) {
              violations.push(this.createViolation({
                ruleId: undefined,
                seriesId: element.seriesId,
                violationType: 'world_rule',
                description: `Content may violate world rule: "${rule}"`,
                content: this.extractContext(content, contentLower.indexOf(ruleKeywords[0]!)),
                severity: 'warning',
              }));
            }
          }
        }
      }

      // Check element-specific canon rules
      const elementRules = rules.filter(r =>
        r.appliesToEntityIds.includes(elementId) ||
        r.appliesToEntityType === element.elementType
      );

      for (const rule of elementRules) {
        const ruleViolation = this.checkRuleViolation(content, rule, { element });
        if (ruleViolation) {
          violations.push(ruleViolation);
        }
      }
    }

    return violations;
  }

  /**
   * Enforce timeline canon
   */
  private async enforceTimelineCanon(
    content: string,
    timelineRefs: string[],
    rules: CanonRule[],
    bookNumber: number
  ): Promise<CanonViolation[]> {
    const violations: CanonViolation[] = [];
    
    // Get timeline events
    for (const eventId of timelineRefs) {
      const { data: event } = await this.supabase
        .from('timeline_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) continue;

      // Check for anachronisms
      if (event.sequence_number) {
        // Look for references to future events
        const futureEvents = await this.supabase
          .from('timeline_events')
          .select('*')
          .eq('series_id', event.series_id)
          .gt('sequence_number', event.sequence_number);

        for (const futureEvent of futureEvents.data || []) {
          const futureEventLower = futureEvent.event_name.toLowerCase();
          if (content.toLowerCase().includes(futureEventLower)) {
            // Check if it's prophecy or foreshadowing
            const prophetic = ['prophesied', 'foretold', 'destined', 'vision', 'dream'];
            const isProphetic = prophetic.some(p => 
              content.toLowerCase().includes(p)
            );

            if (!isProphetic) {
              violations.push(this.createViolation({
                ruleId: undefined,
                seriesId: event.series_id,
                violationType: 'timeline',
                description: `Reference to future event "${futureEvent.event_name}" before it occurs`,
                content: this.extractContext(content, content.toLowerCase().indexOf(futureEventLower)),
                severity: 'error',
              }));
            }
          }
        }
      }
    }

    return violations;
  }

  /**
   * Enforce relationship canon
   */
  private async enforceRelationshipCanon(
    content: string,
    relationshipIds: string[],
    rules: CanonRule[]
  ): Promise<CanonViolation[]> {
    const violations: CanonViolation[] = [];
    const contentLower = content.toLowerCase();

    for (const relId of relationshipIds) {
      const { data: rel } = await this.supabase
        .from('character_relationships')
        .select(`
          *,
          character_a:persistent_characters!character_a_id(name),
          character_b:persistent_characters!character_b_id(name)
        `)
        .eq('id', relId)
        .single();

      if (!rel) continue;

      const charAName = rel.character_a?.name?.toLowerCase();
      const charBName = rel.character_b?.name?.toLowerCase();

      if (!charAName || !charBName) continue;

      // Check for relationship inconsistencies
      if (rel.relationship_type_a_to_b === 'enemy' || rel.relationship_type_b_to_a === 'enemy') {
        // Enemies shouldn't be described as friends without explanation
        const friendlyPatterns = [
          `${charAName} and ${charBName} laughed`,
          `${charAName} hugged ${charBName}`,
          `${charBName} hugged ${charAName}`,
          `friends ${charAName} and ${charBName}`,
          `friends ${charBName} and ${charAName}`,
        ];

        for (const pattern of friendlyPatterns) {
          if (contentLower.includes(pattern)) {
            violations.push(this.createViolation({
              ruleId: undefined,
              seriesId: rel.series_id,
              violationType: 'relationship',
              description: `Characters ${rel.character_a?.name} and ${rel.character_b?.name} are enemies but are described acting friendly`,
              content: this.extractContext(content, contentLower.indexOf(pattern)),
              severity: 'warning',
            }));
            break;
          }
        }
      }

      // Check relationship-specific rules
      for (const rule of rules) {
        if (rule.appliesToEntityIds.includes(relId)) {
          const ruleViolation = this.checkRuleViolation(content, rule, { relationship: rel });
          if (ruleViolation) {
            violations.push(ruleViolation);
          }
        }
      }
    }

    return violations;
  }

  /**
   * Enforce general rules
   */
  private async enforceGeneralRules(
    content: string,
    rules: CanonRule[]
  ): Promise<CanonViolation[]> {
    const violations: CanonViolation[] = [];

    for (const rule of rules) {
      const violation = this.checkRuleViolation(content, rule, {});
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  // ==========================================================================
  // VIOLATION HANDLING
  // ==========================================================================

  /**
   * Record violations in the database
   */
  private async recordViolations(seriesId: string, violations: CanonViolation[]): Promise<void> {
    const records = violations.map(v => ({
      rule_id: v.ruleId,
      series_id: seriesId,
      violation_type: v.violationType,
      violation_description: v.violationDescription,
      violating_content: v.violatingContent,
      detected_by: 'system',
      resolution_status: 'pending',
    }));

    await this.supabase.from('canon_violations').insert(records);
  }

  /**
   * Get pending violations
   */
  async getPendingViolations(seriesId: string): Promise<CanonViolation[]> {
    const { data, error } = await this.supabase
      .from('canon_violations')
      .select('*')
      .eq('series_id', seriesId)
      .eq('resolution_status', 'pending')
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapCanonViolation);
  }

  /**
   * Resolve a violation
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

  /**
   * Override canon (intentionally break a rule)
   */
  async overrideCanon(
    seriesId: string,
    authorId: string,
    override: {
      ruleId?: string;
      entityType: string;
      entityId: string;
      overrideDescription: string;
      reason: string;
      effectiveFromBook: number;
    }
  ): Promise<void> {
    // Create override record
    await this.supabase
      .from('canon_violations')
      .insert({
        rule_id: override.ruleId,
        series_id: seriesId,
        violation_type: 'intentional_override',
        violation_description: override.overrideDescription,
        is_intentional_override: true,
        override_reason: override.reason,
        resolution_status: 'overridden',
        resolved_by: 'author',
        resolved_at: new Date().toISOString(),
      });

    // If there's a rule, deactivate or update it
    if (override.ruleId) {
      await this.supabase
        .from('canon_rules')
        .update({
          applies_until_book: override.effectiveFromBook - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', override.ruleId);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private findRuleConflicts(newRule: DefineRuleInput, existingRules: CanonRule[]): CanonRule[] {
    const conflicts: CanonRule[] = [];

    for (const existing of existingRules) {
      // Check for direct contradictions
      if (
        newRule.ruleType === 'must' && existing.ruleType === 'must_not' ||
        newRule.ruleType === 'must_not' && existing.ruleType === 'must'
      ) {
        // Check if they apply to the same entities
        const newEntities = new Set(newRule.appliesToEntityIds || []);
        const existingEntities = new Set(existing.appliesToEntityIds);
        const overlap = [...newEntities].some(e => existingEntities.has(e));

        if (overlap || newRule.appliesToEntityType === existing.appliesToEntityType) {
          conflicts.push(existing);
        }
      }
    }

    return conflicts;
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

  private createViolation(params: {
    ruleId?: string;
    seriesId: string;
    violationType: string;
    description: string;
    content: string;
    severity: 'warning' | 'error' | 'critical';
  }): CanonViolation {
    return {
      id: '',
      ruleId: params.ruleId,
      seriesId: params.seriesId,
      violationType: params.violationType,
      violationDescription: params.description,
      violatingContent: params.content,
      detectedAt: new Date().toISOString(),
      detectedBy: 'system',
      resolutionStatus: 'pending',
      isIntentionalOverride: false,
    };
  }

  private extractContext(content: string, position: number, length: number = 150): string {
    const start = Math.max(0, position - 50);
    const end = Math.min(content.length, position + length);
    return content.substring(start, end);
  }

  private findPhysicalContradictions(
    content: string,
    character: PersistentCharacter,
    event: any
  ): CanonViolation[] {
    const violations: CanonViolation[] = [];
    const contentLower = content.toLowerCase();
    const nameLower = character.name.toLowerCase();

    // Common physical changes and their contradictions
    if (event.eventDescription.toLowerCase().includes('lost') || 
        event.eventDescription.toLowerCase().includes('missing')) {
      
      // Extract what was lost
      const lostParts = ['eye', 'arm', 'hand', 'leg', 'finger'];
      for (const part of lostParts) {
        if (event.eventDescription.toLowerCase().includes(part)) {
          // Check for descriptions that suggest the part is intact
          const intactPatterns = [
            `${nameLower}'s ${part}s`, // plural suggesting both
            `${nameLower} raised both`,
            `both ${part}s`,
          ];

          for (const pattern of intactPatterns) {
            if (contentLower.includes(pattern)) {
              violations.push(this.createViolation({
                seriesId: character.seriesId!,
                violationType: 'physical_continuity',
                description: `${character.name} lost their ${part} but content suggests it's intact`,
                content: this.extractContext(content, contentLower.indexOf(pattern)),
                severity: event.canonLockLevel === 'immutable' ? 'critical' : 'error',
              }));
            }
          }
        }
      }
    }

    // Scars
    if (event.eventDescription.toLowerCase().includes('scar')) {
      // Check if content describes unmarked skin where scar should be
      // This would need more sophisticated NLP
    }

    return violations;
  }

  private async checkLockedAttributeViolation(
    content: string,
    character: PersistentCharacter,
    attribute: string
  ): Promise<CanonViolation | null> {
    // Get the locked value
    const attrPath = attribute.split('.');
    let lockedValue: any = character;
    for (const key of attrPath) {
      lockedValue = lockedValue?.[key];
    }

    if (!lockedValue) return null;

    // Check if content contradicts the locked value
    // This is a simplified check - would need NLP for thorough analysis
    const nameLower = character.name.toLowerCase();
    const valueLower = String(lockedValue).toLowerCase();

    // Check for contradictory statements
    const negations = [`${nameLower} was not ${valueLower}`, `${nameLower} wasn't ${valueLower}`];
    for (const negation of negations) {
      if (content.toLowerCase().includes(negation)) {
        return this.createViolation({
          seriesId: character.seriesId!,
          violationType: 'locked_attribute',
          description: `Content contradicts locked attribute "${attribute}" for ${character.name}`,
          content: this.extractContext(content, content.toLowerCase().indexOf(negation)),
          severity: 'error',
        });
      }
    }

    return null;
  }

  private checkRuleViolation(
    content: string,
    rule: CanonRule,
    context: { character?: PersistentCharacter; element?: WorldElement; relationship?: any }
  ): CanonViolation | null {
    const contentLower = content.toLowerCase();
    const ruleLower = rule.ruleDescription.toLowerCase();

    // Check invalid examples
    for (const invalid of rule.invalidExamples) {
      if (contentLower.includes(invalid.toLowerCase())) {
        return this.createViolation({
          ruleId: rule.id,
          seriesId: rule.seriesId,
          violationType: rule.ruleCategory,
          description: `Content matches invalid example for rule "${rule.ruleName}"`,
          content: this.extractContext(content, contentLower.indexOf(invalid.toLowerCase())),
          severity: rule.violationSeverity,
        });
      }
    }

    // Check rule keywords
    if (rule.ruleType === 'must_not') {
      // Extract forbidden terms from the rule description
      const forbidden = this.extractForbiddenFromRule(ruleLower);
      for (const term of forbidden) {
        if (contentLower.includes(term)) {
          return this.createViolation({
            ruleId: rule.id,
            seriesId: rule.seriesId,
            violationType: rule.ruleCategory,
            description: `Content may violate rule "${rule.ruleName}": ${rule.ruleDescription}`,
            content: this.extractContext(content, contentLower.indexOf(term)),
            severity: rule.violationSeverity,
          });
        }
      }
    }

    return null;
  }

  private checkRuleText(
    content: string,
    rule: string,
    constraints: string[]
  ): boolean {
    // Simplified check - would need NLP for real implementation
    const ruleLower = rule.toLowerCase();
    const contentLower = content.toLowerCase();

    // Check for constraint violations
    for (const constraint of constraints) {
      const constraintLower = constraint.toLowerCase();
      if (constraintLower.includes('cannot') || constraintLower.includes('never')) {
        const forbidden = constraintLower.replace(/cannot|never|must not/g, '').trim();
        if (contentLower.includes(forbidden)) {
          return true;
        }
      }
    }

    return false;
  }

  private extractForbiddenFromRule(ruleLower: string): string[] {
    const forbidden: string[] = [];
    
    // Extract terms after "cannot", "must not", "never"
    const patterns = [
      /cannot\s+(\w+)/g,
      /must not\s+(\w+)/g,
      /never\s+(\w+)/g,
      /forbidden to\s+(\w+)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(ruleLower)) !== null) {
        if (match[1]) {
          forbidden.push(match[1]);
        }
      }
    }

    return forbidden;
  }

  private generateFixSuggestion(violation: CanonViolation): string | null {
    switch (violation.violationType) {
      case 'character_status':
        return 'Consider using past tense, memories, or flashbacks when referencing this character';
      case 'physical_continuity':
        return 'Update the physical description to reflect the permanent change';
      case 'world_element':
        return 'Reference this element as destroyed/former, or use a flashback context';
      case 'timeline':
        return 'Remove the anachronistic reference or frame it as prophecy/vision';
      case 'relationship':
        return 'Update the interaction to reflect the current relationship status';
      default:
        return `Review and correct: ${violation.violationDescription}`;
    }
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

  private mapCanonViolation(data: any): CanonViolation {
    return {
      id: data.id,
      ruleId: data.rule_id,
      seriesId: data.series_id,
      bookId: data.book_id,
      chapterId: data.chapter_id,
      violationType: data.violation_type,
      violationDescription: data.violation_description,
      violatingContent: data.violating_content,
      detectedAt: data.detected_at,
      detectedBy: data.detected_by,
      resolutionStatus: data.resolution_status,
      resolutionAction: data.resolution_action,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by,
      isIntentionalOverride: data.is_intentional_override,
      overrideReason: data.override_reason,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface DefineRuleInput {
  seriesId: string;
  authorId: string;
  ruleCategory: 'character' | 'world' | 'plot' | 'timeline' | 'relationship' | 'system';
  ruleName: string;
  ruleDescription: string;
  ruleType?: 'must' | 'must_not' | 'should' | 'should_not' | 'may';
  appliesToEntityType?: string;
  appliesToEntityIds?: string[];
  appliesFromBook?: number;
  appliesUntilBook?: number;
  lockLevel?: CanonLockLevel;
  violationSeverity?: 'warning' | 'error' | 'critical';
  violationMessage?: string;
  validExamples?: string[];
  invalidExamples?: string[];
}

export interface EnforcementContext {
  charactersInvolved?: string[];
  worldElementsReferenced?: string[];
  timelineReferences?: string[];
  relationshipsInvolved?: string[];
  currentChapter?: number;
  currentBook?: number;
}

export interface EnforcementResult {
  isCanonCompliant: boolean;
  violations: CanonViolation[];
  warnings: string[];
  suggestions: string[];
  enforcedAt: string;
}

// Export singleton
export const canonEnforcer = new CanonEnforcer();

