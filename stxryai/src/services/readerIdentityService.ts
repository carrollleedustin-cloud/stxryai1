/**
 * Reader Identity Service
 * Define who you are through your reading choices
 * Beyond XP - create a meaningful reader archetype
 */

import { createClient } from '@/lib/supabase/client';

export type ReaderArchetype = 
  | 'The Hero'           // Always chooses bravery, helps others
  | 'The Survivor'       // Pragmatic, self-preserving choices
  | 'The Romantic'       // Prioritizes relationships and emotion
  | 'The Thinker'        // Analytical, investigative choices
  | 'The Rebel'          // Defies authority, chaotic choices
  | 'The Guardian'       // Protective, self-sacrificing
  | 'The Seeker'         // Curious, knowledge-driven
  | 'The Wildcard'       // Unpredictable, varied choices
  | 'The Diplomat'       // Peaceful resolutions, compromise
  | 'The Shadow'         // Morally grey, pragmatic dark choices
  | 'Undefined';         // Not enough data yet

export interface ReaderIdentity {
  id: string;
  userId: string;
  
  // Primary archetype
  primaryArchetype: ReaderArchetype;
  archetypeConfidence: number; // 0-100
  archetypeEvolution: ArchetypeSnapshot[];
  
  // Secondary traits
  secondaryTraits: string[];
  
  // Choice patterns
  choicePatterns: {
    bravery: number;        // -100 to 100 (cautious to brave)
    morality: number;       // -100 to 100 (dark to light)
    logic: number;          // -100 to 100 (emotional to logical)
    social: number;         // -100 to 100 (lone wolf to social)
    curiosity: number;      // -100 to 100 (practical to curious)
    aggression: number;     // -100 to 100 (peaceful to aggressive)
  };
  
  // Genre preferences
  genreAffinity: Record<string, number>; // Genre -> affinity score
  
  // Reading style
  readingStyle: {
    avgSessionLength: number;  // minutes
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    bingeTendency: number;     // 0-100
    completionRate: number;    // 0-100
  };
  
  // Milestones
  totalChoicesMade: number;
  storiesCompleted: number;
  uniquePathsExplored: number;
  rareChoicesFound: number;
  
  // Titles and badges
  earnedTitles: string[];
  activeTitle: string | null;
  
  // Social
  compatibleArchetypes: ReaderArchetype[];
  rivalArchetypes: ReaderArchetype[];
  
  // Timestamps
  firstReadAt: string;
  lastReadAt: string;
  identityFormedAt: string | null;
}

export interface ArchetypeSnapshot {
  archetype: ReaderArchetype;
  date: string;
  confidence: number;
  triggerEvent?: string;
}

export interface ChoiceAnalysis {
  choiceId: string;
  choiceText: string;
  patterns: {
    bravery: number;
    morality: number;
    logic: number;
    social: number;
    curiosity: number;
    aggression: number;
  };
}

