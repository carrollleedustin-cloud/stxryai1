import { supabase } from '@/lib/supabase/client';
import { insertComment, updateCommentById, deleteCommentById } from '@/lib/supabase/typed';
import { sanitizeForDatabase, sanitizeStoryContent } from '@/lib/utils/sanitization';

/**
 * Comment service for managing story comments and interactions
 * Handles posting, editing, deleting, and liking comments with proper validation and sanitization
 */
export const commentService = {
  /**
   * Post a new comment on a story
   * @param storyId - The story ID to comment on
   * @param content - The comment content (will be sanitized)
   * @param parentId - Optional parent comment ID for replies
   * @returns The created comment
   */
  async postComment(storyId: string, content: string, parentId?: string) {
    try {
      // Validate inputs
      if (!storyId || typeof storyId !== 'string') {
        throw new Error('Valid story ID is required');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Comment content is required');
      }

      // Sanitize content to prevent XSS
      const sanitizedContent = sanitizeStoryContent(content.trim());
      if (sanitizedContent.length === 0) {
        throw new Error('Comment content cannot be empty after sanitization');
      }

      if (sanitizedContent.length > 2000) {
        throw new Error('Comment content must be less than 2000 characters');
      }

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in postComment:', authError);
        throw new Error('Authentication failed. Please sign in again.');
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await insertComment({
        story_id: storyId,
        user_id: user.id,
        content: sanitizedContent,
        parent_id: parentId || null,
      });

      if (error) {
        console.error('Database error posting comment:', error);
        throw new Error('Failed to post comment. Please try again.');
      }

      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      // Re-throw validation errors
      if (
        error instanceof Error &&
        (error.message.includes('required') || error.message.includes('cannot be empty'))
      ) {
        throw error;
      }

      console.error('Unexpected error in postComment:', error);
      throw new Error('An unexpected error occurred while posting the comment.');
    }
  },

  /**
   * Edit an existing comment
   * @param commentId - The comment ID to edit
   * @param content - The new content (will be sanitized)
   * @returns The updated comment
   */
  async editComment(commentId: string, content: string) {
    try {
      // Validate inputs
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Valid comment ID is required');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Comment content is required');
      }

      // Sanitize content
      const sanitizedContent = sanitizeStoryContent(content.trim());
      if (sanitizedContent.length === 0) {
        throw new Error('Comment content cannot be empty after sanitization');
      }

      if (sanitizedContent.length > 2000) {
        throw new Error('Comment content must be less than 2000 characters');
      }

      const { data, error } = await updateCommentById(commentId, {
        content: sanitizedContent,
        is_edited: true,
      });

      if (error) {
        console.error('Database error editing comment:', error);
        throw new Error('Failed to edit comment. Please try again.');
      }

      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      // Re-throw validation errors
      if (
        error instanceof Error &&
        (error.message.includes('required') || error.message.includes('cannot be empty'))
      ) {
        throw error;
      }

      console.error('Unexpected error in editComment:', error);
      throw new Error('An unexpected error occurred while editing the comment.');
    }
  },

  /**
   * Delete a comment
   * @param commentId - The comment ID to delete
   */
  async deleteComment(commentId: string) {
    try {
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Valid comment ID is required');
      }

      const { error } = await deleteCommentById(commentId);

      if (error) {
        console.error('Database error deleting comment:', error);
        throw new Error('Failed to delete comment. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error in deleteComment:', error);
      throw new Error('An unexpected error occurred while deleting the comment.');
    }
  },

  /**
   * Like or unlike a comment
   * @param commentId - The comment ID to like/unlike
   * @returns The updated like count
   */
  async likeComment(commentId: string) {
    try {
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Valid comment ID is required');
      }

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // TODO: Implement proper like system with likes table
      // For now, this is a placeholder that calls a hypothetical RPC function
      const { data, error } = await supabase.rpc('toggle_comment_like', {
        comment_id: commentId,
        user_id: user.id,
      });

      if (error) {
        console.error('Database error toggling comment like:', error);
        throw new Error('Failed to like/unlike comment. Please try again.');
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in likeComment:', error);
      throw new Error('An unexpected error occurred while processing your like.');
    }
  },
};
