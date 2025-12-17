/**
 * ISR (Incremental Static Regeneration) helpers for Netlify.
 * Provides utilities for static generation with revalidation.
 */

// Revalidation time constants (in seconds)
export const REVALIDATE = {
  /** No revalidation - fully static */
  STATIC: false,
  /** Revalidate every minute - for frequently changing data */
  MINUTE: 60,
  /** Revalidate every 5 minutes - for semi-dynamic content */
  FIVE_MINUTES: 300,
  /** Revalidate every hour - for moderately changing data */
  HOUR: 3600,
  /** Revalidate daily - for rarely changing content */
  DAY: 86400,
  /** Revalidate weekly */
  WEEK: 604800,
} as const;

/**
 * Generate static params with ISR support.
 * Use this in page components that need static generation.
 */
export function createStaticParams<T extends Record<string, string>>(
  params: T[]
): T[] {
  return params;
}

/**
 * Create fetch options for ISR-compatible data fetching.
 * Netlify handles ISR through the Next.js plugin.
 */
export function createFetchOptions(
  revalidate: number | false = REVALIDATE.HOUR,
  tags?: string[]
): RequestInit & { next: { revalidate: number | false; tags?: string[] } } {
  return {
    next: {
      revalidate,
      ...(tags && { tags }),
    },
  };
}

/**
 * Cache tags for on-demand revalidation.
 * Use with revalidateTag() in API routes.
 */
export const CACHE_TAGS = {
  // Story-related tags
  STORIES: 'stories',
  STORY: (id: string) => `story-${id}`,
  STORIES_BY_GENRE: (genre: string) => `stories-genre-${genre}`,
  STORIES_BY_AUTHOR: (authorId: string) => `stories-author-${authorId}`,
  TRENDING_STORIES: 'trending-stories',
  FEATURED_STORIES: 'featured-stories',

  // User-related tags
  USERS: 'users',
  USER: (id: string) => `user-${id}`,
  USER_PROFILE: (id: string) => `user-profile-${id}`,
  USER_ACHIEVEMENTS: (id: string) => `user-achievements-${id}`,

  // Leaderboard and stats
  LEADERBOARDS: 'leaderboards',
  GLOBAL_STATS: 'global-stats',

  // Content
  GENRES: 'genres',
  TAGS: 'tags',
} as const;

/**
 * Helper to generate metadata for static pages.
 */
export function generateStaticMetadata(
  title: string,
  description: string,
  options?: {
    image?: string;
    noIndex?: boolean;
  }
) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(options?.image && { images: [options.image] }),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      ...(options?.image && { images: [options.image] }),
    },
    ...(options?.noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/**
 * Check if running in static generation context.
 */
export function isStaticGeneration(): boolean {
  // During static generation, there's no request object
  return typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Get the current deployment context.
 */
export function getDeploymentContext(): 'production' | 'preview' | 'development' {
  if (process.env.NETLIFY) {
    switch (process.env.CONTEXT) {
      case 'production':
        return 'production';
      case 'deploy-preview':
      case 'branch-deploy':
        return 'preview';
      default:
        return 'development';
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  return 'development';
}

/**
 * Get the canonical URL for the current deployment.
 */
export function getCanonicalUrl(): string {
  // Netlify environment variables
  if (process.env.NETLIFY) {
    if (process.env.CONTEXT === 'production') {
      return process.env.URL || process.env.NEXT_PUBLIC_APP_URL || '';
    }
    return process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || '';
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
