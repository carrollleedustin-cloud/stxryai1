/**
 * Story Challenge Service
 * Manages community writing prompts, challenges, and competitions.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface StoryChallenge {
  id: string;
  title: string;
  description: string;
  prompt: string;
  genre?: string;
  theme?: string;
  requirements: ChallengeRequirements;
  rewards: ChallengeRewards;
  status: 'draft' | 'upcoming' | 'active' | 'voting' | 'completed';
  start_date: string;
  end_date: string;
  voting_end_date?: string;
  created_by: string;
  is_official: boolean;
  participant_count: number;
  submission_count: number;
  cover_image_url?: string;
  tags: string[];
  created_at: string;
}

export interface ChallengeRequirements {
  min_word_count?: number;
  max_word_count?: number;
  min_chapters?: number;
  max_chapters?: number;
  must_include_choices?: boolean;
  required_elements?: string[];
  forbidden_elements?: string[];
  time_limit_hours?: number;
}

export interface ChallengeRewards {
  xp_participation: number;
  xp_winner: number;
  badges: string[];
  featured_placement?: boolean;
  prize_description?: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  story_id: string;
  user_id: string;
  submitted_at: string;
  word_count: number;
  chapter_count: number;
  is_valid: boolean;
  validation_errors?: string[];
  vote_count: number;
  rank?: number;
  is_winner: boolean;
  story?: {
    title: string;
    cover_image_url?: string;
  };
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface ChallengeVote {
  id: string;
  challenge_id: string;
  submission_id: string;
  user_id: string;
  created_at: string;
}

export interface WritingPrompt {
  id: string;
  text: string;
  genre?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  use_count: number;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  prompt: WritingPrompt;
  bonus_xp: number;
  participant_count: number;
  featured_submission_id?: string;
}

export interface ChallengeLeaderboard {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  challenges_won: number;
  challenges_participated: number;
  total_votes_received: number;
  total_xp_earned: number;
}

// Prompt templates by genre
const PROMPT_TEMPLATES: Record<string, string[]> = {
  fantasy: [
    'A forgotten spell awakens after a thousand years...',
    'The last dragon keeper discovers their power is fading...',
    'A magical artifact chooses an unlikely hero...',
    'Two rival kingdoms must unite against a common enemy...',
    'A portal opens to a world where magic follows different rules...',
  ],
  'sci-fi': [
    'The first message from another galaxy arrives...',
    'A time traveler accidentally changes something small with huge consequences...',
    'Humanity discovers they are not alone on Earth...',
    'The AI designed to save humanity develops unexpected feelings...',
    'A colony ship wakes its passengers centuries too early...',
  ],
  romance: [
    'Two strangers keep running into each other in unexpected places...',
    'A love letter arrives decades too late...',
    'Former rivals must work together on a project...',
    'A chance encounter during a storm changes everything...',
    'Second chances come in the most unexpected forms...',
  ],
  mystery: [
    'A locked room contains a message that makes no sense - yet...',
    'The detective receives a case file about their own future crime...',
    'Everyone in town has the same alibi for the same night...',
    'A cold case suddenly has a new witness after 20 years...',
    'The victim left a trail of clues only one person can understand...',
  ],
  horror: [
    'The house has rules. Breaking them has consequences...',
    'They thought the ritual was just a game...',
    'Something is wrong with the new neighbor, but no one else notices...',
    'The dreams are getting more real every night...',
    "The voice on the phone knows things it shouldn't...",
  ],
  adventure: [
    "The map leads to a place that shouldn't exist...",
    'A dare leads to the discovery of a hidden world...',
    'The last survivor of the expedition finally tells the truth...',
    'A message in a bottle contains coordinates to something incredible...',
    'The forbidden zone has a secret everyone wants...',
  ],
};

// Challenge themes
const CHALLENGE_THEMES = [
  'Redemption',
  'Found Family',
  'Against All Odds',
  'Hidden Identity',
  'Unlikely Hero',
  'Second Chance',
  'Forbidden Knowledge',
  'The Cost of Power',
  'Trust and Betrayal',
  'Coming of Age',
];

export const storyChallengeService = {
  /**
   * Get all active challenges
   */
  async getActiveChallenges(): Promise<StoryChallenge[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('story_challenges')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching active challenges:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get upcoming challenges
   */
  async getUpcomingChallenges(): Promise<StoryChallenge[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('story_challenges')
      .select('*')
      .in('status', ['upcoming', 'draft'])
      .gt('start_date', now)
      .order('start_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching upcoming challenges:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<StoryChallenge | null> {
    const { data, error } = await supabase
      .from('story_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }

    return data;
  },

  /**
   * Create a new challenge
   */
  async createChallenge(
    challenge: Omit<StoryChallenge, 'id' | 'created_at' | 'participant_count' | 'submission_count'>
  ): Promise<StoryChallenge | null> {
    const { data, error } = await supabase
      .from('story_challenges')
      .insert({
        ...challenge,
        participant_count: 0,
        submission_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return data;
  },

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    // Check if already joined
    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (existing) return true; // Already joined

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id: userId,
      joined_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error joining challenge:', error);
      return false;
    }

    // Increment participant count
    await supabase.rpc('increment_challenge_participants', {
      challenge_id: challengeId,
    });

    return true;
  },

  /**
   * Submit story to challenge
   */
  async submitToChallenge(
    challengeId: string,
    storyId: string,
    userId: string
  ): Promise<ChallengeSubmission | null> {
    // Get challenge requirements
    const challenge = await this.getChallenge(challengeId);
    if (!challenge || challenge.status !== 'active') {
      return null;
    }

    // Get story details
    const { data: story } = await supabase
      .from('stories')
      .select('title, word_count')
      .eq('id', storyId)
      .single();

    const { count: chapterCount } = await supabase
      .from('chapters')
      .select('id', { count: 'exact', head: true })
      .eq('story_id', storyId);

    // Validate submission
    const validationErrors: string[] = [];
    const requirements = challenge.requirements;

    if (requirements.min_word_count && (story?.word_count || 0) < requirements.min_word_count) {
      validationErrors.push(`Minimum word count: ${requirements.min_word_count}`);
    }
    if (requirements.max_word_count && (story?.word_count || 0) > requirements.max_word_count) {
      validationErrors.push(`Maximum word count: ${requirements.max_word_count}`);
    }
    if (requirements.min_chapters && (chapterCount || 0) < requirements.min_chapters) {
      validationErrors.push(`Minimum chapters: ${requirements.min_chapters}`);
    }
    if (requirements.max_chapters && (chapterCount || 0) > requirements.max_chapters) {
      validationErrors.push(`Maximum chapters: ${requirements.max_chapters}`);
    }

    const isValid = validationErrors.length === 0;

    const { data, error } = await supabase
      .from('challenge_submissions')
      .insert({
        challenge_id: challengeId,
        story_id: storyId,
        user_id: userId,
        word_count: story?.word_count || 0,
        chapter_count: chapterCount || 0,
        is_valid: isValid,
        validation_errors: validationErrors.length > 0 ? validationErrors : null,
        vote_count: 0,
        is_winner: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting to challenge:', error);
      return null;
    }

    // Increment submission count
    await supabase.rpc('increment_challenge_submissions', {
      challenge_id: challengeId,
    });

    return data;
  },

  /**
   * Get submissions for a challenge
   */
  async getChallengeSubmissions(
    challengeId: string,
    sortBy: 'votes' | 'recent' = 'votes'
  ): Promise<ChallengeSubmission[]> {
    let query = supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        story:story_id (title, cover_image_url),
        user:user_id (display_name, avatar_url)
      `
      )
      .eq('challenge_id', challengeId)
      .eq('is_valid', true);

    if (sortBy === 'votes') {
      query = query.order('vote_count', { ascending: false });
    } else {
      query = query.order('submitted_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      story: Array.isArray(item.story) ? item.story[0] : item.story,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    }));
  },

  /**
   * Vote for a submission
   */
  async voteForSubmission(
    challengeId: string,
    submissionId: string,
    userId: string
  ): Promise<boolean> {
    // Check if challenge is in voting phase
    const challenge = await this.getChallenge(challengeId);
    if (!challenge || challenge.status !== 'voting') {
      return false;
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('challenge_votes')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Remove existing vote
      await supabase.from('challenge_votes').delete().eq('id', existingVote.id);

      // Decrement old submission's vote count
      await supabase.rpc('decrement_submission_votes', {
        submission_id: submissionId,
      });
    }

    // Add new vote
    const { error } = await supabase.from('challenge_votes').insert({
      challenge_id: challengeId,
      submission_id: submissionId,
      user_id: userId,
    });

    if (error) {
      console.error('Error voting:', error);
      return false;
    }

    // Increment vote count
    await supabase.rpc('increment_submission_votes', {
      submission_id: submissionId,
    });

    return true;
  },

  /**
   * Get user's challenge history
   */
  async getUserChallengeHistory(userId: string): Promise<{
    participated: StoryChallenge[];
    won: StoryChallenge[];
    submissions: ChallengeSubmission[];
  }> {
    // Get participated challenges
    const { data: participations } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', userId);

    const challengeIds = participations?.map((p) => p.challenge_id) || [];

    const { data: challenges } = await supabase
      .from('story_challenges')
      .select('*')
      .in('id', challengeIds.length > 0 ? challengeIds : ['none']);

    // Get won challenges
    const { data: wins } = await supabase
      .from('challenge_submissions')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('is_winner', true);

    const wonIds = wins?.map((w) => w.challenge_id) || [];

    const { data: wonChallenges } = await supabase
      .from('story_challenges')
      .select('*')
      .in('id', wonIds.length > 0 ? wonIds : ['none']);

    // Get all submissions
    const { data: submissions } = await supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        story:story_id (title, cover_image_url)
      `
      )
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    return {
      participated: challenges || [],
      won: wonChallenges || [],
      submissions: (submissions || []).map((s: any) => ({
        ...s,
        story: Array.isArray(s.story) ? s.story[0] : s.story,
      })),
    };
  },

  /**
   * Get today's daily challenge
   */
  async getDailyChallenge(): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenges')
      .select(
        `
        *,
        prompt:prompt_id (*)
      `
      )
      .eq('date', today)
      .single();

    if (error || !data) {
      // Generate a new daily challenge if none exists
      return this.generateDailyChallenge();
    }

    return {
      ...data,
      prompt: Array.isArray(data.prompt) ? data.prompt[0] : data.prompt,
    };
  },

  /**
   * Generate a daily challenge
   */
  async generateDailyChallenge(): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];
    const genres = Object.keys(PROMPT_TEMPLATES);
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const prompts = PROMPT_TEMPLATES[randomGenre];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Create prompt
    const { data: prompt, error: promptError } = await supabase
      .from('writing_prompts')
      .insert({
        text: randomPrompt,
        genre: randomGenre,
        difficulty: 'intermediate',
        tags: [randomGenre],
        use_count: 0,
      })
      .select()
      .single();

    if (promptError || !prompt) {
      console.error('Error creating prompt:', promptError);
      return null;
    }

    // Create daily challenge
    const { data: daily, error: dailyError } = await supabase
      .from('daily_challenges')
      .insert({
        date: today,
        prompt_id: prompt.id,
        bonus_xp: 50,
        participant_count: 0,
      })
      .select()
      .single();

    if (dailyError) {
      console.error('Error creating daily challenge:', dailyError);
      return null;
    }

    return {
      ...daily,
      prompt,
    };
  },

  /**
   * Get random writing prompt
   */
  async getRandomPrompt(genre?: string): Promise<WritingPrompt | null> {
    const prompts = genre
      ? PROMPT_TEMPLATES[genre.toLowerCase()] || []
      : Object.values(PROMPT_TEMPLATES).flat();

    if (prompts.length === 0) return null;

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return {
      id: crypto.randomUUID(),
      text: randomPrompt,
      genre: genre || 'general',
      difficulty: 'intermediate',
      tags: genre ? [genre] : [],
      use_count: 0,
      created_at: new Date().toISOString(),
    };
  },

  /**
   * Get multiple writing prompts
   */
  async getWritingPrompts(count: number = 5, genre?: string): Promise<WritingPrompt[]> {
    const prompts: WritingPrompt[] = [];
    const allPrompts = genre
      ? PROMPT_TEMPLATES[genre.toLowerCase()] || []
      : Object.values(PROMPT_TEMPLATES).flat();

    const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    selected.forEach((text, index) => {
      prompts.push({
        id: `prompt-${index}`,
        text,
        genre: genre || 'mixed',
        difficulty: 'intermediate',
        tags: [],
        use_count: 0,
        created_at: new Date().toISOString(),
      });
    });

    return prompts;
  },

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(limit: number = 10): Promise<ChallengeLeaderboard[]> {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select(
        `
        user_id,
        is_winner,
        vote_count,
        user:user_id (display_name, avatar_url)
      `
      )
      .eq('is_valid', true);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Aggregate by user
    const userStats: Record<string, ChallengeLeaderboard> = {};

    data?.forEach((submission: any) => {
      const userId = submission.user_id;
      const userData = Array.isArray(submission.user) ? submission.user[0] : submission.user;

      if (!userStats[userId]) {
        userStats[userId] = {
          user_id: userId,
          display_name: userData?.display_name || 'Unknown',
          avatar_url: userData?.avatar_url,
          challenges_won: 0,
          challenges_participated: 0,
          total_votes_received: 0,
          total_xp_earned: 0,
        };
      }

      userStats[userId].challenges_participated++;
      userStats[userId].total_votes_received += submission.vote_count || 0;

      if (submission.is_winner) {
        userStats[userId].challenges_won++;
        userStats[userId].total_xp_earned += 500; // Winner XP
      } else {
        userStats[userId].total_xp_earned += 100; // Participation XP
      }
    });

    return Object.values(userStats)
      .sort((a, b) => {
        // Sort by wins first, then by votes
        if (b.challenges_won !== a.challenges_won) {
          return b.challenges_won - a.challenges_won;
        }
        return b.total_votes_received - a.total_votes_received;
      })
      .slice(0, limit);
  },

  /**
   * Finalize challenge and determine winners
   */
  async finalizeChallenge(challengeId: string): Promise<boolean> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) return false;

    // Get top submissions by votes
    const { data: submissions } = await supabase
      .from('challenge_submissions')
      .select('id, user_id, vote_count')
      .eq('challenge_id', challengeId)
      .eq('is_valid', true)
      .order('vote_count', { ascending: false })
      .limit(3);

    if (!submissions || submissions.length === 0) return false;

    // Mark winner
    const winnerId = submissions[0].id;
    await supabase
      .from('challenge_submissions')
      .update({ is_winner: true, rank: 1 })
      .eq('id', winnerId);

    // Mark runners up
    for (let i = 1; i < submissions.length; i++) {
      await supabase
        .from('challenge_submissions')
        .update({ rank: i + 1 })
        .eq('id', submissions[i].id);
    }

    // Award XP to participants
    const { data: allSubmissions } = await supabase
      .from('challenge_submissions')
      .select('user_id, is_winner')
      .eq('challenge_id', challengeId)
      .eq('is_valid', true);

    for (const submission of allSubmissions || []) {
      const xp = submission.is_winner
        ? challenge.rewards.xp_winner
        : challenge.rewards.xp_participation;

      await supabase.rpc('add_user_xp', {
        user_id: submission.user_id,
        xp_amount: xp,
      });
    }

    // Update challenge status
    await supabase.from('story_challenges').update({ status: 'completed' }).eq('id', challengeId);

    return true;
  },

  /**
   * Get challenge themes
   */
  getThemes(): string[] {
    return CHALLENGE_THEMES;
  },

  /**
   * Get prompt templates by genre
   */
  getPromptsByGenre(genre: string): string[] {
    return PROMPT_TEMPLATES[genre.toLowerCase()] || [];
  },
};

export default storyChallengeService;
