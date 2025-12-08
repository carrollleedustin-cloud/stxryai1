import { supabase } from '@/lib/supabase';

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

export interface StoryMetadata {
  id?: string;
  title: string;
  description: string;
  genre: 'fantasy' | 'sci-fi' | 'mystery' | 'romance' | 'horror' | 'adventure' | 'thriller' | 'historical';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  coverImageUrl: string;
  isPremium: boolean;
  estimatedDuration?: number;
}

// Create a new story draft
export const createStoryDraft = async (metadata: StoryMetadata, authorId: string) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: metadata.title,
        description: metadata.description,
        genre: metadata.genre,
        difficulty: metadata.difficulty,
        cover_image_url: metadata.coverImageUrl,
        is_premium: metadata.isPremium,
        estimated_duration: metadata.estimatedDuration,
        author_id: authorId,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, story: data };
  } catch (error) {
    console.error('Error creating story draft:', error);
    return { success: false, error };
  }
};

// Add a chapter to a story
export const addChapter = async (storyId: string, chapter: Omit<StoryNode, 'id' | 'choices'>) => {
  try {
    const { data, error } = await supabase
      .from('story_chapters')
      .insert({
        story_id: storyId,
        title: chapter.title,
        content: chapter.content,
        chapter_number: chapter.chapterNumber
      })
      .select()
      .single();

    if (error) throw error;

    // Update story total chapters count
    const { error: updateError } = await supabase.rpc('increment', {
      table_name: 'stories',
      row_id: storyId,
      column_name: 'total_chapters'
    });

    return { success: true, chapter: data };
  } catch (error) {
    console.error('Error adding chapter:', error);
    return { success: false, error };
  }
};

// Add choices to a chapter
export const addChoicesToChapter = async (chapterId: string, choices: Omit<ChoiceNode, 'id'>[]) => {
  try {
    const choicesData = choices.map(choice => ({
      chapter_id: chapterId,
      choice_text: choice.choiceText,
      consequence_text: choice.consequenceText,
      choice_order: choice.choiceOrder,
      next_chapter_id: choice.nextChapterId
    }));

    const { data, error } = await supabase
      .from('story_choices')
      .insert(choicesData)
      .select();

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
      .from('story_chapters')
      .select(`
        *,
        story_choices (*)
      `)
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
    const { data, error } = await supabase
      .from('story_chapters')
      .update({
        title: updates.title,
        content: updates.content
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, chapter: data };
  } catch (error) {
    console.error('Error updating chapter:', error);
    return { success: false, error };
  }
};

// Update story metadata
export const updateStoryMetadata = async (storyId: string, metadata: Partial<StoryMetadata>) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update({
        ...metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, story: data };
  } catch (error) {
    console.error('Error updating story metadata:', error);
    return { success: false, error };
  }
};

// Publish story (change status from draft to published)
export const publishStory = async (storyId: string) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, story: data };
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
      .from('story_choices')
      .delete()
      .eq('chapter_id', chapterId);

    if (choicesError) throw choicesError;

    // Then delete the chapter
    const { error } = await supabase
      .from('story_chapters')
      .delete()
      .eq('id', chapterId);

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
      .eq('author_id', authorId)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, drafts: data };
  } catch (error) {
    console.error('Error fetching user drafts:', error);
    return { success: false, error };
  }
};