// Archetype definitions and their pattern signatures
const archetypeSignatures: Record<ReaderArchetype, { 
  patterns: Partial<ReaderIdentity['choicePatterns']>;
  description: string;
  icon: string;
  color: string;
  compatibleWith: ReaderArchetype[];
  rivalsOf: ReaderArchetype[];
}> = {
  'The Hero': {
    patterns: { bravery: 80, morality: 70, social: 50 },
    description: 'You charge into danger to protect others. Courage flows through your choices.',
    icon: '⚔️',
    color: '#F59E0B',
    compatibleWith: ['The Guardian', 'The Romantic', 'The Diplomat'],
    rivalsOf: ['The Shadow', 'The Rebel'],
  },
  'The Survivor': {
    patterns: { bravery: -30, logic: 60, social: -20 },
    description: 'Pragmatic and resourceful. You make the hard choices others won\'t.',
    icon: '🏹',
    color: '#10B981',
    compatibleWith: ['The Thinker', 'The Shadow'],
    rivalsOf: ['The Hero', 'The Guardian'],
  },
  'The Romantic': {
    patterns: { morality: 40, logic: -60, social: 80 },
    description: 'Led by your heart. Relationships and emotions guide your path.',
    icon: '💕',
    color: '#EC4899',
    compatibleWith: ['The Hero', 'The Guardian', 'The Diplomat'],
    rivalsOf: ['The Thinker', 'The Survivor'],
  },
  'The Thinker': {
    patterns: { logic: 90, curiosity: 70, bravery: 0 },
    description: 'Logic is your weapon. You analyze before you act.',
    icon: '🧠',
    color: '#3B82F6',
    compatibleWith: ['The Seeker', 'The Survivor'],
    rivalsOf: ['The Romantic', 'The Wildcard'],
  },
  'The Rebel': {
    patterns: { morality: -20, aggression: 50, social: -30 },
    description: 'Authority is meant to be questioned. Rules are made to be broken.',
    icon: '🔥',
    color: '#EF4444',
    compatibleWith: ['The Shadow', 'The Wildcard'],
    rivalsOf: ['The Hero', 'The Diplomat'],
  },
  'The Guardian': {
    patterns: { morality: 80, bravery: 60, social: 60 },
    description: 'Protector of the innocent. You\'ll sacrifice everything for those you love.',
    icon: '🛡️',
    color: '#8B5CF6',
    compatibleWith: ['The Hero', 'The Romantic'],
    rivalsOf: ['The Shadow', 'The Survivor'],
  },
  'The Seeker': {
    patterns: { curiosity: 90, logic: 40, bravery: 20 },
    description: 'Knowledge is your treasure. Every mystery calls to you.',
    icon: '🔮',
    color: '#6366F1',
    compatibleWith: ['The Thinker', 'The Wildcard'],
    rivalsOf: ['The Survivor'],
  },
  'The Wildcard': {
    patterns: { curiosity: 30 }, // High variance in all patterns
    description: 'Unpredictable and free. You walk paths no one else would dare.',
    icon: '🎭',
    color: '#F97316',
    compatibleWith: ['The Seeker', 'The Rebel'],
    rivalsOf: ['The Thinker'],
  },
  'The Diplomat': {
    patterns: { aggression: -70, social: 80, morality: 30 },
    description: 'Words over swords. You seek harmony and peaceful resolution.',
    icon: '🕊️',
    color: '#14B8A6',
    compatibleWith: ['The Hero', 'The Romantic', 'The Guardian'],
    rivalsOf: ['The Rebel', 'The Shadow'],
  },
  'The Shadow': {
    patterns: { morality: -50, logic: 50, aggression: 30 },
    description: 'The ends justify the means. You embrace the darkness within.',
    icon: '🌑',
    color: '#1F2937',
    compatibleWith: ['The Survivor', 'The Rebel'],
    rivalsOf: ['The Hero', 'The Guardian', 'The Diplomat'],
  },
  'Undefined': {
    patterns: {},
    description: 'Your story is just beginning. Keep reading to discover who you truly are.',
    icon: '❓',
    color: '#6B7280',
    compatibleWith: [],
    rivalsOf: [],
  },
};

// Choice keywords for pattern analysis
const choiceKeywords = {
  bravery: {
    positive: ['fight', 'confront', 'attack', 'challenge', 'stand', 'defend', 'charge', 'brave', 'face'],
    negative: ['hide', 'flee', 'retreat', 'avoid', 'wait', 'careful', 'safe', 'escape', 'run'],
  },
  morality: {
    positive: ['help', 'save', 'protect', 'honest', 'truth', 'spare', 'forgive', 'mercy', 'kind'],
    negative: ['steal', 'lie', 'betray', 'kill', 'abandon', 'deceive', 'manipulate', 'dark', 'cruel'],
  },
  logic: {
    positive: ['think', 'analyze', 'plan', 'consider', 'investigate', 'examine', 'study', 'logical'],
    negative: ['feel', 'heart', 'instinct', 'impulse', 'emotion', 'passion', 'love', 'gut'],
  },
  social: {
    positive: ['together', 'team', 'friend', 'ally', 'group', 'help', 'join', 'trust', 'cooperate'],
    negative: ['alone', 'solo', 'myself', 'independent', 'solitary', 'leave', 'separate'],
  },
  curiosity: {
    positive: ['explore', 'discover', 'investigate', 'search', 'learn', 'curious', 'examine', 'why'],
    negative: ['ignore', 'leave', 'practical', 'focus', 'relevant', 'important'],
  },
  aggression: {
    positive: ['attack', 'fight', 'destroy', 'force', 'aggressive', 'violence', 'kill', 'strike'],
    negative: ['peace', 'talk', 'negotiate', 'calm', 'gentle', 'diplomacy', 'resolve', 'compromise'],
  },
};

class ReaderIdentityService {
  private supabase = createClient();

  /**
   * Get user's reader identity
   */
  async getIdentity(userId: string): Promise<ReaderIdentity | null> {
    try {
      const { data, error } = await this.supabase
        .from('reader_identities')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No identity yet, create one
          return this.initializeIdentity(userId);
        }
        console.error('Error fetching identity:', error);
        return null;
      }

