'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  referralService,
  type ReferralStats,
  type ReferralReward,
} from '@/services/referralService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { shareCardService } from '@/services/shareCardService';

interface ReferralDashboardProps {
  className?: string;
}

export function ReferralDashboard({ className = '' }: ReferralDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [code, referralStats, userRewards] = await Promise.all([
          referralService.getReferralCode(user.id),
          referralService.getReferralStats(user.id),
          referralService.getUserRewards(user.id),
        ]);

        setReferralCode(code);
        setStats(referralStats);
        setRewards(userRewards);
      } catch (error) {
        console.error('Failed to load referral data:', error);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCopyCode = async () => {
    if (!referralCode) return;

    const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareReferral = async () => {
    if (!referralCode || !user) return;

    const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`;

    // Generate share card
    const shareCardData = shareCardService.generateMilestoneShareCard({
      title: 'Join StxryAI!',
      description: `Use my referral code: ${referralCode}`,
      value: '1 Month Free',
      label: 'Premium',
    });

    try {
      const cardUrl = await shareCardService.generateShareCard(shareCardData);

      if (navigator.share) {
        await navigator.share({
          title: 'Join StxryAI with my referral!',
          text: `Get 1 month free Premium when you sign up with my code: ${referralCode}`,
          url: referralUrl,
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(referralUrl);
        toast.success('Referral link copied!');
      }
    } catch (error) {
      console.error('Failed to share referral:', error);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">Please sign in to view your referrals</p>
      </div>
    );
  }

  const referralUrl = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`
    : '';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Referral Program</h2>
        <p className="text-muted-foreground">Share StxryAI with friends and earn rewards!</p>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Your Referral Code</h3>
            <p className="text-sm opacity-90">
              Share this code and both you and your friend get rewards!
            </p>
          </div>
          <div className="text-4xl">🎁</div>
        </div>

        {referralCode && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <code className="flex-1 text-xl font-mono font-bold">{referralCode}</code>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareReferral}
              className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ShareIcon" size={20} />
              Share Referral Link
            </motion.button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-bold text-foreground">{stats.totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completedReferrals}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pendingReferrals}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalRewards}
            </div>
            <div className="text-sm text-muted-foreground">Total Rewards</div>
          </motion.div>
        </div>
      )}

      {/* Rewards Section */}
      {rewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Your Rewards</h3>
          <div className="space-y-2">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground capitalize">
                    {reward.rewardType.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">Value: {reward.rewardValue}</div>
                  {reward.expiresAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reward.rewardStatus === 'applied'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : reward.rewardStatus === 'expired'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {reward.rewardStatus}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <div className="font-medium text-foreground">Share your referral code</div>
              <div className="text-sm text-muted-foreground">
                Copy your code or share the link with friends
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <div className="font-medium text-foreground">Friend signs up</div>
              <div className="text-sm text-muted-foreground">
                They use your code when creating an account
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <div className="font-medium text-foreground">Both get rewards!</div>
              <div className="text-sm text-muted-foreground">
                You get 1 month free Premium, they get 50% off
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
