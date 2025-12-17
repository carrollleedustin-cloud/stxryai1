import { supabase } from '@/lib/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import {
  insertClubMember,
  insertDiscussionForum,
  insertEventParticipant,
} from '@/lib/supabase/typed';

// ============================================
// TYPES
// ============================================
export interface ReadingClub {
  id: string;
  name: string;
  description?: string;
  creator_id?: string;
  cover_image_url?: string;
  member_count: number;
  current_story_id?: string;
  status: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface DiscussionForum {
  id: string;
  title: string;
  category: string;
  story_id?: string;
  club_id?: string;
  created_by: string;
  is_pinned: boolean;
  reply_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: string;
  forum_id: string;
  user_id: string;
  content: string;
  parent_reply_id?: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserContent {
  id: string;
  user_id: string;
  story_id?: string;
  content_type: string;
  title: string;
  description?: string;
  content_url?: string;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  host_id?: string;
  club_id?: string;
  story_id?: string;
  start_time: string;
  end_time: string;
  max_participants?: number;
  participant_count: number;
  is_public: boolean;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  rsvp_status: string;
  joined_at: string;
}

export interface MentorshipProgram {
  id: string;
  mentor_id: string;
  mentee_id: string;
  focus_area: string;
  status: string;
  progress_notes?: Record<string, string | number>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserReputation {
  id: string;
  user_id: string;
  reputation_points: number;
  contribution_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// READING CLUBS
// ============================================
export const communityService = {
  // Get all active reading clubs
  async getActiveClubs(): Promise<{ data: ReadingClub[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('reading_clubs')
      .select('*')
      .eq('status', 'active')
      .order('member_count', { ascending: false });

    return { data: data as ReadingClub[], error };
  },

  // Get club by ID with members
  async getClubById(
    clubId: string
  ): Promise<{ data: ReadingClub | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('reading_clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    return { data: data as ReadingClub, error };
  },

  // Join a club
  async joinClub(clubId: string, userId: string): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await insertClubMember({
      club_id: clubId,
      user_id: userId,
      role: 'member',
    });

    return { error };
  },

  // ============================================
  // DISCUSSION FORUMS
  // ============================================

  // Get forums by category
  async getForumsByCategory(
    category: string
  ): Promise<{ data: DiscussionForum[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('discussion_forums')
      .select('*')
      .ilike('title', `%${category}%`)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    return { data: data as DiscussionForum[], error };
  },

  // Get forum replies
  async getForumReplies(
    forumId: string
  ): Promise<{ data: DiscussionReply[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('discussion_replies')
      .select('*')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: true });

    return { data: data as DiscussionReply[], error };
  },

  // Create forum post
  async createForum(
    forum: Partial<DiscussionForum>
  ): Promise<{ data: DiscussionForum | null; error: PostgrestError | null }> {
    const { data, error } = await insertDiscussionForum({
      title: forum.title as string,
      club_id: forum.club_id as any,
      created_by: forum.created_by as string,
    });

    return {
      data: Array.isArray(data) ? (data[0] as DiscussionForum) : (data as DiscussionForum),
      error,
    };
  },

  // ============================================
  // COMMUNITY EVENTS
  // ============================================

  // Get upcoming events
  async getUpcomingEvents(): Promise<{
    data: CommunityEvent[] | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    return { data: data as CommunityEvent[], error };
  },

  // RSVP to event
  async rsvpToEvent(eventId: string, userId: string): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await insertEventParticipant({
      event_id: eventId,
      user_id: userId,
      status: 'going',
    });

    return { error };
  },

  // ============================================
  // USER CONTENT
  // ============================================

  // Get user generated content
  async getUserContent(
    storyId?: string
  ): Promise<{ data: UserContent[] | null; error: PostgrestError | null }> {
    let query = supabase.from('user_content').select('*').order('vote_count', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    return { data: data as UserContent[], error };
  },

  // ============================================
  // MENTORSHIP
  // ============================================

  // Get active mentorships for user
  async getUserMentorships(
    userId: string
  ): Promise<{ data: MentorshipProgram[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('mentorship_programs')
      .select('*')
      .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return { data: data as MentorshipProgram[], error };
  },

  // ============================================
  // REPUTATION
  // ============================================

  // Get user reputation
  async getUserReputation(
    userId: string
  ): Promise<{ data: UserReputation | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data: data as UserReputation, error };
  },
};
