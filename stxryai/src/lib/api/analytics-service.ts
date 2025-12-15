/**
 * Enhanced Analytics Service
 * Provides batched event tracking for PostHog and Google Analytics with retry logic
 */

import posthog from 'posthog-js';
import { BatchProcessor } from './error-handler';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

interface UserIdentity {
  userId: string;
  traits?: Record<string, unknown>;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

class AnalyticsService {
  private eventBatcher: BatchProcessor<AnalyticsEvent, void>;
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  constructor() {
    // Initialize batch processor for events
    this.eventBatcher = new BatchProcessor(
      async (events) => {
        await this.sendBatchedEvents(events);
        return new Array(events.length).fill(undefined);
      },
      {
        maxBatchSize: 20,
        maxWaitMs: 2000,
      }
    );

    // Flush queue periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushQueue(), this.FLUSH_INTERVAL);

      // Flush on page unload
      window.addEventListener('beforeunload', () => {
        this.flushQueue();
      });

      // Flush on visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flushQueue();
        }
      });
    }
  }

  /**
   * Initialize analytics services
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Initialize PostHog
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          loaded: (ph) => {
            if (process.env.NODE_ENV === 'development') {
              ph.debug();
            }
          },
          capture_pageview: false, // Manual pageview tracking
          capture_pageleave: true,
          persistence: 'localStorage+cookie',
          autocapture: false, // Disable autocapture for better control
        });
      } catch (error) {
        console.error('Failed to initialize PostHog:', error);
      }
    }

    // Initialize Google Analytics
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      try {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          send_page_view: false, // Manual pageview tracking
        });
      } catch (error) {
        console.error('Failed to initialize Google Analytics:', error);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Track event (batched)
   */
  track(eventName: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.queue.push(event);

    // Auto-flush if queue gets too large
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueue();
    }
  }

  /**
   * Track pageview
   */
  pageView(page?: string): void {
    if (typeof window === 'undefined') return;

    const pageUrl = page || window.location.pathname;

    // PostHog
    if (posthog) {
      posthog.capture('$pageview', { $current_url: pageUrl });
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pageUrl,
      });
    }
  }

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    // PostHog
    if (posthog) {
      posthog.identify(userId, traits);
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...traits,
      });
    }
  }

  /**
   * Reset user identity
   */
  reset(): void {
    if (typeof window === 'undefined') return;

    // Flush remaining events before reset
    this.flushQueue();

    // PostHog
    if (posthog) {
      posthog.reset();
    }
  }

  /**
   * Flush queued events
   */
  private flushQueue(): void {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    eventsToSend.forEach(event => {
      this.eventBatcher.add(event);
    });
  }

  /**
   * Send batched events to analytics services
   */
  private async sendBatchedEvents(events: AnalyticsEvent[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Send to PostHog
      if (posthog) {
        events.forEach(event => {
          posthog.capture(event.name, {
            ...event.properties,
            timestamp: event.timestamp,
          });
        });
      }

      // Send to Google Analytics
      if (window.gtag) {
        events.forEach(event => {
          window.gtag('event', event.name, event.properties);
        });
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue failed events
      this.queue.push(...events);
    }
  }

  /**
   * Get analytics status
   */
  getStatus(): {
    initialized: boolean;
    queueSize: number;
    posthogActive: boolean;
    googleAnalyticsActive: boolean;
  } {
    return {
      initialized: this.isInitialized,
      queueSize: this.queue.length,
      posthogActive: !!posthog && typeof window !== 'undefined',
      googleAnalyticsActive: !!window.gtag,
    };
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Domain-specific event tracking helpers
export const storyAnalytics = {
  viewed: (storyId: string, title: string) => {
    analyticsService.track('story_viewed', { story_id: storyId, title });
  },

  started: (storyId: string, title: string) => {
    analyticsService.track('story_started', { story_id: storyId, title });
  },

  completed: (storyId: string, title: string, durationMs: number) => {
    analyticsService.track('story_completed', {
      story_id: storyId,
      title,
      duration_seconds: Math.round(durationMs / 1000),
    });
  },

  chapterRead: (storyId: string, chapterId: string, chapterNumber: number) => {
    analyticsService.track('chapter_read', {
      story_id: storyId,
      chapter_id: chapterId,
      chapter_number: chapterNumber,
    });
  },

  choiceMade: (storyId: string, chapterId: string, choiceId: string) => {
    analyticsService.track('choice_made', {
      story_id: storyId,
      chapter_id: chapterId,
      choice_id: choiceId,
    });
  },

  rated: (storyId: string, rating: number) => {
    analyticsService.track('story_rated', { story_id: storyId, rating });
  },

  shared: (storyId: string, platform: string) => {
    analyticsService.track('story_shared', { story_id: storyId, platform });
  },
};

export const creatorAnalytics = {
  storyCreated: (storyId: string, genre: string) => {
    analyticsService.track('story_created', { story_id: storyId, genre });
  },

  storyPublished: (storyId: string, chapterCount: number) => {
    analyticsService.track('story_published', {
      story_id: storyId,
      chapter_count: chapterCount,
    });
  },

  chapterAdded: (storyId: string, chapterNumber: number, wordCount: number) => {
    analyticsService.track('chapter_added', {
      story_id: storyId,
      chapter_number: chapterNumber,
      word_count: wordCount,
    });
  },

  aiUsed: (feature: string, storyId?: string) => {
    analyticsService.track('ai_feature_used', {
      feature,
      story_id: storyId,
    });
  },
};

export const socialAnalytics = {
  commentPosted: (storyId: string, commentLength: number) => {
    analyticsService.track('comment_posted', {
      story_id: storyId,
      comment_length: commentLength,
    });
  },

  userFollowed: (followedUserId: string) => {
    analyticsService.track('user_followed', { followed_user_id: followedUserId });
  },

  profileViewed: (viewedUserId: string) => {
    analyticsService.track('profile_viewed', { viewed_user_id: viewedUserId });
  },
};

export const subscriptionAnalytics = {
  checkoutStarted: (tier: string, price: number) => {
    analyticsService.track('checkout_started', { tier, price });
  },

  subscriptionStarted: (tier: string, price: number) => {
    analyticsService.track('subscription_started', { tier, price });
  },

  subscriptionCanceled: (tier: string, reason?: string) => {
    analyticsService.track('subscription_canceled', { tier, reason });
  },

  subscriptionUpgraded: (fromTier: string, toTier: string) => {
    analyticsService.track('subscription_upgraded', {
      from_tier: fromTier,
      to_tier: toTier,
    });
  },
};

export const gamificationAnalytics = {
  achievementUnlocked: (achievementId: string, title: string, rarity: string) => {
    analyticsService.track('achievement_unlocked', {
      achievement_id: achievementId,
      title,
      rarity,
    });
  },

  levelUp: (newLevel: number, xpEarned: number) => {
    analyticsService.track('level_up', {
      new_level: newLevel,
      xp_earned: xpEarned,
    });
  },

  streakMilestone: (days: number) => {
    analyticsService.track('streak_milestone', { days });
  },
};

export const searchAnalytics = {
  performed: (query: string, resultsCount: number) => {
    analyticsService.track('search_performed', {
      query,
      results_count: resultsCount,
    });
  },

  resultClicked: (storyId: string, position: number, query: string) => {
    analyticsService.track('search_result_clicked', {
      story_id: storyId,
      position,
      query,
    });
  },

  filterApplied: (filterType: string, filterValue: string) => {
    analyticsService.track('search_filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },
};
