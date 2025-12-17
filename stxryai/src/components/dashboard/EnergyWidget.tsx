'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EnergyWidgetProps {
  currentEnergy: number;
  maxEnergy: number;
  rechargeRate?: number; // Energy per hour
  nextRechargeTime?: Date; // When next energy will be added
  isPremium?: boolean;
  variant?: 'compact' | 'full';
  onUpgrade?: () => void;
}

export default function EnergyWidget({
  currentEnergy,
  maxEnergy,
  rechargeRate = 1,
  nextRechargeTime,
  isPremium = false,
  variant = 'full',
  onUpgrade,
}: EnergyWidgetProps) {
  const [timeUntilRecharge, setTimeUntilRecharge] = useState<string>('');
  const energyPercentage = (currentEnergy / maxEnergy) * 100;

  // Energy level color
  const getEnergyColor = () => {
    if (isPremium) return 'from-yellow-400 to-orange-400';
    if (energyPercentage > 60) return 'from-green-400 to-emerald-400';
    if (energyPercentage > 30) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  // Calculate time until next recharge
  useEffect(() => {
    if (!nextRechargeTime || isPremium) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = nextRechargeTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilRecharge('Recharging...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilRecharge(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntilRecharge(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilRecharge(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextRechargeTime, isPremium]);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        {/* Lightning Icon */}
        <motion.div
          animate={{
            scale: isPremium ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isPremium ? Infinity : 0,
          }}
          className={`text-2xl ${isPremium ? 'animate-pulse' : ''}`}
        >
          {isPremium ? '⚡' : currentEnergy === 0 ? '🔋' : '⚡'}
        </motion.div>

        {/* Energy Count */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`font-bold ${isPremium ? 'text-yellow-400' : 'text-white'}`}>
              {isPremium ? '∞' : currentEnergy}
            </span>
            {!isPremium && <span className="text-gray-400 text-sm">/ {maxEnergy}</span>}
          </div>
          {isPremium && <span className="text-xs text-yellow-400">Premium</span>}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: isPremium ? [0, 360] : 0,
            }}
            transition={{
              duration: 3,
              repeat: isPremium ? Infinity : 0,
              ease: 'linear',
            }}
            className="text-4xl"
          >
            {isPremium ? '⚡' : currentEnergy === 0 ? '🔋' : '⚡'}
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Energy</h3>
            {isPremium ? (
              <p className="text-sm text-yellow-400 font-medium">Unlimited ∞</p>
            ) : (
              <p className="text-sm text-gray-400">
                {currentEnergy} / {maxEnergy} available
              </p>
            )}
          </div>
        </div>

        {/* Premium Badge */}
        {isPremium && (
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
            PREMIUM
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isPremium && (
        <div className="mb-4">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              role="progressbar"
              aria-valuenow={Math.round(energyPercentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              initial={{ width: 0 }}
              animate={{ width: `${energyPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ width: `${energyPercentage}%` }}
              className={`h-full bg-gradient-to-r ${getEnergyColor()} relative`}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {!isPremium && (
          <>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Recharge Rate</div>
              <div className="text-sm font-semibold text-white">+{rechargeRate} / hour</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Next Recharge</div>
              <div className="text-sm font-semibold text-white">{timeUntilRecharge || 'Full'}</div>
            </div>
          </>
        )}
        {isPremium && (
          <div className="col-span-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg p-3 border border-yellow-400/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div className="text-sm text-yellow-400 font-medium">
                Enjoy unlimited energy with Premium!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Low Energy Warning */}
      {!isPremium && currentEnergy === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-400 mb-1">Out of Energy</h4>
              <p className="text-xs text-gray-300">
                Wait for recharge or upgrade to Premium for unlimited energy!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!isPremium && currentEnergy < maxEnergy * 0.3 && currentEnergy > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-400 mb-1">Low Energy</h4>
              <p className="text-xs text-gray-300">
                Your energy is running low. Consider upgrading to Premium!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Button */}
      {!isPremium &&
        // If an onUpgrade handler is provided (tests or custom flows), call it.
        // Otherwise fall back to the marketing link.
        (onUpgrade ? (
          <motion.button
            onClick={onUpgrade}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Get Unlimited Energy
            </div>
          </motion.button>
        ) : (
          <Link href="/landing-page#pricing">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Get Unlimited Energy
              </div>
            </motion.button>
          </Link>
        ))}
    </motion.div>
  );
}

// Compact energy display for headers/nav
export function EnergyBadge({
  currentEnergy,
  maxEnergy,
  isPremium = false,
}: {
  currentEnergy: number;
  maxEnergy: number;
  isPremium?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
      <motion.span
        animate={{
          scale: isPremium ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isPremium ? Infinity : 0,
        }}
        className="text-lg"
      >
        ⚡
      </motion.span>
      <span className={`text-sm font-bold ${isPremium ? 'text-yellow-400' : 'text-white'}`}>
        {isPremium ? '∞' : currentEnergy}
      </span>
      {!isPremium && <span className="text-xs text-gray-400">/ {maxEnergy}</span>}
    </div>
  );
}
