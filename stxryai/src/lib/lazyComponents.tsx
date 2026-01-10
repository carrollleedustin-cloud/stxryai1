'use client';

import dynamic from 'next/dynamic';
import { Suspense, ComponentType, ReactNode } from 'react';

/**
 * Lazy Loading Utilities
 *
 * Provides optimized dynamic imports with:
 * - Consistent loading states
 * - Error boundaries
 * - SSR handling
 * - Bundle splitting
 */

// Shared loading skeleton component
export function LoadingSkeleton({
  className = '',
  height = 'h-64',
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div className={`animate-pulse bg-void-800/50 rounded-lg ${height} ${className}`}>
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-spectral-cyan/30 border-t-spectral-cyan rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Chart loading skeleton
export function ChartLoadingSkeleton() {
  return (
    <div className="animate-pulse bg-void-800/30 rounded-lg p-6 h-64">
      <div className="flex items-end justify-between h-full gap-2 pb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-void-700/50 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
      <div className="h-2 bg-void-700/50 rounded mt-2" />
    </div>
  );
}

// Card loading skeleton
export function CardLoadingSkeleton() {
  return (
    <div className="animate-pulse bg-void-800/30 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-void-700/50 rounded w-2/3" />
      <div className="h-3 bg-void-700/50 rounded w-1/2" />
      <div className="h-20 bg-void-700/50 rounded" />
    </div>
  );
}

// Generic lazy component wrapper
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: ReactNode;
    displayName?: string;
  }
) {
  const LazyComponent = dynamic(importFn, {
    ssr: options?.ssr ?? false,
    loading: () => (options?.loading as React.ReactElement) ?? <LoadingSkeleton />,
  });

  if (options?.displayName) {
    LazyComponent.displayName = options.displayName;
  }

  return LazyComponent;
}

// ============================================
// Pre-configured Lazy Components
// ============================================

// Heavy chart components (recharts adds ~200KB to bundle)
export const LazyPlayStyleAnalysis = dynamic(
  () => import('@/app/user-profile/components/PlayStyleAnalysis'),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

// Heavy animation components
export const LazyAdvancedEffects = dynamic(
  () =>
    import('@/components/void/AdvancedEffects').then((mod) => ({ default: mod.HolographicCard })),
  {
    ssr: false,
    loading: () => <CardLoadingSkeleton />,
  }
);

// Story creation studio (heavy with form state)
export const LazyStoryCreationStudio = dynamic(() => import('@/app/story-creation-studio/page'), {
  ssr: false,
  loading: () => <LoadingSkeleton height="h-screen" />,
});

// Writers desk components
export const LazySeriesCreationWizard = dynamic(
  () => import('@/app/writers-desk/components/SeriesCreationWizard'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton height="h-96" />,
  }
);

export const LazyAIWritingStudio = dynamic(
  () => import('@/app/writers-desk/components/AIWritingStudio'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton height="h-96" />,
  }
);

export const LazyNarrativeArcTimeline = dynamic(
  () => import('@/app/writers-desk/components/NarrativeArcTimeline'),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

// Story reader components (heavy with animations)
export const LazyStoryReaderInteractive = dynamic(
  () => import('@/app/story-reader/components/StoryReaderInteractive'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-void-950">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-spectral-cyan/30 border-t-spectral-cyan rounded-full animate-spin mx-auto mb-4" />
          <p className="text-void-400">Opening story...</p>
        </div>
      </div>
    ),
  }
);

// Dashboard components
export const LazyDashboardInteractive = dynamic(
  () => import('@/app/user-dashboard/components/DashboardInteractive'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton height="h-screen" />,
  }
);

// Admin components (rarely accessed, should be lazy)
export const LazyAdminPage = dynamic(() => import('@/app/admin/page'), {
  ssr: false,
  loading: () => <LoadingSkeleton height="h-screen" />,
});

// Settings page (heavy with forms)
export const LazySettingsPage = dynamic(() => import('@/app/settings/components/SettingsPage'), {
  ssr: false,
  loading: () => <LoadingSkeleton height="h-screen" />,
});

// ============================================
// Suspense Wrapper Utility
// ============================================

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return <Suspense fallback={fallback ?? <LoadingSkeleton />}>{children}</Suspense>;
}

// ============================================
// Route-level Code Splitting Helpers
// ============================================

// Use these in page.tsx files for route-level code splitting
export const routeLoaders = {
  dashboard: () => import('@/app/user-dashboard/components/DashboardWrapper'),
  storyLibrary: () => import('@/app/story-library/components/StoryLibraryInteractive'),
  storyReader: () => import('@/app/story-reader/components/StoryReaderInteractive'),
  userProfile: () => import('@/app/user-profile/components/UserProfileInteractive'),
  writersDesk: () => import('@/app/writers-desk/page'),
  storyCreation: () => import('@/app/story-creation-studio/page'),
  admin: () => import('@/app/admin/page'),
  settings: () => import('@/app/settings/components/SettingsPage'),
  achievements: () => import('@/app/achievements/page'),
  leaderboards: () => import('@/app/leaderboards/page'),
  communityHub: () => import('@/app/community-hub/page'),
};
