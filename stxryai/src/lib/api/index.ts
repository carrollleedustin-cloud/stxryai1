/**
 * API Services Index
 * Central export point for all API integration services
 */

// Error handling
export {
  APIError,
  withErrorHandling,
  withRetry,
  validateResponse,
  rateLimiter,
  BatchProcessor,
  type APIResponse,
  type ErrorResponse,
  type SuccessResponse,
} from './error-handler';

// Caching
export {
  apiCache,
  withCache,
  useCacheManagement,
} from './cache';

// AI Service
export {
  aiService,
  type AIServiceOptions,
  type StoryGenerationRequest,
  type CharacterGenerationRequest,
  type ContentModerationRequest,
  type ModerationResult,
} from './ai-service';

// Supabase Service
export {
  supabaseService,
} from './supabase-service';

// Analytics Service - Re-export
export * from './analytics-service';
