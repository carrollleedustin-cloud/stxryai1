'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Sparkles, Coffee } from 'lucide-react';
import { donationService, DonationTier } from '@/services/donationService';
import confetti from 'canvas-confetti';

interface DonationWidgetProps {
  compact?: boolean;
  onClose?: () => void;
}

export default function DonationWidget({ compact = false, onClose }: DonationWidgetProps) {
  const [tiers, setTiers] = useState<DonationTier[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    donationService.getTiers().then(setTiers);
  }, []);

  const getAmount = () => {
    if (selectedAmount !== null) return selectedAmount;
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getCurrentTier = () => {
    const amount = getAmount();
    return tiers.find(
      (t) => amount >= t.minAmount && (t.maxAmount === undefined || amount <= t.maxAmount)
    );
  };

  const handleDonate = async () => {
    const amount = getAmount();
    if (amount < 1) {
      setError('Minimum donation is $1');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url } = await donationService.createCheckoutSession(amount, {
        message: message || undefined,
        isAnonymous,
        successUrl: `${window.location.origin}/donate/success`,
        cancelUrl: `${window.location.origin}/donate`,
      });

      // Redirect to Stripe
      window.location.href = url;
    } catch (err) {
      setError('Failed to start donation. Please try again.');
      setLoading(false);
    }
  };

  // Success animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
    });
  };

  useEffect(() => {
    if (success) {
      triggerConfetti();
    }
  }, [success]);

  const currentTier = getCurrentTier();

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = '/donate')}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full text-white font-medium shadow-lg shadow-pink-500/25 transition-all"
      >
        <Heart className="w-4 h-4" />
        Support Us
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden max-w-md w-full"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Support StxryAI</h2>
        </div>
        <p className="text-pink-100">Help us build the future of interactive storytelling</p>
      </div>

      <div className="p-6">
        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
            <p className="text-gray-400">Your support means the world to us.</p>
            {currentTier && (
              <div className="mt-4 inline-flex items-center gap-2 bg-gray-700 rounded-full px-4 py-2">
                <span className="text-2xl">{currentTier.badgeEmoji}</span>
                <span>You earned the {currentTier.displayName} badge!</span>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Preset Amounts */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Select an amount</p>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      selectedAmount === amount
                        ? 'bg-pink-500 text-white ring-2 ring-pink-400 ring-offset-2 ring-offset-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Or enter custom amount</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="w-full bg-gray-700 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            {/* Badge Preview */}
            {currentTier && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl"
                    style={{ filter: `drop-shadow(0 0 8px ${currentTier.badgeColor})` }}
                  >
                    {currentTier.badgeEmoji}
                  </span>
                  <div>
                    <p className="font-medium">{currentTier.displayName} Badge</p>
                    <p className="text-sm text-gray-400">{currentTier.badgeDescription}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Optional Message */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Leave a message (optional)</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Thanks for building StxryAI!"
                maxLength={200}
                rows={2}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
              />
            </div>

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-gray-300">Donate anonymously</span>
            </label>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={loading || getAmount() < 1}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Donate {getAmount() > 0 ? `$${getAmount().toFixed(2)}` : ''}
                </>
              )}
            </button>

            {/* Info */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Donations support platform development. You'll receive a special badge displayed next
              to your username. No gameplay advantages - just our gratitude!
            </p>
          </>
        )}
      </div>

      {/* All Tiers */}
      {!success && (
        <div className="border-t border-gray-700 p-6">
          <p className="text-sm text-gray-400 mb-3">Badge Tiers</p>
          <div className="flex flex-wrap gap-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center gap-1.5 bg-gray-700/50 rounded-full px-3 py-1.5 text-sm"
              >
                <span>{tier.badgeEmoji}</span>
                <span className="text-gray-400">${tier.minAmount}+</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Badge display component for user profiles
export function DonationBadge({
  emoji,
  tier,
  size = 'md',
}: {
  emoji: string;
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <span
      title={`${tier} Supporter`}
      className={`${sizeClasses[size]} cursor-help`}
      style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.5))' }}
    >
      {emoji}
    </span>
  );
}
