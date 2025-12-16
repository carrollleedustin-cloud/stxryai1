import { supabase } from '@/lib/supabase/client';
import {
  insertComment,
  updateCommentById,
  deleteCommentById,
} from '@/lib/supabase/typed';

export const commentService = {
  async postComment(storyId: string, content: string, parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await insertComment({
      story_id: storyId,
      user_id: user.id,
      content,
      parent_id: parentId,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async editComment(commentId: string, content: string) {
    const { data, error } = await updateCommentById(commentId, { content, is_edited: true });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  },

  async deleteComment(commentId: string) {
    const { error } = await deleteCommentById(commentId);
    if (error) throw error;
  },

  async likeComment(commentId: string) {
    // This is a placeholder implementation.
    // A real implementation would require a 'likes' table.
    const { data, error } = await supabase
      .rpc('increment_comment_like', { comment_id: commentId });

    if (error) throw error;
    return data;
  },
};
