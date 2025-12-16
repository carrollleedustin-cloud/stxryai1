import { getSupabaseClient } from '@/lib/supabase/client';

export interface EngagementMetrics {
  id?: string;
  user_id: string;
  story_id: string;
  chapter_id?: string;
  time_on_scene: number;
  choice_frequency: number;
  choices_made_count: number;
  scroll_depth: number;
  engagement_score?: number;
  engagement_level?: string;
  recommended_pacing?: string;
  pacing_adjustment_factor?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoryNPC {
  id?: string;
  story_id: string;
  npc_name: string;
  npc_role?: string;
  personality_traits?: string[];
  base_dialogue_style?: string;
  base_knowledge?: Record<string, any>;
  first_appears_chapter?: number;
  last_appears_chapter?: number;
}

export interface NPCMemory {
  id?: string;
  npc_id: string;
  user_id: string;
  story_id: string;
  memory_type: string;
  memory_content: string;
  chapter_number?: number;
  importance_score?: number;
  relationship_delta?: number;
  relationship_type?: string;
  cumulative_relationship_score?: number;
  revealed_traits?: string[];
  created_at?: string;
}

export interface PacingAdjustment {
  id?: string;
  user_id: string;
  story_id: string;
  chapter_id?: string;
  adjustment_type: string;
  engagement_trigger: string;
  adjustment_data?: Record<string, any>;
  generated_content?: string;
  prompt_used?: string;
  applied_at?: string;
}

class NarrativeAIService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== ENGAGEMENT METRICS ====================

  async trackEngagement(metrics: Omit<EngagementMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<EngagementMetrics | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_engagement_metrics')
        .upsert({
          user_id: metrics.user_id,
          story_id: metrics.story_id,
          chapter_id: metrics.chapter_id,
          time_on_scene: metrics.time_on_scene,
          choice_frequency: metrics.choice_frequency,
          choices_made_count: metrics.choices_made_count,
          scroll_depth: metrics.scroll_depth,
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking engagement:', error);
        return null;
      }

      return data as EngagementMetrics;
    } catch (error) {
      console.error('Failed to track engagement:', error);
      return null;
    }
  }

  async getEngagementMetrics(userId: string, storyId: string): Promise<EngagementMetrics[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching engagement metrics:', error);
        return [];
      }

