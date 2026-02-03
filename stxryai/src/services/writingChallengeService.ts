/**
 * Writing Challenge Service
 * Manages writing prompts, contests, and seasonal events
 */

import { createClient } from '@/lib/supabase/client';

export interface WritingPrompt {
  id: string;
  title: string;
  promptText: string;
  genre: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordLimitMin: number | null;
  wordLimitMax: number | null;
  timeLimitHours: number | null;
  isDaily: boolean;
  promptDate: string | null;
}

export interface WritingContest {
  id: string;
  title: string;
  description: string | null;
  rules: string | null;
  contestType: 'weekly' | 'monthly' | 'seasonal' | 'special';
  theme: string | null;
  genreRestriction: string | null;
  wordLimitMin: number | null;
  wordLimitMax: number | null;
  prizePoolCoins: number;
  prizePoolDescription: string | null;
  entryFeeCoins: number;
  maxEntries: number | null;
  votingType: 'community' | 'judges' | 'mixed';
  submissionStart: string;
  submissionEnd: string;
  votingStart: string | null;
  votingEnd: string | null;
  status: 'upcoming' | 'submissions_open' | 'voting' | 'judging' | 'completed' | 'cancelled';
  entryCount?: number;
  hasEntered?: boolean;
}

export interface ContestEntry {
  id: string;
  contestId: string;
  userId: string;
  storyId: string;
  entryTitle: string | null;
  wordCount: number | null;
  submittedAt: string;
  finalRank: number | null;
  finalScore: number | null;
  voteCount?: number;
  authorName?: string;
  authorAvatarUrl?: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string | null;
  theme: string | null;
  eventType: 'halloween' | 'holiday' | 'summer' | 'spring' | 'custom';
  specialRewards: any[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

class WritingChallengeService {
  private supabase = createClient();

  /**
   * Get daily writing prompt
   */
  async getDailyPrompt(): Promise<WritingPrompt | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .from('writing_prompts')
        .select('*')
        .eq('is_daily', true)
        .eq('prompt_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily prompt:', error);
        return null;
      }

      if (!data) {
        // Get a random prompt if no daily prompt exists
        return this.getRandomPrompt();
      }

      return this.mapPrompt(data);
    } catch (error) {
      console.error('Error in getDailyPrompt:', error);
      return null;
    }
  }

  /**
   * Get random writing prompt
   */
  async getRandomPrompt(genre?: string, difficulty?: string): Promise<WritingPrompt | null> {
    try {
      let query = this.supabase
        .from('writing_prompts')
        .select('*')
        .eq('is_active', true);

      if (genre) {
        query = query.eq('genre', genre);
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return null;
      }

      // Select random
      const randomIndex = Math.floor(Math.random() * data.length);
      return this.mapPrompt(data[randomIndex]);
    } catch (error) {
      console.error('Error in getRandomPrompt:', error);
      return null;
    }
  }

  /**
   * Get all active contests
   */
  async getActiveContests(userId?: string): Promise<WritingContest[]> {
    try {
      const { data, error } = await this.supabase
        .from('writing_contests')
        .select('*')
        .in('status', ['upcoming', 'submissions_open', 'voting'])
        .order('submission_start', { ascending: true });

      if (error) {
        console.error('Error fetching active contests:', error);
        return [];
      }

      const contests = (data || []).map(this.mapContest);

      // Check if user has entered each contest
      if (userId) {
        for (const contest of contests) {
          const { data: entry } = await this.supabase
            .from('contest_entries')
            .select('id')
            .eq('contest_id', contest.id)
            .eq('user_id', userId)
            .single();

          contest.hasEntered = !!entry;
        }
      }

      // Get entry counts
      for (const contest of contests) {
        const { count } = await this.supabase
          .from('contest_entries')
          .select('*', { count: 'exact', head: true })
          .eq('contest_id', contest.id);

        contest.entryCount = count || 0;
      }

      return contests;
    } catch (error) {
      console.error('Error in getActiveContests:', error);
      return [];
    }
  }

  /**
   * Get contest by ID
   */
  async getContest(contestId: string, userId?: string): Promise<WritingContest | null> {
    try {
      const { data, error } = await this.supabase
        .from('writing_contests')
        .select('*')
        .eq('id', contestId)
        .single();

      if (error) {
        console.error('Error fetching contest:', error);
        return null;
      }

      const contest = this.mapContest(data);

      // Get entry count
      const { count } = await this.supabase
        .from('contest_entries')
        .select('*', { count: 'exact', head: true })
        .eq('contest_id', contestId);

      contest.entryCount = count || 0;

      // Check if user has entered
      if (userId) {
        const { data: entry } = await this.supabase
          .from('contest_entries')
          .select('id')
          .eq('contest_id', contestId)
          .eq('user_id', userId)
          .single();

        contest.hasEntered = !!entry;
      }

      return contest;
    } catch (error) {
      console.error('Error in getContest:', error);
      return null;
    }
  }

  /**
   * Enter a contest
   */
  async enterContest(
    userId: string,
    contestId: string,
    storyId: string,
    entryTitle?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get contest details
      const contest = await this.getContest(contestId);
      
      if (!contest) {
        return { success: false, error: 'Contest not found' };
      }

      if (contest.status !== 'submissions_open') {
        return { success: false, error: 'Contest is not accepting submissions' };
      }

      if (contest.hasEntered) {
        return { success: false, error: 'You have already entered this contest' };
      }

      if (contest.maxEntries && contest.entryCount && contest.entryCount >= contest.maxEntries) {
        return { success: false, error: 'Contest has reached maximum entries' };
      }

      // Check entry fee
      if (contest.entryFeeCoins > 0) {
        const { data: wallet } = await this.supabase
          .from('user_wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!wallet || wallet.balance < contest.entryFeeCoins) {
          return { success: false, error: 'Insufficient coins for entry fee' };
        }

        // Deduct entry fee
        await this.supabase.rpc('deduct_coins', {
          p_user_id: userId,
          p_amount: contest.entryFeeCoins,
          p_reason: `Entry fee for ${contest.title}`,
        });
      }

      // Get story word count
      const { data: story } = await this.supabase
        .from('stories')
        .select('word_count')
        .eq('id', storyId)
        .single();

      // Create entry
      const { error } = await this.supabase.from('contest_entries').insert({
        contest_id: contestId,
        user_id: userId,
        story_id: storyId,
        entry_title: entryTitle,
        word_count: story?.word_count || 0,
      });

      if (error) {
        console.error('Error creating contest entry:', error);
        return { success: false, error: 'Failed to submit entry' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in enterContest:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get contest entries
   */
  async getContestEntries(contestId: string, limit: number = 50): Promise<ContestEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('contest_entries')
        .select(`
          *,
          user_profiles!contest_entries_user_id_fkey (display_name, avatar_url)
        `)
        .eq('contest_id', contestId)
        .eq('is_disqualified', false)
        .order('final_score', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching contest entries:', error);
        return [];
      }

      // Get vote counts for each entry
      const entries = await Promise.all(
        (data || []).map(async (entry) => {
          const { count } = await this.supabase
            .from('contest_votes')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id);

          return {
            id: entry.id,
            contestId: entry.contest_id,
            userId: entry.user_id,
            storyId: entry.story_id,
            entryTitle: entry.entry_title,
            wordCount: entry.word_count,
            submittedAt: entry.submitted_at,
            finalRank: entry.final_rank,
            finalScore: entry.final_score,
            voteCount: count || 0,
            authorName: (entry.user_profiles as any)?.display_name || 'Unknown',
            authorAvatarUrl: (entry.user_profiles as any)?.avatar_url,
          };
        })
      );

      return entries;
    } catch (error) {
      console.error('Error in getContestEntries:', error);
      return [];
    }
  }

  /**
   * Vote on contest entry
   */
  async voteOnEntry(
    userId: string,
    contestId: string,
    entryId: string,
    score: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if contest is in voting phase
      const contest = await this.getContest(contestId);
      
      if (!contest || contest.status !== 'voting') {
        return { success: false, error: 'Contest is not in voting phase' };
      }

      // Check if user already voted
      const { data: existingVote } = await this.supabase
        .from('contest_votes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('voter_id', userId)
        .single();

      if (existingVote) {
        // Update existing vote
        await this.supabase
          .from('contest_votes')
          .update({ score, voted_at: new Date().toISOString() })
          .eq('id', existingVote.id);
      } else {
        // Create new vote
        await this.supabase.from('contest_votes').insert({
          contest_id: contestId,
          entry_id: entryId,
          voter_id: userId,
          score,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error in voteOnEntry:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get seasonal events
   */
  async getSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('seasonal_events')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now);

      if (error) {
        console.error('Error fetching seasonal events:', error);
        return [];
      }

      return (data || []).map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        theme: event.theme,
        eventType: event.event_type,
        specialRewards: event.special_rewards || [],
        startsAt: event.starts_at,
        endsAt: event.ends_at,
        isActive: event.is_active,
      }));
    } catch (error) {
      console.error('Error in getSeasonalEvents:', error);
      return [];
    }
  }

  /**
   * Get user's contest history
   */
  async getUserContestHistory(userId: string): Promise<{
    totalEntered: number;
    wins: number;
    topThreeFinishes: number;
    totalPrizeCoins: number;
    entries: ContestEntry[];
  }> {
    try {
      const { data, error } = await this.supabase
        .from('contest_entries')
        .select(`
          *,
          writing_contests!contest_entries_contest_id_fkey (title, status)
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching user contest history:', error);
        return {
          totalEntered: 0,
          wins: 0,
          topThreeFinishes: 0,
          totalPrizeCoins: 0,
          entries: [],
        };
      }

      const entries = (data || []).map((entry) => ({
        id: entry.id,
        contestId: entry.contest_id,
        userId: entry.user_id,
        storyId: entry.story_id,
        entryTitle: entry.entry_title,
        wordCount: entry.word_count,
        submittedAt: entry.submitted_at,
        finalRank: entry.final_rank,
        finalScore: entry.final_score,
      }));

      const wins = entries.filter((e) => e.finalRank === 1).length;
      const topThree = entries.filter((e) => e.finalRank && e.finalRank <= 3).length;

      // Calculate total prize coins (would need prize_awarded field)
      const totalPrizeCoins = 0;

      return {
        totalEntered: entries.length,
        wins,
        topThreeFinishes: topThree,
        totalPrizeCoins,
        entries,
      };
    } catch (error) {
      console.error('Error in getUserContestHistory:', error);
      return {
        totalEntered: 0,
        wins: 0,
        topThreeFinishes: 0,
        totalPrizeCoins: 0,
        entries: [],
      };
    }
  }

  /**
   * Get upcoming contests
   */
  async getUpcomingContests(): Promise<WritingContest[]> {
    try {
      const { data, error } = await this.supabase
        .from('writing_contests')
        .select('*')
        .eq('status', 'upcoming')
        .order('submission_start', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching upcoming contests:', error);
        return [];
      }

      return (data || []).map(this.mapContest);
    } catch (error) {
      console.error('Error in getUpcomingContests:', error);
      return [];
    }
  }

  private mapPrompt(data: any): WritingPrompt {
    return {
      id: data.id,
      title: data.title,
      promptText: data.prompt_text,
      genre: data.genre,
      difficulty: data.difficulty,
      wordLimitMin: data.word_limit_min,
      wordLimitMax: data.word_limit_max,
      timeLimitHours: data.time_limit_hours,
      isDaily: data.is_daily,
      promptDate: data.prompt_date,
    };
  }

  private mapContest(data: any): WritingContest {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      rules: data.rules,
      contestType: data.contest_type,
      theme: data.theme,
      genreRestriction: data.genre_restriction,
      wordLimitMin: data.word_limit_min,
      wordLimitMax: data.word_limit_max,
      prizePoolCoins: data.prize_pool_coins,
      prizePoolDescription: data.prize_pool_description,
      entryFeeCoins: data.entry_fee_coins,
      maxEntries: data.max_entries,
      votingType: data.voting_type,
      submissionStart: data.submission_start,
      submissionEnd: data.submission_end,
      votingStart: data.voting_start,
      votingEnd: data.voting_end,
      status: data.status,
    };
  }
}

export const writingChallengeService = new WritingChallengeService();
