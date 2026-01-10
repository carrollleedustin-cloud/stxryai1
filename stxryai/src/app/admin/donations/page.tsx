'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  DollarSign,
  Users,
  TrendingUp,
  Trophy,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  donationService,
  DonationTier,
  Donation,
  LeaderboardEntry,
  DonationStats,
} from '@/services/donationService';

export default function AdminDonationsPage() {
  const [tiers, setTiers] = useState<DonationTier[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tiersData, leaderboardData, statsData] = await Promise.all([
        donationService.getTiers(),
        donationService.getLeaderboard(20),
        donationService.getStats(),
      ]);

      setTiers(tiersData);
      setLeaderboard(leaderboardData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Donation Management</h1>
              <p className="text-gray-400">Track donations and supporter badges</p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Total Raised</span>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(stats.totalRaised)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Total Donors</span>
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.donorCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">This Month</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {formatCurrency(stats.thisMonthRaised)}
              </p>
              <p className="text-sm text-gray-400 mt-1">{stats.thisMonthDonors} donors</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Average Donation</span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {formatCurrency(stats.averageDonation)}
              </p>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donation Tiers */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Donation Tiers
              </h2>

              <div className="space-y-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl"
                        style={{ filter: `drop-shadow(0 0 4px ${tier.badgeColor})` }}
                      >
                        {tier.badgeEmoji}
                      </span>
                      <div>
                        <p className="font-medium">{tier.displayName}</p>
                        <p className="text-sm text-gray-400">
                          {formatCurrency(tier.minAmount)}
                          {tier.maxAmount ? ` - ${formatCurrency(tier.maxAmount)}` : '+'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Supporters
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3 pr-4">Rank</th>
                      <th className="pb-3 pr-4">Supporter</th>
                      <th className="pb-3 pr-4">Badge</th>
                      <th className="pb-3 pr-4 text-right">Total</th>
                      <th className="pb-3 text-right">Donations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <motion.tr
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/50"
                      >
                        <td className="py-3 pr-4">
                          {entry.rank <= 3 ? (
                            <span
                              className={`text-lg ${
                                entry.rank === 1
                                  ? 'text-yellow-400'
                                  : entry.rank === 2
                                    ? 'text-gray-300'
                                    : 'text-amber-600'
                              }`}
                            >
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-gray-500">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={entry.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                {entry.username[0]?.toUpperCase()}
                              </div>
                            )}
                            <span>{entry.username}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xl">{entry.highestBadge}</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-green-400">
                          {formatCurrency(entry.totalDonated)}
                        </td>
                        <td className="py-3 text-right text-gray-400">{entry.donationCount}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {leaderboard.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    No donations yet. Be the first to support!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Export Monthly Report</span>
            </button>

            <button className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-pink-400" />
              <span>Send Thank You Emails</span>
            </button>

            <button className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Manage Tiers</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            About Donations
          </h3>
          <p className="text-gray-300">
            Donations help support StxryAI during our early startup phase. Donors receive special
            badges displayed next to their username - nothing more, no gameplay advantages. Every
            contribution helps us build a better platform for everyone!
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {tiers.map((tier) => (
              <span
                key={tier.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800/50 rounded-full text-sm"
              >
                <span>{tier.badgeEmoji}</span>
                <span className="text-gray-400">{tier.displayName}</span>
                <span className="text-gray-500">({formatCurrency(tier.minAmount)}+)</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
