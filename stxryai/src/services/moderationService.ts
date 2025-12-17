import { supabase } from '@/lib/supabase/client';
import { Report, ReportStatus, ContentType } from '@/types/moderation';
import { insertReportedContent, updateReportedContentStatus } from '@/lib/supabase/typed';

interface SubmitReportPayload {
  contentType: ContentType;
  contentId: string;
  reason: string;
}

export const moderationService = {
  async getReports(status?: ReportStatus): Promise<Report[]> {
    let query = supabase.from('reported_content').select(`
      *,
      reporter:users!reported_by (
        id,
        display_name,
        avatar_url
      )
    `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }

    return data as Report[];
  },

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    const { data, error } = await updateReportedContentStatus(reportId, { status });

    if (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
    return;
  },

  async submitReport(payload: SubmitReportPayload): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to report content.');
    }

    const { data, error } = await insertReportedContent({
      reported_by: user.id,
      target_table: payload.contentType,
      target_id: payload.contentId,
      reason: payload.reason,
    });

    if (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
    return;
  },

  // More functions for moderation actions will be added here
};
