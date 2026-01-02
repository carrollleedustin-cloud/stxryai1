/**
 * Advanced Analytics System
 * Comprehensive analytics for user behavior, content performance, and business metrics
 */

import posthog from 'posthog-js';

// ============================================================================
// TYPES
// ============================================================================

export interface UserEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export interface StoryMetrics {
  storyId: string;
  views: number;
  reads: number;
  completions: number;
  averageRating: number;
  averageReadTime: number;
  dropOffPoints: Array<{ chapter: number; percentage: number }>;
}

export interface UserMetrics {
  userId: string;
  storiesRead: number;
  storiesCreated: number;
  timeSpent: number;
  engagementScore: number;
  retentionRate: number;
  lastActive: Date;
}

export interface ConversionFunnel {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track custom event
 */
export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // PostHog
  posthog.capture(event, properties);

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', event, properties);
  }

  // Custom analytics
  console.log('Event tracked:', event, properties);
}

/**
 * Track page view
 */
export function trackPageView(path: string, title: string): void {
  if (typeof window === 'undefined') return;

  const pageView: PageView = {
    path,
    title,
    referrer: document.referrer,
    sessionId: getSessionId(),
    timestamp: new Date(),
  };

  // PostHog
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    $pathname: path,
    $title: title,
  });

  // Google Analytics
  if (window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: path,
      page_title: title,
    });
  }

  console.log('Page view tracked:', pageView);
}

/**
 * Track user action
 */
export function trackUserAction(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  trackEvent('user_action', {
    action,
    category,
    label,
    value,
  });
}

// ============================================================================
// STORY ANALYTICS
// ============================================================================

/**
 * Track story view
 */
export function trackStoryView(storyId: string, storyTitle: string): void {
  trackEvent('story_viewed', {
    story_id: storyId,
    story_title: storyTitle,
  });
}

/**
 * Track story read start
 */
export function trackStoryReadStart(
  storyId: string,
  chapterId: string,
  chapterNumber: number
): void {
  trackEvent('story_read_start', {
    story_id: storyId,
    chapter_id: chapterId,
    chapter_number: chapterNumber,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track story read progress
 */
export function trackStoryReadProgress(
  storyId: string,
  chapterId: string,
  percentage: number,
  timeSpent: number
): void {
  trackEvent('story_read_progress', {
    story_id: storyId,
    chapter_id: chapterId,
    percentage,
    time_spent: timeSpent,
  });
}

/**
 * Track story completion
 */
export function trackStoryCompletion(
  storyId: string,
  totalTimeSpent: number,
  rating?: number
): void {
  trackEvent('story_completed', {
    story_id: storyId,
    total_time_spent: totalTimeSpent,
    rating,
  });
}

/**
 * Track story creation
 */
export function trackStoryCreation(
  storyId: string,
  genre: string,
  wordCount: number,
  aiAssisted: boolean
): void {
  trackEvent('story_created', {
    story_id: storyId,
    genre,
    word_count: wordCount,
    ai_assisted: aiAssisted,
  });
}

// ============================================================================
// USER ENGAGEMENT ANALYTICS
// ============================================================================

/**
 * Track user signup
 */
export function trackUserSignup(
  userId: string,
  method: 'email' | 'google' | 'github'
): void {
  trackEvent('user_signup', {
    user_id: userId,
    method,
  });

  // Identify user in PostHog
  posthog.identify(userId);
}

/**
 * Track user login
 */
export function trackUserLogin(userId: string): void {
  trackEvent('user_login', {
    user_id: userId,
  });

  posthog.identify(userId);
}

/**
 * Track subscription purchase
 */
export function trackSubscriptionPurchase(
  userId: string,
  plan: string,
  amount: number,
  currency: string
): void {
  trackEvent('subscription_purchased', {
    user_id: userId,
    plan,
    amount,
    currency,
  });

  // Track revenue in PostHog
  posthog.capture('subscription_purchased', {
    $set: {
      subscription_plan: plan,
    },
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  action: string,
  metadata?: Record<string, any>
): void {
  trackEvent('feature_used', {
    feature,
    action,
    ...metadata,
  });
}

// ============================================================================
// CONVERSION FUNNEL TRACKING
// ============================================================================

/**
 * Track funnel step
 */
export function trackFunnelStep(
  funnelName: string,
  step: string,
  stepNumber: number
): void {
  trackEvent('funnel_step', {
    funnel: funnelName,
    step,
    step_number: stepNumber,
  });
}

/**
 * Track conversion
 */
export function trackConversion(
  funnelName: string,
  value?: number,
  currency?: string
): void {
  trackEvent('conversion', {
    funnel: funnelName,
    value,
    currency,
  });
}

// ============================================================================
// A/B TESTING
// ============================================================================

/**
 * Get A/B test variant
 */
export function getABTestVariant(
  testName: string,
  variants: string[]
): string {
  const userId = getUserId();
  const sessionId = getSessionId();

  // Use PostHog feature flags if available
  if (posthog.isFeatureEnabled) {
    const variant = posthog.getFeatureFlag(testName);
    if (variant) return variant as string;
  }

  // Fallback to deterministic assignment
  const identifier = userId || sessionId;
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

/**
 * Track A/B test exposure
 */
export function trackABTestExposure(
  testName: string,
  variant: string
): void {
  trackEvent('ab_test_exposure', {
    test: testName,
    variant,
  });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Get user ID from storage
 */
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

/**
 * Set user ID
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_id', userId);
  posthog.identify(userId);
}

/**
 * Clear user ID (on logout)
 */
export function clearUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user_id');
  posthog.reset();
}

// ============================================================================
// PERFORMANCE ANALYTICS
// ============================================================================

/**
 * Track performance metric
 */
export function trackPerformanceMetric(
  metric: string,
  value: number,
  unit: string = 'ms'
): void {
  trackEvent('performance_metric', {
    metric,
    value,
    unit,
  });
}

/**
 * Track Core Web Vitals
 */
export function trackCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  // LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    trackPerformanceMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // FID
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      trackPerformanceMetric('FID', entry.processingStart - entry.startTime);
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // CLS
  let clsScore = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        trackPerformanceMetric('CLS', clsScore, 'score');
      }
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track error
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
): void {
  trackEvent('error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });

  // Send to error tracking service
  console.error('Error tracked:', error, context);
}

/**
 * Track API error
 */
export function trackAPIError(
  endpoint: string,
  statusCode: number,
  errorMessage: string
): void {
  trackEvent('api_error', {
    endpoint,
    status_code: statusCode,
    error_message: errorMessage,
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize analytics
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Initialize PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll track manually
      capture_pageleave: true,
      autocapture: false, // Manual tracking for better control
    });
  }

  // Track Core Web Vitals
  trackCoreWebVitals();

  // Track initial page view
  trackPageView(window.location.pathname, document.title);

  console.log('Analytics initialized');
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Event tracking
  trackEvent,
  trackPageView,
  trackUserAction,

  // Story analytics
  trackStoryView,
  trackStoryReadStart,
  trackStoryReadProgress,
  trackStoryCompletion,
  trackStoryCreation,

  // User engagement
  trackUserSignup,
  trackUserLogin,
  trackSubscriptionPurchase,
  trackFeatureUsage,

  // Conversion funnel
  trackFunnelStep,
  trackConversion,

  // A/B testing
  getABTestVariant,
  trackABTestExposure,

  // Session management
  setUserId,
  clearUserId,

  // Performance
  trackPerformanceMetric,
  trackCoreWebVitals,

  // Error tracking
  trackError,
  trackAPIError,

  // Initialization
  initializeAnalytics,
};
