export type ReportStatus = 'pending' | 'addressed' | 'dismissed';

export type ContentType = 'story' | 'comment' | 'user' | 'chapter';

export interface Report {
  id: string;
  reporter_id: string;
  content_id: string;
  content_type: ContentType;
  reason: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  reporter: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}
