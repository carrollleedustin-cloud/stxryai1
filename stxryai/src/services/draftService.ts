/**
 * Draft Service
 * Manages story and chapter drafts with version control
 */

import { createClient } from '@/lib/supabase/client';

export interface StoryDraft {
  id: string;
  storyId?: string;
  authorId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  genre?: string;
  tags: string[];
  draftStatus: 'draft' | 'review' | 'ready' | 'archived';
  isAutoSave: boolean;
  versionNumber: number;
  parentDraftId?: string;
  wordCount: number;
  characterCount: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDraft {
  id: string;
  chapterId?: string;
  storyDraftId: string;
  title: string;
  content: string;
  chapterNumber: number;
  isPublished: boolean;
  versionNumber: number;
  parentDraftId?: string;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes?: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftComment {
  id: string;
  draftId: string;
  chapterDraftId?: string;
  commenterId: string;
  content: string;
  commentType: 'general' | 'suggestion' | 'question' | 'praise' | 'issue';
  startPosition?: number;
  endPosition?: number;
  selectedText?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export class DraftService {
  private supabase = createClient();

  // ========================================
  // STORY DRAFTS
  // ========================================

  /**
   * Create a new story draft
   */
  async createStoryDraft(
    authorId: string,
    storyId: string | null,
    draft: Partial<StoryDraft>
  ): Promise<StoryDraft> {
    const { data, error } = await this.supabase
      .from('story_drafts')
      .insert({
        story_id: storyId,
        author_id: authorId,
        title: draft.title || 'Untitled Story',
        description: draft.description,
        cover_image_url: draft.coverImageUrl,
        genre: draft.genre,
        tags: draft.tags || [],
        draft_status: draft.draftStatus || 'draft',
        is_auto_save: draft.isAutoSave || false,
        version_number: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapStoryDraft(data);
  }

  /**
   * Get story drafts
   */
  async getStoryDrafts(authorId: string, storyId?: string): Promise<StoryDraft[]> {
    let query = this.supabase
      .from('story_drafts')
      .select('*')
      .eq('author_id', authorId)
      .order('last_edited_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapStoryDraft(item));
  }

  /**
   * Get a single story draft
   */
  async getStoryDraft(draftId: string): Promise<StoryDraft | null> {
    const { data, error } = await this.supabase
      .from('story_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapStoryDraft(data);
  }

  /**
   * Update story draft
   */
  async updateStoryDraft(draftId: string, updates: Partial<StoryDraft>): Promise<StoryDraft> {
    const { data, error } = await this.supabase
      .from('story_drafts')
      .update({
        title: updates.title,
        description: updates.description,
        cover_image_url: updates.coverImageUrl,
        genre: updates.genre,
        tags: updates.tags,
        draft_status: updates.draftStatus,
        is_auto_save: updates.isAutoSave,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw error;
    return this.mapStoryDraft(data);
  }

  /**
   * Create a new version of a draft
   */
  async createDraftVersion(draftId: string): Promise<StoryDraft> {
    const currentDraft = await this.getStoryDraft(draftId);
    if (!currentDraft) throw new Error('Draft not found');

    const { data, error } = await this.supabase
      .from('story_drafts')
      .insert({
        story_id: currentDraft.storyId || null,
        author_id: currentDraft.authorId,
        title: currentDraft.title,
        description: currentDraft.description,
        cover_image_url: currentDraft.coverImageUrl,
        genre: currentDraft.genre,
        tags: currentDraft.tags,
        draft_status: 'draft',
        is_auto_save: false,
        version_number: currentDraft.versionNumber + 1,
        parent_draft_id: draftId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapStoryDraft(data);
  }

  // ========================================
  // CHAPTER DRAFTS
  // ========================================

  /**
   * Create a chapter draft
   */
  async createChapterDraft(
    storyDraftId: string,
    chapterId: string | null,
    draft: Partial<ChapterDraft>
  ): Promise<ChapterDraft> {
    const { data, error } = await this.supabase
      .from('chapter_drafts')
      .insert({
        chapter_id: chapterId,
        story_draft_id: storyDraftId,
        title: draft.title || 'Untitled Chapter',
        content: draft.content || '',
        chapter_number: draft.chapterNumber || 1,
        is_published: draft.isPublished || false,
        version_number: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapChapterDraft(data);
  }

  /**
   * Get chapter drafts for a story draft
   */
  async getChapterDrafts(storyDraftId: string): Promise<ChapterDraft[]> {
    const { data, error } = await this.supabase
      .from('chapter_drafts')
      .select('*')
      .eq('story_draft_id', storyDraftId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapChapterDraft(item));
  }

  /**
   * Update chapter draft
   */
  async updateChapterDraft(
    draftId: string,
    updates: Partial<ChapterDraft>
  ): Promise<ChapterDraft> {
    const { data, error } = await this.supabase
      .from('chapter_drafts')
      .update({
        title: updates.title,
        content: updates.content,
        chapter_number: updates.chapterNumber,
        is_published: updates.isPublished,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw error;
    return this.mapChapterDraft(data);
  }

  /**
   * Auto-save chapter draft
   */
  async autoSaveChapterDraft(
    draftId: string,
    content: string
  ): Promise<ChapterDraft> {
    return this.updateChapterDraft(draftId, { content });
  }

  // ========================================
  // DRAFT COMMENTS
  // ========================================

  /**
   * Add a comment to a draft
   */
  async addDraftComment(
    draftId: string,
    commenterId: string,
    comment: Partial<DraftComment>
  ): Promise<DraftComment> {
    const { data, error } = await this.supabase
      .from('draft_comments')
      .insert({
        draft_id: draftId,
        chapter_draft_id: comment.chapterDraftId,
        commenter_id: commenterId,
        content: comment.content || '',
        comment_type: comment.commentType || 'general',
        start_position: comment.startPosition,
        end_position: comment.endPosition,
        selected_text: comment.selectedText,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDraftComment(data);
  }

  /**
   * Get comments for a draft
   */
  async getDraftComments(draftId: string): Promise<DraftComment[]> {
    const { data, error } = await this.supabase
      .from('draft_comments')
      .select('*')
      .eq('draft_id', draftId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapDraftComment(item));
  }

  /**
   * Resolve a comment
   */
  async resolveComment(commentId: string, resolvedBy: string): Promise<DraftComment> {
    const { data, error } = await this.supabase
      .from('draft_comments')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDraftComment(data);
  }

  // ========================================
  // PUBLISH DRAFT
  // ========================================

  /**
   * Publish a draft to a story
   */
  async publishDraft(draftId: string): Promise<void> {
    const draft = await this.getStoryDraft(draftId);
    if (!draft) throw new Error('Draft not found');

    // This would integrate with the story service to create/update the story
    // For now, we'll just mark it as ready
    await this.updateStoryDraft(draftId, { draftStatus: 'ready' });
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapStoryDraft(data: any): StoryDraft {
    return {
      id: data.id,
      storyId: data.story_id,
      authorId: data.author_id,
      title: data.title,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      genre: data.genre,
      tags: data.tags || [],
      draftStatus: data.draft_status,
      isAutoSave: data.is_auto_save,
      versionNumber: data.version_number,
      parentDraftId: data.parent_draft_id,
      wordCount: data.word_count || 0,
      characterCount: data.character_count || 0,
      lastEditedAt: data.last_edited_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapChapterDraft(data: any): ChapterDraft {
    return {
      id: data.id,
      chapterId: data.chapter_id,
      storyDraftId: data.story_draft_id,
      title: data.title,
      content: data.content,
      chapterNumber: data.chapter_number,
      isPublished: data.is_published,
      versionNumber: data.version_number,
      parentDraftId: data.parent_draft_id,
      wordCount: data.word_count || 0,
      characterCount: data.character_count || 0,
      readingTimeMinutes: data.reading_time_minutes,
      lastEditedAt: data.last_edited_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDraftComment(data: any): DraftComment {
    return {
      id: data.id,
      draftId: data.draft_id,
      chapterDraftId: data.chapter_draft_id,
      commenterId: data.commenter_id,
      content: data.content,
      commentType: data.comment_type,
      startPosition: data.start_position,
      endPosition: data.end_position,
      selectedText: data.selected_text,
      isResolved: data.is_resolved,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const draftService = new DraftService();

