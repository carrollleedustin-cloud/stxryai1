/**
 * Worldbuilding Archive Service
 * A living archive for geography, cultures, religions, magic systems, technology,
 * power structures, and all world elements. The world accretes history, scars,
 * politics, and myths - nothing exists in isolation.
 */

import { createClient } from '@/lib/supabase/client';
import type {
  WorldElement,
  WorldLocation,
  WorldSystem,
  WorldFaction,
  WorldElementType,
  CanonLockLevel,
} from '@/types/narrativeEngine';

// ============================================================================
// WORLDBUILDING ARCHIVE SERVICE
// ============================================================================

export class WorldbuildingArchive {
  private supabase = createClient();

  // ==========================================================================
  // WORLD ELEMENT MANAGEMENT
  // ==========================================================================

  /**
   * Create a new world element
   */
  async createElement(element: CreateWorldElementInput): Promise<WorldElement> {
    // Validate against existing elements if rules apply
    if (element.rules?.constraints) {
      await this.validateAgainstExisting(element);
    }

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
        is_active: true,
        canon_lock_level: element.canonLockLevel || 'soft',
        metadata: element.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    // If this element depends on others, update their related_elements
    if (element.dependsOn && element.dependsOn.length > 0) {
      await this.linkRelatedElements(data.id, element.dependsOn);
    }

    return this.mapWorldElement(data);
  }

  /**
   * Get the complete world state for a series
   */
  async getCompleteWorldState(seriesId: string): Promise<WorldState> {
    const [elements, locations, systems, factions] = await Promise.all([
      this.getElements(seriesId),
      this.getLocations(seriesId),
      this.getSystems(seriesId),
      this.getFactions(seriesId),
    ]);

    // Build element hierarchy
    const hierarchy = this.buildElementHierarchy(elements);

    // Build relationship graph
    const relationshipGraph = this.buildRelationshipGraph(elements);

    return {
      elements,
      locations,
      systems,
      factions,
      hierarchy,
      relationshipGraph,
      summary: this.generateWorldSummary(elements, locations, systems, factions),
    };
  }

