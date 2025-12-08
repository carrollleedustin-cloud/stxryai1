import { supabase } from '@/lib/supabase/client';

export interface AIPromptTemplate {
  id: string;
  user_id: string;
  story_id: string;
  prompt_category: 'contextual' | 'dynamic' | 'procedural' | 'branching';
  template_name: string;
  prompt_text: string;
  context_variables: Record<string, any>;
  creativity_level: number;
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface DynamicPromptChain {
  id: string;
  user_id: string;
  story_id: string;
  chain_name: string;
  prompt_sequence: Record<string, any>;
  context_history: any[];
  adaptation_rules: Record<string, any>;
  current_step: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProceduralContent {
  id: string;
  story_id: string;
  chapter_id: string;
  content_type: 'item_description' | 'ambient_event' | 'lore_fragment' | 'background_character' | 'environment_detail';
  generated_content: string;
  context_tags: string[];
  quality_score: number;
  is_approved: boolean;
  created_at: string;
}

export interface StoryPathAnalytics {
  id: string;
  story_id: string;
  chapter_id: string;
  predicted_engagement: number;
  emotional_intensity: number;
  decision_weight: number;
  outcome_impact: string;
  reader_choice_probability: Record<string, number>;
  narrative_pacing_effect: string;
  arc_investment_score: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingJourneyRecap {
  id: string;
  user_id: string;
  story_id: string;
  recap_type: string;
  choice_history: any[];
  moral_alignments: Record<string, number>;
  relationship_dynamics: Record<string, any>;
  narrative_milestones: any[];
  recap_content: string;
  spoiler_level: string;
  created_at: string;
}

export interface StoryTranslation {
  id: string;
  story_id: string;
  chapter_id: string;
  target_language: string;
  original_content: string;
  translated_content: string;
  translation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tone_preservation_score: number;
  cultural_adaptation_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlossaryEntry {
  id: string;
  story_id: string;
  user_id: string;
  entry_type: string;
  entry_name: string;
  entry_description: string;
  discovered_at: string;
  discovery_chapter_id: string | null;
  spoiler_protected: boolean;
  related_entries: string[];
  lore_depth: number;
  created_at: string;
}

export interface WritingPrompt {
  id: string;
  user_id: string;
  prompt_type: string;
  genre_specific: string | null;
  worldbuilding_focus: string | null;
  character_motivation_theme: string | null;
  scene_construction_guidance: string | null;
  atmospheric_enhancements: string[];
  psychological_layers: string | null;
  suggested_expansions: string | null;
  created_at: string;
}

// AI Prompt Templates
export async function getPromptTemplates(userId: string, storyId?: string) {
  try {
    let query = supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AIPromptTemplate[];
  } catch (error: any) {
    console.error('Error fetching prompt templates:', error);
    throw error;
  }
}

export async function createPromptTemplate(template: Partial<AIPromptTemplate>) {
  try {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data as AIPromptTemplate;
  } catch (error: any) {
    console.error('Error creating prompt template:', error);
    throw error;
  }
}

export async function updatePromptTemplate(id: string, updates: Partial<AIPromptTemplate>) {
  try {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AIPromptTemplate;
  } catch (error: any) {
    console.error('Error updating prompt template:', error);
    throw error;
  }
}

// Dynamic Prompt Chains
export async function getPromptChains(userId: string, storyId?: string) {
  try {
    let query = supabase
      .from('dynamic_prompt_chains')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as DynamicPromptChain[];
  } catch (error: any) {
    console.error('Error fetching prompt chains:', error);
    throw error;
  }
}

export async function createPromptChain(chain: Partial<DynamicPromptChain>) {
  try {
    const { data, error } = await supabase
      .from('dynamic_prompt_chains')
      .insert([chain])
      .select()
      .single();

    if (error) throw error;
    return data as DynamicPromptChain;
  } catch (error: any) {
    console.error('Error creating prompt chain:', error);
    throw error;
  }
}

// Procedural Content
export async function getProceduralContent(storyId: string, chapterId?: string) {
  try {
    let query = supabase
      .from('procedural_content')
      .select('*')
      .eq('story_id', storyId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (chapterId) {
      query = query.eq('chapter_id', chapterId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ProceduralContent[];
  } catch (error: any) {
    console.error('Error fetching procedural content:', error);
    throw error;
  }
}

export async function generateProceduralContent(content: Partial<ProceduralContent>) {
  try {
    const { data, error } = await supabase
      .from('procedural_content')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data as ProceduralContent;
  } catch (error: any) {
    console.error('Error generating procedural content:', error);
    throw error;
  }
}

// Story Path Analytics
export async function getStoryAnalytics(storyId: string, chapterId?: string) {
  try {
    let query = supabase
      .from('story_path_analytics')
      .select('*')
      .eq('story_id', storyId);

    if (chapterId) {
      query = query.eq('chapter_id', chapterId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as StoryPathAnalytics[];
  } catch (error: any) {
    console.error('Error fetching story analytics:', error);
    throw error;
  }
}

// Reading Journey Recaps
export async function getReadingRecaps(userId: string, storyId?: string) {
  try {
    let query = supabase
      .from('reading_journey_recaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ReadingJourneyRecap[];
  } catch (error: any) {
    console.error('Error fetching reading recaps:', error);
    throw error;
  }
}

export async function generateReadingRecap(recap: Partial<ReadingJourneyRecap>) {
  try {
    const { data, error } = await supabase
      .from('reading_journey_recaps')
      .insert([recap])
      .select()
      .single();

    if (error) throw error;
    return data as ReadingJourneyRecap;
  } catch (error: any) {
    console.error('Error generating reading recap:', error);
    throw error;
  }
}

// Story Translations
export async function getStoryTranslations(storyId: string, targetLanguage?: string) {
  try {
    let query = supabase
      .from('story_translations')
      .select('*')
      .eq('story_id', storyId)
      .eq('translation_status', 'completed');

    if (targetLanguage) {
      query = query.eq('target_language', targetLanguage);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as StoryTranslation[];
  } catch (error: any) {
    console.error('Error fetching translations:', error);
    throw error;
  }
}

// Story Glossary
export async function getGlossaryEntries(userId: string, storyId: string) {
  try {
    const { data, error } = await supabase
      .from('story_glossary')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GlossaryEntry[];
  } catch (error: any) {
    console.error('Error fetching glossary entries:', error);
    throw error;
  }
}

export async function addGlossaryEntry(entry: Partial<GlossaryEntry>) {
  try {
    const { data, error } = await supabase
      .from('story_glossary')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data as GlossaryEntry;
  } catch (error: any) {
    console.error('Error adding glossary entry:', error);
    throw error;
  }
}

// Writing Prompts
export async function getWritingPrompts(userId: string, promptType?: string) {
  try {
    let query = supabase
      .from('writing_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (promptType) {
      query = query.eq('prompt_type', promptType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as WritingPrompt[];
  } catch (error: any) {
    console.error('Error fetching writing prompts:', error);
    throw error;
  }
}

export async function createWritingPrompt(prompt: Partial<WritingPrompt>) {
  try {
    const { data, error } = await supabase
      .from('writing_prompts')
      .insert([prompt])
      .select()
      .single();

    if (error) throw error;
    return data as WritingPrompt;
  } catch (error: any) {
    console.error('Error creating writing prompt:', error);
    throw error;
  }
}