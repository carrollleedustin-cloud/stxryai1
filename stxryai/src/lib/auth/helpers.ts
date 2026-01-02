import { createClient } from '../supabase/server';
import type { Database } from '../supabase/database.types';
import { redirect } from 'next/navigation';
import { UserProfile, Achievement, UserAchievement, Notification } from '@/types/database';
import { updateUserById, upsertUserAchievement, insertNotification } from '@/lib/supabase/typed';

// Get current user from server
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select(
      'id, email, username, display_name, avatar_url, bio, tier, xp, level, energy, max_energy, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_end_date, created_at, updated_at'
    )
    .eq('id', user.id)
    .single();

  return (profile as any) as UserProfile | null;
}

// Require authentication (redirect if not authenticated)
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

// Check if user has specific tier
export async function requireTier(tier: 'premium' | 'creator_pro'): Promise<UserProfile> {
  const user = await requireAuth();

  if (user.tier === 'free') {
    redirect('/pricing');
  }

  if (tier === 'creator_pro' && user.tier !== 'creator_pro') {
    redirect('/pricing');
  }

  return user;
}

// Check if user is story owner
interface StoryOwner {
  user_id: string;
}
export async function requireStoryOwnership(storyId: string): Promise<UserProfile> {
  const user = await requireAuth();
  const supabase = createClient();

  const { data: story }: { data: StoryOwner | null } = await supabase
    .from('stories')
    .select('user_id')
    .eq('id', storyId)
    .single();

  if (!story || story.user_id !== user.id) {
    redirect('/dashboard');
  }

  return user;
}

// Check energy for reading
export async function checkEnergy(): Promise<boolean> {
  const user = await requireAuth();

  if (user.tier === 'premium' || user.tier === 'creator_pro') {
    return true; // Unlimited energy
  }

  return user.energy > 0;
}

// Consume energy
export async function consumeEnergy(amount = 1): Promise<boolean> {
  const user = await requireAuth();

  if (user.tier === 'premium' || user.tier === 'creator_pro') {
    return true; // Unlimited energy
  }

  if (user.energy < amount) {
    return false;
  }

  const supabase = createClient();

  const { error } = await updateUserById(user.id, { energy: user.energy - amount });

  return !error;
}

// Grant XP and level up
export async function grantXP(userId: string, xpAmount: number): Promise<boolean> {
  const supabase = createClient();

  const { data: user }: { data: Pick<UserProfile, 'xp' | 'level'> | null } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();

  if (!user) return false;

  const newXP = user.xp + xpAmount;
  const xpForNextLevel = user.level * 100; // Simple leveling formula

  let newLevel = user.level;
  if (newXP >= xpForNextLevel) {
    newLevel = user.level + 1;
  }

  const { error } = await updateUserById(userId, { xp: newXP, level: newLevel });

  return !error;
}

// Check and update achievements
export async function checkAchievements(userId: string, type: string, value: number) {
  const supabase = createClient();

  // Get relevant achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('requirement_type', type);

  if (!achievements) return;

  for (const achievement of achievements as Achievement[]) {
    if (value >= achievement.requirement_value) {
      // Check if already unlocked
      const { data: userAchievement }: { data: UserAchievement | null } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (!userAchievement || !userAchievement.unlocked_at) {
        // Unlock achievement
        await upsertUserAchievement({
          user_id: userId,
          achievement_id: achievement.id,
          progress: achievement.requirement_value,
          unlocked_at: new Date().toISOString(),
        });

        // Grant XP reward
        await grantXP(userId, achievement.xp_reward);

        // Create notification
        await insertNotification({
          user_id: userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You unlocked: ${achievement.title}`,
          link: '/achievements',
        });
      }
    }
  }
}