      return this.mapIdentity(data);
    } catch (error) {
      console.error('Error in getIdentity:', error);
      return null;
    }
  }

  /**
   * Initialize a new reader identity
   */
  private async initializeIdentity(userId: string): Promise<ReaderIdentity | null> {
    try {
      const { data, error } = await this.supabase
        .from('reader_identities')
        .insert({
          user_id: userId,
          primary_archetype: 'Undefined',
          archetype_confidence: 0,
          archetype_evolution: [],
          secondary_traits: [],
          choice_patterns: {
            bravery: 0,
            morality: 0,
            logic: 0,
            social: 0,
            curiosity: 0,
            aggression: 0,
          },
          genre_affinity: {},
          reading_style: {
            avgSessionLength: 0,
            preferredTimeOfDay: 'evening',
            bingeTendency: 50,
            completionRate: 0,
          },
          total_choices_made: 0,
          stories_completed: 0,
          unique_paths_explored: 0,
          rare_choices_found: 0,
          earned_titles: [],
          active_title: null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error initializing identity:', error);
        return null;
      }

      return this.mapIdentity(data);
    } catch (error) {
      console.error('Error in initializeIdentity:', error);
      return null;
    }
  }

  /**
   * Analyze a choice and update identity
   */
  async analyzeAndRecordChoice(
    userId: string,
    choiceText: string,
    context?: { genre?: string; isRareChoice?: boolean }
  ): Promise<{ patternChanges: Partial<ReaderIdentity['choicePatterns']>; archetypeChange?: boolean }> {
    try {
      const analysis = this.analyzeChoiceText(choiceText);
      
      const identity = await this.getIdentity(userId);
      if (!identity) return { patternChanges: {} };

      // Update patterns with weighted average
      const newPatterns = { ...identity.choicePatterns };
      const weight = 0.1; // Each choice contributes 10% towards the average

      for (const [key, value] of Object.entries(analysis)) {
        if (key in newPatterns) {
          const k = key as keyof typeof newPatterns;
          newPatterns[k] = Math.round(newPatterns[k] * (1 - weight) + value * weight);
        }
      }

      // Check if archetype should change
      const newArchetype = this.calculateArchetype(newPatterns);
      const archetypeChanged = newArchetype !== identity.primaryArchetype && 
                              identity.totalChoicesMade > 20;

      // Update genre affinity
      const newGenreAffinity = { ...identity.genreAffinity };
      if (context?.genre) {
        newGenreAffinity[context.genre] = (newGenreAffinity[context.genre] || 0) + 1;
      }

      // Update evolution history if archetype changed
      const evolution = [...identity.archetypeEvolution];
      if (archetypeChanged) {
        evolution.push({
          archetype: newArchetype,
          date: new Date().toISOString(),
          confidence: this.calculateConfidence(newPatterns, newArchetype),
          triggerEvent: `Choice: "${choiceText.substring(0, 50)}..."`,
        });
      }

      // Save updates
      await this.supabase
        .from('reader_identities')
        .update({
          choice_patterns: newPatterns,
          primary_archetype: newArchetype,
          archetype_confidence: this.calculateConfidence(newPatterns, newArchetype),
          archetype_evolution: evolution,
          genre_affinity: newGenreAffinity,
          total_choices_made: identity.totalChoicesMade + 1,
          rare_choices_found: context?.isRareChoice 
            ? identity.rareChoicesFound + 1 
            : identity.rareChoicesFound,
          last_read_at: new Date().toISOString(),
          identity_formed_at: identity.totalChoicesMade >= 19 && !identity.identityFormedAt
            ? new Date().toISOString()
            : identity.identityFormedAt,
        })
        .eq('user_id', userId);

      return {
        patternChanges: analysis,
        archetypeChange: archetypeChanged,
      };
    } catch (error) {
      console.error('Error in analyzeAndRecordChoice:', error);
      return { patternChanges: {} };
    }
  }

  /**
   * Analyze choice text for patterns
   */
  analyzeChoiceText(text: string): Partial<ReaderIdentity['choicePatterns']> {
    const lowerText = text.toLowerCase();
    const patterns: ReaderIdentity['choicePatterns'] = {
      bravery: 0,
      morality: 0,
      logic: 0,
      social: 0,
      curiosity: 0,
      aggression: 0,
    };

    for (const [pattern, keywords] of Object.entries(choiceKeywords)) {
      const key = pattern as keyof typeof patterns;
      let score = 0;

      for (const word of keywords.positive) {
        if (lowerText.includes(word)) score += 25;
      }
      for (const word of keywords.negative) {
        if (lowerText.includes(word)) score -= 25;
      }

      patterns[key] = Math.max(-100, Math.min(100, score));
    }

    return patterns;
  }

  /**
   * Calculate archetype from patterns
   */
  calculateArchetype(patterns: ReaderIdentity['choicePatterns']): ReaderArchetype {
    let bestMatch: ReaderArchetype = 'Undefined';
    let bestScore = -Infinity;

    for (const [archetype, signature] of Object.entries(archetypeSignatures)) {
      if (archetype === 'Undefined') continue;

      let score = 0;
      let matches = 0;

      for (const [key, targetValue] of Object.entries(signature.patterns)) {
        if (key in patterns) {
          const actualValue = patterns[key as keyof typeof patterns];
          // Score based on how close we are to the target
          const distance = Math.abs(actualValue - targetValue);
          score += 100 - distance;
          matches++;
        }
      }

      if (matches > 0) {
        const avgScore = score / matches;
        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestMatch = archetype as ReaderArchetype;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Calculate confidence in archetype assignment
   */
  calculateConfidence(patterns: ReaderIdentity['choicePatterns'], archetype: ReaderArchetype): number {
    const signature = archetypeSignatures[archetype];
    if (!signature || Object.keys(signature.patterns).length === 0) return 0;

    let totalDistance = 0;
    let matches = 0;

    for (const [key, targetValue] of Object.entries(signature.patterns)) {
      if (key in patterns) {
        const actualValue = patterns[key as keyof typeof patterns];
        totalDistance += Math.abs(actualValue - targetValue);
        matches++;
      }
    }

    if (matches === 0) return 0;

    // Convert average distance to confidence (closer = higher confidence)
    const avgDistance = totalDistance / matches;
    const confidence = Math.max(0, Math.min(100, 100 - (avgDistance / 2)));

    return Math.round(confidence);
  }

  /**
   * Get archetype info
   */
  getArchetypeInfo(archetype: ReaderArchetype): typeof archetypeSignatures[ReaderArchetype] {
    return archetypeSignatures[archetype];
  }

  /**
   * Get all archetype info for display
   */
  getAllArchetypes(): { archetype: ReaderArchetype; info: typeof archetypeSignatures[ReaderArchetype] }[] {
    return Object.entries(archetypeSignatures)
      .filter(([a]) => a !== 'Undefined')
      .map(([archetype, info]) => ({
        archetype: archetype as ReaderArchetype,
        info,
      }));
  }

  /**
   * Record story completion
   */
  async recordStoryCompletion(userId: string, storyId: string): Promise<void> {
    try {
      const { data: identity } = await this.supabase
        .from('reader_identities')
        .select('stories_completed, earned_titles')
        .eq('user_id', userId)
        .single();

      if (!identity) return;

      const newCompletions = (identity.stories_completed || 0) + 1;
      const newTitles = [...(identity.earned_titles || [])];

      // Check for milestone titles
      const titleMilestones: Record<number, string> = {
        1: 'First Steps',
        5: 'Bookworm',
        10: 'Story Seeker',
        25: 'Tale Weaver',
        50: 'Narrative Navigator',
        100: 'Legendary Reader',
        250: 'Master of Stories',
        500: 'Eternal Chronicler',
      };

      if (titleMilestones[newCompletions] && !newTitles.includes(titleMilestones[newCompletions])) {
        newTitles.push(titleMilestones[newCompletions]);
      }

      await this.supabase
        .from('reader_identities')
        .update({
          stories_completed: newCompletions,
          earned_titles: newTitles,
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error recording story completion:', error);
    }
  }

  /**
   * Set active title
   */
  async setActiveTitle(userId: string, title: string | null): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reader_identities')
        .update({ active_title: title })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error setting active title:', error);
      return false;
    }
  }

  /**
   * Generate identity character sheet
   */
  generateCharacterSheet(identity: ReaderIdentity): {
    summary: string;
    strengths: string[];
    tendencies: string[];
    compatibilityNote: string;
  } {
    const archetypeInfo = archetypeSignatures[identity.primaryArchetype];

    const strengths: string[] = [];
    const tendencies: string[] = [];

    // Analyze patterns for strengths and tendencies
    if (identity.choicePatterns.bravery > 50) strengths.push('Courageous');
    if (identity.choicePatterns.bravery < -50) tendencies.push('Cautious');
    if (identity.choicePatterns.morality > 50) strengths.push('Virtuous');
    if (identity.choicePatterns.morality < -50) tendencies.push('Pragmatic');
    if (identity.choicePatterns.logic > 50) strengths.push('Analytical');
    if (identity.choicePatterns.logic < -50) strengths.push('Empathetic');
    if (identity.choicePatterns.social > 50) strengths.push('Cooperative');
    if (identity.choicePatterns.social < -50) tendencies.push('Independent');
    if (identity.choicePatterns.curiosity > 50) strengths.push('Inquisitive');
    if (identity.choicePatterns.aggression > 30) tendencies.push('Action-oriented');
    if (identity.choicePatterns.aggression < -30) strengths.push('Diplomatic');

    // Generate compatibility note
    const compatibleNames = archetypeInfo.compatibleWith.slice(0, 2).join(' and ');
    const compatibilityNote = archetypeInfo.compatibleWith.length > 0
      ? `You resonate well with ${compatibleNames} readers.`
      : 'Your unique path is still forming.';

    return {
      summary: archetypeInfo.description,
      strengths: strengths.slice(0, 4),
      tendencies: tendencies.slice(0, 3),
      compatibilityNote,
    };
  }

  /**
   * Find compatible readers
   */
  async findCompatibleReaders(userId: string, limit: number = 10): Promise<{
    userId: string;
    archetype: ReaderArchetype;
    compatibility: number;
  }[]> {
    try {
      const identity = await this.getIdentity(userId);
      if (!identity || identity.primaryArchetype === 'Undefined') return [];

      const archetypeInfo = archetypeSignatures[identity.primaryArchetype];
      const compatibleArchetypes = archetypeInfo.compatibleWith;

      if (compatibleArchetypes.length === 0) return [];

      const { data, error } = await this.supabase
        .from('reader_identities')
        .select('user_id, primary_archetype, choice_patterns')
        .in('primary_archetype', compatibleArchetypes)
        .neq('user_id', userId)
        .limit(limit);

      if (error || !data) return [];

      return data.map(other => ({
        userId: other.user_id,
        archetype: other.primary_archetype as ReaderArchetype,
        compatibility: this.calculatePatternSimilarity(
          identity.choicePatterns,
          other.choice_patterns
        ),
      })).sort((a, b) => b.compatibility - a.compatibility);
    } catch (error) {
      console.error('Error finding compatible readers:', error);
      return [];
    }
  }

  private calculatePatternSimilarity(
    a: ReaderIdentity['choicePatterns'],
    b: ReaderIdentity['choicePatterns']
  ): number {
    let totalDiff = 0;
    let count = 0;

    for (const key of Object.keys(a) as (keyof typeof a)[]) {
      totalDiff += Math.abs(a[key] - b[key]);
      count++;
    }

    if (count === 0) return 0;
    const avgDiff = totalDiff / count;
    // Convert to percentage (200 is max diff, 0 is perfect match)
    return Math.round(100 - (avgDiff / 2));
  }

  private mapIdentity(data: any): ReaderIdentity {
    const signature = archetypeSignatures[data.primary_archetype as ReaderArchetype];
    
    return {
      id: data.id,
      userId: data.user_id,
      primaryArchetype: data.primary_archetype,
      archetypeConfidence: data.archetype_confidence,
      archetypeEvolution: data.archetype_evolution || [],
      secondaryTraits: data.secondary_traits || [],
      choicePatterns: data.choice_patterns || {
        bravery: 0, morality: 0, logic: 0, social: 0, curiosity: 0, aggression: 0,
      },
      genreAffinity: data.genre_affinity || {},
      readingStyle: data.reading_style || {
        avgSessionLength: 0,
        preferredTimeOfDay: 'evening',
        bingeTendency: 50,
        completionRate: 0,
      },
      totalChoicesMade: data.total_choices_made || 0,
      storiesCompleted: data.stories_completed || 0,
      uniquePathsExplored: data.unique_paths_explored || 0,
      rareChoicesFound: data.rare_choices_found || 0,
      earnedTitles: data.earned_titles || [],
      activeTitle: data.active_title,
      compatibleArchetypes: signature?.compatibleWith || [],
      rivalArchetypes: signature?.rivalsOf || [],
      firstReadAt: data.first_read_at || data.created_at,
      lastReadAt: data.last_read_at,
      identityFormedAt: data.identity_formed_at,
    };
  }
}

export const readerIdentityService = new ReaderIdentityService();
