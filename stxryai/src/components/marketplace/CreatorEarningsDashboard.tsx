'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  marketplaceService,
  type CreatorEarnings,
  type CreatorPayout,
} from '@/services/marketplaceService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface CreatorEarningsDashboardProps {
  className?: string;
}

export function CreatorEarningsDashboard({ className = '' }: CreatorEarningsDashboardProps) {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    paidOut: number;
    pending: number;
    earnings: CreatorEarnings[];
  } | null>(null);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts'>('overview');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [earningsData, payoutsData] = await Promise.all([
        marketplaceService.getCreatorEarnings(user.id),
        marketplaceService.getCreatorPayouts(user.id),
      ]);

      setEarnings(earningsData);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Failed to load earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">No earnings data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="CurrencyDollarIcon" size={28} />
          Creator Earnings
        </h2>
        <p className="text-muted-foreground">Track your revenue and payouts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'earnings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Earnings ({earnings.earnings.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'payouts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Payouts ({payouts.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Earnings</span>
              <Icon name="CurrencyDollarIcon" size={20} className="text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${earnings.totalEarnings.toFixed(2)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Paid Out</span>
              <Icon name="CheckCircleIcon" size={20} className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">${earnings.paidOut.toFixed(2)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Icon name="ClockIcon" size={20} className="text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">${earnings.pending.toFixed(2)}</div>
          </motion.div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          {earnings.earnings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No earnings yet</p>
            </div>
          ) : (
            earnings.earnings.map((earning, index) => (
              <motion.div
                key={earning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      ${earning.creatorEarnings.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      From ${earning.purchaseAmount.toFixed(2)} purchase
                    </div>
                  </div>
                  <div className="text-right">
                    {earning.isPaidOut ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                        Paid Out
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(earning.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payouts yet</p>
            </div>
          ) : (
            payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        ${payout.netEarnings.toFixed(2)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payout.payoutStatus === 'completed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : payout.payoutStatus === 'processing'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {payout.payoutStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Period: {new Date(payout.payoutPeriodStart).toLocaleDateString()} -{' '}
                      {new Date(payout.payoutPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                    <div className="font-medium text-foreground">
                      ${payout.totalEarnings.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Platform Fee</div>
                    <div className="font-medium text-foreground">
                      ${payout.platformFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Earnings</div>
                    <div className="font-medium text-foreground">
                      ${payout.netEarnings.toFixed(2)}
                    </div>
                  </div>
                </div>

                {payout.paidAt && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Paid on {new Date(payout.paidAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
