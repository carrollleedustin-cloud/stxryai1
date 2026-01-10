'use client';

import { useState, useEffect } from 'react';
import {
  enhancedModerationService,
  type ModerationStats,
} from '@/services/enhancedModerationService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface EnhancedModerationDashboardProps {
  className?: string;
}

export function EnhancedModerationDashboard({ className = '' }: EnhancedModerationDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<ModerationStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedContentType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueData, statsData] = await Promise.all([
        enhancedModerationService.getModerationQueue(50),
        getStatsForPeriod(),
      ]);

      setQueue(queueData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const getStatsForPeriod = async (): Promise<ModerationStats[]> => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();

    if (selectedPeriod === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (selectedPeriod === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 90);
    }

    const contentType = selectedContentType === 'all' ? undefined : selectedContentType;

    return await enhancedModerationService.getModerationStats(
      startDate.toISOString().split('T')[0],
      endDate,
      contentType
    );
  };

  const handleProcessQueueItem = async (queueId: string) => {
    try {
      await enhancedModerationService.markQueueItemProcessed(queueId, true);
      toast.success('Queue item processed');
      loadData();
    } catch (error) {
      console.error('Failed to process queue item:', error);
      toast.error('Failed to process queue item');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalChecked = stats.reduce((sum, s) => sum + s.totalChecked, 0);
  const totalFlagged = stats.reduce((sum, s) => sum + s.flaggedCount, 0);
  const totalBlocked = stats.reduce((sum, s) => sum + s.blockedCount, 0);
  const flagRate = totalChecked > 0 ? (totalFlagged / totalChecked) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Moderation</h2>
          <p className="text-muted-foreground">AI-powered content moderation dashboard</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Content</option>
            <option value="story">Stories</option>
            <option value="comment">Comments</option>
            <option value="chapter">Chapters</option>
            <option value="profile">Profiles</option>
            <option value="message">Messages</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-foreground">{totalChecked.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Checked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalFlagged.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Flagged</div>
          <div className="text-xs text-muted-foreground mt-1">{flagRate.toFixed(1)}% flag rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {totalBlocked.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Blocked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {queue.length}
          </div>
          <div className="text-sm text-muted-foreground">In Queue</div>
        </motion.div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Moderation Queue</h3>
          <button
            onClick={loadData}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CheckCircleIcon" size={48} className="mx-auto mb-2 opacity-50" />
            <p>No items in moderation queue</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground capitalize">{item.content_type}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {item.content_id.slice(0, 8)}...
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        item.priority === 'urgent'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : item.priority === 'high'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleProcessQueueItem(item.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Review
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Chart */}
      {stats.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Moderation Trends</h3>
          <div className="space-y-2">
            {stats.map((stat) => (
              <div key={`${stat.date}-${stat.contentType}`} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {new Date(stat.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-foreground capitalize">
                      {stat.contentType}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.totalChecked} checked</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full"
                        style={{
                          width: `${stat.totalChecked > 0 ? (stat.flaggedCount / stat.totalChecked) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right">
                      {stat.flaggedCount} flagged
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
