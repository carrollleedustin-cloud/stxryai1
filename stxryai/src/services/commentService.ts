import { supabase } from '@/lib/supabase/client';

export const commentService = {
  async postComment(storyId: string, content: string, parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        story_id: storyId,
        user_id: user.id,
        content,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async editComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, is_edited: true })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
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
