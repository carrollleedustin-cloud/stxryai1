/**
 * Reader Persona Service
 * Persistent reader characters that travel across stories with evolving stats
 */

import { createClient } from '@/lib/supabase/client';

export interface ReaderPersona {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  backgroundStory: string | null;
  personalityTraits: string[];
  preferredChoices: Record<string, string>;
  stats: {
    strength: number;
    intelligence: number;
    charisma: number;
    luck: number;
    [key: string]: number;
  };
  experiencePoints: number;
  level: number;
  isActive: boolean;
  createdAt: string;
}

export interface PersonaStoryState {
  personaId: string;
  storyId: string;
  currentStats: Record<string, number>;
  inventory: string[];
  relationships: Record<string, number>;
  flags: Record<string, any>;
  choicesMade: Array<{ chapterId: string; choiceText: string }>;
}

export interface PersonaAchievement {
  achievementName: string;
  storyId: string | null;
  earnedAt: string;
}

export interface PersonaEvolution {
  eventType: 'level_up' | 'stat_change' | 'trait_gained' | 'trait_lost' | 'story_completed';
  oldValue: any;
  newValue: any;
  sourceStoryId: string | null;
  createdAt: string;
}

class ReaderPersonaService {
  private supabase = createClient();

  /**
   * Create a new persona
   */
  async createPersona(
    userId: string,
    data: {
      name: string;
      avatarUrl?: string;
      backgroundStory?: string;
      personalityTraits?: string[];
      startingStats?: Partial<ReaderPersona['stats']>;
    }
  ): Promise<ReaderPersona | null> {
    try {
      const defaultStats = {
        strength: 10,
        intelligence: 10,
        charisma: 10,
        luck: 10,
      };

      const { data: persona, error } = await this.supabase
        .from('reader_personas')
        .insert({
          user_id: userId,
          name: data.name,
          avatar_url: data.avatarUrl,
          background_story: data.backgroundStory,
          personality_traits: data.personalityTraits || [],
          preferred_choices: {},
          stats: { ...defaultStats, ...data.startingStats },
          experience_points: 0,
          level: 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating persona:', error);
        return null;
      }

      return this.mapPersona(persona);
    } catch (error) {
      console.error('Error in createPersona:', error);
      return null;
    }
  }

  /**
   * Get user's personas
   */
  async getUserPersonas(userId: string): Promise<ReaderPersona[]> {
    try {
      const { data, error } = await this.supabase
        .from('reader_personas')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching personas:', error);
        return [];
      }

      return (data || []).map(this.mapPersona);
    } catch (error) {
      console.error('Error in getUserPersonas:', error);
      return [];
    }
  }

  /**
   * Get active persona
   */
  async getActivePersona(userId: string): Promise<ReaderPersona | null> {
    try {
      const personas = await this.getUserPersonas(userId);
      return personas[0] || null;
    } catch (error) {
      console.error('Error in getActivePersona:', error);
      return null;
    }
  }

  /**
   * Get persona by ID
   */
  async getPersona(personaId: string): Promise<ReaderPersona | null> {
    try {
      const { data, error } = await this.supabase
        .from('reader_personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (error) {
        console.error('Error fetching persona:', error);
        return null;
      }

      return this.mapPersona(data);
    } catch (error) {
      console.error('Error in getPersona:', error);
      return null;
    }
  }

