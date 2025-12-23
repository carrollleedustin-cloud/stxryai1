/**
 * Global Community Story Service
 * Manages the community-driven story where everyone contributes
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface GlobalStory {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  theme: string;
  startingPremise: string;
  currentContent: string;
  chapterCount: number;
  totalContributions: number;
  uniqueContributors: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalStoryChapter {
  id: string;
  globalStoryId: string;
  chapterNumber: number;
  title?: string;
  content: string;
  aiGeneratedChoices: AIChoice[];
  winningActionId?: string;
  winningActionText?: string;
  votesTallied: boolean;
  votingEndsAt?: string;
  createdAt: string;
}

export interface AIChoice {
  index: number;
  text: string;
  consequence?: string;
}

export interface GlobalStoryAction {
  id: string;
  globalStoryId: string;
  chapterId: string;
  userId: string;
  username?: string;
  avatarUrl?: string;
  actionType: 'preset_choice' | 'custom_write';
  actionText: string;
  presetChoiceIndex?: number;
  voteCount: number;
  isSelected: boolean;
  hasUserVoted?: boolean;
  createdAt: string;
}

export interface UserCooldownStatus {
  canAct: boolean;
  nextActionAt?: string;
  totalContributions: number;
  lastActionAt?: string;
}

export interface GlobalStoryStats {
  totalContributions: number;
  uniqueContributors: number;
  chapterCount: number;
  currentChapterActions: number;
  topContributors: {
    userId: string;
    username: string;
    avatarUrl?: string;
    contributions: number;
  }[];
}

// ========================================
// SERVICE
// ========================================

class GlobalStoryService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');
    return client;
  }

  // ==================== STORY MANAGEMENT ====================

  /**
   * Get the current active global story
   */
  async getActiveStory(): Promise<GlobalStory | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('global_stories')
      .select('*')
      .eq('status', 'active')
      .single();

    if (error || !data) return null;
    return this.mapStory(data);
  }

  /**
   * Get all global stories (for admin)
   */
  async getAllStories(): Promise<GlobalStory[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('global_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(this.mapStory);
  }

  /**
   * Create a new global story (admin only)
   */
  async createStory(
    title: string,
    startingPremise: string,
    options: {
      description?: string;
      theme?: string;
      coverImageUrl?: string;
    } = {}
  ): Promise<GlobalStory> {
    const supabase = this.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('global_stories')
      .insert({
        title,
        starting_premise: startingPremise,
        current_content: startingPremise,
        description: options.description,
        theme: options.theme || 'fantasy',
        cover_image_url: options.coverImageUrl,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapStory(data);
  }

  /**
   * Activate a global story (deactivates current active)
   */
  async activateStory(storyId: string): Promise<void> {
    const supabase = this.getSupabase();

    // Deactivate any current active story
    await supabase
      .from('global_stories')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('status', 'active');

    // Activate the new story
    await supabase
      .from('global_stories')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', storyId);
  }

  /**
   * Archive a story
   */
  async archiveStory(storyId: string): Promise<void> {
    const supabase = this.getSupabase();

    await supabase
      .from('global_stories')
      .update({ status: 'archived', ended_at: new Date().toISOString() })
      .eq('id', storyId);
  }

  // ==================== CHAPTERS ====================

  /**
   * Get chapters for a story
   */
  async getChapters(storyId: string): Promise<GlobalStoryChapter[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('global_story_chapters')
      .select('*')
      .eq('global_story_id', storyId)
      .order('chapter_number', { ascending: true });

    if (error) return [];
    return (data || []).map(this.mapChapter);
  }

  /**
   * Get current chapter (latest accepting votes)
   */
  async getCurrentChapter(storyId: string): Promise<GlobalStoryChapter | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('global_story_chapters')
      .select('*')
      .eq('global_story_id', storyId)
      .eq('votes_tallied', false)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapChapter(data);
  }

  /**
   * Create a new chapter (admin only)
   */
  async createChapter(
    storyId: string,
    content: string,
    choices: AIChoice[],
    options: {
      title?: string;
      votingDurationHours?: number;
    } = {}
  ): Promise<GlobalStoryChapter> {
    const supabase = this.getSupabase();

    // Get current chapter count
    const { data: story } = await supabase
      .from('global_stories')
      .select('chapter_count')
      .eq('id', storyId)
      .single();

    const chapterNumber = (story?.chapter_count || 0) + 1;
    const votingEndsAt = options.votingDurationHours
      ? new Date(Date.now() + options.votingDurationHours * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('global_story_chapters')
      .insert({
        global_story_id: storyId,
        chapter_number: chapterNumber,
        title: options.title || `Chapter ${chapterNumber}`,
        content,
        ai_generated_choices: choices,
        voting_ends_at: votingEndsAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Update story chapter count and content
    await supabase
      .from('global_stories')
      .update({
        chapter_count: chapterNumber,
        current_content: supabase.rpc('concat_content', { new_content: content }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId);

    return this.mapChapter(data);
  }

  // ==================== USER ACTIONS ====================

  /**
   * Check if user can take action
   */
  async getUserCooldownStatus(userId: string, storyId: string): Promise<UserCooldownStatus> {
    const supabase = this.getSupabase();

    const { data } = await supabase
      .from('global_story_user_cooldowns')
      .select('*')
      .eq('user_id', userId)
      .eq('global_story_id', storyId)
      .single();

    if (!data) {
      return { canAct: true, totalContributions: 0 };
    }

    const lastAction = new Date(data.last_action_at);
    const nextAction = new Date(lastAction.getTime() + 24 * 60 * 60 * 1000);
    const canAct = nextAction <= new Date();

    return {
      canAct,
      nextActionAt: canAct ? undefined : nextAction.toISOString(),
      totalContributions: data.total_contributions,
      lastActionAt: data.last_action_at,
    };
  }

  /**
   * Submit an action
   */
  async submitAction(
    storyId: string,
    chapterId: string,
    actionType: 'preset_choice' | 'custom_write',
    actionText: string,
    presetIndex?: number
  ): Promise<{ success: boolean; message: string; actionId?: string }> {
    const supabase = this.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('submit_global_story_action', {
      p_user_id: user.id,
      p_story_id: storyId,
      p_chapter_id: chapterId,
      p_action_type: actionType,
      p_action_text: actionText,
      p_preset_index: presetIndex || null,
    });

    if (error) throw error;

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      actionId: result.action_id,
    };
  }

  /**
   * Get actions for a chapter
   */
  async getChapterActions(
    chapterId: string,
    userId?: string
  ): Promise<GlobalStoryAction[]> {
    const supabase = this.getSupabase();

    const { data: actions, error } = await supabase
      .from('global_story_actions')
      .select(`
        *,
        users:user_id (username, avatar_url)
      `)
      .eq('chapter_id', chapterId)
      .order('vote_count', { ascending: false });

    if (error) return [];

    // If user is provided, check which actions they've voted on
    let userVotes: string[] = [];
    if (userId) {
      const { data: votes } = await supabase
        .from('global_story_action_votes')
        .select('action_id')
        .eq('user_id', userId);
      userVotes = (votes || []).map(v => v.action_id);
    }

    return (actions || []).map(a => ({
      ...this.mapAction(a),
      hasUserVoted: userVotes.includes(a.id),
    }));
  }

  /**
   * Vote for an action
   */
  async voteForAction(actionId: string): Promise<void> {
    const supabase = this.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Add vote
    await supabase
      .from('global_story_action_votes')
      .insert({ action_id: actionId, user_id: user.id });

    // Update vote count
    await supabase.rpc('increment_action_votes', { p_action_id: actionId });
  }

  /**
   * Remove vote from action
   */
  async unvoteAction(actionId: string): Promise<void> {
    const supabase = this.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    await supabase
      .from('global_story_action_votes')
      .delete()
      .eq('action_id', actionId)
      .eq('user_id', user.id);

    await supabase.rpc('decrement_action_votes', { p_action_id: actionId });
  }

  // ==================== STATS ====================

  /**
   * Get story statistics
   */
  async getStats(storyId: string): Promise<GlobalStoryStats> {
    const supabase = this.getSupabase();

    const { data: story } = await supabase
      .from('global_stories')
      .select('total_contributions, unique_contributors, chapter_count')
      .eq('id', storyId)
      .single();

    const currentChapter = await this.getCurrentChapter(storyId);

    let currentChapterActions = 0;
    if (currentChapter) {
      const { count } = await supabase
        .from('global_story_actions')
        .select('*', { count: 'exact' })
        .eq('chapter_id', currentChapter.id);
      currentChapterActions = count || 0;
    }

    // Top contributors
    const { data: contributors } = await supabase
      .from('global_story_user_cooldowns')
      .select(`
        total_contributions,
        users:user_id (id, username, avatar_url)
      `)
      .eq('global_story_id', storyId)
      .order('total_contributions', { ascending: false })
      .limit(10);

    return {
      totalContributions: story?.total_contributions || 0,
      uniqueContributors: story?.unique_contributors || 0,
      chapterCount: story?.chapter_count || 0,
      currentChapterActions,
      topContributors: (contributors || []).map(c => ({
        userId: c.users?.id,
        username: c.users?.username || 'Anonymous',
        avatarUrl: c.users?.avatar_url,
        contributions: c.total_contributions,
      })),
    };
  }

  // ==================== MAPPERS ====================

  private mapStory(data: any): GlobalStory {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      theme: data.theme,
      startingPremise: data.starting_premise,
      currentContent: data.current_content,
      chapterCount: data.chapter_count,
      totalContributions: data.total_contributions,
      uniqueContributors: data.unique_contributors,
      status: data.status,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapChapter(data: any): GlobalStoryChapter {
    return {
      id: data.id,
      globalStoryId: data.global_story_id,
      chapterNumber: data.chapter_number,
      title: data.title,
      content: data.content,
      aiGeneratedChoices: data.ai_generated_choices || [],
      winningActionId: data.winning_action_id,
      winningActionText: data.winning_action_text,
      votesTallied: data.votes_tallied,
      votingEndsAt: data.voting_ends_at,
      createdAt: data.created_at,
    };
  }

  private mapAction(data: any): GlobalStoryAction {
    return {
      id: data.id,
      globalStoryId: data.global_story_id,
      chapterId: data.chapter_id,
      userId: data.user_id,
      username: data.users?.username,
      avatarUrl: data.users?.avatar_url,
      actionType: data.action_type,
      actionText: data.action_text,
      presetChoiceIndex: data.preset_choice_index,
      voteCount: data.vote_count,
      isSelected: data.is_selected,
      createdAt: data.created_at,
    };
  }
}

export const globalStoryService = new GlobalStoryService();

