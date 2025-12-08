import { supabase } from '../lib/supabase/client';

// ============================================
// TYPES
// ============================================
export interface ReadingClub {
  id: string;
  name: string;
  description?: string;
  creatorId?: string;
  coverImageUrl?: string;
  memberCount: number;
  currentStoryId?: string;
  status: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface DiscussionForum {
  id: string;
  title: string;
  category: string;
  storyId?: string;
  clubId?: string;
  createdBy: string;
  isPinned: boolean;
  replyCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  forumId: string;
  userId: string;
  content: string;
  parentReplyId?: string;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserContent {
  id: string;
  userId: string;
  storyId?: string;
  contentType: string;
  title: string;
  description?: string;
  contentUrl?: string;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  hostId?: string;
  clubId?: string;
  storyId?: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  participantCount: number;
  isPublic: boolean;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  rsvpStatus: string;
  joinedAt: string;
}

export interface MentorshipProgram {
  id: string;
  mentorId: string;
  menteeId: string;
  focusArea: string;
  status: string;
  progressNotes?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReputation {
  id: string;
  userId: string;
  reputationPoints: number;
  contributionCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// READING CLUBS
// ============================================
export const communityService = {
  // Get all active reading clubs
  async getActiveClubs(): Promise<{ data: ReadingClub[] | null; error: any }> {
    const { data, error } = await supabase
      .from('reading_clubs')
      .select('*')
      .eq('status', 'active')
      .order('member_count', { ascending: false });

    if (error) return { data: null, error };

    const clubs = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      creatorId: row.creator_id,
      coverImageUrl: row.cover_image_url,
      memberCount: row.member_count,
      currentStoryId: row.current_story_id,
      status: row.status,
      isPrivate: row.is_private,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: clubs, error: null };
  },

  // Get club by ID with members
  async getClubById(clubId: string): Promise<{ data: ReadingClub | null; error: any }> {
    const { data, error } = await supabase
      .from('reading_clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) return { data: null, error };

    const club: ReadingClub = {
      id: data.id,
      name: data.name,
      description: data.description,
      creatorId: data.creator_id,
      coverImageUrl: data.cover_image_url,
      memberCount: data.member_count,
      currentStoryId: data.current_story_id,
      status: data.status,
      isPrivate: data.is_private,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: club, error: null };
  },

  // Join a club
  async joinClub(clubId: string, userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        role: 'member'
      });

    return { error };
  },

  // ============================================
  // DISCUSSION FORUMS
  // ============================================
  
  // Get forums by category
  async getForumsByCategory(category: string): Promise<{ data: DiscussionForum[] | null; error: any }> {
    const { data, error } = await supabase
      .from('discussion_forums')
      .select('*')
      .eq('category', category)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) return { data: null, error };

    const forums = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      storyId: row.story_id,
      clubId: row.club_id,
      createdBy: row.created_by,
      isPinned: row.is_pinned,
      replyCount: row.reply_count,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: forums, error: null };
  },

  // Get forum replies
  async getForumReplies(forumId: string): Promise<{ data: DiscussionReply[] | null; error: any }> {
    const { data, error } = await supabase
      .from('discussion_replies')
      .select('*')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error };

    const replies = (data || []).map((row: any) => ({
      id: row.id,
      forumId: row.forum_id,
      userId: row.user_id,
      content: row.content,
      parentReplyId: row.parent_reply_id,
      upvoteCount: row.upvote_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: replies, error: null };
  },

  // Create forum post
  async createForum(forum: Partial<DiscussionForum>): Promise<{ data: DiscussionForum | null; error: any }> {
    const { data, error } = await supabase
      .from('discussion_forums')
      .insert({
        title: forum.title,
        category: forum.category,
        story_id: forum.storyId,
        club_id: forum.clubId,
        created_by: forum.createdBy
      })
      .select()
      .single();

    if (error) return { data: null, error };

    const newForum: DiscussionForum = {
      id: data.id,
      title: data.title,
      category: data.category,
      storyId: data.story_id,
      clubId: data.club_id,
      createdBy: data.created_by,
      isPinned: data.is_pinned,
      replyCount: data.reply_count,
      viewCount: data.view_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: newForum, error: null };
  },

  // ============================================
  // COMMUNITY EVENTS
  // ============================================
  
  // Get upcoming events
  async getUpcomingEvents(): Promise<{ data: CommunityEvent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) return { data: null, error };

    const events = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      eventType: row.event_type,
      hostId: row.host_id,
      clubId: row.club_id,
      storyId: row.story_id,
      startTime: row.start_time,
      endTime: row.end_time,
      maxParticipants: row.max_participants,
      participantCount: row.participant_count,
      isPublic: row.is_public,
      createdAt: row.created_at
    }));

    return { data: events, error: null };
  },

  // RSVP to event
  async rsvpToEvent(eventId: string, userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: userId,
        rsvp_status: 'going'
      });

    return { error };
  },

  // ============================================
  // USER CONTENT
  // ============================================
  
  // Get user generated content
  async getUserContent(storyId?: string): Promise<{ data: UserContent[] | null; error: any }> {
    let query = supabase
      .from('user_content')
      .select('*')
      .order('vote_count', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    const content = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      storyId: row.story_id,
      contentType: row.content_type,
      title: row.title,
      description: row.description,
      contentUrl: row.content_url,
      voteCount: row.vote_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: content, error: null };
  },

  // ============================================
  // MENTORSHIP
  // ============================================
  
  // Get active mentorships for user
  async getUserMentorships(userId: string): Promise<{ data: MentorshipProgram[] | null; error: any }> {
    const { data, error } = await supabase
      .from('mentorship_programs')
      .select('*')
      .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const mentorships = (data || []).map((row: any) => ({
      id: row.id,
      mentorId: row.mentor_id,
      menteeId: row.mentee_id,
      focusArea: row.focus_area,
      status: row.status,
      progressNotes: row.progress_notes,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: mentorships, error: null };
  },

  // ============================================
  // REPUTATION
  // ============================================
  
  // Get user reputation
  async getUserReputation(userId: string): Promise<{ data: UserReputation | null; error: any }> {
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return { data: null, error };

    const reputation: UserReputation = {
      id: data.id,
      userId: data.user_id,
      reputationPoints: data.reputation_points,
      contributionCount: data.contribution_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: reputation, error: null };
  }
};