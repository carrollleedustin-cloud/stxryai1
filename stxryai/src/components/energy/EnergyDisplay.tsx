'use client';

/**
 * Energy Display Components
 * Shows user's current energy, regeneration timer, and upgrade options
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  calculateEnergyRegen,
  getTimeUntilNextEnergy,
  formatTimeUntilNext,
  getEnergyPercentage,
  type UserEnergy,
  type SubscriptionTier,
  ENERGY_CONFIGS,
} from '@/lib/energy/energySystem';

interface EnergyDisplayProps {
  userEnergy: UserEnergy;
  showUpgradeButton?: boolean;
  compact?: boolean;
  className?: string;
}

export default function EnergyDisplay({
  userEnergy,
  showUpgradeButton = true,
  compact = false,
  className = '',
}: EnergyDisplayProps) {
  const [currentEnergy, setCurrentEnergy] = useState(calculateEnergyRegen(userEnergy));
  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilNextEnergy(userEnergy));
  const [percentage, setPercentage] = useState(getEnergyPercentage(userEnergy));

  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];
  const isUnlimited = userEnergy.subscriptionTier === 'creator_pro';

  // Update energy every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEnergy(calculateEnergyRegen(userEnergy));
      setTimeUntilNext(getTimeUntilNextEnergy(userEnergy));
      setPercentage(getEnergyPercentage(userEnergy));
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [userEnergy]);

  // Energy color based on percentage
  const getEnergyColor = () => {
    if (isUnlimited) return 'text-purple-500';
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Energy Icon */}
        <div className="relative">
          <svg className={`w-6 h-6 ${getEnergyColor()}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          {!isUnlimited && currentEnergy < 5 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </div>

        {/* Energy Count */}
        <div className="text-sm font-semibold">
          {isUnlimited ? '∞' : `${currentEnergy}/${config.maxEnergy}`}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className={`w-5 h-5 ${getEnergyColor()}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold">Energy</span>
        </div>

        {/* Tier Badge */}
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isUnlimited
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
              : userEnergy.subscriptionTier === 'premium'
              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
          }`}
        >
          {userEnergy.subscriptionTier === 'creator_pro'
            ? 'Unlimited'
            : userEnergy.subscriptionTier === 'premium'
            ? 'Premium'
            : 'Free'}
        </span>
      </div>

      {/* Energy Bar */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1">
          <span className={`text-2xl font-bold ${getEnergyColor()}`}>
            {isUnlimited ? '∞' : currentEnergy}
          </span>
          {!isUnlimited && (
            <span className="text-sm text-muted-foreground">/ {config.maxEnergy}</span>
          )}
        </div>

        {!isUnlimited && (
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                percentage >= 75
                  ? 'bg-green-500'
                  : percentage >= 50
                  ? 'bg-yellow-500'
                  : percentage >= 25
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
            />
          </div>
        )}
      </div>

      {/* Regeneration Info */}
      {!isUnlimited && (
        <div className="text-sm text-muted-foreground mb-3">
          {currentEnergy < config.maxEnergy ? (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Next energy: {formatTimeUntilNext(timeUntilNext)}</span>
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400">Energy Full!</div>
          )}
        </div>
      )}

      {/* Low Energy Warning */}
      {!isUnlimited && currentEnergy < 5 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3"
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-xs text-red-600 dark:text-red-400">
              Low energy! Upgrade for faster regeneration.
            </div>
          </div>
        </motion.div>
      )}

      {/* Upgrade Button */}
      {showUpgradeButton && !isUnlimited && (
        <a
          href="/premium"
          className="block w-full px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
        >
          {userEnergy.subscriptionTier === 'free' ? 'Upgrade to Premium' : 'Upgrade to Creator Pro'}
        </a>
      )}
    </div>
  );
}

/**
 * Energy Badge - Small badge for headers/navbars
 */
export function EnergyBadge({ userEnergy, onClick }: { userEnergy: UserEnergy; onClick?: () => void }) {
  const [currentEnergy, setCurrentEnergy] = useState(calculateEnergyRegen(userEnergy));
  const isUnlimited = userEnergy.subscriptionTier === 'creator_pro';
  const config = ENERGY_CONFIGS[userEnergy.subscriptionTier];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEnergy(calculateEnergyRegen(userEnergy));
    }, 60000);
    return () => clearInterval(interval);
  }, [userEnergy]);

  const getColor = () => {
    if (isUnlimited) return 'bg-purple-500';
    const percentage = (currentEnergy / config.maxEnergy) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full hover:bg-muted transition-colors"
    >
      <div className={`w-2 h-2 rounded-full ${getColor()}`} />
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-semibold">{isUnlimited ? '∞' : currentEnergy}</span>
    </button>
  );
}

/**
 * Energy Modal - Full energy management modal
 */
export function EnergyModal({
  userEnergy,
  onClose,
  onUpgrade,
}: {
  userEnergy: UserEnergy;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Energy System</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Energy Display */}
        <EnergyDisplay userEnergy={userEnergy} showUpgradeButton={false} className="mb-6" />

        {/* How it Works */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">How Energy Works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Each story choice costs 1 energy</li>
            <li>• Energy regenerates automatically over time</li>
            <li>• Upgrade for faster regeneration & more energy</li>
          </ul>
        </div>

        {/* Tier Comparison */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {(['free', 'premium', 'creator_pro'] as SubscriptionTier[]).map((tier) => {
            const config = ENERGY_CONFIGS[tier];
            const isCurrent = tier === userEnergy.subscriptionTier;

            return (
              <div
                key={tier}
                className={`p-3 rounded-lg border-2 ${
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-xs font-medium mb-1 capitalize">{tier.replace('_', ' ')}</div>
                <div className="text-lg font-bold">
                  {tier === 'creator_pro' ? '∞' : config.maxEnergy}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tier === 'creator_pro' ? 'Unlimited' : `+1/${config.regenInterval}m`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Close
          </button>
          {userEnergy.subscriptionTier !== 'creator_pro' && (
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