  /**
   * Get elements by type
   */
  async getElements(seriesId: string, type?: WorldElementType): Promise<WorldElement[]> {
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
   * Get element with full context
   */
  async getElementWithContext(elementId: string): Promise<ElementWithContext> {
    const element = await this.getElement(elementId);
    if (!element) throw new Error('Element not found');

    // Get related elements
    const related =
      element.relatedElements.length > 0
        ? await this.supabase.from('world_elements').select('*').in('id', element.relatedElements)
        : { data: [] };

    // Get conflicting elements
    const conflicts =
      element.conflictsWith.length > 0
        ? await this.supabase.from('world_elements').select('*').in('id', element.conflictsWith)
        : { data: [] };

    // Get dependent elements
    const dependencies =
      element.dependsOn.length > 0
        ? await this.supabase.from('world_elements').select('*').in('id', element.dependsOn)
        : { data: [] };

    // Get children
    const children = await this.supabase
      .from('world_elements')
      .select('*')
      .eq('parent_element_id', elementId);

    // Get history
    const history = await this.supabase
      .from('world_element_history')
      .select('*')
      .eq('element_id', elementId)
      .order('created_at', { ascending: true });

    return {
      element,
      relatedElements: (related.data || []).map(this.mapWorldElement),
      conflictingElements: (conflicts.data || []).map(this.mapWorldElement),
      dependencies: (dependencies.data || []).map(this.mapWorldElement),
      children: (children.data || []).map(this.mapWorldElement),
      history: history.data || [],
    };
  }

  /**
   * Get a single element
   */
  async getElement(elementId: string): Promise<WorldElement | null> {
    const { data, error } = await this.supabase
      .from('world_elements')
      .select('*')
      .eq('id', elementId)
      .single();

    if (error) return null;
    return this.mapWorldElement(data);
  }

  /**
   * Update an element
   */
  async updateElement(
    elementId: string,
    updates: Partial<WorldElement>,
    recordHistory: boolean = true
  ): Promise<WorldElement> {
    const element = await this.getElement(elementId);
    if (!element) throw new Error('Element not found');

    // Check canon lock
    if (element.canonLockLevel === 'immutable') {
      throw new Error('This element is immutable and cannot be modified');
    }

    // Record history if requested
    if (recordHistory) {
      await this.recordElementHistory(elementId, 'update', {
        previous: element,
        changes: updates,
      });
    }

    const { data, error } = await this.supabase
      .from('world_elements')
      .update({
        name: updates.name ?? element.name,
        aliases: updates.aliases ?? element.aliases,
        short_description: updates.shortDescription ?? element.shortDescription,
        full_description: updates.fullDescription ?? element.fullDescription,
        visual_description: updates.visualDescription ?? element.visualDescription,
        category: updates.category ?? element.category,
        tags: updates.tags ?? element.tags,
        related_elements: updates.relatedElements ?? element.relatedElements,
        conflicts_with: updates.conflictsWith ?? element.conflictsWith,
        depends_on: updates.dependsOn ?? element.dependsOn,
        rules: updates.rules ?? element.rules,
        is_active: updates.isActive ?? element.isActive,
        destroyed_in_book: updates.destroyedInBook,
        destruction_reason: updates.destructionReason,
        canon_lock_level: updates.canonLockLevel ?? element.canonLockLevel,
        metadata: updates.metadata ?? element.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', elementId)
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldElement(data);
  }

  /**
   * Destroy/deactivate an element (with history)
   */
  async destroyElement(
    elementId: string,
    bookNumber: number,
    reason: string
  ): Promise<WorldElement> {
    return this.updateElement(
      elementId,
      {
        isActive: false,
        destroyedInBook: bookNumber,
        destructionReason: reason,
      },
      true
    );
  }

  // ==========================================================================
  // LOCATIONS
  // ==========================================================================

  /**
   * Create a location
   */
  async createLocation(location: CreateLocationInput): Promise<WorldLocation> {
    // First create the world element
    const element = await this.createElement({
      seriesId: location.seriesId,
      authorId: location.authorId,
      parentElementId: location.parentLocationId
        ? (await this.getLocationElement(location.parentLocationId))?.id
        : undefined,
      elementType: 'geography',
      name: location.name,
      shortDescription: location.description,
      fullDescription: location.fullDescription,
      visualDescription: location.visualDescription,
      category: location.locationType,
      tags: location.tags || [],
      introducedInBook: location.introducedInBook,
      introducedInChapter: location.introducedInChapter,
      canonLockLevel: location.canonLockLevel,
    });

    // Then create the location specifics
    const { data, error } = await this.supabase
      .from('world_locations')
      .insert({
        element_id: element.id,
        series_id: location.seriesId,
        location_type: location.locationType,
        coordinates: location.coordinates || {},
        parent_location_id: location.parentLocationId,
        population: location.population,
        climate: location.climate,
        terrain: location.terrain,
        resources: location.resources || [],
        hazards: location.hazards || [],
        controlling_faction: location.controllingFaction,
        government_type: location.governmentType,
        connected_locations: location.connectedLocations || [],
        travel_times: location.travelTimes || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldLocation(data);
  }

  /**
   * Get all locations for a series
   */
  async getLocations(seriesId: string): Promise<WorldLocation[]> {
    const { data, error } = await this.supabase
      .from('world_locations')
      .select('*')
      .eq('series_id', seriesId)
      .order('location_type')
      .order('created_at');

    if (error) throw error;
    return (data || []).map(this.mapWorldLocation);
  }

  /**
   * Get location hierarchy (e.g., Continent > Country > City > Building)
   */
  async getLocationHierarchy(seriesId: string): Promise<LocationNode[]> {
    const locations = await this.getLocations(seriesId);
    return this.buildLocationTree(locations);
  }

  /**
   * Calculate travel time between locations
   */
  async getTravelTime(
    fromLocationId: string,
    toLocationId: string
  ): Promise<{ time: string; method: string } | null> {
    const from = await this.getLocation(fromLocationId);
    if (!from) return null;

    // Check direct connection
    if (from.travelTimes[toLocationId]) {
      return {
        time: from.travelTimes[toLocationId],
        method: 'direct',
      };
    }

    // Would need pathfinding for indirect routes
    return null;
  }

  /**
   * Get a single location
   */
  async getLocation(locationId: string): Promise<WorldLocation | null> {
    const { data, error } = await this.supabase
      .from('world_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) return null;
    return this.mapWorldLocation(data);
  }

  private async getLocationElement(locationId: string): Promise<WorldElement | null> {
    const location = await this.getLocation(locationId);
    if (!location) return null;
    return this.getElement(location.elementId);
  }

  // ==========================================================================
  // MAGIC/TECHNOLOGY SYSTEMS
  // ==========================================================================

  /**
   * Create a world system (magic, technology, etc.)
   */
  async createSystem(system: CreateSystemInput): Promise<WorldSystem> {
    // Create the base world element
    const element = await this.createElement({
      seriesId: system.seriesId,
      authorId: system.authorId,
      elementType: system.systemType === 'magic' ? 'magic_system' : 'technology',
      name: system.systemName,
      shortDescription: system.description,
      fullDescription: system.fullDescription,
      rules: {
        rules: system.fundamentalLaws || [],
        constraints: system.limitations || [],
        exceptions: [],
      },
      canonLockLevel: system.canonLockLevel || 'hard', // Systems should be more strictly enforced
    });

    // Create the system specifics
    const { data, error } = await this.supabase
      .from('world_systems')
      .insert({
        element_id: element.id,
        series_id: system.seriesId,
        system_type: system.systemType,
        system_name: system.systemName,
        fundamental_laws: system.fundamentalLaws || [],
        energy_source: system.energySource,
        limitations: system.limitations || [],
        costs: system.costs || [],
        power_levels: system.powerLevels || { levels: [], descriptions: [] },
        who_can_use: system.whoCanUse,
        training_required: system.trainingRequired ?? true,
        hereditary: system.hereditary ?? false,
        known_abilities: system.knownAbilities || [],
        taboos: system.taboos || [],
        dangers: system.dangers || [],
        canon_lock_level: system.canonLockLevel || 'hard',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldSystem(data);
  }

  /**
   * Get all systems for a series
   */
  async getSystems(seriesId: string): Promise<WorldSystem[]> {
    const { data, error } = await this.supabase
      .from('world_systems')
      .select('*')
      .eq('series_id', seriesId)
      .order('system_type')
      .order('system_name');

    if (error) throw error;
    return (data || []).map(this.mapWorldSystem);
  }

  /**
   * Validate an ability against system rules
   */
  async validateAbilityAgainstSystem(
    systemId: string,
    ability: {
      name: string;
      description: string;
      effects: string[];
    }
  ): Promise<ValidationResult> {
    const system = await this.getSystem(systemId);
    if (!system) return { valid: false, issues: ['System not found'] };

    const issues: string[] = [];

    // Check against fundamental laws
    for (const law of system.fundamentalLaws) {
      // This would need NLP analysis in practice
      // For now, we check for obvious conflicts
      const lawLower = law.toLowerCase();
      const descLower = ability.description.toLowerCase();

      if (lawLower.includes('cannot') || lawLower.includes('impossible')) {
        // Check if the ability description contradicts this
        const forbiddenTerms = this.extractForbiddenTerms(lawLower);
        for (const term of forbiddenTerms) {
          if (descLower.includes(term)) {
            issues.push(`Ability may violate fundamental law: "${law}"`);
          }
        }
      }
    }

    // Check against limitations
    for (const limitation of system.limitations) {
      const limitLower = limitation.toLowerCase();
      const descLower = ability.description.toLowerCase();

      if (limitLower.includes('only') || limitLower.includes('must')) {
        // Check if the ability respects the limitation
        const requiredTerms = this.extractRequiredTerms(limitLower);
        const hasRequired = requiredTerms.some((term) => descLower.includes(term));
        if (!hasRequired && requiredTerms.length > 0) {
          issues.push(`Ability may not respect limitation: "${limitation}"`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings: issues.length > 0 ? ['Review ability for consistency with system rules'] : [],
    };
  }

  /**
   * Get a single system
   */
  async getSystem(systemId: string): Promise<WorldSystem | null> {
    const { data, error } = await this.supabase
      .from('world_systems')
      .select('*')
      .eq('id', systemId)
      .single();

    if (error) return null;
    return this.mapWorldSystem(data);
  }

  // ==========================================================================
  // FACTIONS
  // ==========================================================================

  /**
   * Create a faction
   */
  async createFaction(faction: CreateFactionInput): Promise<WorldFaction> {
    // Create the base world element
    const element = await this.createElement({
      seriesId: faction.seriesId,
      authorId: faction.authorId,
      elementType: 'political',
      name: faction.factionName,
      shortDescription: faction.description,
      fullDescription: faction.fullDescription,
      category: faction.factionType,
      relatedElements: [...(faction.alliedFactions || []), ...(faction.enemyFactions || [])],
      conflictsWith: faction.enemyFactions || [],
      introducedInBook: faction.introducedInBook,
      canonLockLevel: faction.canonLockLevel,
    });

    // Create the faction specifics
    const { data, error } = await this.supabase
      .from('world_factions')
      .insert({
        element_id: element.id,
        series_id: faction.seriesId,
        faction_name: faction.factionName,
        faction_type: faction.factionType,
        leadership_type: faction.leadershipType,
        hierarchy_structure: faction.hierarchyStructure,
        public_goals: faction.publicGoals || [],
        secret_goals: faction.secretGoals || [],
        power_base: faction.powerBase,
        military_strength: faction.militaryStrength,
        economic_power: faction.economicPower,
        allied_factions: faction.alliedFactions || [],
        enemy_factions: faction.enemyFactions || [],
        leader_id: faction.leaderId,
        key_members: faction.keyMembers || [],
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWorldFaction(data);
  }

  /**
   * Get all factions for a series
   */
  async getFactions(seriesId: string): Promise<WorldFaction[]> {
    const { data, error } = await this.supabase
      .from('world_factions')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('faction_type')
      .order('faction_name');

    if (error) throw error;
    return (data || []).map(this.mapWorldFaction);
  }

  /**
   * Get faction relationship map
   */
  async getFactionRelationshipMap(seriesId: string): Promise<FactionRelationshipMap> {
    const factions = await this.getFactions(seriesId);
    const relationships: FactionRelationship[] = [];

    for (const faction of factions) {
      for (const allyId of faction.alliedFactions) {
        const ally = factions.find((f) => f.id === allyId);
        if (ally) {
          relationships.push({
            factionA: faction.factionName,
            factionB: ally.factionName,
            relationship: 'ally',
            strength: 'strong', // Would need more data to determine
          });
        }
      }

      for (const enemyId of faction.enemyFactions) {
        const enemy = factions.find((f) => f.id === enemyId);
        if (enemy) {
          relationships.push({
            factionA: faction.factionName,
            factionB: enemy.factionName,
            relationship: 'enemy',
            strength: 'strong',
          });
        }
      }
    }

    return {
      factions: factions.map((f) => ({ id: f.id, name: f.factionName, type: f.factionType })),
      relationships,
    };
  }

  /**
   * Get a single faction
   */
  async getFaction(factionId: string): Promise<WorldFaction | null> {
    const { data, error } = await this.supabase
      .from('world_factions')
      .select('*')
      .eq('id', factionId)
      .single();

    if (error) return null;
    return this.mapWorldFaction(data);
  }

  // ==========================================================================
  // HISTORY & CONSISTENCY
  // ==========================================================================

  /**
   * Record element history
   */
  async recordElementHistory(
    elementId: string,
    changeType: string,
    details: {
      previous?: Partial<WorldElement>;
      changes?: Partial<WorldElement>;
      bookId?: string;
      chapterId?: string;
      cause?: string;
      affectedElements?: string[];
      affectedCharacters?: string[];
    }
  ): Promise<void> {
    await this.supabase.from('world_element_history').insert({
      element_id: elementId,
      book_id: details.bookId,
      chapter_id: details.chapterId,
      change_description: `${changeType}: ${JSON.stringify(details.changes || {})}`,
      change_cause: details.cause,
      change_type: changeType,
      previous_state: details.previous || {},
      new_state: details.changes || {},
      affected_elements: details.affectedElements || [],
      affected_characters: details.affectedCharacters || [],
      is_canon: true,
    });
  }

  /**
   * Get element history
   */
  async getElementHistory(elementId: string): Promise<ElementHistoryEntry[]> {
    const { data, error } = await this.supabase
      .from('world_element_history')
      .select('*')
      .eq('element_id', elementId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check for consistency issues in the world
   */
  async checkWorldConsistency(seriesId: string): Promise<ConsistencyCheckResult> {
    const issues: WorldConsistencyIssue[] = [];

    // Get all elements
    const elements = await this.getElements(seriesId);
    const systems = await this.getSystems(seriesId);
    const factions = await this.getFactions(seriesId);

    // Check for circular dependencies
    for (const element of elements) {
      const circularDeps = await this.checkCircularDependencies(element.id, elements);
      if (circularDeps.length > 0) {
        issues.push({
          type: 'circular_dependency',
          severity: 'error',
          description: `Circular dependency detected: ${circularDeps.join(' -> ')}`,
          affectedElements: circularDeps,
        });
      }
    }

    // Check for conflicting rules in systems
    for (let i = 0; i < systems.length; i++) {
      for (let j = i + 1; j < systems.length; j++) {
        const conflicts = this.findSystemConflicts(systems[i], systems[j]);
        if (conflicts.length > 0) {
          issues.push({
            type: 'rule_conflict',
            severity: 'warning',
            description: `Potential rule conflict between ${systems[i].systemName} and ${systems[j].systemName}`,
            affectedElements: [systems[i].id, systems[j].id],
            details: conflicts,
          });
        }
      }
    }

    // Check for faction relationship inconsistencies
    for (const faction of factions) {
      // Enemy of my ally should not be my ally
      for (const allyId of faction.alliedFactions) {
        const ally = factions.find((f) => f.id === allyId);
        if (ally) {
          const sharedEnemies = ally.enemyFactions.filter((e) =>
            faction.alliedFactions.includes(e)
          );
          if (sharedEnemies.length > 0) {
            const enemyNames = sharedEnemies.map(
              (id) => factions.find((f) => f.id === id)?.factionName
            );
            issues.push({
              type: 'relationship_conflict',
              severity: 'warning',
              description: `${faction.factionName} is allied with both ${ally.factionName} and ${enemyNames.join(', ')}, who are enemies`,
              affectedElements: [faction.id, allyId, ...sharedEnemies],
            });
          }
        }
      }
    }

    return {
      isConsistent: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
      checkedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async validateAgainstExisting(element: CreateWorldElementInput): Promise<void> {
    const existing = await this.getElements(element.seriesId, element.elementType);

    // Check for name conflicts
    const nameConflict = existing.find((e) => e.name.toLowerCase() === element.name.toLowerCase());
    if (nameConflict) {
      throw new Error(`An element with the name "${element.name}" already exists`);
    }
  }

  private async linkRelatedElements(newElementId: string, relatedIds: string[]): Promise<void> {
    for (const relatedId of relatedIds) {
      const related = await this.getElement(relatedId);
      if (related && !related.relatedElements.includes(newElementId)) {
        await this.updateElement(
          relatedId,
          {
            relatedElements: [...related.relatedElements, newElementId],
          },
          false
        );
      }
    }
  }

  private buildElementHierarchy(elements: WorldElement[]): ElementNode[] {
    const rootElements = elements.filter((e) => !e.parentElementId);

    // Track visited elements to prevent infinite recursion from circular references
    const visited = new Set<string>();

    const buildNode = (element: WorldElement): ElementNode => {
      // Guard against circular references
      if (visited.has(element.id)) {
        console.warn(`Circular reference detected for element: ${element.id} (${element.name})`);
        return {
          element,
          children: [], // Stop recursion at circular reference
        };
      }

      visited.add(element.id);

      const node: ElementNode = {
        element,
        children: elements.filter((e) => e.parentElementId === element.id).map(buildNode),
      };

      // Remove from visited after processing children to allow same element
      // to appear in different branches (though this shouldn't happen with proper parent-child)
      visited.delete(element.id);

      return node;
    };

    return rootElements.map(buildNode);
  }

  private buildRelationshipGraph(elements: WorldElement[]): RelationshipEdge[] {
    const edges: RelationshipEdge[] = [];

    for (const element of elements) {
      for (const relatedId of element.relatedElements) {
        edges.push({
          from: element.id,
          to: relatedId,
          type: 'related',
        });
      }
      for (const conflictId of element.conflictsWith) {
        edges.push({
          from: element.id,
          to: conflictId,
          type: 'conflicts',
        });
      }
      for (const dependencyId of element.dependsOn) {
        edges.push({
          from: element.id,
          to: dependencyId,
          type: 'depends',
        });
      }
    }

    return edges;
  }

  private buildLocationTree(locations: WorldLocation[]): LocationNode[] {
    const rootLocations = locations.filter((l) => !l.parentLocationId);

    const buildNode = (location: WorldLocation): LocationNode => ({
      location,
      children: locations.filter((l) => l.parentLocationId === location.id).map(buildNode),
    });

    return rootLocations.map(buildNode);
  }

  private generateWorldSummary(
    elements: WorldElement[],
    locations: WorldLocation[],
    systems: WorldSystem[],
    factions: WorldFaction[]
  ): WorldSummary {
    return {
      totalElements: elements.length,
      byType: {
        geography: elements.filter((e) => e.elementType === 'geography').length,
        culture: elements.filter((e) => e.elementType === 'culture').length,
        religion: elements.filter((e) => e.elementType === 'religion').length,
        magic_system: elements.filter((e) => e.elementType === 'magic_system').length,
        technology: elements.filter((e) => e.elementType === 'technology').length,
        political: elements.filter((e) => e.elementType === 'political').length,
      },
      totalLocations: locations.length,
      totalSystems: systems.length,
      totalFactions: factions.length,
      activeFactions: factions.filter((f) => f.isActive).length,
    };
  }

  private async checkCircularDependencies(
    elementId: string,
    allElements: WorldElement[],
    visited: string[] = []
  ): Promise<string[]> {
    if (visited.includes(elementId)) {
      return [...visited, elementId];
    }

    const element = allElements.find((e) => e.id === elementId);
    if (!element) return [];

    for (const depId of element.dependsOn) {
      const result = await this.checkCircularDependencies(depId, allElements, [
        ...visited,
        elementId,
      ]);
      if (result.length > 0) return result;
    }

    return [];
  }

  private findSystemConflicts(systemA: WorldSystem, systemB: WorldSystem): string[] {
    const conflicts: string[] = [];

    // Check if fundamental laws contradict each other
    for (const lawA of systemA.fundamentalLaws) {
      for (const lawB of systemB.fundamentalLaws) {
        if (this.lawsConflict(lawA, lawB)) {
          conflicts.push(`"${lawA}" may conflict with "${lawB}"`);
        }
      }
    }

    return conflicts;
  }

  private lawsConflict(lawA: string, lawB: string): boolean {
    // Simple heuristic - check for opposite terms
    const aLower = lawA.toLowerCase();
    const bLower = lawB.toLowerCase();

    const opposites = [
      ['always', 'never'],
      ['can', 'cannot'],
      ['possible', 'impossible'],
      ['must', 'must not'],
    ];

    for (const [term1, term2] of opposites) {
      if (
        (aLower.includes(term1) && bLower.includes(term2)) ||
        (aLower.includes(term2) && bLower.includes(term1))
      ) {
        // Check if they're talking about the same subject
        const wordsA = new Set(aLower.split(/\s+/));
        const wordsB = new Set(bLower.split(/\s+/));
        const intersection = [...wordsA].filter((w) => wordsB.has(w));
        if (intersection.length > 3) {
          return true;
        }
      }
    }

    return false;
  }

  private extractForbiddenTerms(law: string): string[] {
    const forbidden: string[] = [];

    // Use regex with capture groups to properly extract the forbidden action/term
    const cannotMatches = law.matchAll(/cannot\s+(\w+(?:\s+\w+)?)/gi);
    const impossibleMatches = law.matchAll(/impossible\s+to\s+(\w+(?:\s+\w+)?)/gi);

    for (const match of cannotMatches) {
      if (match[1]) forbidden.push(match[1].trim());
    }
    for (const match of impossibleMatches) {
      if (match[1]) forbidden.push(match[1].trim());
    }

    return forbidden;
  }

  private extractRequiredTerms(limitation: string): string[] {
    const required: string[] = [];

    // Use regex with capture groups to properly extract the required action/term
    const onlyMatches = limitation.matchAll(/only\s+(\w+(?:\s+\w+)?)/gi);
    const mustMatches = limitation.matchAll(/must\s+(\w+(?:\s+\w+)?)/gi);

    for (const match of onlyMatches) {
      if (match[1]) required.push(match[1].trim());
    }
    for (const match of mustMatches) {
      if (match[1]) required.push(match[1].trim());
    }

    return required;
  }

  // ==========================================================================
  // MAPPING FUNCTIONS
  // ==========================================================================

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

  private mapWorldLocation(data: any): WorldLocation {
    return {
      id: data.id,
      elementId: data.element_id,
      seriesId: data.series_id,
      locationType: data.location_type,
      coordinates: data.coordinates || {},
      parentLocationId: data.parent_location_id,
      population: data.population,
      climate: data.climate,
      terrain: data.terrain,
      resources: data.resources || [],
      hazards: data.hazards || [],
      controllingFaction: data.controlling_faction,
      governmentType: data.government_type,
      connectedLocations: data.connected_locations || [],
      travelTimes: data.travel_times || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapWorldSystem(data: any): WorldSystem {
    return {
      id: data.id,
      elementId: data.element_id,
      seriesId: data.series_id,
      systemType: data.system_type,
      systemName: data.system_name,
      fundamentalLaws: data.fundamental_laws || [],
      energySource: data.energy_source,
      limitations: data.limitations || [],
      costs: data.costs || [],
      powerLevels: data.power_levels || { levels: [], descriptions: [] },
      whoCanUse: data.who_can_use,
      trainingRequired: data.training_required,
      hereditary: data.hereditary,
      knownAbilities: data.known_abilities || [],
      taboos: data.taboos || [],
      dangers: data.dangers || [],
      canonLockLevel: data.canon_lock_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapWorldFaction(data: any): WorldFaction {
    return {
      id: data.id,
      elementId: data.element_id,
      seriesId: data.series_id,
      factionName: data.faction_name,
      factionType: data.faction_type,
      leadershipType: data.leadership_type,
      hierarchyStructure: data.hierarchy_structure,
      publicGoals: data.public_goals || [],
      secretGoals: data.secret_goals || [],
      powerBase: data.power_base,
      militaryStrength: data.military_strength,
      economicPower: data.economic_power,
      alliedFactions: data.allied_factions || [],
      enemyFactions: data.enemy_factions || [],
      leaderId: data.leader_id,
      keyMembers: data.key_members || [],
      isActive: data.is_active,
      dissolvedInBook: data.dissolved_in_book,
      dissolutionReason: data.dissolution_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface CreateWorldElementInput {
  seriesId: string;
  authorId: string;
  parentElementId?: string;
  elementType: WorldElementType;
  name: string;
  aliases?: string[];
  shortDescription?: string;
  fullDescription?: string;
  visualDescription?: string;
  category?: string;
  tags?: string[];
  relatedElements?: string[];
  conflictsWith?: string[];
  dependsOn?: string[];
  rules?: { rules: string[]; constraints: string[]; exceptions: string[] };
  introducedInBook?: number;
  introducedInChapter?: number;
  canonLockLevel?: CanonLockLevel;
  metadata?: Record<string, any>;
}

export interface CreateLocationInput {
  seriesId: string;
  authorId: string;
  name: string;
  description?: string;
  fullDescription?: string;
  visualDescription?: string;
  locationType: string;
  tags?: string[];
  parentLocationId?: string;
  coordinates?: { lat?: number; lng?: number; custom?: Record<string, any> };
  population?: string;
  climate?: string;
  terrain?: string;
  resources?: string[];
  hazards?: string[];
  controllingFaction?: string;
  governmentType?: string;
  connectedLocations?: string[];
  travelTimes?: Record<string, string>;
  introducedInBook?: number;
  introducedInChapter?: number;
  canonLockLevel?: CanonLockLevel;
}

export interface CreateSystemInput {
  seriesId: string;
  authorId: string;
  systemType: string;
  systemName: string;
  description?: string;
  fullDescription?: string;
  fundamentalLaws?: string[];
  energySource?: string;
  limitations?: string[];
  costs?: string[];
  powerLevels?: { levels: string[]; descriptions: string[] };
  whoCanUse?: string;
  trainingRequired?: boolean;
  hereditary?: boolean;
  knownAbilities?: Array<{
    name: string;
    description: string;
    requirements: string[];
    effects: string[];
  }>;
  taboos?: string[];
  dangers?: string[];
  canonLockLevel?: CanonLockLevel;
}

export interface CreateFactionInput {
  seriesId: string;
  authorId: string;
  factionName: string;
  factionType?: string;
  description?: string;
  fullDescription?: string;
  leadershipType?: string;
  hierarchyStructure?: string;
  publicGoals?: string[];
  secretGoals?: string[];
  powerBase?: string;
  militaryStrength?: string;
  economicPower?: string;
  alliedFactions?: string[];
  enemyFactions?: string[];
  leaderId?: string;
  keyMembers?: string[];
  introducedInBook?: number;
  canonLockLevel?: CanonLockLevel;
}

export interface WorldState {
  elements: WorldElement[];
  locations: WorldLocation[];
  systems: WorldSystem[];
  factions: WorldFaction[];
  hierarchy: ElementNode[];
  relationshipGraph: RelationshipEdge[];
  summary: WorldSummary;
}

export interface ElementWithContext {
  element: WorldElement;
  relatedElements: WorldElement[];
  conflictingElements: WorldElement[];
  dependencies: WorldElement[];
  children: WorldElement[];
  history: ElementHistoryEntry[];
}

export interface ElementNode {
  element: WorldElement;
  children: ElementNode[];
}

export interface LocationNode {
  location: WorldLocation;
  children: LocationNode[];
}

export interface RelationshipEdge {
  from: string;
  to: string;
  type: 'related' | 'conflicts' | 'depends';
}

export interface WorldSummary {
  totalElements: number;
  byType: Record<string, number>;
  totalLocations: number;
  totalSystems: number;
  totalFactions: number;
  activeFactions: number;
}

export interface ElementHistoryEntry {
  id: string;
  elementId: string;
  bookId?: string;
  chapterId?: string;
  changeDescription: string;
  changeCause?: string;
  changeType: string;
  previousState: Record<string, any>;
  newState: Record<string, any>;
  affectedElements: string[];
  affectedCharacters: string[];
  isCanon: boolean;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings?: string[];
}

export interface FactionRelationshipMap {
  factions: Array<{ id: string; name: string; type?: string }>;
  relationships: FactionRelationship[];
}

export interface FactionRelationship {
  factionA: string;
  factionB: string;
  relationship: 'ally' | 'enemy' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  issues: WorldConsistencyIssue[];
  checkedAt: string;
}

export interface WorldConsistencyIssue {
  type: 'circular_dependency' | 'rule_conflict' | 'relationship_conflict' | 'missing_dependency';
  severity: 'error' | 'warning' | 'info';
  description: string;
  affectedElements: string[];
  details?: string[];
}

// Export singleton
export const worldbuildingArchive = new WorldbuildingArchive();
