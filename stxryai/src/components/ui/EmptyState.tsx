'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className = '',
}: EmptyStateProps) {
  const iconElement = typeof icon === 'string' ? (
    <div className="text-6xl mb-4">{icon}</div>
  ) : (
    <div className="mb-4">{icon}</div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center p-8 md:p-12 ${className}`}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Illustration or Icon */}
        {illustration ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            {illustration}
          </motion.div>
        ) : icon ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            {iconElement}
          </motion.div>
        ) : null}

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {action && (
              <motion.button
                onClick={action.onClick}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  action.variant === 'primary'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : action.variant === 'outline'
                      ? 'border-2 border-primary text-primary hover:bg-primary/10'
                      : 'bg-card border border-border text-foreground hover:bg-accent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action.label}
              </motion.button>
            )}
            {secondaryAction && (
              <motion.button
                onClick={secondaryAction.onClick}
                className="px-6 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {secondaryAction.label}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Pre-built empty states for common scenarios
export function EmptyStories({ onCreateStory }: { onCreateStory: () => void }) {
  return (
    <EmptyState
      icon="📚"
      title="No Stories Yet"
      description="Start your creative journey by creating your first interactive story. Use our AI tools to help spark your imagination!"
      action={{
        label: 'Create Your First Story',
        onClick: onCreateStory,
        variant: 'primary',
      }}
    />
  );
}

export function EmptySearchResults({ query, onClearSearch }: { query: string; onClearSearch: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'outline',
      }}
    />
  );
}

export function EmptyLibrary({ onBrowseStories }: { onBrowseStories: () => void }) {
  return (
    <EmptyState
      icon="📖"
      title="Your Library is Empty"
      description="Discover amazing interactive stories created by our community. Start reading to build your personal library!"
      action={{
        label: 'Browse Stories',
        onClick: onBrowseStories,
        variant: 'primary',
      }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="All Caught Up!"
      description="You don't have any new notifications. Check back later for updates on your stories and community activity."
    />
  );
}

export function EmptyAchievements({ onViewLeaderboard }: { onViewLeaderboard?: () => void }) {
  return (
    <EmptyState
      icon="🏆"
      title="No Achievements Yet"
      description="Start reading and creating stories to unlock achievements and climb the leaderboards!"
      action={
        onViewLeaderboard
          ? {
              label: 'View Leaderboard',
              onClick: onViewLeaderboard,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}

