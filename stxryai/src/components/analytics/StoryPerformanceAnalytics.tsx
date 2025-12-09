'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

interface PerformanceMetric {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface ChapterPerformance {
  chapterNumber: number;
  title: string;
  views: number;
  completionRate: number;
  averageTimeSpent: number;
  dropOffRate: number;
  rating: number;
}

interface ChoiceAnalytics {
  choiceId: string;
  text: string;
  selectionCount: number;
  selectionPercentage: number;
  averageRating: number;
  completionRate: number;
}

interface DemographicData {
  ageGroup: string;
  percentage: number;
  count: number;
}

interface StoryPerformanceAnalyticsProps {
  storyId: string;
  storyTitle: string;
  publishedDate: Date;
  metrics: PerformanceMetric[];
  chapterPerformance: ChapterPerformance[];
  choiceAnalytics: ChoiceAnalytics[];
  demographics: {
    age: DemographicData[];
    topCountries: { country: string; percentage: number }[];
  };
  revenueData?: {
    total: number;
    premium: number;
    ads: number;
  };
}

export default function StoryPerformanceAnalytics({
  storyId,
  storyTitle,
  publishedDate,
  metrics,
  chapterPerformance,
  choiceAnalytics,
  demographics,
  revenueData
}: StoryPerformanceAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'chapters' | 'choices' | 'audience'>('overview');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return { icon: 'ArrowTrendingUpIcon', color: 'text-green-500' };
      case 'down': return { icon: 'ArrowTrendingDownIcon', color: 'text-red-500' };
      case 'stable': return { icon: 'MinusIcon', color: 'text-yellow-500' };
    }
  };

  const getPerformanceColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-blue-500';
    if (rate >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ChartBarIcon' },
    { id: 'chapters', label: 'Chapters', icon: 'BookOpenIcon' },
    { id: 'choices', label: 'Choices', icon: 'ArrowPathIcon' },
    { id: 'audience', label: 'Audience', icon: 'UserGroupIcon' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{storyTitle}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="CalendarIcon" size={14} />
                Published {publishedDate.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="IdentificationIcon" size={14} />
                ID: {storyId}
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Icon name="ArrowDownTrayIcon" size={16} />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metrics.map((metric, index) => {
          const trendInfo = getTrendIcon(metric.trend);
          return (
            <motion.div
              key={metric.label}
              variants={slideUp}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-card border border-border rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-10 h-10 rounded-lg ${metric.color.replace('text', 'bg')}/10 flex items-center justify-center`}>
                  <span className="text-2xl">{metric.icon}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {formatNumber(metric.value)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <div className="flex items-center gap-1">
                  <Icon name={trendInfo.icon} size={12} className={trendInfo.color} />
                  <span className={`text-xs font-medium ${trendInfo.color}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Revenue Card (if available) */}
      {revenueData && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="CurrencyDollarIcon" size={20} className="text-green-500" />
            Revenue Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-green-500 mb-1">
                {formatCurrency(revenueData.total)}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {formatCurrency(revenueData.premium)}
              </div>
              <p className="text-sm text-muted-foreground">Premium Sales</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {formatCurrency(revenueData.ads)}
              </div>
              <p className="text-sm text-muted-foreground">Ad Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Icon name="ChartBarIcon" size={16} />
                    Engagement Funnel
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Story Views', value: 100, count: metrics[0]?.value || 0 },
                      { label: 'Started Reading', value: 75, count: Math.floor((metrics[0]?.value || 0) * 0.75) },
                      { label: 'Reached Midpoint', value: 50, count: Math.floor((metrics[0]?.value || 0) * 0.5) },
                      { label: 'Completed', value: 35, count: Math.floor((metrics[0]?.value || 0) * 0.35) }
                    ].map((stage, index) => (
                      <div key={stage.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{stage.label}</span>
                          <span className="text-sm font-medium text-foreground">
                            {formatNumber(stage.count)} ({stage.value}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage.value}%` }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Icon name="ClockIcon" size={16} />
                    Reading Patterns
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Peak Reading Time', value: '8:00 PM - 10:00 PM', icon: 'SunIcon' },
                      { label: 'Avg Session Duration', value: '24 minutes', icon: 'ClockIcon' },
                      { label: 'Binge Read Rate', value: '42%', icon: 'FireIcon' },
                      { label: 'Return Reader Rate', value: '68%', icon: 'ArrowPathIcon' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name={stat.icon} size={14} className="text-primary" />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapters Tab */}
          {selectedTab === 'chapters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground">Chapter-by-Chapter Analysis</h4>
                <span className="text-xs text-muted-foreground">{chapterPerformance.length} chapters</span>
              </div>
              {chapterPerformance.map((chapter, index) => (
                <motion.div
                  key={chapter.chapterNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-muted/50 border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-bold text-foreground">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="EyeIcon" size={12} />
                          {formatNumber(chapter.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="ClockIcon" size={12} />
                          {Math.floor(chapter.averageTimeSpent)}m avg
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="StarIcon" size={12} />
                          {chapter.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Completion Rate</span>
                        <span className={`text-xs font-bold ${getPerformanceColor(chapter.completionRate)}`}>
                          {chapter.completionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${chapter.completionRate}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className={`h-full ${
                            chapter.completionRate >= 80
                              ? 'bg-green-500'
                              : chapter.completionRate >= 60
                              ? 'bg-blue-500'
                              : chapter.completionRate >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Drop-off Rate</span>
                        <span className="text-xs font-bold text-red-500">{chapter.dropOffRate}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${chapter.dropOffRate}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Choices Tab */}
          {selectedTab === 'choices' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground">Choice Analytics</h4>
                <span className="text-xs text-muted-foreground">
                  Total selections: {choiceAnalytics.reduce((sum, c) => sum + c.selectionCount, 0)}
                </span>
              </div>
              {choiceAnalytics.map((choice, index) => (
                <motion.div
                  key={choice.choiceId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-muted/50 border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-2">{choice.text}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="UserGroupIcon" size={12} />
                          {formatNumber(choice.selectionCount)} selections
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="StarIcon" size={12} />
                          {choice.averageRating.toFixed(1)} rating
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="CheckCircleIcon" size={12} />
                          {choice.completionRate}% completed
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">{choice.selectionPercentage}%</span>
                    </div>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${choice.selectionPercentage}%` }}
                      transition={{ delay: index * 0.05, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Audience Tab */}
          {selectedTab === 'audience' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="UserIcon" size={16} />
                  Age Distribution
                </h4>
                <div className="space-y-3">
                  {demographics.age.map((group, index) => (
                    <div key={group.ageGroup}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{group.ageGroup}</span>
                        <span className="text-sm font-medium text-foreground">
                          {group.percentage}% ({formatNumber(group.count)})
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${group.percentage}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="GlobeAltIcon" size={16} />
                  Top Countries
                </h4>
                <div className="space-y-3">
                  {demographics.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-foreground">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{country.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
