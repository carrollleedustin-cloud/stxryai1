/**
 * Enhanced Book Club Service
 * Book clubs with discussions, reading schedules, and group activities
 */

import { createClient } from '@/lib/supabase/client';

export interface BookClub {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  ownerId: string;
  ownerName?: string;
  isPublic: boolean;
  isFeatured: boolean;
  maxMembers: number;
  memberCount: number;
  currentBook: {
    id: string;
    title: string;
    coverImageUrl: string;
  } | null;
  readingPace: 'slow' | 'moderate' | 'fast' | 'custom' | null;
  chaptersPerWeek: number | null;
  discussionDay: string | null;
  createdAt: string;
  isMember?: boolean;
  memberRole?: 'owner' | 'moderator' | 'member';
}

export interface ClubMember {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: string;
}

export interface ClubDiscussion {
  id: string;
  clubId: string;
  storyId: string | null;
  chapterId: string | null;
  title: string;
  content: string | null;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  isPinned: boolean;
  replyCount: number;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  parentReplyId: string | null;
  createdAt: string;
}

class BookClubEnhancedService {
  private supabase = createClient();

  /**
   * Create a new book club
   */
  async createClub(
    userId: string,
    data: {
      name: string;
      description?: string;
      isPublic?: boolean;
      maxMembers?: number;
      readingPace?: 'slow' | 'moderate' | 'fast' | 'custom';
      chaptersPerWeek?: number;
      discussionDay?: string;
    }
  ): Promise<BookClub | null> {
    try {
      const { data: club, error } = await this.supabase
        .from('book_clubs')
        .insert({
          name: data.name,
          description: data.description,
          owner_id: userId,
          is_public: data.isPublic ?? true,
          max_members: data.maxMembers ?? 100,
          reading_pace: data.readingPace,
          chapters_per_week: data.chaptersPerWeek,
          discussion_day: data.discussionDay,
          member_count: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating book club:', error);
        return null;
      }

      // Add owner as member
      await this.supabase.from('book_club_members').insert({
        club_id: club.id,
        user_id: userId,
        role: 'owner',
      });

      return this.mapClub(club);
    } catch (error) {
      console.error('Error in createClub:', error);
      return null;
    }
  }

  /**
   * Get club by ID
   */
  async getClub(clubId: string, userId?: string): Promise<BookClub | null> {
    try {
      const { data, error } = await this.supabase
        .from('book_clubs')
        .select(`
          *,
          user_profiles!book_clubs_owner_id_fkey (display_name),
          stories!book_clubs_current_book_id_fkey (id, title, cover_image_url)
        `)
        .eq('id', clubId)
        .single();

      if (error) {
        console.error('Error fetching book club:', error);
        return null;
      }

      const club = this.mapClub(data);
      club.ownerName = (data.user_profiles as any)?.display_name;
      club.currentBook = data.stories ? {
        id: (data.stories as any).id,
        title: (data.stories as any).title,
        coverImageUrl: (data.stories as any).cover_image_url,
      } : null;

      // Check if user is member
      if (userId) {
        const { data: membership } = await this.supabase
          .from('book_club_members')
          .select('role')
          .eq('club_id', clubId)
          .eq('user_id', userId)
          .single();

        club.isMember = !!membership;
        club.memberRole = membership?.role;
      }

      return club;
    } catch (error) {
      console.error('Error in getClub:', error);
      return null;
    }
  }

  /**
   * Get public clubs
   */
  async getPublicClubs(limit: number = 20): Promise<BookClub[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_clubs')
        .select(`
          *,
          user_profiles!book_clubs_owner_id_fkey (display_name)
        `)
        .eq('is_public', true)
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching public clubs:', error);
        return [];
      }

      return (data || []).map((club) => {
        const mapped = this.mapClub(club);
        mapped.ownerName = (club.user_profiles as any)?.display_name;
        return mapped;
      });
    } catch (error) {
      console.error('Error in getPublicClubs:', error);
      return [];
    }
  }

  /**
   * Get featured clubs
   */
  async getFeaturedClubs(): Promise<BookClub[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_clubs')
        .select('*')
        .eq('is_featured', true)
        .eq('is_public', true)
        .limit(10);

      if (error) {
        console.error('Error fetching featured clubs:', error);
        return [];
      }

      return (data || []).map(this.mapClub);
    } catch (error) {
      console.error('Error in getFeaturedClubs:', error);
      return [];
    }
  }

  /**
   * Get user's clubs
   */
  async getUserClubs(userId: string): Promise<BookClub[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_club_members')
        .select(`
          role,
          book_clubs!book_club_members_club_id_fkey (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user clubs:', error);
        return [];
      }

      return (data || []).map((membership) => {
        const club = this.mapClub(membership.book_clubs as any);
        club.isMember = true;
        club.memberRole = membership.role;
        return club;
      });
    } catch (error) {
      console.error('Error in getUserClubs:', error);
      return [];
    }
  }

  /**
   * Join a club
   */
  async joinClub(userId: string, clubId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already a member
      const { data: existing } = await this.supabase
        .from('book_club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return { success: false, error: 'Already a member' };
      }

      // Check if club is full
      const { data: club } = await this.supabase
        .from('book_clubs')
        .select('member_count, max_members, is_public')
        .eq('id', clubId)
        .single();

      if (!club) {
        return { success: false, error: 'Club not found' };
      }

      if (!club.is_public) {
        return { success: false, error: 'This is a private club' };
      }

      if (club.member_count >= club.max_members) {
        return { success: false, error: 'Club is full' };
      }

      // Join club
      const { error } = await this.supabase.from('book_club_members').insert({
        club_id: clubId,
        user_id: userId,
        role: 'member',
      });

      if (error) {
        console.error('Error joining club:', error);
        return { success: false, error: 'Failed to join club' };
      }

      // Update member count
      await this.supabase
        .from('book_clubs')
        .update({ member_count: club.member_count + 1 })
        .eq('id', clubId);

      return { success: true };
    } catch (error) {
      console.error('Error in joinClub:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Leave a club
   */
  async leaveClub(userId: string, clubId: string): Promise<boolean> {
    try {
      // Check if user is owner
      const { data: club } = await this.supabase
        .from('book_clubs')
        .select('owner_id, member_count')
        .eq('id', clubId)
        .single();

      if (club?.owner_id === userId) {
        return false; // Owner can't leave, must transfer or delete
      }

      const { error } = await this.supabase
        .from('book_club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving club:', error);
        return false;
      }

      // Update member count
      if (club) {
        await this.supabase
          .from('book_clubs')
          .update({ member_count: Math.max(0, club.member_count - 1) })
          .eq('id', clubId);
      }

      return true;
    } catch (error) {
      console.error('Error in leaveClub:', error);
      return false;
    }
  }

  /**
   * Get club members
   */
  async getClubMembers(clubId: string): Promise<ClubMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_club_members')
        .select(`
          *,
          user_profiles!book_club_members_user_id_fkey (
            id, display_name, username, avatar_url
          )
        `)
        .eq('club_id', clubId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching club members:', error);
        return [];
      }

      return (data || []).map((member) => {
        const profile = member.user_profiles as any;
        return {
          id: member.id,
          userId: member.user_id,
          displayName: profile?.display_name || 'Unknown',
          username: profile?.username || '',
          avatarUrl: profile?.avatar_url,
          role: member.role,
          joinedAt: member.joined_at,
        };
      });
    } catch (error) {
      console.error('Error in getClubMembers:', error);
      return [];
    }
  }

  /**
   * Set current book for club
   */
  async setCurrentBook(clubId: string, storyId: string, userId: string): Promise<boolean> {
    try {
      // Verify user is owner or moderator
      const { data: membership } = await this.supabase
        .from('book_club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single();

      if (!membership || !['owner', 'moderator'].includes(membership.role)) {
        return false;
      }

      const { error } = await this.supabase
        .from('book_clubs')
        .update({ current_book_id: storyId, updated_at: new Date().toISOString() })
        .eq('id', clubId);

      return !error;
    } catch (error) {
      console.error('Error in setCurrentBook:', error);
      return false;
    }
  }

  /**
   * Create discussion
   */
  async createDiscussion(
    userId: string,
    clubId: string,
    data: {
      title: string;
      content?: string;
      storyId?: string;
      chapterId?: string;
    }
  ): Promise<ClubDiscussion | null> {
    try {
      const { data: discussion, error } = await this.supabase
        .from('book_club_discussions')
        .insert({
          club_id: clubId,
          author_id: userId,
          title: data.title,
          content: data.content,
          story_id: data.storyId,
          chapter_id: data.chapterId,
        })
        .select(`
          *,
          user_profiles!book_club_discussions_author_id_fkey (
            display_name, avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating discussion:', error);
        return null;
      }

      const profile = discussion.user_profiles as any;
      return {
        id: discussion.id,
        clubId: discussion.club_id,
        storyId: discussion.story_id,
        chapterId: discussion.chapter_id,
        title: discussion.title,
        content: discussion.content,
        authorId: discussion.author_id,
        authorName: profile?.display_name || 'Unknown',
        authorAvatarUrl: profile?.avatar_url,
        isPinned: discussion.is_pinned,
        replyCount: 0,
        createdAt: discussion.created_at,
      };
    } catch (error) {
      console.error('Error in createDiscussion:', error);
      return null;
    }
  }

  /**
   * Get club discussions
   */
  async getClubDiscussions(clubId: string, limit: number = 20): Promise<ClubDiscussion[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_club_discussions')
        .select(`
          *,
          user_profiles!book_club_discussions_author_id_fkey (
            display_name, avatar_url
          )
        `)
        .eq('club_id', clubId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching discussions:', error);
        return [];
      }

      return (data || []).map((d) => {
        const profile = d.user_profiles as any;
        return {
          id: d.id,
          clubId: d.club_id,
          storyId: d.story_id,
          chapterId: d.chapter_id,
          title: d.title,
          content: d.content,
          authorId: d.author_id,
          authorName: profile?.display_name || 'Unknown',
          authorAvatarUrl: profile?.avatar_url,
          isPinned: d.is_pinned,
          replyCount: d.reply_count,
          createdAt: d.created_at,
        };
      });
    } catch (error) {
      console.error('Error in getClubDiscussions:', error);
      return [];
    }
  }

  /**
   * Add reply to discussion
   */
  async addReply(
    userId: string,
    discussionId: string,
    content: string,
    parentReplyId?: string
  ): Promise<DiscussionReply | null> {
    try {
      const { data: reply, error } = await this.supabase
        .from('book_club_discussion_replies')
        .insert({
          discussion_id: discussionId,
          author_id: userId,
          content,
          parent_reply_id: parentReplyId,
        })
        .select(`
          *,
          user_profiles!book_club_discussion_replies_author_id_fkey (
            display_name, avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding reply:', error);
        return null;
      }

      // Update reply count
      await this.supabase.rpc('increment_discussion_reply_count', { discussion_id: discussionId });

      const profile = reply.user_profiles as any;
      return {
        id: reply.id,
        discussionId: reply.discussion_id,
        authorId: reply.author_id,
        authorName: profile?.display_name || 'Unknown',
        authorAvatarUrl: profile?.avatar_url,
        content: reply.content,
        parentReplyId: reply.parent_reply_id,
        createdAt: reply.created_at,
      };
    } catch (error) {
      console.error('Error in addReply:', error);
      return null;
    }
  }

  /**
   * Get discussion replies
   */
  async getDiscussionReplies(discussionId: string): Promise<DiscussionReply[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_club_discussion_replies')
        .select(`
          *,
          user_profiles!book_club_discussion_replies_author_id_fkey (
            display_name, avatar_url
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return [];
      }

      return (data || []).map((r) => {
        const profile = r.user_profiles as any;
        return {
          id: r.id,
          discussionId: r.discussion_id,
          authorId: r.author_id,
          authorName: profile?.display_name || 'Unknown',
          authorAvatarUrl: profile?.avatar_url,
          content: r.content,
          parentReplyId: r.parent_reply_id,
          createdAt: r.created_at,
        };
      });
    } catch (error) {
      console.error('Error in getDiscussionReplies:', error);
      return [];
    }
  }

  /**
   * Search clubs
   */
  async searchClubs(query: string): Promise<BookClub[]> {
    try {
      const { data, error } = await this.supabase
        .from('book_clubs')
        .select('*')
        .eq('is_public', true)
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching clubs:', error);
        return [];
      }

      return (data || []).map(this.mapClub);
    } catch (error) {
      console.error('Error in searchClubs:', error);
      return [];
    }
  }

  private mapClub(data: any): BookClub {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      ownerId: data.owner_id,
      isPublic: data.is_public,
      isFeatured: data.is_featured,
      maxMembers: data.max_members,
      memberCount: data.member_count,
      currentBook: null,
      readingPace: data.reading_pace,
      chaptersPerWeek: data.chapters_per_week,
      discussionDay: data.discussion_day,
      createdAt: data.created_at,
    };
  }
}

export const bookClubEnhancedService = new BookClubEnhancedService();
