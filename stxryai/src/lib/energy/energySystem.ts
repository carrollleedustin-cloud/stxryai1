/**
 * Energy System for Story Choices
 * Free users have limited energy that regenerates slowly
 * Premium users have more energy and faster regeneration
 * Creator Pro users have unlimited energy
 */

export type SubscriptionTier = 'free' | 'premium' | 'creator_pro';

export interface EnergyConfig {
  maxEnergy: number;
  regenRate: number; // Energy points per hour
  regenInterval: number; // Minutes between regeneration
  costPerChoice: number;
}

export const ENERGY_CONFIGS: Record<SubscriptionTier, EnergyConfig> = {
  free: {
    maxEnergy: 20,
    regenRate: 1, // 1 energy every 3 hours
    regenInterval: 180, // 3 hours in minutes
    costPerChoice: 1,
  },
  premium: {
    maxEnergy: 100,
    regenRate: 1, // 1 energy every 90 minutes (2x faster)
    regenInterval: 90, // 90 minutes
    costPerChoice: 1,
  },
  creator_pro: {
    maxEnergy: 999999, // Effectively unlimited
    regenRate: 999, // Instant regeneration
    regenInterval: 1, // Every minute
    costPerChoice: 0, // Free choices
  },
};

export interface UserEnergy {
  current: number;
  max: number;
  lastRegenTime: Date;
  subscriptionTier: SubscriptionTier;
}

/**
 * Calculate energy regeneration since last update
 */
export function calculateEnergyRegen(userEnergy: UserEnergy): number {
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];

  // Creator Pro has unlimited energy
  if (userEnergy.subscriptionTier === 'creator_pro') {
    return config.maxEnergy;
  }

  // Calculate time elapsed since last regeneration
  const now = new Date();
  const lastRegen = new Date(userEnergy.lastRegenTime);
  const minutesElapsed = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60));

  // Calculate how many regeneration intervals have passed
  const intervalsComplete = Math.floor(minutesElapsed / config.regenInterval);

  // Calculate regenerated energy
  const regenEnergy = intervalsComplete * config.regenRate;

  // Cap at max energy
  const newEnergy = Math.min(userEnergy.current + regenEnergy, config.maxEnergy);

  return newEnergy;
}

/**
 * Get time until next energy point
 */
export function getTimeUntilNextEnergy(userEnergy: UserEnergy): number {
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];

  // Creator Pro has unlimited
  if (userEnergy.subscriptionTier === 'creator_pro') {
    return 0;
  }

  // If at max, no need to regenerate
  if (userEnergy.current >= config.maxEnergy) {
    return 0;
  }

  const now = new Date();
  const lastRegen = new Date(userEnergy.lastRegenTime);
  const minutesElapsed = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60));

  // Minutes until next interval
  const minutesUntilNext = config.regenInterval - (minutesElapsed % config.regenInterval);

  return minutesUntilNext * 60 * 1000; // Return in milliseconds
}

/**
 * Format time remaining until next energy
 */
export function formatTimeUntilNext(milliseconds: number): string {
  if (milliseconds === 0) return 'Full';

  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check if user has enough energy for a choice
 */
export function hasEnoughEnergy(userEnergy: UserEnergy, choiceCost: number = 1): boolean {
  // Creator Pro always has enough
  if (userEnergy.subscriptionTier === 'creator_pro') {
    return true;
  }

  // Calculate current energy with regeneration
  const currentEnergy = calculateEnergyRegen(userEnergy);

  return currentEnergy >= choiceCost;
}

/**
 * Consume energy for a story choice
 */
export function consumeEnergy(
  userEnergy: UserEnergy,
  choiceCost: number = 1
): { success: boolean; newEnergy: UserEnergy; message?: string } {
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];

  // Creator Pro never consumes energy
  if (userEnergy.subscriptionTier === 'creator_pro') {
    return {
      success: true,
      newEnergy: userEnergy,
      message: 'Unlimited energy!',
    };
  }

  // Calculate current energy with regeneration
  const currentEnergy = calculateEnergyRegen(userEnergy);

  // Check if enough energy
  if (currentEnergy < choiceCost) {
    return {
      success: false,
      newEnergy: {
        ...userEnergy,
        current: currentEnergy,
      },
      message: `Not enough energy! You need ${choiceCost}, but have ${currentEnergy}.`,
    };
  }

  // Consume energy
  return {
    success: true,
    newEnergy: {
      ...userEnergy,
      current: currentEnergy - choiceCost,
      lastRegenTime: new Date(),
    },
    message: `Energy consumed: ${choiceCost}. Remaining: ${currentEnergy - choiceCost}/${config.maxEnergy}`,
  };
}

/**
 * Purchase energy refill (for free users)
 */
export function purchaseEnergyRefill(userEnergy: UserEnergy): UserEnergy {
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];

  return {
    ...userEnergy,
    current: config.maxEnergy,
    lastRegenTime: new Date(),
  };
}

/**
 * Get energy percentage
 */
export function getEnergyPercentage(userEnergy: UserEnergy): number {
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];
  const currentEnergy = calculateEnergyRegen(userEnergy);

  if (userEnergy.subscriptionTier === 'creator_pro') {
    return 100;
  }

  return Math.floor((currentEnergy / config.maxEnergy) * 100);
}

/**
 * Get upgrade benefits for energy
 */
export function getUpgradeBenefits(fromTier: SubscriptionTier, toTier: SubscriptionTier) {
  const fromConfig = ENERGY_CONFIGS[fromTier];
  const toConfig = ENERGY_CONFIGS[toTier];

  return {
    energyIncrease: toConfig.maxEnergy - fromConfig.maxEnergy,
    regenSpeedMultiplier: fromConfig.regenInterval / toConfig.regenInterval,
    isUnlimited: toTier === 'creator_pro',
  };
}

/**
 * Initialize new user energy
 */
export function initializeUserEnergy(subscriptionTier: SubscriptionTier = 'free'): UserEnergy {
  const config = ENERGY_CONFIGS[subscriptionTier];

  return {
    current: config.maxEnergy, // Start with full energy
    max: config.maxEnergy,
    lastRegenTime: new Date(),
    subscriptionTier,
  };
}

/**
 * Update user energy after subscription change
 */
export function updateEnergyForSubscription(
  userEnergy: UserEnergy,
  newTier: SubscriptionTier
): UserEnergy {
  const newConfig = ENERGY_CONFIGS[newTier];

  // Calculate current energy with regeneration first
  const currentEnergy = calculateEnergyRegen(userEnergy);

  return {
    ...userEnergy,
    current: Math.min(currentEnergy, newConfig.maxEnergy),
    max: newConfig.maxEnergy,
    subscriptionTier: newTier,
    lastRegenTime: new Date(),
  };
}
