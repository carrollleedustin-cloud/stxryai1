import { createClient } from '@/lib/supabase/client';

export interface CollectiveMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardXP: number;
  type: 'total_words' | 'total_reads' | 'total_stories' | 'total_shares';
  isActive: boolean;
  endsAt: string;
}

export class CollectiveMilestoneService {
  private static instance: CollectiveMilestoneService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): CollectiveMilestoneService {
    if (!CollectiveMilestoneService.instance) {
      CollectiveMilestoneService.instance = new CollectiveMilestoneService();
    }
    return CollectiveMilestoneService.instance;
  }

  /**
   * Fetches all active collective milestones
   */
  public async getActiveMilestones(): Promise<CollectiveMilestone[]> {
    const { data, error } = await this.supabase
      .from('collective_milestones')
      .select('*')
      .eq('isActive', true)
      .gt('endsAt', new Date().toISOString());

    if (error) {
      console.error('Error fetching collective milestones:', error);
      return [];
    }

    return data as CollectiveMilestone[];
  }

  /**
   * Updates a milestone progress (should be called by a background worker or after relevant actions)
   */
  public async incrementProgress(
    type: CollectiveMilestone['type'],
    amount: number = 1
  ): Promise<void> {
    const { data: milestones, error: fetchError } = await this.supabase
      .from('collective_milestones')
      .select('id, currentValue, targetValue')
      .eq('type', type)
      .eq('isActive', true);

    if (fetchError || !milestones) return;

    for (const milestone of milestones) {
      const newValue = milestone.currentValue + amount;
      const { error: updateError } = await this.supabase
        .from('collective_milestones')
        .update({
          currentValue: newValue,
          isActive: newValue < milestone.targetValue,
        })
        .eq('id', milestone.id);

      if (updateError) {
        console.error(`Error updating milestone ${milestone.id}:`, updateError);
      }
    }
  }
}

export const collectiveMilestoneService = CollectiveMilestoneService.getInstance();
