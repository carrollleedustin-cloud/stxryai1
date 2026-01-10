/**
 * Collaboration Service
 * Manages story collaboration, invitations, and sessions
 */

import { createClient } from '@/lib/supabase/client';

export interface StoryCollaborator {
  id: string;
  storyId: string;
  collaboratorId: string;
  role: 'co_author' | 'editor' | 'beta_reader' | 'proofreader' | 'illustrator';
  permissions: Record<string, boolean>;
  invitationStatus: 'pending' | 'accepted' | 'declined' | 'revoked';
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  contributionPercentage: number;
  wordsContributed: number;
  chaptersContributed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationSession {
  id: string;
  storyId: string;
  chapterDraftId?: string;
  sessionName?: string;
  startedBy: string;
  startedAt: string;
  endedAt?: string;
  participants: string[];
  activeParticipants: string[];
  changesLog: any[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class CollaborationService {
  private supabase = createClient();

  // ========================================
  // COLLABORATORS
  // ========================================

  /**
   * Invite a collaborator
   */
  async inviteCollaborator(
    storyId: string,
    collaboratorId: string,
    role: StoryCollaborator['role'],
    invitedBy: string,
    permissions?: Record<string, boolean>
  ): Promise<StoryCollaborator> {
    const defaultPermissions = this.getDefaultPermissions(role);

    const { data, error } = await this.supabase
      .from('story_collaborators')
      .insert({
        story_id: storyId,
        collaborator_id: collaboratorId,
        role,
        permissions: permissions || defaultPermissions,
        invitation_status: 'pending',
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCollaborator(data);
  }

  /**
   * Accept collaboration invitation
   */
  async acceptInvitation(
    collaborationId: string,
    collaboratorId: string
  ): Promise<StoryCollaborator> {
    const { data, error } = await this.supabase
      .from('story_collaborators')
      .update({
        invitation_status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', collaborationId)
      .eq('collaborator_id', collaboratorId)
      .select()
      .single();

    if (error) throw error;
    return this.mapCollaborator(data);
  }

  /**
   * Get collaborators for a story
   */
  async getStoryCollaborators(storyId: string): Promise<StoryCollaborator[]> {
    const { data, error } = await this.supabase
      .from('story_collaborators')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapCollaborator(item));
  }

  /**
   * Get user's collaboration invitations
   */
  async getUserInvitations(userId: string): Promise<StoryCollaborator[]> {
    const { data, error } = await this.supabase
      .from('story_collaborators')
      .select('*')
      .eq('collaborator_id', userId)
      .eq('invitation_status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapCollaborator(item));
  }

  /**
   * Remove a collaborator
   */
  async removeCollaborator(collaborationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('story_collaborators')
      .update({ invitation_status: 'revoked' })
      .eq('id', collaborationId);

    if (error) throw error;
  }

  // ========================================
  // COLLABORATION SESSIONS
  // ========================================

  /**
   * Start a collaboration session
   */
  async startSession(
    storyId: string,
    startedBy: string,
    chapterDraftId?: string,
    sessionName?: string
  ): Promise<CollaborationSession> {
    const { data, error } = await this.supabase
      .from('collaboration_sessions')
      .insert({
        story_id: storyId,
        chapter_draft_id: chapterDraftId,
        session_name: sessionName,
        started_by: startedBy,
        participants: [startedBy],
        active_participants: [startedBy],
        changes_log: [],
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSession(data);
  }

  /**
   * Join a collaboration session
   */
  async joinSession(sessionId: string, userId: string): Promise<CollaborationSession> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const updatedParticipants = [...new Set([...session.participants, userId])];
    const updatedActive = [...new Set([...session.activeParticipants, userId])];

    const { data, error } = await this.supabase
      .from('collaboration_sessions')
      .update({
        participants: updatedParticipants,
        active_participants: updatedActive,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSession(data);
  }

  /**
   * Get active sessions for a story
   */
  async getStorySessions(storyId: string): Promise<CollaborationSession[]> {
    const { data, error } = await this.supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('story_id', storyId)
      .is('ended_at', null)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapSession(item));
  }

  /**
   * Get a session
   */
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    const { data, error } = await this.supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapSession(data);
  }

  /**
   * End a collaboration session
   */
  async endSession(sessionId: string): Promise<CollaborationSession> {
    const { data, error } = await this.supabase
      .from('collaboration_sessions')
      .update({
        ended_at: new Date().toISOString(),
        active_participants: [],
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSession(data);
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  private getDefaultPermissions(role: StoryCollaborator['role']): Record<string, boolean> {
    const permissions: Record<string, Record<string, boolean>> = {
      co_author: {
        can_edit: true,
        can_publish: true,
        can_delete: false,
        can_invite: true,
      },
      editor: {
        can_edit: true,
        can_publish: false,
        can_delete: false,
        can_invite: false,
      },
      beta_reader: {
        can_edit: false,
        can_publish: false,
        can_delete: false,
        can_invite: false,
      },
      proofreader: {
        can_edit: true,
        can_publish: false,
        can_delete: false,
        can_invite: false,
      },
      illustrator: {
        can_edit: false,
        can_publish: false,
        can_delete: false,
        can_invite: false,
      },
    };

    return permissions[role] || {};
  }

  private mapCollaborator(data: any): StoryCollaborator {
    return {
      id: data.id,
      storyId: data.story_id,
      collaboratorId: data.collaborator_id,
      role: data.role,
      permissions: data.permissions || {},
      invitationStatus: data.invitation_status,
      invitedBy: data.invited_by,
      invitedAt: data.invited_at,
      acceptedAt: data.accepted_at,
      contributionPercentage: parseFloat(data.contribution_percentage || '0'),
      wordsContributed: data.words_contributed || 0,
      chaptersContributed: data.chapters_contributed || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSession(data: any): CollaborationSession {
    return {
      id: data.id,
      storyId: data.story_id,
      chapterDraftId: data.chapter_draft_id,
      sessionName: data.session_name,
      startedBy: data.started_by,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      participants: data.participants || [],
      activeParticipants: data.active_participants || [],
      changesLog: data.changes_log || [],
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const collaborationService = new CollaborationService();
