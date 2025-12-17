'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalReaders: number;
    avgRating: number;
    totalRevenue: number;
    viewsChange: number;
    readersChange: number;
    ratingChange: number;
    revenueChange: number;
  };
  storyPerformance: StoryStats[];
  readerDemographics: {
    ageGroups: { label: string; percentage: number }[];
    topCountries: { country: string; count: number }[];
  };
  engagement: {
    avgReadTime: number;
    completionRate: number;
    choicesPerSession: number;
    returnRate: number;
  };
  revenueBreakdown: {
    subscriptions: number;
    tips: number;
    premiumContent: number;
  };
}

interface StoryStats {
  id: string;
  title: string;
  views: number;
  readers: number;
  rating: number;
  revenue: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface CreatorAnalyticsDashboardProps {
  data?: AnalyticsData;
  timeRange?: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange?: (range: string) => void;
}

export default function CreatorAnalyticsDashboard({
  data,
  timeRange = '30d',
  onTimeRangeChange,
}: CreatorAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'audience' | 'revenue'>(
    'overview'
  );

  if (!data) {
    return <AnalyticsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Creator Analytics</h1>
          <p className="text-gray-400">Track your story performance and audience insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range.slice(0, -1)} days`}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon="👁️"
          label="Total Views"
          value={data.overview.totalViews.toLocaleString()}
          change={data.overview.viewsChange}
          color="from-blue-600 to-cyan-600"
        />
        <MetricCard
          icon="📚"
          label="Total Readers"
          value={data.overview.totalReaders.toLocaleString()}
          change={data.overview.readersChange}
          color="from-purple-600 to-pink-600"
        />
        <MetricCard
          icon="⭐"
          label="Avg Rating"
          value={data.overview.avgRating.toFixed(1)}
          change={data.overview.ratingChange}
          color="from-yellow-600 to-orange-600"
        />
        <MetricCard
          icon="💰"
          label="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          change={data.overview.revenueChange}
          color="from-green-600 to-emerald-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'stories', 'audience', 'revenue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab
                ? 'text-white border-purple-600'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'stories' && <StoriesTab stories={data.storyPerformance} />}
        {activeTab === 'audience' && (
          <AudienceTab demographics={data.readerDemographics} engagement={data.engagement} />
        )}
        {activeTab === 'revenue' && <RevenueTab breakdown={data.revenueBreakdown} />}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  change: number;
  color: string;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? 'text-green-300' : 'text-red-300'
          }`}
        >
          {isPositive ? '↑' : '↓'}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </motion.div>
  );
}

// Overview Tab
function OverviewTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Engagement Metrics */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Engagement Metrics</h3>
        <div className="space-y-4">
          <ProgressMetric
            label="Avg Read Time"
            value={`${data.engagement.avgReadTime} min`}
            percentage={Math.min((data.engagement.avgReadTime / 60) * 100, 100)}
            color="purple"
          />
          <ProgressMetric
            label="Completion Rate"
            value={`${data.engagement.completionRate}%`}
            percentage={data.engagement.completionRate}
            color="blue"
          />
          <ProgressMetric
            label="Return Rate"
            value={`${data.engagement.returnRate}%`}
            percentage={data.engagement.returnRate}
            color="green"
          />
        </div>
      </div>

      {/* Top Performing Stories */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Stories</h3>
        <div className="space-y-3">
          {data.storyPerformance.slice(0, 5).map((story, index) => (
            <div
              key={story.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-yellow-600'
                    : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                        ? 'bg-orange-600'
                        : 'bg-white/10'
                } text-white text-sm`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{story.title}</div>
                <div className="text-sm text-gray-400">{story.views.toLocaleString()} views</div>
              </div>
              <div className="text-sm font-semibold text-white">⭐ {story.rating.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stories Tab
function StoriesTab({ stories }: { stories: StoryStats[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Story</th>
              <th className="text-left p-4 text-gray-400 font-medium">Views</th>
              <th className="text-left p-4 text-gray-400 font-medium">Readers</th>
              <th className="text-left p-4 text-gray-400 font-medium">Rating</th>
              <th className="text-left p-4 text-gray-400 font-medium">Completion</th>
              <th className="text-left p-4 text-gray-400 font-medium">Revenue</th>
              <th className="text-left p-4 text-gray-400 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr
                key={story.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4 text-white font-medium">{story.title}</td>
                <td className="p-4 text-gray-300">{story.views.toLocaleString()}</td>
                <td className="p-4 text-gray-300">{story.readers.toLocaleString()}</td>
                <td className="p-4 text-gray-300">⭐ {story.rating.toFixed(1)}</td>
                <td className="p-4 text-gray-300">{story.completionRate}%</td>
                <td className="p-4 text-green-400 font-semibold">
                  ${story.revenue.toLocaleString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      story.trend === 'up'
                        ? 'bg-green-600/20 text-green-400'
                        : story.trend === 'down'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {story.trend === 'up'
                      ? '↑ Trending'
                      : story.trend === 'down'
                        ? '↓ Declining'
                        : '→ Stable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Audience Tab
function AudienceTab({
  demographics,
  engagement,
}: {
  demographics: AnalyticsData['readerDemographics'];
  engagement: AnalyticsData['engagement'];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Groups */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Reader Age Groups</h3>
        <div className="space-y-3">
          {demographics.ageGroups.map((group) => (
            <div key={group.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{group.label}</span>
                <span className="text-white font-semibold">{group.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${group.percentage}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Top Countries</h3>
        <div className="space-y-3">
          {demographics.topCountries.map((country, index) => (
            <div
              key={country.country}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-white font-medium">{country.country}</span>
              </div>
              <span className="text-gray-300">{country.count.toLocaleString()} readers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Revenue Tab
function RevenueTab({ breakdown }: { breakdown: AnalyticsData['revenueBreakdown'] }) {
  const total = breakdown.subscriptions + breakdown.tips + breakdown.premiumContent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Breakdown */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Revenue Breakdown</h3>
        <div className="space-y-4">
          <RevenueItem
            label="Subscriptions"
            amount={breakdown.subscriptions}
            percentage={(breakdown.subscriptions / total) * 100}
            color="from-purple-600 to-pink-600"
          />
          <RevenueItem
            label="Tips"
            amount={breakdown.tips}
            percentage={(breakdown.tips / total) * 100}
            color="from-yellow-600 to-orange-600"
          />
          <RevenueItem
            label="Premium Content"
            amount={breakdown.premiumContent}
            percentage={(breakdown.premiumContent / total) * 100}
            color="from-blue-600 to-cyan-600"
          />
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 shadow-lg">
        <div className="text-4xl mb-4">💰</div>
        <div className="text-5xl font-bold text-white mb-2">${total.toLocaleString()}</div>
        <div className="text-white/80 text-lg">Total Revenue</div>
      </div>
    </div>
  );
}

// Helper Components
function ProgressMetric({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: string;
  percentage: number;
  color: 'purple' | 'blue' | 'green';
}) {
  const colors = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
    </div>
  );
}

function RevenueItem({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="p-4 bg-white/5 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{label}</span>
        <span className="text-green-400 font-bold">${amount.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of total</div>
    </div>
  );
}

// Loading Skeleton
function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-white/5 rounded-xl" />
    </div>
  );
}