  /**
   * Update persona
   */
  async updatePersona(
    personaId: string,
    updates: Partial<{
      name: string;
      avatarUrl: string;
      backgroundStory: string;
      personalityTraits: string[];
    }>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reader_personas')
        .update({
          name: updates.name,
          avatar_url: updates.avatarUrl,
          background_story: updates.backgroundStory,
          personality_traits: updates.personalityTraits,
          updated_at: new Date().toISOString(),
        })
        .eq('id', personaId);

      return !error;
    } catch (error) {
      console.error('Error in updatePersona:', error);
      return false;
    }
  }

  /**
   * Get or create story state for persona
   */
  async getStoryState(personaId: string, storyId: string): Promise<PersonaStoryState | null> {
    try {
      const { data: existing } = await this.supabase
        .from('persona_story_states')
        .select('*')
        .eq('persona_id', personaId)
        .eq('story_id', storyId)
        .single();

      if (existing) {
        return {
          personaId: existing.persona_id,
          storyId: existing.story_id,
          currentStats: existing.current_stats || {},
          inventory: existing.inventory || [],
          relationships: existing.relationships || {},
          flags: existing.flags || {},
          choicesMade: existing.choices_made || [],
        };
      }

      // Create new state based on persona's current stats
      const persona = await this.getPersona(personaId);
      if (!persona) return null;

      const { data: newState } = await this.supabase
        .from('persona_story_states')
        .insert({
          persona_id: personaId,
          story_id: storyId,
          current_stats: persona.stats,
          inventory: [],
          relationships: {},
          flags: {},
          choices_made: [],
        })
        .select()
        .single();

      if (newState) {
        return {
          personaId: newState.persona_id,
          storyId: newState.story_id,
          currentStats: newState.current_stats || {},
          inventory: newState.inventory || [],
          relationships: newState.relationships || {},
          flags: newState.flags || {},
          choicesMade: newState.choices_made || [],
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getStoryState:', error);
      return null;
    }
  }

  /**
   * Update story state
   */
  async updateStoryState(
    personaId: string,
    storyId: string,
    updates: Partial<{
      currentStats: Record<string, number>;
      inventory: string[];
      relationships: Record<string, number>;
      flags: Record<string, any>;
      choicesMade: Array<{ chapterId: string; choiceText: string }>;
    }>
  ): Promise<boolean> {
    try {
      const currentState = await this.getStoryState(personaId, storyId);
      if (!currentState) return false;

      const newState = {
        current_stats: updates.currentStats || currentState.currentStats,
        inventory: updates.inventory || currentState.inventory,
        relationships: updates.relationships || currentState.relationships,
        flags: updates.flags || currentState.flags,
        choices_made: updates.choicesMade || currentState.choicesMade,
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.supabase
        .from('persona_story_states')
        .update(newState)
        .eq('persona_id', personaId)
        .eq('story_id', storyId);

      return !error;
    } catch (error) {
      console.error('Error in updateStoryState:', error);
      return false;
    }
  }

  /**
   * Record choice made
   */
  async recordChoice(
    personaId: string,
    storyId: string,
    chapterId: string,
    choiceText: string,
    consequences?: {
      statChanges?: Record<string, number>;
      itemsGained?: string[];
      itemsLost?: string[];
      relationshipChanges?: Record<string, number>;
      flagsSet?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const state = await this.getStoryState(personaId, storyId);
      if (!state) return;

      // Add choice to history
      const newChoices = [...state.choicesMade, { chapterId, choiceText }];

      // Apply consequences
      let newStats = { ...state.currentStats };
      let newInventory = [...state.inventory];
      let newRelationships = { ...state.relationships };
      let newFlags = { ...state.flags };

      if (consequences) {
        // Stat changes
        if (consequences.statChanges) {
          for (const [stat, change] of Object.entries(consequences.statChanges)) {
            newStats[stat] = (newStats[stat] || 0) + change;
          }
        }

        // Inventory
        if (consequences.itemsGained) {
          newInventory = [...newInventory, ...consequences.itemsGained];
        }
        if (consequences.itemsLost) {
          newInventory = newInventory.filter(i => !consequences.itemsLost!.includes(i));
        }

        // Relationships
        if (consequences.relationshipChanges) {
          for (const [character, change] of Object.entries(consequences.relationshipChanges)) {
            newRelationships[character] = (newRelationships[character] || 0) + change;
          }
        }

        // Flags
        if (consequences.flagsSet) {
          newFlags = { ...newFlags, ...consequences.flagsSet };
        }
      }

      await this.updateStoryState(personaId, storyId, {
        currentStats: newStats,
        inventory: newInventory,
        relationships: newRelationships,
        flags: newFlags,
        choicesMade: newChoices,
      });

      // Learn preference
      await this.learnPreference(personaId, choiceText);
    } catch (error) {
      console.error('Error in recordChoice:', error);
    }
  }

  /**
   * Learn choice preference
   */
  private async learnPreference(personaId: string, choiceText: string): Promise<void> {
    try {
      const persona = await this.getPersona(personaId);
      if (!persona) return;

      // Simple keyword extraction
      const keywords = choiceText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const preferences = { ...persona.preferredChoices };

      for (const keyword of keywords) {
        preferences[keyword] = (preferences[keyword] || '0');
        const count = parseInt(preferences[keyword]) + 1;
        preferences[keyword] = count.toString();
      }

      await this.supabase
        .from('reader_personas')
        .update({ preferred_choices: preferences })
        .eq('id', personaId);
    } catch (error) {
      console.error('Error learning preference:', error);
    }
  }

  /**
   * Award XP and handle level up
   */
  async awardExperience(personaId: string, xp: number, sourceStoryId?: string): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    try {
      const persona = await this.getPersona(personaId);
      if (!persona) {
        return { newXP: 0, newLevel: 1, leveledUp: false };
      }

      const newXP = persona.experiencePoints + xp;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > persona.level;

      await this.supabase
        .from('reader_personas')
        .update({
          experience_points: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', personaId);

      // Record evolution if leveled up
      if (leveledUp) {
        await this.recordEvolution(personaId, 'level_up', persona.level, newLevel, sourceStoryId);
      }

      return { newXP, newLevel, leveledUp };
    } catch (error) {
      console.error('Error in awardExperience:', error);
      return { newXP: 0, newLevel: 1, leveledUp: false };
    }
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    // Simple leveling curve: each level requires 100 * level XP
    let level = 1;
    let xpRequired = 100;
    let totalRequired = 0;

    while (xp >= totalRequired + xpRequired) {
      totalRequired += xpRequired;
      level++;
      xpRequired = 100 * level;
    }

    return level;
  }

  /**
   * Record evolution event
   */
  private async recordEvolution(
    personaId: string,
    eventType: PersonaEvolution['eventType'],
    oldValue: any,
    newValue: any,
    sourceStoryId?: string
  ): Promise<void> {
    try {
      await this.supabase.from('persona_evolution').insert({
        persona_id: personaId,
        event_type: eventType,
        old_value: oldValue,
        new_value: newValue,
        source_story_id: sourceStoryId,
      });
    } catch (error) {
      console.error('Error recording evolution:', error);
    }
  }

  /**
   * Get persona achievements
   */
  async getPersonaAchievements(personaId: string): Promise<PersonaAchievement[]> {
    try {
      const { data, error } = await this.supabase
        .from('persona_achievements')
        .select('*')
        .eq('persona_id', personaId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return (data || []).map(a => ({
        achievementName: a.achievement_name,
        storyId: a.story_id,
        earnedAt: a.earned_at,
      }));
    } catch (error) {
      console.error('Error in getPersonaAchievements:', error);
      return [];
    }
  }

  /**
   * Award achievement
   */
  async awardAchievement(personaId: string, achievementName: string, storyId?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('persona_achievements').insert({
        persona_id: personaId,
        achievement_name: achievementName,
        story_id: storyId,
      });

      return !error;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Get evolution history
   */
  async getEvolutionHistory(personaId: string, limit: number = 20): Promise<PersonaEvolution[]> {
    try {
      const { data, error } = await this.supabase
        .from('persona_evolution')
        .select('*')
        .eq('persona_id', personaId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching evolution:', error);
        return [];
      }

      return (data || []).map(e => ({
        eventType: e.event_type,
        oldValue: e.old_value,
        newValue: e.new_value,
        sourceStoryId: e.source_story_id,
        createdAt: e.created_at,
      }));
    } catch (error) {
      console.error('Error in getEvolutionHistory:', error);
      return [];
    }
  }

  /**
   * Complete story with persona
   */
  async completeStory(personaId: string, storyId: string): Promise<void> {
    try {
      const persona = await this.getPersona(personaId);
      const state = await this.getStoryState(personaId, storyId);

      if (!persona || !state) return;

      // Record completion
      await this.recordEvolution(personaId, 'story_completed', null, storyId, storyId);

      // Carry over stat changes to main persona
      // Only apply a portion of the changes to prevent stat inflation
      const carryOverRatio = 0.1;
      const newStats = { ...persona.stats };

      for (const [stat, value] of Object.entries(state.currentStats)) {
        const originalValue = persona.stats[stat] || 10;
        const change = value - originalValue;
        newStats[stat] = originalValue + Math.floor(change * carryOverRatio);
      }

      await this.supabase
        .from('reader_personas')
        .update({ stats: newStats, updated_at: new Date().toISOString() })
        .eq('id', personaId);

      // Award completion XP
      await this.awardExperience(personaId, 100, storyId);
    } catch (error) {
      console.error('Error in completeStory:', error);
    }
  }

  private mapPersona(data: any): ReaderPersona {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      avatarUrl: data.avatar_url,
      backgroundStory: data.background_story,
      personalityTraits: data.personality_traits || [],
      preferredChoices: data.preferred_choices || {},
      stats: data.stats || { strength: 10, intelligence: 10, charisma: 10, luck: 10 },
      experiencePoints: data.experience_points || 0,
      level: data.level || 1,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
}

export const readerPersonaService = new ReaderPersonaService();
