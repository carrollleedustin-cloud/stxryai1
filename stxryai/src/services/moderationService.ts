/**
 * Moderation Service
 * User reports, moderation actions, and content management
 */

import { createClient } from '@/lib/supabase/client';
import { rbacService } from './rbacService';

export type ReportType = 
  | 'spam' 
  | 'harassment' 
  | 'inappropriate_content' 
  | 'copyright' 
  | 'impersonation' 
  | 'hate_speech' 
  | 'violence' 
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';

export type ModerationActionType = 
  | 'warning' 
  | 'mute' 
  | 'temp_ban' 
  | 'perm_ban' 
  | 'unmute' 
  | 'unban' 
  | 'content_removal' 
  | 'account_restriction' 
  | 'note';

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string | null;
  reportedUserName: string | null;
  reportedContentType: string | null;
  reportedContentId: string | null;
  reportType: ReportType;
  description: string | null;
  evidenceUrls: string[];
  status: ReportStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo: string | null;
  assignedToName: string | null;
  resolutionType: string | null;
  resolutionNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  userId: string;
  userName: string;
  moderatorId: string;
  moderatorName: string;
  actionType: ModerationActionType;
  reason: string;
  durationHours: number | null;
  expiresAt: string | null;
  isActive: boolean;
  appealStatus: 'none' | 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface StaffNote {
  id: string;
  userId: string;
  staffId: string;
  staffName: string;
  noteType: 'general' | 'warning' | 'positive' | 'watch_list' | 'vip';
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface ModerationStats {
  pendingReports: number;
  reportsToday: number;
  actionsToday: number;
  activeBans: number;
  activeMutes: number;
}

class ModerationService {
  private supabase = createClient();

  /**
   * Create a user report
   */
  async createReport(
    reporterId: string,
    data: {
      reportedUserId?: string;
      reportedContentType?: string;
      reportedContentId?: string;
      reportType: ReportType;
      description?: string;
      evidenceUrls?: string[];
    }
  ): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      // Determine priority based on report type
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
      if (['hate_speech', 'violence'].includes(data.reportType)) {
        priority = 'urgent';
      } else if (['harassment', 'impersonation'].includes(data.reportType)) {
        priority = 'high';
      }

      const { data: report, error } = await this.supabase
        .from('user_reports')
        .insert({
          reporter_id: reporterId,
          reported_user_id: data.reportedUserId,
          reported_content_type: data.reportedContentType,
          reported_content_id: data.reportedContentId,
          report_type: data.reportType,
          description: data.description,
          evidence_urls: data.evidenceUrls || [],
          priority,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating report:', error);
        return { success: false, error: 'Failed to submit report' };
      }

      return { success: true, reportId: report.id };
    } catch (error) {
      console.error('Error in createReport:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get reports (staff only)
   */
  async getReports(
    moderatorId: string,
    options?: {
      status?: ReportStatus;
      priority?: string;
      assignedToMe?: boolean;
      limit?: number;
    }
  ): Promise<UserReport[]> {
    try {
      // Verify staff access
      if (!(await rbacService.hasPermission(moderatorId, 'view_reports'))) {
        console.error('Unauthorized: view_reports permission required');
        return [];
      }

      let query = this.supabase
        .from('user_reports')
        .select(`
          *,
          reporter:user_profiles!user_reports_reporter_id_fkey (display_name),
          reported:user_profiles!user_reports_reported_user_id_fkey (display_name),
          assigned:user_profiles!user_reports_assigned_to_fkey (display_name)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options?.assignedToMe) {
        query = query.eq('assigned_to', moderatorId);
      }

      query = query.limit(options?.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }

      return (data || []).map((report) => ({
        id: report.id,
        reporterId: report.reporter_id,
        reporterName: (report.reporter as any)?.display_name || 'Unknown',
        reportedUserId: report.reported_user_id,
        reportedUserName: (report.reported as any)?.display_name || null,
        reportedContentType: report.reported_content_type,
        reportedContentId: report.reported_content_id,
        reportType: report.report_type,
        description: report.description,
        evidenceUrls: report.evidence_urls || [],
        status: report.status,
        priority: report.priority,
        assignedTo: report.assigned_to,
        assignedToName: (report.assigned as any)?.display_name || null,
        resolutionType: report.resolution_type,
        resolutionNotes: report.resolution_notes,
        resolvedBy: report.resolved_by,
        resolvedAt: report.resolved_at,
        createdAt: report.created_at,
      }));
    } catch (error) {
      console.error('Error in getReports:', error);
      return [];
    }
  }

  /**
   * Update report status (simple status change)
   */
  async updateReportStatus(reportId: string, status: ReportStatus): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // If resolving or dismissing, set resolved timestamp
      if (status === 'resolved' || status === 'dismissed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('user_reports')
        .update(updateData)
        .eq('id', reportId);

      return !error;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  }

  /**
   * Assign report to self
   */
  async assignReport(moderatorId: string, reportId: string): Promise<boolean> {
    try {
      if (!(await rbacService.hasPermission(moderatorId, 'manage_reports'))) {
        return false;
      }

      const { error } = await this.supabase
        .from('user_reports')
        .update({
          assigned_to: moderatorId,
          status: 'reviewing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (!error) {
        await rbacService.logStaffAction(moderatorId, 'assign_report', 'report', reportId);
      }

      return !error;
    } catch (error) {
      console.error('Error assigning report:', error);
      return false;
    }
  }

  /**
   * Resolve report
   */
  async resolveReport(
    moderatorId: string,
    reportId: string,
    resolution: {
      type: 'action_taken' | 'no_violation' | 'duplicate' | 'insufficient_evidence';
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      if (!(await rbacService.hasPermission(moderatorId, 'manage_reports'))) {
        return false;
      }

      const { error } = await this.supabase
        .from('user_reports')
        .update({
          status: 'resolved',
          resolution_type: resolution.type,
          resolution_notes: resolution.notes,
          resolved_by: moderatorId,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (!error) {
        await rbacService.logStaffAction(moderatorId, 'resolve_report', 'report', reportId, undefined, undefined, { resolution });
      }

      return !error;
    } catch (error) {
      console.error('Error resolving report:', error);
      return false;
    }
  }

  /**
   * Take moderation action
   */
  async takeAction(
    moderatorId: string,
    targetUserId: string,
    action: {
      type: ModerationActionType;
      reason: string;
      durationHours?: number;
      relatedReportId?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions based on action type
      const permissionMap: Record<ModerationActionType, string> = {
        warning: 'warn_users',
        mute: 'mute_users',
        temp_ban: 'temp_ban_users',
        perm_ban: 'perm_ban_users',
        unmute: 'mute_users',
        unban: 'temp_ban_users',
        content_removal: 'remove_content',
        account_restriction: 'temp_ban_users',
        note: 'add_staff_notes',
      };

      if (!(await rbacService.hasPermission(moderatorId, permissionMap[action.type]))) {
        return { success: false, error: 'Insufficient permissions' };
      }

      // Calculate expiration
      let expiresAt: string | null = null;
      if (action.durationHours && ['mute', 'temp_ban', 'account_restriction'].includes(action.type)) {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + action.durationHours);
        expiresAt = expiry.toISOString();
      }

      // Deactivate previous conflicting actions
      if (['unmute', 'unban'].includes(action.type)) {
        const targetAction = action.type === 'unmute' ? 'mute' : ['temp_ban', 'perm_ban'];
        await this.supabase
          .from('moderation_actions')
          .update({ is_active: false })
          .eq('user_id', targetUserId)
          .in('action_type', Array.isArray(targetAction) ? targetAction : [targetAction])
          .eq('is_active', true);
      }

      // Create action record
      const { error } = await this.supabase.from('moderation_actions').insert({
        user_id: targetUserId,
        moderator_id: moderatorId,
        action_type: action.type,
        reason: action.reason,
        duration_hours: action.durationHours,
        expires_at: expiresAt,
        related_report_id: action.relatedReportId,
        is_active: !['unmute', 'unban', 'note'].includes(action.type),
      });

      if (error) {
        console.error('Error creating moderation action:', error);
        return { success: false, error: 'Failed to take action' };
      }

      // Log action
      await rbacService.logStaffAction(
        moderatorId,
        `moderation_${action.type}`,
        'user',
        targetUserId,
        targetUserId,
        undefined,
        { action },
        action.reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error in takeAction:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get user's moderation history
   */
  async getUserModerationHistory(userId: string): Promise<ModerationAction[]> {
    try {
      const { data, error } = await this.supabase
        .from('moderation_actions')
        .select(`
          *,
          user:user_profiles!moderation_actions_user_id_fkey (display_name),
          moderator:user_profiles!moderation_actions_moderator_id_fkey (display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching moderation history:', error);
        return [];
      }

      return (data || []).map((action) => ({
        id: action.id,
        userId: action.user_id,
        userName: (action.user as any)?.display_name || 'Unknown',
        moderatorId: action.moderator_id,
        moderatorName: (action.moderator as any)?.display_name || 'Unknown',
        actionType: action.action_type,
        reason: action.reason,
        durationHours: action.duration_hours,
        expiresAt: action.expires_at,
        isActive: action.is_active,
        appealStatus: action.appeal_status,
        createdAt: action.created_at,
      }));
    } catch (error) {
      console.error('Error in getUserModerationHistory:', error);
      return [];
    }
  }

  /**
   * Check if user is banned/muted
   */
  async getUserRestrictions(userId: string): Promise<{
    isBanned: boolean;
    isMuted: boolean;
    restrictions: ModerationAction[];
  }> {
    try {
      const { data } = await this.supabase
        .from('moderation_actions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .in('action_type', ['mute', 'temp_ban', 'perm_ban', 'account_restriction']);

      const activeRestrictions = (data || []).filter((action) => {
        // Check if not expired
        if (action.expires_at && new Date(action.expires_at) < new Date()) {
          // Auto-deactivate expired
          this.supabase
            .from('moderation_actions')
            .update({ is_active: false })
            .eq('id', action.id);
          return false;
        }
        return true;
      });

      return {
        isBanned: activeRestrictions.some((a) => ['temp_ban', 'perm_ban'].includes(a.action_type)),
        isMuted: activeRestrictions.some((a) => a.action_type === 'mute'),
        restrictions: activeRestrictions.map((action) => ({
          id: action.id,
          userId: action.user_id,
          userName: '',
          moderatorId: action.moderator_id,
          moderatorName: '',
          actionType: action.action_type,
          reason: action.reason,
          durationHours: action.duration_hours,
          expiresAt: action.expires_at,
          isActive: action.is_active,
          appealStatus: action.appeal_status,
          createdAt: action.created_at,
        })),
      };
    } catch (error) {
      console.error('Error checking user restrictions:', error);
      return { isBanned: false, isMuted: false, restrictions: [] };
    }
  }

  /**
   * Add staff note
   */
  async addStaffNote(
    staffId: string,
    userId: string,
    noteType: StaffNote['noteType'],
    content: string
  ): Promise<boolean> {
    try {
      if (!(await rbacService.hasPermission(staffId, 'add_staff_notes'))) {
        return false;
      }

      const { error } = await this.supabase.from('staff_notes').insert({
        user_id: userId,
        staff_id: staffId,
        note_type: noteType,
        content,
      });

      return !error;
    } catch (error) {
      console.error('Error adding staff note:', error);
      return false;
    }
  }

  /**
   * Get staff notes for user
   */
  async getStaffNotes(userId: string): Promise<StaffNote[]> {
    try {
      const { data, error } = await this.supabase
        .from('staff_notes')
        .select(`
          *,
          staff:user_profiles!staff_notes_staff_id_fkey (display_name)
        `)
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching staff notes:', error);
        return [];
      }

      return (data || []).map((note) => ({
        id: note.id,
        userId: note.user_id,
        staffId: note.staff_id,
        staffName: (note.staff as any)?.display_name || 'Unknown',
        noteType: note.note_type,
        content: note.content,
        isPinned: note.is_pinned,
        createdAt: note.created_at,
      }));
    } catch (error) {
      console.error('Error in getStaffNotes:', error);
      return [];
    }
  }

  /**
   * Get moderation stats
   */
  async getModerationStats(): Promise<ModerationStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Pending reports
      const { count: pendingReports } = await this.supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Reports today
      const { count: reportsToday } = await this.supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Actions today
      const { count: actionsToday } = await this.supabase
        .from('moderation_actions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Active bans
      const { count: activeBans } = await this.supabase
        .from('moderation_actions')
        .select('*', { count: 'exact', head: true })
        .in('action_type', ['temp_ban', 'perm_ban'])
        .eq('is_active', true);

      // Active mutes
      const { count: activeMutes } = await this.supabase
        .from('moderation_actions')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'mute')
        .eq('is_active', true);

      return {
        pendingReports: pendingReports || 0,
        reportsToday: reportsToday || 0,
        actionsToday: actionsToday || 0,
        activeBans: activeBans || 0,
        activeMutes: activeMutes || 0,
      };
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      return {
        pendingReports: 0,
        reportsToday: 0,
        actionsToday: 0,
        activeBans: 0,
        activeMutes: 0,
      };
    }
  }
}

export const moderationService = new ModerationService();
