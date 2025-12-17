/**
 * Netlify-specific utilities and helpers.
 * Provides ISR, caching, and deployment utilities optimized for Netlify.
 */

export {
  REVALIDATE,
  CACHE_TAGS,
  createStaticParams,
  createFetchOptions,
  generateStaticMetadata,
  isStaticGeneration,
  getDeploymentContext,
  getCanonicalUrl,
} from './isr';

export {
  revalidateStory,
  revalidateUser,
  revalidateLeaderboards,
  revalidateAllStories,
  createRevalidationHandler,
  createBackgroundHandler,
} from './revalidate';
