// Lazy Loading Utilities
// Helper functions for code splitting and lazy loading components

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        {fallback || (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        )}
      </div>
    ),
    ssr: false
  });
}

/**
 * Lazy load with SSR enabled
 */
export function lazyLoadWithSSR<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        {fallback || (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        )}
      </div>
    ),
    ssr: true
  });
}

/**
 * Preload a component for faster transitions
 */
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc();
}

// Pre-configured lazy loaded components for common heavy modules

/**
 * Lazy load analytics components (heavy with charts)
 */
export const LazyAnalytics = {
  ReadingAnalytics: lazyLoad(() =>
    import('@/components/analytics/ReadingAnalytics')
  ),
  ActivityHeatmap: lazyLoad(() =>
    import('@/components/analytics/ActivityHeatmap')
  ),
  ReadingInsights: lazyLoad(() =>
    import('@/components/analytics/ReadingInsights')
  ),
  StoryPerformanceAnalytics: lazyLoad(() =>
    import('@/components/analytics/StoryPerformanceAnalytics')
  )
};

/**
 * Lazy load AI components (require API calls)
 */
export const LazyAI = {
  ContentSuggestions: lazyLoad(() =>
    import('@/components/ai/ContentSuggestions')
  ),
  PersonalizedFeed: lazyLoad(() =>
    import('@/components/ai/PersonalizedFeed')
  )
};

/**
 * Lazy load gamification components
 */
export const LazyGamification = {
  GamificationDashboard: lazyLoad(() =>
    import('@/components/gamification/GamificationDashboard')
  ),
  Leaderboard: lazyLoad(() =>
    import('@/components/gamification/Leaderboard')
  )
};

/**
 * Lazy load social components
 */
export const LazySocial = {
  CommentSystem: lazyLoad(() =>
    import('@/components/social/CommentSystem')
  )
};
