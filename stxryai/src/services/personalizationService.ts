import { supabase } from '@/lib/supabase/client';

export interface ThemeSettings {
    [key: string]: string | number;
}

export interface EmotionalBond {
    type: string;
    intensity: number;
    timestamp: string;
}

export interface ConflictHistory {
    description: string;
    outcome: string;
    timestamp: string;
}

export interface EvolutionEvent {
    event: string;
    change: string;
    timestamp: string;
}

export interface UserUITheme {
  id: string;
  user_id: string;
  theme_name: string;
  theme_category: 'color_palette' | 'typography' | 'layout' | 'animation' | 'genre_atmosphere';
  color_palette: Record<string, string>;
  typography_settings: ThemeSettings;
  layout_preferences: ThemeSettings;
  animation_settings: ThemeSettings;
  genre_atmosphere: ThemeSettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CharacterRelationship {
  id: string;
  story_id: string;
  user_id: string;
  character_a_name: string;
  character_b_name: string;
  relationship_type: 'ally' | 'rival' | 'romantic' | 'mentor' | 'family' | 'enemy' | 'neutral';
  relationship_strength: number;
  emotional_bonds: EmotionalBond[];
  conflict_history: ConflictHistory[];
  alliance_status: string | null;
  secret_dynamics: string | null;
  evolution_timeline: EvolutionEvent[];
  created_at: string;
  updated_at: string;
}

export interface AchievementTier {
  id: string;
  badge_id: string;
  tier_level: number;
  tier_name: string;
  requirements: Record<string, string | number>;
  rewards: Record<string, string | number>;
  seasonal_theme: string | null;
  story_specific: boolean;
  created_at: string;
}

export interface DiscoveryPreferences {
  id: string;
  user_id: string;
  favorite_genres: string[];
  preferred_writing_styles: string[];
  emotional_tone_preferences: string[];
  branching_behavior_patterns: Record<string, string | number>;
  reading_pace_preference: string;
  content_maturity_level: string;
  discovery_algorithm_weights: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface ReaderFeedback {
  id: string;
  giver_user_id: string;
  receiver_user_id: string;
  story_id: string;
  feedback_type: string;
  gift_item: Record<string, string | number>;
  milestone_achieved: string | null;
  message: string | null;
  created_at: string;
}

// UI Themes
export async function getUserThemes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_ui_themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserUITheme[];
  } catch (error: unknown) {
    console.error('Error fetching user themes:', error);
    throw error;
  }
}

export async function getActiveTheme(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_ui_themes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as UserUITheme | null;
  } catch (error: unknown) {
    console.error('Error fetching active theme:', error);
    return null;
  }
}

export async function createTheme(theme: Partial<UserUITheme>) {
  try {
    const { data, error } = await supabase
      .from('user_ui_themes')
      .insert([theme])
      .select()
      .single();

    if (error) throw error;
    return data as UserUITheme;
  } catch (error: unknown) {
    console.error('Error creating theme:', error);
    throw error;
  }
}

export async function updateTheme(id: string, updates: Partial<UserUITheme>) {
  try {
    const { data, error } = await supabase
      .from('user_ui_themes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserUITheme;
  } catch (error: unknown) {
    console.error('Error updating theme:', error);
    throw error;
  }
}

export async function setActiveTheme(userId: string, themeId: string) {
  try {
    // Deactivate all themes
    await supabase
      .from('user_ui_themes')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Activate selected theme
    const { data, error } = await supabase
      .from('user_ui_themes')
      .update({ is_active: true })
      .eq('id', themeId)
      .select()
      .single();

    if (error) throw error;
    return data as UserUITheme;
  } catch (error: unknown) {
    console.error('Error setting active theme:', error);
    throw error;
  }
}

export async function deleteTheme(id: string) {
  try {
    const { error } = await supabase
      .from('user_ui_themes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: unknown) {
    console.error('Error deleting theme:', error);
    throw error;
  }
}

// Character Relationships
export async function getCharacterRelationships(userId: string, storyId: string) {
  try {
    const { data, error } = await supabase
      .from('character_relationships')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .order('relationship_strength', { ascending: false });

    if (error) throw error;
    return data as CharacterRelationship[];
  } catch (error: unknown) {
    console.error('Error fetching character relationships:', error);
    throw error;
  }
}

export async function createCharacterRelationship(relationship: Partial<CharacterRelationship>) {
  try {
    const { data, error } = await supabase
      .from('character_relationships')
      .insert([relationship])
      .select()
      .single();

    if (error) throw error;
    return data as CharacterRelationship;
  } catch (error: unknown) {
    console.error('Error creating character relationship:', error);
    throw error;
  }
}

export async function updateCharacterRelationship(id: string, updates: Partial<CharacterRelationship>) {
  try {
    const { data, error } = await supabase
      .from('character_relationships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CharacterRelationship;
  } catch (error: unknown) {
    console.error('Error updating character relationship:', error);
    throw error;
  }
}

// Achievement Tiers
export async function getAchievementTiers(badgeId?: string) {
  try {
    let query = supabase
      .from('achievement_tiers')
      .select('*')
      .order('tier_level', { ascending: true });

    if (badgeId) {
      query = query.eq('badge_id', badgeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AchievementTier[];
  } catch (error: unknown) {
    console.error('Error fetching achievement tiers:', error);
    throw error;
  }
}

// Discovery Preferences
export async function getDiscoveryPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('discovery_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as DiscoveryPreferences | null;
  } catch (error: unknown) {
    console.error('Error fetching discovery preferences:', error);
    return null;
  }
}

export async function updateDiscoveryPreferences(userId: string, preferences: Partial<DiscoveryPreferences>) {
  try {
    // Try update first
    let { data, error } = await supabase
      .from('discovery_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    // If no rows updated, insert new preferences
    if (error && error.code === 'PGRST116') {
      const insertResult = await supabase
        .from('discovery_preferences')
        .insert([{ ...preferences, user_id: userId }])
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) throw error;
    return data as DiscoveryPreferences;
  } catch (error: unknown) {
    console.error('Error updating discovery preferences:', error);
    throw error;
  }
}

// Reader Feedback
export async function getReceivedFeedback(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reader_feedback')
      .select('*, giver:users!giver_user_id(username, display_name, avatar_url)')
      .eq('receiver_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: unknown) {
    console.error('Error fetching received feedback:', error);
    throw error;
  }
}

export async function giveFeedback(feedback: Partial<ReaderFeedback>) {
  try {
    const { data, error } = await supabase
      .from('reader_feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) throw error;
    return data as ReaderFeedback;
  } catch (error: unknown) {
    console.error('Error giving feedback:', error);
    throw error;
  }
}