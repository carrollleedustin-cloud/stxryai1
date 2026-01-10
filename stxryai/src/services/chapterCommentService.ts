/**
 * Chapter Comment Service
 * Manages chapter-level comments, threads, and discussions
 */

import { createClient } from '@/lib/supabase/client';

export interface ChapterComment {
  id: string;
  chapterId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  isEdited: boolean;
  editedAt?: string;
  paragraphNumber?: number;
  sentenceStart?: number;
  sentenceEnd?: number;
  selectedText?: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  isHidden: boolean;
  hiddenReason?: string;
  hiddenBy?: string;
  hiddenAt?: string;
  authorReplied: boolean;
  authorReplyId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterCommentThread {
  id: string;
  chapterId: string;
  threadTitle?: string;
  threadType: 'discussion' | 'question' | 'theory' | 'appreciation' | 'critique';
  commentCount: number;
  participantCount: number;
  lastActivityAt: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  isFeatured: boolean;
  featuredUntil?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterCommentStats {
  totalComments: number;
  totalThreads: number;
  totalLikes: number;
  uniqueCommenters: number;
  authorReplies: number;
}

export class ChapterCommentService {
  private supabase = createClient();

  // ========================================
  // COMMENTS
  // ========================================

  /**
   * Create a chapter comment
   */
  async createComment(
    chapterId: string,
    userId: string,
    comment: Partial<ChapterComment>
  ): Promise<ChapterComment> {
    const { data, error } = await this.supabase
      .from('chapter_comments')
      .insert({
        chapter_id: chapterId,
        user_id: userId,
        parent_comment_id: comment.parentCommentId,
        content: comment.content || '',
        paragraph_number: comment.paragraphNumber,
        sentence_start: comment.sentenceStart,
        sentence_end: comment.sentenceEnd,
        selected_text: comment.selectedText,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapComment(data);
  }

  /**
   * Get comments for a chapter
   */
  async getChapterComments(
    chapterId: string,
    options?: {
      parentId?: string | null;
      sortBy?: 'newest' | 'oldest' | 'most_liked' | 'most_replies';
      limit?: number;
      offset?: number;
    }
  ): Promise<ChapterComment[]> {
    let query = this.supabase
      .from('chapter_comments')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('is_hidden', false);

    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        query = query.is('parent_comment_id', null);
      } else {
        query = query.eq('parent_comment_id', options.parentId);
      }
    }

    // Sorting
    switch (options?.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_liked':
        query = query.order('like_count', { ascending: false });
        break;
      case 'most_replies':
        query = query.order('reply_count', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }

    // Pinned comments first
    query = query.order('is_pinned', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapComment(item));
  }

  /**
   * Get a single comment with replies
   */
  async getCommentWithReplies(commentId: string): Promise<{
    comment: ChapterComment;
    replies: ChapterComment[];
  }> {
    const [comment, replies] = await Promise.all([
      this.getComment(commentId),
      this.getReplies(commentId),
    ]);

    if (!comment) throw new Error('Comment not found');

    return { comment, replies };
  }

  /**
   * Get a single comment
   */
  async getComment(commentId: string): Promise<ChapterComment | null> {
    const { data, error } = await this.supabase
      .from('chapter_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapComment(data);
  }

  /**
   * Get replies to a comment
   */
  async getReplies(commentId: string): Promise<ChapterComment[]> {
    const { data, error } = await this.supabase
      .from('chapter_comments')
      .select('*')
      .eq('parent_comment_id', commentId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapComment(item));
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    updates: Partial<ChapterComment>
  ): Promise<ChapterComment> {
    const { data, error } = await this.supabase
      .from('chapter_comments')
      .update({
        content: updates.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return this.mapComment(data);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await this.supabase.from('chapter_comments').delete().eq('id', commentId);

    if (error) throw error;
  }

  // ========================================
  // LIKES
  // ========================================

  /**
   * Like a comment
   */
  async likeComment(commentId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from('chapter_comment_likes').insert({
      comment_id: commentId,
      user_id: userId,
    });

    if (error && error.code !== '23505') throw error; // Ignore duplicate like
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chapter_comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Check if user liked a comment
   */
  async hasUserLiked(commentId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chapter_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // ========================================
  // THREADS
  // ========================================

  /**
   * Create a comment thread
   */
  async createThread(
    chapterId: string,
    thread: Partial<ChapterCommentThread>
  ): Promise<ChapterCommentThread> {
    const { data, error } = await this.supabase
      .from('chapter_comment_threads')
      .insert({
        chapter_id: chapterId,
        thread_title: thread.threadTitle,
        thread_type: thread.threadType || 'discussion',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapThread(data);
  }

  /**
   * Get threads for a chapter
   */
  async getChapterThreads(chapterId: string): Promise<ChapterCommentThread[]> {
    const { data, error } = await this.supabase
      .from('chapter_comment_threads')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapThread(item));
  }

  // ========================================
  // SUBSCRIPTIONS
  // ========================================

  /**
   * Subscribe to chapter comments
   */
  async subscribeToChapter(
    chapterId: string,
    userId: string,
    options?: {
      notifyOnReply?: boolean;
      notifyOnAuthorReply?: boolean;
      notifyOnLike?: boolean;
    }
  ): Promise<void> {
    const { error } = await this.supabase.from('chapter_comment_subscriptions').upsert(
      {
        user_id: userId,
        chapter_id: chapterId,
        subscription_type: 'chapter',
        notify_on_reply: options?.notifyOnReply ?? true,
        notify_on_author_reply: options?.notifyOnAuthorReply ?? true,
        notify_on_like: options?.notifyOnLike ?? false,
      },
      {
        onConflict: 'user_id,chapter_id,comment_id,subscription_type',
      }
    );

    if (error) throw error;
  }

  /**
   * Unsubscribe from chapter comments
   */
  async unsubscribeFromChapter(chapterId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chapter_comment_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .eq('subscription_type', 'chapter');

    if (error) throw error;
  }

  // ========================================
  // STATS
  // ========================================

  /**
   * Get chapter comment statistics
   */
  async getChapterStats(chapterId: string): Promise<ChapterCommentStats> {
    const { data, error } = await this.supabase.rpc('get_chapter_comment_stats', {
      p_chapter_id: chapterId,
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        totalComments: 0,
        totalThreads: 0,
        totalLikes: 0,
        uniqueCommenters: 0,
        authorReplies: 0,
      };
    }

    return {
      totalComments: Number(data[0].total_comments || 0),
      totalThreads: Number(data[0].total_threads || 0),
      totalLikes: Number(data[0].total_likes || 0),
      uniqueCommenters: Number(data[0].unique_commenters || 0),
      authorReplies: Number(data[0].author_replies || 0),
    };
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapComment(data: any): ChapterComment {
    return {
      id: data.id,
      chapterId: data.chapter_id,
      userId: data.user_id,
      parentCommentId: data.parent_comment_id,
      content: data.content,
      isEdited: data.is_edited,
      editedAt: data.edited_at,
      paragraphNumber: data.paragraph_number,
      sentenceStart: data.sentence_start,
      sentenceEnd: data.sentence_end,
      selectedText: data.selected_text,
      likeCount: data.like_count || 0,
      replyCount: data.reply_count || 0,
      isPinned: data.is_pinned,
      pinnedBy: data.pinned_by,
      pinnedAt: data.pinned_at,
      isHidden: data.is_hidden,
      hiddenReason: data.hidden_reason,
      hiddenBy: data.hidden_by,
      hiddenAt: data.hidden_at,
      authorReplied: data.author_replied,
      authorReplyId: data.author_reply_id,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapThread(data: any): ChapterCommentThread {
    return {
      id: data.id,
      chapterId: data.chapter_id,
      threadTitle: data.thread_title,
      threadType: data.thread_type,
      commentCount: data.comment_count || 0,
      participantCount: data.participant_count || 0,
      lastActivityAt: data.last_activity_at,
      isLocked: data.is_locked,
      lockedBy: data.locked_by,
      lockedAt: data.locked_at,
      lockReason: data.lock_reason,
      isFeatured: data.is_featured,
      featuredUntil: data.featured_until,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const chapterCommentService = new ChapterCommentService();