      return (data || []) as EngagementMetrics[];
    } catch (error) {
      console.error('Failed to fetch engagement metrics:', error);
      return [];
    }
  }

  async getCurrentPacing(userId: string, storyId: string, chapterId?: string): Promise<{
    recommendedPacing: string;
    adjustmentFactor: number;
    engagementLevel: string;
  } | null> {
    try {
      const supabase = this.getSupabase();
      let query = supabase
        .from('user_engagement_metrics')
        .select('recommended_pacing, pacing_adjustment_factor, engagement_level')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return {
          recommendedPacing: 'balanced',
          adjustmentFactor: 1.0,
          engagementLevel: 'medium'
        };
      }

      return {
        recommendedPacing: data.recommended_pacing || 'balanced',
        adjustmentFactor: data.pacing_adjustment_factor || 1.0,
        engagementLevel: data.engagement_level || 'medium'
      };
    } catch (error) {
      console.error('Failed to get current pacing:', error);
      return null;
    }
  }

  async sendEngagementMetricsAndGetFeedback(
    metrics: Omit<EngagementMetrics, 'id' | 'created_at' | 'updated_at'>,
    context: {
      storyId: string;
      userId: string;
      chapterId: string;
      currentChapterContent: string;
    }
  ): Promise<{ feedback?: string[]; pacingAdjustments?: any }> { // Return type for AI feedback/segments
    try {
      // 1. Track engagement
      const trackedMetrics = await this.trackEngagement(metrics);
      if (!trackedMetrics) {
        console.warn('Failed to track engagement metrics.');
      }

      // 2. Simulate AI feedback/dynamic segment generation
      // In a real scenario, this would involve calling another AI service or API endpoint
      // with the collected metrics and story context to generate dynamic content or pacing adjustments.
      const aiFeedback: string[] = [];
      const pacingAdjustments: any = {}; // Placeholder for actual pacing adjustments

      // Example AI logic: If scroll depth is low and time on scene is high, suggest speeding up.
      if (metrics.scroll_depth < 50 && metrics.time_on_scene > 60) {
        aiFeedback.push("The reader seems to be spending a lot of time on this section but hasn't scrolled much. Perhaps this part is too detailed? Consider a more concise approach.");
        pacingAdjustments.suggestedPacing = 'fast';
      } else if (metrics.choices_made_count === 0 && metrics.time_on_scene > 120) {
        aiFeedback.push("The reader is taking a long time without making choices. Maybe they need more guidance or more immediate engagement? Offer a clear choice or a dramatic event.");
        pacingAdjustments.suggestedPacing = 'action-oriented';
      } else if (metrics.scroll_depth > 90 && metrics.time_on_scene < 30 && metrics.choices_made_count > 0) {
        aiFeedback.push("The reader is quickly moving through chapters. They enjoy rapid progression. Offer more immediate choices and dynamic events.");
        pacingAdjustments.suggestedPacing = 'very-fast';
      }

      // Here you would integrate with an actual AI model (e.g., via an API route)
      // For now, returning simulated feedback.

      // If we wanted to generate new content, this is where we'd call the AI model.
      // E.g., const generatedSegment = await this.callAnotherAIEndpoint(context.currentChapterContent, aiFeedback);
      // aiFeedback.push(generatedSegment);

      return { feedback: aiFeedback.length > 0 ? aiFeedback : undefined, pacingAdjustments };

    } catch (error) {
      console.error('Failed to send engagement metrics or get feedback:', error);
      return {};
    }
  }

  // ==================== NPC MANAGEMENT ====================

  async createNPC(npc: Omit<StoryNPC, 'id'>): Promise<StoryNPC | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('story_npcs')
        .insert({
          story_id: npc.story_id,
          npc_name: npc.npc_name,
          npc_role: npc.npc_role,
          personality_traits: npc.personality_traits,
          base_dialogue_style: npc.base_dialogue_style,
          base_knowledge: npc.base_knowledge,
          first_appears_chapter: npc.first_appears_chapter,
          last_appears_chapter: npc.last_appears_chapter,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating NPC:', error);
        return null;
      }

      return data as StoryNPC;
    } catch (error) {
      console.error('Failed to create NPC:', error);
      return null;
    }
  }

  async getStoryNPCs(storyId: string): Promise<StoryNPC[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('story_npcs')
        .select('*')
        .eq('story_id', storyId)
        .order('first_appears_chapter', { ascending: true });

      if (error) {
        console.error('Error fetching NPCs:', error);
        return [];
      }

      return (data || []) as StoryNPC[];
    } catch (error) {
      console.error('Failed to fetch NPCs:', error);
      return [];
    }
  }

  async getNPCById(npcId: string): Promise<StoryNPC | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('story_npcs')
        .select('*')
        .eq('id', npcId)
        .single();

      if (error) {
        console.error('Error fetching NPC:', error);
        return null;
      }

      return data as StoryNPC;
    } catch (error) {
      console.error('Failed to fetch NPC:', error);
      return null;
    }
  }

  // ==================== NPC MEMORY ====================

  async recordNPCMemory(memory: Omit<NPCMemory, 'id' | 'created_at'>): Promise<NPCMemory | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('npc_user_memories')
        .insert({
          npc_id: memory.npc_id,
          user_id: memory.user_id,
          story_id: memory.story_id,
          memory_type: memory.memory_type,
          memory_content: memory.memory_content,
          chapter_number: memory.chapter_number,
          importance_score: memory.importance_score || 0.5,
          relationship_delta: memory.relationship_delta || 0,
          revealed_traits: memory.revealed_traits,
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording NPC memory:', error);
        return null;
      }

      return data as NPCMemory;
    } catch (error) {
      console.error('Failed to record NPC memory:', error);
      return null;
    }
  }

  async getNPCMemories(npcId: string, userId: string): Promise<NPCMemory[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('npc_user_memories')
        .select('*')
        .eq('npc_id', npcId)
        .eq('user_id', userId)
        .order('chapter_number', { ascending: true });

      if (error) {
        console.error('Error fetching NPC memories:', error);
        return [];
      }

      return (data || []) as NPCMemory[];
    } catch (error) {
      console.error('Failed to fetch NPC memories:', error);
      return [];
    }
  }

  async getNPCRelationshipStatus(npcId: string, userId: string): Promise<{
    relationshipType: string;
    cumulativeScore: number;
    revealedTraits: string[];
  } | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('npc_user_memories')
        .select('relationship_type, cumulative_relationship_score, revealed_traits')
        .eq('npc_id', npcId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return {
          relationshipType: 'neutral',
          cumulativeScore: 0,
          revealedTraits: []
        };
      }

      // Aggregate all revealed traits
      const { data: allMemories } = await supabase
        .from('npc_user_memories')
        .select('revealed_traits')
        .eq('npc_id', npcId)
        .eq('user_id', userId);

      const allTraits = new Set<string>();
      allMemories?.forEach(memory => {
        if (memory.revealed_traits) {
          memory.revealed_traits.forEach((trait: string) => allTraits.add(trait));
        }
      });

      return {
        relationshipType: data.relationship_type || 'neutral',
        cumulativeScore: data.cumulative_relationship_score || 0,
        revealedTraits: Array.from(allTraits)
      };
    } catch (error) {
      console.error('Failed to get NPC relationship status:', error);
      return null;
    }
  }

  // ==================== PACING ADJUSTMENTS ====================

  async createPacingAdjustment(adjustment: Omit<PacingAdjustment, 'id' | 'applied_at'>): Promise<PacingAdjustment | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('narrative_pacing_adjustments')
        .insert({
          user_id: adjustment.user_id,
          story_id: adjustment.story_id,
          chapter_id: adjustment.chapter_id,
          adjustment_type: adjustment.adjustment_type,
          engagement_trigger: adjustment.engagement_trigger,
          adjustment_data: adjustment.adjustment_data,
          generated_content: adjustment.generated_content,
          prompt_used: adjustment.prompt_used,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pacing adjustment:', error);
        return null;
      }

      return data as PacingAdjustment;
    } catch (error) {
      console.error('Failed to create pacing adjustment:', error);
      return null;
    }
  }

  async getPacingAdjustments(userId: string, storyId: string): Promise<PacingAdjustment[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('narrative_pacing_adjustments')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching pacing adjustments:', error);
        return [];
      }

      return (data || []) as PacingAdjustment[];
    } catch (error) {
      console.error('Failed to fetch pacing adjustments:', error);
      return [];
    }
  }

  // ==================== AI GENERATION HELPERS ====================

  generateNPCDialogue(
    npc: StoryNPC,
    memories: NPCMemory[],
    currentContext: string
  ): string {
    const relationshipContext = memories.length > 0
      ? `The NPC remembers: ${memories.slice(-3).map(m => m.memory_content).join(', ')}`
      : 'This is your first meeting.';

    const personalityContext = npc.personality_traits?.join(', ') || 'balanced personality';
    
    return `Generate dialogue for ${npc.npc_name}, a ${npc.npc_role} with ${personalityContext}. 
    ${relationshipContext}
    Current situation: ${currentContext}
    Style: ${npc.base_dialogue_style || 'natural'}`;
  }

  generatePacingContent(
    engagementLevel: string,
    adjustmentType: string,
    storyContext: string
  ): string {
    const pacingInstructions: Record<string, string> = {
      very_low: 'Create fast-paced, action-oriented content with frequent choices',
      low: 'Increase tension and introduce plot developments quickly',
      medium: 'Maintain balanced narrative with mix of description and action',
      high: 'Allow for more descriptive passages and character development',
      very_high: 'Slow down pacing with rich descriptions and introspection'
    };

    return `${pacingInstructions[engagementLevel] || pacingInstructions.medium}
    Adjustment type: ${adjustmentType}
    Story context: ${storyContext}`;
  }
}

export const narrativeAIService = new NarrativeAIService();