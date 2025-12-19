/**
 * Collaborative Creation Service
 * Manages community stories, remixes, forks, and contributions
 */

import { createClient } from '@/lib/supabase/client';

export interface CommunityStory {
  id: string;
  storyId: string;
  storyType: 'community' | 'remix' | 'fork' | 'collaborative';
  originalStoryId?: string;
  isOpenForContributions: boolean;
  contributionGuidelines?: string;
  moderationLevel: 'open' | 'moderate' | 'strict' | 'curated';
  contributorCount: number;
  chapterCount: number;
  totalWords: number;
  status: 'active' | 'completed' | 'archived' | 'paused';
  completionPercentage: number;
  communityRating: number;
  communityRatingCount: number;
  discussionCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoryContribution {
  id: string;
  communityStoryId: string;
  contributorId: string;
  chapterId?: string;
  contributionType: 'chapter' | 'edit' | 'suggestion' | 'review' | 'illustration' | 'translation';
  contributionContent?: string;
  contributionStatus: 'pending' | 'approved' | 'rejected' | 'merged' | 'needs_revision';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  qualityScore?: number;
  communityVotes: number;
  communityRating?: number;
  wordsAdded: number;
  charactersAdded: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoryRemix {
  id: string;
  originalStoryId: string;
  remixStoryId: string;
  remixerId: string;
  remixType: 'alternate_ending' | 'prequel' | 'sequel' | 'spin_off' | 'genre_shift' | 'perspective_shift' | 'complete_remix';
  remixDescription?: string;
  creditsOriginalAuthor: boolean;
  remixLicense: 'remix' | 'derivative' | 'inspired_by';
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  similarityScore?: number;
  originalityScore?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoryFork {
  id: string;
  originalStoryId: string;
  forkedStoryId: string;
  forkerId: string;
  forkPointChapterId?: string;
  forkReason?: string;
  forkDescription?: string;
  creditsOriginal: boolean;
  isActive: boolean;
  divergencePoint?: number;
  chaptersAdded: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class CollaborativeCreationService {
  private supabase = createClient();

  // ========================================
  // COMMUNITY STORIES
  // ========================================

  /**
   * Create a community story
   */
  async createCommunityStory(
    storyId: string,
    communityStory: Partial<CommunityStory>
  ): Promise<CommunityStory> {
    const { data, error } = await this.supabase
      .from('community_stories')
      .insert({
        story_id: storyId,
        story_type: communityStory.storyType || 'community',
        original_story_id: communityStory.originalStoryId,
        is_open_for_contributions: communityStory.isOpenForContributions !== undefined ? communityStory.isOpenForContributions : true,
        contribution_guidelines: communityStory.contributionGuidelines,
        moderation_level: communityStory.moderationLevel || 'moderate',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCommunityStory(data);
  }

  /**
   * Get community stories
   */
  async getCommunityStories(options?: {
    storyType?: CommunityStory['storyType'];
    status?: CommunityStory['status'];
    limit?: number;
  }): Promise<CommunityStory[]> {
    let query = this.supabase
      .from('community_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.storyType) {
      query = query.eq('story_type', options.storyType);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapCommunityStory(item));
  }

  /**
   * Get a community story
   */
  async getCommunityStory(storyId: string): Promise<CommunityStory | null> {
    const { data, error } = await this.supabase
      .from('community_stories')
      .select('*')
      .eq('story_id', storyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapCommunityStory(data);
  }

  // ========================================
  // CONTRIBUTIONS
  // ========================================

  /**
   * Submit a contribution
   */
  async submitContribution(
    communityStoryId: string,
    contributorId: string,
    contribution: Partial<StoryContribution>
  ): Promise<StoryContribution> {
    const { data, error } = await this.supabase
      .from('story_contributions')
      .insert({
        community_story_id: communityStoryId,
        contributor_id: contributorId,
        chapter_id: contribution.chapterId,
        contribution_type: contribution.contributionType,
        contribution_content: contribution.contributionContent,
        contribution_status: 'pending',
        words_added: contribution.wordsAdded || 0,
        characters_added: contribution.charactersAdded || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapContribution(data);
  }

  /**
   * Get contributions for a community story
   */
  async getStoryContributions(
    communityStoryId: string,
    status?: StoryContribution['contributionStatus']
  ): Promise<StoryContribution[]> {
    let query = this.supabase
      .from('story_contributions')
      .select('*')
      .eq('community_story_id', communityStoryId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('contribution_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapContribution(item));
  }

  /**
   * Review a contribution
   */
  async reviewContribution(
    contributionId: string,
    reviewerId: string,
    status: 'approved' | 'rejected' | 'needs_revision',
    reviewNotes?: string
  ): Promise<StoryContribution> {
    const { data, error } = await this.supabase
      .from('story_contributions')
      .update({
        contribution_status: status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapContribution(data);
  }

  /**
   * Vote on a contribution
   */
  async voteOnContribution(
    contributionId: string,
    voterId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('contribution_votes')
      .upsert({
        contribution_id: contributionId,
        voter_id: voterId,
        vote_type: voteType,
        vote_weight: voteType === 'upvote' ? 1 : -1,
      }, {
        onConflict: 'contribution_id,voter_id',
      });

    if (error) throw error;
  }

  // ========================================
  // REMIXES
  // ========================================

  /**
   * Create a story remix
   */
  async createRemix(
    originalStoryId: string,
    remixStoryId: string,
    remixerId: string,
    remix: Partial<StoryRemix>
  ): Promise<StoryRemix> {
    const { data, error } = await this.supabase
      .from('story_remixes')
      .insert({
        original_story_id: originalStoryId,
        remix_story_id: remixStoryId,
        remixer_id: remixerId,
        remix_type: remix.remixType,
        remix_description: remix.remixDescription,
        credits_original_author: remix.creditsOriginalAuthor !== undefined ? remix.creditsOriginalAuthor : true,
        remix_license: remix.remixLicense || 'remix',
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRemix(data);
  }

  /**
   * Get remixes of a story
   */
  async getStoryRemixes(originalStoryId: string): Promise<StoryRemix[]> {
    const { data, error } = await this.supabase
      .from('story_remixes')
      .select('*')
      .eq('original_story_id', originalStoryId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapRemix(item));
  }

  /**
   * Get user's remixes
   */
  async getUserRemixes(userId: string): Promise<StoryRemix[]> {
    const { data, error } = await this.supabase
      .from('story_remixes')
      .select('*')
      .eq('remixer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapRemix(item));
  }

  /**
   * Approve a remix
   */
  async approveRemix(remixId: string, approverId: string): Promise<StoryRemix> {
    const { data, error } = await this.supabase
      .from('story_remixes')
      .update({
        is_approved: true,
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', remixId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRemix(data);
  }

  // ========================================
  // FORKS
  // ========================================

  /**
   * Create a story fork
   */
  async createFork(
    originalStoryId: string,
    forkedStoryId: string,
    forkerId: string,
    fork: Partial<StoryFork>
  ): Promise<StoryFork> {
    const { data, error } = await this.supabase
      .from('story_forks')
      .insert({
        original_story_id: originalStoryId,
        forked_story_id: forkedStoryId,
        forker_id: forkerId,
        fork_point_chapter_id: fork.forkPointChapterId,
        fork_reason: fork.forkReason,
        fork_description: fork.forkDescription,
        credits_original: fork.creditsOriginal !== undefined ? fork.creditsOriginal : true,
        divergence_point: fork.divergencePoint,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFork(data);
  }

  /**
   * Get forks of a story
   */
  async getStoryForks(originalStoryId: string): Promise<StoryFork[]> {
    const { data, error } = await this.supabase
      .from('story_forks')
      .select('*')
      .eq('original_story_id', originalStoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapFork(item));
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapCommunityStory(data: any): CommunityStory {
    return {
      id: data.id,
      storyId: data.story_id,
      storyType: data.story_type,
      originalStoryId: data.original_story_id,
      isOpenForContributions: data.is_open_for_contributions,
      contributionGuidelines: data.contribution_guidelines,
      moderationLevel: data.moderation_level,
      contributorCount: data.contributor_count || 0,
      chapterCount: data.chapter_count || 0,
      totalWords: data.total_words || 0,
      status: data.status,
      completionPercentage: parseFloat(data.completion_percentage || '0'),
      communityRating: parseFloat(data.community_rating || '0'),
      communityRatingCount: data.community_rating_count || 0,
      discussionCount: data.discussion_count || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapContribution(data: any): StoryContribution {
    return {
      id: data.id,
      communityStoryId: data.community_story_id,
      contributorId: data.contributor_id,
      chapterId: data.chapter_id,
      contributionType: data.contribution_type,
      contributionContent: data.contribution_content,
      contributionStatus: data.contribution_status,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      reviewNotes: data.review_notes,
      qualityScore: data.quality_score ? parseFloat(data.quality_score) : undefined,
      communityVotes: data.community_votes || 0,
      communityRating: data.community_rating ? parseFloat(data.community_rating) : undefined,
      wordsAdded: data.words_added || 0,
      charactersAdded: data.characters_added || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapRemix(data: any): StoryRemix {
    return {
      id: data.id,
      originalStoryId: data.original_story_id,
      remixStoryId: data.remix_story_id,
      remixerId: data.remixer_id,
      remixType: data.remix_type,
      remixDescription: data.remix_description,
      creditsOriginalAuthor: data.credits_original_author,
      remixLicense: data.remix_license,
      isApproved: data.is_approved,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      similarityScore: data.similarity_score ? parseFloat(data.similarity_score) : undefined,
      originalityScore: data.originality_score ? parseFloat(data.originality_score) : undefined,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapFork(data: any): StoryFork {
    return {
      id: data.id,
      originalStoryId: data.original_story_id,
      forkedStoryId: data.forked_story_id,
      forkerId: data.forker_id,
      forkPointChapterId: data.fork_point_chapter_id,
      forkReason: data.fork_reason,
      forkDescription: data.fork_description,
      creditsOriginal: data.credits_original,
      isActive: data.is_active,
      divergencePoint: data.divergence_point,
      chaptersAdded: data.chapters_added || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const collaborativeCreationService = new CollaborativeCreationService();

