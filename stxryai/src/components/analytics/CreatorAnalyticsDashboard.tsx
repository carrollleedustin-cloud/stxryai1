'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { analyticsService, type AnalyticsOverview, type StoryPerformance, type RevenueAnalytics, type AudienceInsights } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface CreatorAnalyticsDashboardProps {
  className?: string;
}

export function CreatorAnalyticsDashboard({ className = '' }: CreatorAnalyticsDashboardProps) {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [storiesPerformance, setStoriesPerformance] = useState<StoryPerformance[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'revenue' | 'audience'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, selectedPeriod]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [overviewData, storiesData, revenueData, audienceData] = await Promise.all([
        analyticsService.getCreatorOverview(user.id),
        analyticsService.getCreatorStoriesPerformance(user.id),
        analyticsService.getRevenueAnalytics(user.id, selectedPeriod),
        analyticsService.getAudienceInsights(user.id),
      ]);

      setOverview(overviewData);
      setStoriesPerformance(storiesData);
      setRevenueAnalytics(revenueData);
      setAudienceInsights(audienceData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icon name="ChartBarIcon" size={28} />
            Creator Analytics
          </h2>
          <p className="text-muted-foreground">Track your performance and audience insights</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['overview', 'stories', 'revenue', 'audience'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <Icon name="EyeIcon" size={20} className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {overview.totalViews.toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <Icon name="CurrencyDollarIcon" size={20} className="text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                ${overview.totalRevenue.toFixed(2)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Readers</span>
                <Icon name="UsersIcon" size={20} className="text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {overview.totalReaders.toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Rating</span>
                <Icon name="StarIcon" size={20} className="text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {overview.averageRating.toFixed(1)}
              </div>
            </motion.div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Engagement Rate</div>
              <div className="text-2xl font-bold text-foreground">
                {overview.engagementRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-foreground">
                {overview.conversionRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Stories</div>
              <div className="text-2xl font-bold text-foreground">
                {overview.totalStories}
              </div>
            </div>
          </div>

          {/* Top Performing Stories */}
          {overview.topPerformingStories.length > 0 && (
            <div className="bg-card border-2 border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Top Performing Stories</h3>
              <div className="space-y-3">
                {overview.topPerformingStories.map((story, index) => (
                  <motion.div
                    key={story.storyId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{story.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {story.views.toLocaleString()} views • {story.rating.toFixed(1)}⭐
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">${story.revenue.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {storiesPerformance.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No story performance data available</p>
            </div>
          ) : (
            storiesPerformance.map((performance, index) => (
              <motion.div
                key={performance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-foreground mb-2">
                      Story Performance
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(performance.lastCalculatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {performance.overallScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Views</div>
                    <div className="text-lg font-bold text-foreground">
                      {performance.currentViews.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Readers</div>
                    <div className="text-lg font-bold text-foreground">
                      {performance.currentReaders.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="text-lg font-bold text-foreground">
                      ${performance.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="text-lg font-bold text-foreground">
                      {performance.currentRating.toFixed(1)} ⭐
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Engagement</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(performance.engagementScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{performance.engagementScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Popularity</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(performance.popularityScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{performance.popularityScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(performance.revenueScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{performance.revenueScore.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          {revenueAnalytics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No revenue data available</p>
            </div>
          ) : (
            revenueAnalytics.map((revenue, index) => (
              <motion.div
                key={revenue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {new Date(revenue.periodStart).toLocaleDateString()} - {new Date(revenue.periodEnd).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{revenue.periodType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ${revenue.totalRevenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Purchases</div>
                    <div className="text-xl font-bold text-foreground">
                      ${revenue.purchaseRevenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{revenue.purchaseCount} transactions</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Subscriptions</div>
                    <div className="text-xl font-bold text-foreground">
                      ${revenue.subscriptionRevenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{revenue.subscriptionCount} active</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Tips</div>
                    <div className="text-xl font-bold text-foreground">
                      ${revenue.tipRevenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{revenue.tipCount} tips</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    <div className="text-lg font-bold text-foreground">
                      {revenue.conversionRate.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Purchase Value</div>
                    <div className="text-lg font-bold text-foreground">
                      ${revenue.averagePurchaseValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Audience Tab */}
      {activeTab === 'audience' && (
        <div className="space-y-4">
          {!audienceInsights ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No audience insights available</p>
            </div>
          ) : (
            <div className="bg-card border-2 border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Audience Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Top Countries</h4>
                  <div className="space-y-2">
                    {Object.entries(audienceInsights.countryDistribution)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{country}</span>
                          <span className="text-sm font-medium text-muted-foreground">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Device Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(audienceInsights.deviceDistribution)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="text-sm text-foreground capitalize">{device}</span>
                          <span className="text-sm font-medium text-muted-foreground">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Reading Behavior</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Avg Session Duration</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {audienceInsights.averageSessionDurationMinutes.toFixed(1)} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Chapters per Session</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {audienceInsights.averageChaptersPerSession.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Retention Rate</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {audienceInsights.retentionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Demographics</h4>
                  <div className="space-y-2">
                    {Object.entries(audienceInsights.ageDistribution)
                      .slice(0, 5)
                      .map(([age, count]) => (
                        <div key={age} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{age}</span>
                          <span className="text-sm font-medium text-muted-foreground">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
