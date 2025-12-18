/**
 * Story Collaboration Service
 * Enables collaborative story creation and co-authoring features.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface StoryCollaborator {
  id: string;
  story_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'contributor' | 'viewer';
  permissions: CollaboratorPermissions;
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'declined';
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface CollaboratorPermissions {
  can_edit_content: boolean;
  can_edit_chapters: boolean;
  can_edit_choices: boolean;
  can_publish: boolean;
  can_delete: boolean;
  can_invite_others: boolean;
  can_manage_settings: boolean;
}

export interface StoryComment {
  id: string;
  story_id: string;
  chapter_id?: string;
  user_id: string;
  content: string;
  line_number?: number;
  resolved: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
  replies?: StoryComment[];
}

export interface StoryRevision {
  id: string;
  story_id: string;
  chapter_id?: string;
  user_id: string;
  content_before: string;
  content_after: string;
  change_type: 'create' | 'edit' | 'delete' | 'reorder';
  change_summary?: string;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface CollaborationInvite {
  id: string;
  story_id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_id?: string;
  role: StoryCollaborator['role'];
  message?: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<StoryCollaborator['role'], CollaboratorPermissions> = {
  owner: {
    can_edit_content: true,
    can_edit_chapters: true,
    can_edit_choices: true,
    can_publish: true,
    can_delete: true,
    can_invite_others: true,
    can_manage_settings: true,
  },
  editor: {
    can_edit_content: true,
    can_edit_chapters: true,
    can_edit_choices: true,
    can_publish: true,
    can_delete: false,
    can_invite_others: true,
    can_manage_settings: false,
  },
  contributor: {
    can_edit_content: true,
    can_edit_chapters: false,
    can_edit_choices: false,
    can_publish: false,
    can_delete: false,
    can_invite_others: false,
    can_manage_settings: false,
  },
  viewer: {
    can_edit_content: false,
    can_edit_chapters: false,
    can_edit_choices: false,
    can_publish: false,
    can_delete: false,
    can_invite_others: false,
    can_manage_settings: false,
  },
};

export const collaborationService = {
  /**
   * Get collaborators for a story
   */
  async getCollaborators(storyId: string): Promise<StoryCollaborator[]> {
    const { data, error } = await supabase
      .from('story_collaborators')
      .select(
        `
        *,
        user:user_id (
          id,
          display_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching collaborators:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    })) as StoryCollaborator[];
  },

  /**
   * Get user's collaboration role for a story
   */
  async getUserRole(
    storyId: string,
    userId: string
  ): Promise<StoryCollaborator['role'] | null> {
    const { data } = await supabase
      .from('story_collaborators')
      .select('role')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single();

    return data?.role || null;
  },

  /**
   * Check if user has permission
   */
  async checkPermission(
    storyId: string,
    userId: string,
    permission: keyof CollaboratorPermissions
  ): Promise<boolean> {
    const role = await this.getUserRole(storyId, userId);
    if (!role) return false;

    return ROLE_PERMISSIONS[role][permission];
  },

  /**
   * Invite a collaborator
   */
  async inviteCollaborator(
    storyId: string,
    inviterId: string,
    inviteeEmail: string,
    role: StoryCollaborator['role'],
    message?: string
  ): Promise<CollaborationInvite | null> {
    // Check if inviter can invite
    const canInvite = await this.checkPermission(storyId, inviterId, 'can_invite_others');
    if (!canInvite) {
      console.error('User does not have permission to invite');
      return null;
    }

    // Generate invite token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', inviteeEmail)
      .single();

    const { data, error } = await supabase
      .from('collaboration_invites')
      .insert({
        story_id: storyId,
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
        invitee_id: existingUser?.id,
        role,
        message,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      return null;
    }

    return data;
  },

  /**
   * Accept a collaboration invite
   */
  async acceptInvite(token: string, userId: string): Promise<boolean> {
    // Get invite
    const { data: invite } = await supabase
      .from('collaboration_invites')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!invite) {
      console.error('Invalid or expired invite');
      return false;
    }

    // Create collaborator record
    const { error: collabError } = await supabase
      .from('story_collaborators')
      .insert({
        story_id: invite.story_id,
        user_id: userId,
        role: invite.role,
        permissions: ROLE_PERMISSIONS[invite.role as StoryCollaborator['role']],
        invited_by: invite.inviter_id,
        invited_at: invite.created_at,
        accepted_at: new Date().toISOString(),
        status: 'accepted',
      });

    if (collabError) {
      console.error('Error creating collaborator:', collabError);
      return false;
    }

    // Delete invite
    await supabase.from('collaboration_invites').delete().eq('id', invite.id);

    return true;
  },

  /**
   * Remove a collaborator
   */
  async removeCollaborator(
    storyId: string,
    userId: string,
    removerId: string
  ): Promise<boolean> {
    // Check if remover has permission (only owner or the user themselves)
    const removerRole = await this.getUserRole(storyId, removerId);
    if (removerRole !== 'owner' && removerId !== userId) {
      console.error('No permission to remove collaborator');
      return false;
    }

    const { error } = await supabase
      .from('story_collaborators')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing collaborator:', error);
      return false;
    }

    return true;
  },

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(
    storyId: string,
    userId: string,
    newRole: StoryCollaborator['role'],
    updaterId: string
  ): Promise<boolean> {
    // Only owner can change roles
    const updaterRole = await this.getUserRole(storyId, updaterId);
    if (updaterRole !== 'owner') {
      console.error('Only owner can change roles');
      return false;
    }

    const { error } = await supabase
      .from('story_collaborators')
      .update({
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole],
      })
      .eq('story_id', storyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return false;
    }

    return true;
  },

  /**
   * Add a comment to a story/chapter
   */
  async addComment(
    storyId: string,
    userId: string,
    content: string,
    options?: {
      chapterId?: string;
      lineNumber?: number;
      parentId?: string;
    }
  ): Promise<StoryComment | null> {
    const { data, error } = await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        user_id: userId,
        content,
        chapter_id: options?.chapterId,
        line_number: options?.lineNumber,
        parent_id: options?.parentId,
        resolved: false,
      })
      .select(
        `
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return data;
  },

  /**
   * Get comments for a story
   */
  async getComments(
    storyId: string,
    chapterId?: string
  ): Promise<StoryComment[]> {
    let query = supabase
      .from('story_comments')
      .select(
        `
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (chapterId) {
      query = query.eq('chapter_id', chapterId);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    // Fetch replies
    const { data: replies } = await supabase
      .from('story_comments')
      .select(
        `
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .not('parent_id', 'is', null)
      .order('created_at', { ascending: true });

    // Attach replies to comments
    const commentMap = new Map<string, StoryComment>();
    comments?.forEach((c) => commentMap.set(c.id, { ...c, replies: [] }));

    replies?.forEach((reply) => {
      const parent = commentMap.get(reply.parent_id);
      if (parent) {
        parent.replies?.push(reply);
      }
    });

    return Array.from(commentMap.values());
  },

  /**
   * Resolve a comment
   */
  async resolveComment(commentId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_comments')
      .update({ resolved: true })
      .eq('id', commentId);

    if (error) {
      console.error('Error resolving comment:', error);
      return false;
    }

    return true;
  },

  /**
   * Create a revision record
   */
  async createRevision(
    storyId: string,
    userId: string,
    contentBefore: string,
    contentAfter: string,
    changeType: StoryRevision['change_type'],
    options?: {
      chapterId?: string;
      changeSummary?: string;
    }
  ): Promise<StoryRevision | null> {
    const { data, error } = await supabase
      .from('story_revisions')
      .insert({
        story_id: storyId,
        chapter_id: options?.chapterId,
        user_id: userId,
        content_before: contentBefore,
        content_after: contentAfter,
        change_type: changeType,
        change_summary: options?.changeSummary,
      })
      .select(
        `
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating revision:', error);
      return null;
    }

    return data;
  },

  /**
   * Get revision history
   */
  async getRevisionHistory(
    storyId: string,
    options?: {
      chapterId?: string;
      limit?: number;
    }
  ): Promise<StoryRevision[]> {
    let query = supabase
      .from('story_revisions')
      .select(
        `
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (options?.chapterId) {
      query = query.eq('chapter_id', options.chapterId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching revisions:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    })) as StoryRevision[];
  },

  /**
   * Revert to a specific revision
   */
  async revertToRevision(
    revisionId: string,
    userId: string
  ): Promise<boolean> {
    const { data: revision } = await supabase
      .from('story_revisions')
      .select('*')
      .eq('id', revisionId)
      .single();

    if (!revision) {
      console.error('Revision not found');
      return false;
    }

    // Check permission
    const canEdit = await this.checkPermission(
      revision.story_id,
      userId,
      'can_edit_content'
    );
    if (!canEdit) {
      console.error('No permission to revert');
      return false;
    }

    // Create a new revision for the revert
    await this.createRevision(
      revision.story_id,
      userId,
      revision.content_after,
      revision.content_before,
      'edit',
      {
        chapterId: revision.chapter_id,
        changeSummary: `Reverted to revision from ${new Date(revision.created_at).toLocaleString()}`,
      }
    );

    return true;
  },

  /**
   * Get stories user is collaborating on
   */
  async getUserCollaborations(userId: string): Promise<
    Array<{
      story_id: string;
      role: StoryCollaborator['role'];
      story: {
        title: string;
        cover_image_url?: string;
      };
    }>
  > {
    const { data, error } = await supabase
      .from('story_collaborators')
      .select(
        `
        story_id,
        role,
        story:story_id (
          title,
          cover_image_url
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching collaborations:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      story_id: item.story_id,
      role: item.role,
      story: Array.isArray(item.story) ? item.story[0] || { title: '' } : item.story || { title: '' },
    }));
  },
};

export default collaborationService;
