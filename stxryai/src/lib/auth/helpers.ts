// @ts-nocheck
import { createClient } from '../supabase/server';
import { redirect } from 'next/navigation';

// Get current user from server
export async function getCurrentUser() {
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
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Require authentication (redirect if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

// Check if user has specific tier
export async function requireTier(tier: 'premium' | 'creator_pro') {
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
export async function requireStoryOwnership(storyId: string) {
  const user = await requireAuth();
  const supabase = createClient();

  const { data: story } = await supabase
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
export async function checkEnergy() {
  const user = await requireAuth();

  if (user.tier === 'premium' || user.tier === 'creator_pro') {
    return true; // Unlimited energy
  }

  return user.energy > 0;
}

// Consume energy
export async function consumeEnergy(amount = 1) {
  const user = await requireAuth();

  if (user.tier === 'premium' || user.tier === 'creator_pro') {
    return true; // Unlimited energy
  }

  if (user.energy < amount) {
    return false;
  }

  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .update({ energy: user.energy - amount })
    .eq('id', user.id);

  return !error;
}

// Grant XP and level up
export async function grantXP(userId: string, xpAmount: number) {
  const supabase = createClient();

  const { data: user } = await supabase
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

  const { error } = await supabase
    .from('users')
    .update({ xp: newXP, level: newLevel })
    .eq('id', userId);

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

  for (const achievement of achievements) {
    if (value >= achievement.requirement_value) {
      // Check if already unlocked
      const { data: userAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (!userAchievement || !userAchievement.unlocked_at) {
        // Unlock achievement
        await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            progress: achievement.requirement_value,
            unlocked_at: new Date().toISOString(),
          });

        // Grant XP reward
        await grantXP(userId, achievement.xp_reward);

        // Create notification
        await supabase.from('notifications').insert({
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
