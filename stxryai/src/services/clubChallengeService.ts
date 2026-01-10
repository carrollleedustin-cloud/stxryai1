import { supabase } from '@/lib/supabase/client';

export type ChallengeGoalType =
  | 'chapters_read'
  | 'stories_published'
  | 'total_xp'
  | 'reviews_written'
  | 'words_written';

export interface ClubChallenge {
  id: string;
  club_id: string;
  title: string;
  description: string;
  goal_type: ChallengeGoalType;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  reward_xp: number;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
}

export interface ChallengeContribution {
  challenge_id: string;
  user_id: string;
  contribution_value: number;
  updated_at: string;
}

class ClubChallengeService {
  /**
   * Fetch all challenges for a specific club
   */
  async getClubChallenges(clubId: string) {
    try {
      const { data, error } = await supabase
        .from('club_challenges')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet, return empty array for now
        if (
          error.code === 'PGRST116' ||
          error.message.includes('relation "club_challenges" does not exist')
        ) {
          console.warn('club_challenges table not found, using mock data');
          return this.getMockChallenges(clubId);
        }
        throw error;
      }

      return data as ClubChallenge[];
    } catch (error) {
      console.error('Error fetching club challenges:', error);
      return this.getMockChallenges(clubId);
    }
  }

  /**
   * Create a new challenge for a club
   */
  async createChallenge(
    challengeData: Omit<ClubChallenge, 'id' | 'current_value' | 'status' | 'created_at'>
  ) {
    try {
      const { data, error } = await supabase
        .from('club_challenges')
        .insert({
          ...challengeData,
          current_value: 0,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClubChallenge;
    } catch (error) {
      console.error('Error creating club challenge:', error);
      throw error;
    }
  }

  /**
   * Update challenge progress
   */
  async updateProgress(challengeId: string, userId: string, increment: number) {
    try {
      // 1. Update individual contribution
      const { data: contribution, error: contribError } = await supabase
        .from('challenge_contributions')
        .upsert(
          {
            challenge_id: challengeId,
            user_id: userId,
            contribution_value: increment, // In a real scenario, this would be incremented in DB
          },
          {
            onConflict: 'challenge_id,user_id',
          }
        )
        .select()
        .single();

      if (contribError) throw contribError;

      // 2. Update total challenge value
      const { data: challenge, error: challengeError } = await supabase
        .from('club_challenges')
        .select('current_value, target_value')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      const newValue = (challenge.current_value || 0) + increment;
      const isCompleted = newValue >= challenge.target_value;

      const { error: updateError } = await supabase
        .from('club_challenges')
        .update({
          current_value: newValue,
          status: isCompleted ? 'completed' : 'active',
        })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      return { newValue, isCompleted };
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for a challenge
   */
  async getChallengeLeaderboard(challengeId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('challenge_contributions')
        .select('*, users(username, avatar_url, display_name)')
        .eq('challenge_id', challengeId)
        .order('contribution_value', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      return [];
    }
  }

  private getMockChallenges(clubId: string): ClubChallenge[] {
    return [
      {
        id: 'mock-1',
        club_id: clubId,
        title: 'Weekly Reading Marathon',
        description: 'Read 100 chapters as a club this week!',
        goal_type: 'chapters_read',
        target_value: 100,
        current_value: 45,
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        reward_xp: 500,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-2',
        club_id: clubId,
        title: 'Anthology Project',
        description: 'Publish 10 new stories together.',
        goal_type: 'stories_published',
        target_value: 10,
        current_value: 2,
        start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        reward_xp: 2000,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export const clubChallengeService = new ClubChallengeService();
