import { supabase } from '@/lib/supabase/client';
import {
  insertStory,
  insertChapter,
  updateChapterById,
  updateStoryById,
  deleteChapterById,
} from '@/lib/supabase/typed';

export interface StoryNode {
  id: string;
  chapterId?: string;
  title: string;
  content: string;
  chapterNumber: number;
  choices: ChoiceNode[];
  position?: { x: number; y: number };
}

export interface ChoiceNode {
  id: string;
  choiceText: string;
  consequenceText?: string;
  nextChapterId?: string;
  choiceOrder: number;
}

/**
 * Story Mode Types:
 * - 'static': Author writes everything, no AI generation (linear reading experience)
 * - 'ai_choices': AI generates choices at chapter ends, readers pick from options
 * - 'ai_infinite': Full AI-powered infinite branching with companion memory
 */
export type StoryMode = 'static' | 'ai_choices' | 'ai_infinite';

/**
 * Custom Choice Access Tier:
 * Determines which subscription tier can write custom choices (type their own path)
 */
export type CustomChoiceTier = 'none' | 'premium' | 'pro' | 'all';

export interface StoryMetadata {
  id?: string;
  title: string;
  description: string;
  genre:
    | 'fantasy'
    | 'sci-fi'
    | 'mystery'
    | 'romance'
    | 'horror'
    | 'adventure'
    | 'thriller'
    | 'historical';
  difficulty: 'easy' | 'medium' | 'hard';
  coverImageUrl: string;
  isPremium: boolean;
  estimatedDuration?: number;
  
  // AI Autonomy Settings
  storyMode: StoryMode;
  customChoiceTier: CustomChoiceTier;
  
  // AI Companion Settings (for ai_infinite mode)
  enableAICompanion: boolean;
  companionPersonality?: string;
  companionName?: string;
}

// Create a new story draft
export const createStoryDraft = async (metadata: StoryMetadata, authorId: string) => {
  try {
    const { data, error } = await insertStory({
      title: metadata.title,
      description: metadata.description,
      genre: metadata.genre,
      difficulty: metadata.difficulty,
      cover_image: metadata.coverImageUrl,
      is_premium: metadata.isPremium,
      estimated_duration: metadata.estimatedDuration,
      user_id: authorId,
      is_published: false,
      // AI Autonomy fields
      story_mode: metadata.storyMode || 'ai_choices',
      custom_choice_tier: metadata.customChoiceTier || 'none',
      enable_ai_companion: metadata.enableAICompanion || false,
      companion_personality: metadata.companionPersonality,
      companion_name: metadata.companionName,
    });

    if (error) throw error;
    return { success: true, story: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error creating story draft:', error);
    return { success: false, error };
  }
};

// Add a chapter to a story
export const addChapter = async (storyId: string, chapter: Omit<StoryNode, 'id' | 'choices'>) => {
  try {
    const { data, error } = await insertChapter({
      story_id: storyId,
      title: chapter.title,
      content: chapter.content,
      chapter_number: chapter.chapterNumber,
    });

    if (error) throw error;

    // Update story total chapters count
    const { error: updateError } = await supabase.rpc('increment', {
      table_name: 'stories',
      row_id: storyId,
      column_name: 'total_chapters',
    });

    return { success: true, chapter: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error adding chapter:', error);
    return { success: false, error };
  }
};

// Add choices to a chapter
export const addChoicesToChapter = async (chapterId: string, choices: Omit<ChoiceNode, 'id'>[]) => {
  try {
    const choicesData = choices.map((choice) => ({
      chapter_id: chapterId,
      text: choice.choiceText,
      position: choice.choiceOrder,
      next_chapter_id: choice.nextChapterId,
    }));

    const { data, error } = await supabase.from('choices').insert(choicesData).select();

    if (error) throw error;
    return { success: true, choices: data };
  } catch (error) {
    console.error('Error adding choices:', error);
    return { success: false, error };
  }
};

// Get story with all chapters and choices for editing
export const getStoryForEditing = async (storyId: string) => {
  try {
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) throw storyError;

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select(
        `
        *,
        choices (*)
      `
      )
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true });

    if (chaptersError) throw chaptersError;

    return { success: true, story, chapters };
  } catch (error) {
    console.error('Error fetching story for editing:', error);
    return { success: false, error };
  }
};

// Update chapter content
export const updateChapter = async (chapterId: string, updates: Partial<StoryNode>) => {
  try {
    const { data, error } = await updateChapterById(chapterId, {
      title: updates.title,
      content: updates.content,
    });

    if (error) throw error;
    return { success: true, chapter: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error updating chapter:', error);
    return { success: false, error };
  }
};

// Update story metadata
export const updateStoryMetadata = async (storyId: string, metadata: Partial<StoryMetadata>) => {
  try {
    const patch: Record<string, string | boolean | number | null | undefined> = {
      title: metadata.title,
      description: metadata.description,
      genre: metadata.genre,
      difficulty: metadata.difficulty,
      cover_image: metadata.coverImageUrl,
      is_premium: metadata.isPremium,
      estimated_duration: metadata.estimatedDuration,
      // AI Autonomy fields
      story_mode: metadata.storyMode,
      custom_choice_tier: metadata.customChoiceTier,
      enable_ai_companion: metadata.enableAICompanion,
      companion_personality: metadata.companionPersonality,
      companion_name: metadata.companionName,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(patch).forEach(key => {
      if (patch[key] === undefined) delete patch[key];
    });

    const { data, error } = await updateStoryById(storyId, patch);

    if (error) throw error;
    return { success: true, story: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error updating story metadata:', error);
    return { success: false, error };
  }
};

// Publish story (change status from draft to published)
export const publishStory = async (storyId: string) => {
  try {
    const { data, error } = await updateStoryById(storyId, {
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true, story: Array.isArray(data) ? data[0] : data };
  } catch (error) {
    console.error('Error publishing story:', error);
    return { success: false, error };
  }
};

// Delete chapter
export const deleteChapter = async (chapterId: string) => {
  try {
    // First delete all choices associated with this chapter
    const { error: choicesError } = await supabase
      .from('choices')
      .delete()
      .eq('chapter_id', chapterId);

    if (choicesError) throw choicesError;

    // Then delete the chapter
    const { error } = await deleteChapterById(chapterId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return { success: false, error };
  }
};

// Get user's draft stories
export const getUserDrafts = async (authorId: string) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', authorId)
      .eq('is_published', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, drafts: data };
  } catch (error) {
    console.error('Error fetching user drafts:', error);
    return { success: false, error };
  }
};
