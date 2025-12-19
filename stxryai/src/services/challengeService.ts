/**
 * Challenge Service
 * Manages monthly challenges and community competitions
 */

import { createClient } from '@/lib/supabase/client';

export interface MonthlyChallenge {
  id: string;
  challengeMonth: string;
  challengeType: 'genre' | 'count' | 'time' | 'explore' | 'social';
  challengeData: Record<string, any>;
  title: string;
  description: string;
  rewardXp: number;
  rewardBadge?: string;
  rewardTitle?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isFeatured: boolean;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMonthlyChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  rewardClaimedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityCompetition {
  id: string;
  title: string;
  description: string;
  competitionType: 'reading' | 'writing' | 'social' | 'creative';
  status: 'upcoming' | 'active' | 'voting' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  votingEndDate?: string;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  participantCount: number;
  submissionCount: number;
  coverImageUrl?: string;
  bannerImageUrl?: string;
  createdBy?: string;
  isOfficial: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  progressData: Record<string, any>;
  submissionIds: string[];
  score: number;
  rank?: number;
  joinedAt: string;
  completedAt?: string;
  rewardClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionLeaderboardEntry {
  id: string;
  competitionId: string;
  userId: string;
  rank: number;
  score: number;
  progressPercentage: number;
  userDisplayName?: string;
  userAvatarUrl?: string;
  lastUpdated: string;
}

export class ChallengeService {
  private supabase = createClient();

  // ========================================
  // MONTHLY CHALLENGES
  // ========================================

  /**
   * Get all monthly challenges for a specific month
   */
  async getMonthlyChallenges(month?: Date): Promise<MonthlyChallenge[]> {
    const targetMonth = month || new Date();
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('monthly_challenges')
      .select('*')
      .eq('challenge_month', monthStartStr)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return this.mapMonthlyChallenges(data || []);
  }

  /**
   * Get current month's challenges
   */
  async getCurrentMonthlyChallenges(): Promise<MonthlyChallenge[]> {
    return this.getMonthlyChallenges();
  }

  /**
   * Get user's progress on monthly challenges
   */
  async getUserMonthlyChallenges(userId: string, month?: Date): Promise<UserMonthlyChallengeProgress[]> {
    const targetMonth = month || new Date();
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('user_monthly_challenges')
      .select(`
        *,
        challenge:monthly_challenges!inner(challenge_month)
      `)
      .eq('user_id', userId)
      .eq('challenge.challenge_month', monthStartStr);

    if (error) throw error;
    return this.mapUserMonthlyChallenges(data || []);
  }

  /**
   * Get or create user progress for a monthly challenge
   */
  async getOrCreateUserMonthlyChallenge(
    userId: string,
    challengeId: string
  ): Promise<UserMonthlyChallengeProgress> {
    const { data, error } = await this.supabase
      .from('user_monthly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return this.mapUserMonthlyChallenge(data);
    }

    // Create new progress entry
    const { data: newData, error: insertError } = await this.supabase
      .from('user_monthly_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        completed: false,
        reward_claimed: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return this.mapUserMonthlyChallenge(newData);
  }

  /**
   * Update user's monthly challenge progress
   */
  async updateMonthlyChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number
  ): Promise<UserMonthlyChallengeProgress> {
    // Get current progress
    const current = await this.getOrCreateUserMonthlyChallenge(userId, challengeId);

    // Get challenge to check goal
    const { data: challenge, error: challengeError } = await this.supabase
      .from('monthly_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) throw challengeError;

    const challengeData = challenge.challenge_data as Record<string, any>;
    const goal = challengeData.goal || challengeData.target || 100;
    const isCompleted = progress >= goal;

    const updateData: any = {
      progress,
      completed: isCompleted,
      updated_at: new Date().toISOString(),
    };

    if (isCompleted && !current.completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('user_monthly_challenges')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserMonthlyChallenge(data);
  }

  /**
   * Claim reward for completed monthly challenge
   */
  async claimMonthlyChallengeReward(
    userId: string,
    challengeId: string
  ): Promise<UserMonthlyChallengeProgress> {
    const current = await this.getOrCreateUserMonthlyChallenge(userId, challengeId);

    if (!current.completed) {
      throw new Error('Challenge not completed yet');
    }

    if (current.rewardClaimed) {
      throw new Error('Reward already claimed');
    }

    const { data, error } = await this.supabase
      .from('user_monthly_challenges')
      .update({
        reward_claimed: true,
        reward_claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    // Award XP and badges (integrate with achievement service)
    const challenge = await this.supabase
      .from('monthly_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challenge.data) {
      // TODO: Integrate with XP and badge system
      // await this.awardChallengeRewards(userId, challenge.data);
    }

    return this.mapUserMonthlyChallenge(data);
  }

  // ========================================
  // COMMUNITY COMPETITIONS
  // ========================================

  /**
   * Get all active competitions
   */
  async getActiveCompetitions(): Promise<CommunityCompetition[]> {
    const { data, error } = await this.supabase
      .from('community_competitions')
      .select('*')
      .in('status', ['upcoming', 'active', 'voting'])
      .order('is_official', { ascending: false })
      .order('start_date', { ascending: true });

    if (error) throw error;
    return this.mapCompetitions(data || []);
  }

  /**
   * Get competition by ID
   */
  async getCompetition(competitionId: string): Promise<CommunityCompetition> {
    const { data, error } = await this.supabase
      .from('community_competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (error) throw error;
    return this.mapCompetition(data);
  }

  /**
   * Join a competition
   */
  async joinCompetition(userId: string, competitionId: string): Promise<CompetitionParticipant> {
    // Check if already joined
    const { data: existing } = await this.supabase
      .from('competition_participants')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .single();

    if (existing) {
      return this.mapParticipant(existing);
    }

    // Join competition
    const { data, error } = await this.supabase
      .from('competition_participants')
      .insert({
        user_id: userId,
        competition_id: competitionId,
        progress_data: {},
        submission_ids: [],
        score: 0,
        reward_claimed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapParticipant(data);
  }

  /**
   * Get user's participation in a competition
   */
  async getUserParticipation(
    userId: string,
    competitionId: string
  ): Promise<CompetitionParticipant | null> {
    const { data, error } = await this.supabase
      .from('competition_participants')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapParticipant(data);
  }

  /**
   * Update competition participation progress
   */
  async updateCompetitionProgress(
    userId: string,
    competitionId: string,
    progressData: Record<string, any>,
    submissionIds?: string[]
  ): Promise<CompetitionParticipant> {
    const participation = await this.getUserParticipation(userId, competitionId);

    if (!participation) {
      throw new Error('User not participating in this competition');
    }

    const updateData: any = {
      progress_data: progressData,
      updated_at: new Date().toISOString(),
    };

    if (submissionIds) {
      updateData.submission_ids = submissionIds;
    }

    // Calculate score based on competition type and progress
    const competition = await this.getCompetition(competitionId);
    updateData.score = this.calculateCompetitionScore(competition, progressData);

    const { data, error } = await this.supabase
      .from('competition_participants')
      .update(updateData)
      .eq('id', participation.id)
      .select()
      .single();

    if (error) throw error;

    // Update leaderboard cache
    await this.updateLeaderboardCache(competitionId);

    return this.mapParticipant(data);
  }

  /**
   * Get competition leaderboard
   */
  async getCompetitionLeaderboard(
    competitionId: string,
    limit: number = 100
  ): Promise<CompetitionLeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from('competition_leaderboard')
      .select('*')
      .eq('competition_id', competitionId)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return this.mapLeaderboardEntries(data || []);
  }

  /**
   * Update leaderboard cache for a competition
   */
  private async updateLeaderboardCache(competitionId: string): Promise<void> {
    // Get all participants ordered by score
    const { data: participants, error } = await this.supabase
      .from('competition_participants')
      .select(`
        *,
        user:user_profiles!inner(display_name, avatar_url)
      `)
      .eq('competition_id', competitionId)
      .order('score', { ascending: false });

    if (error) throw error;

    // Get competition to calculate progress percentage
    const competition = await this.getCompetition(competitionId);
    const requirements = competition.requirements as Record<string, any>;
    const maxScore = requirements.maxScore || 1000;

    // Clear existing leaderboard
    await this.supabase
      .from('competition_leaderboard')
      .delete()
      .eq('competition_id', competitionId);

    // Insert updated leaderboard entries
    const leaderboardEntries = participants.map((participant, index) => ({
      competition_id: competitionId,
      user_id: participant.user_id,
      rank: index + 1,
      score: participant.score,
      progress_percentage: (participant.score / maxScore) * 100,
      user_display_name: (participant.user as any)?.display_name,
      user_avatar_url: (participant.user as any)?.avatar_url,
      last_updated: new Date().toISOString(),
    }));

    if (leaderboardEntries.length > 0) {
      await this.supabase
        .from('competition_leaderboard')
        .insert(leaderboardEntries);
    }
  }

  /**
   * Calculate competition score based on progress data
   */
  private calculateCompetitionScore(
    competition: CommunityCompetition,
    progressData: Record<string, any>
  ): number {
    const requirements = competition.requirements as Record<string, any>;

    switch (competition.competitionType) {
      case 'reading':
        return (
          (progressData.storiesRead || 0) * 10 +
          (progressData.chaptersRead || 0) * 5 +
          (progressData.readingTime || 0) / 60 // minutes
        );
      case 'writing':
        return (
          (progressData.storiesCreated || 0) * 50 +
          (progressData.chaptersWritten || 0) * 20 +
          (progressData.wordCount || 0) / 100
        );
      case 'social':
        return (
          (progressData.commentsPosted || 0) * 5 +
          (progressData.reviewsPosted || 0) * 15 +
          (progressData.shares || 0) * 10
        );
      case 'creative':
        return (
          (progressData.choicesMade || 0) * 2 +
          (progressData.pathsExplored || 0) * 10 +
          (progressData.achievementsUnlocked || 0) * 20
        );
      default:
        return 0;
    }
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapMonthlyChallenges(data: any[]): MonthlyChallenge[] {
    return data.map((item) => ({
      id: item.id,
      challengeMonth: item.challenge_month,
      challengeType: item.challenge_type,
      challengeData: item.challenge_data,
      title: item.title,
      description: item.description,
      rewardXp: item.reward_xp,
      rewardBadge: item.reward_badge,
      rewardTitle: item.reward_title,
      difficulty: item.difficulty,
      isFeatured: item.is_featured,
      coverImageUrl: item.cover_image_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  private mapUserMonthlyChallenges(data: any[]): UserMonthlyChallengeProgress[] {
    return data.map((item) => this.mapUserMonthlyChallenge(item));
  }

  private mapUserMonthlyChallenge(item: any): UserMonthlyChallengeProgress {
    return {
      id: item.id,
      userId: item.user_id,
      challengeId: item.challenge_id,
      progress: item.progress,
      completed: item.completed,
      completedAt: item.completed_at,
      rewardClaimed: item.reward_claimed,
      rewardClaimedAt: item.reward_claimed_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapCompetitions(data: any[]): CommunityCompetition[] {
    return data.map((item) => this.mapCompetition(item));
  }

  private mapCompetition(item: any): CommunityCompetition {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      competitionType: item.competition_type,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      votingEndDate: item.voting_end_date,
      requirements: item.requirements,
      rewards: item.rewards,
      participantCount: item.participant_count,
      submissionCount: item.submission_count,
      coverImageUrl: item.cover_image_url,
      bannerImageUrl: item.banner_image_url,
      createdBy: item.created_by,
      isOfficial: item.is_official,
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapParticipant(item: any): CompetitionParticipant {
    return {
      id: item.id,
      competitionId: item.competition_id,
      userId: item.user_id,
      progressData: item.progress_data,
      submissionIds: item.submission_ids || [],
      score: item.score,
      rank: item.rank,
      joinedAt: item.joined_at,
      completedAt: item.completed_at,
      rewardClaimed: item.reward_claimed,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapLeaderboardEntries(data: any[]): CompetitionLeaderboardEntry[] {
    return data.map((item) => ({
      id: item.id,
      competitionId: item.competition_id,
      userId: item.user_id,
      rank: item.rank,
      score: item.score,
      progressPercentage: item.progress_percentage,
      userDisplayName: item.user_display_name,
      userAvatarUrl: item.user_avatar_url,
      lastUpdated: item.last_updated,
    }));
  }
}

export const challengeService = new ChallengeService();


