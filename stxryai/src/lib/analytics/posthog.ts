'use client';

import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
    });
  }
}

export function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, traits);
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
}

export function capturePageView() {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview');
  }
}

// Custom events for StxryAI
export const analytics = {
  // Story events
  storyViewed: (storyId: string, title: string) => {
    captureEvent('story_viewed', { storyId, title });
  },
  storyStarted: (storyId: string, title: string) => {
    captureEvent('story_started', { storyId, title });
  },
  storyCompleted: (storyId: string, title: string, duration: number) => {
    captureEvent('story_completed', { storyId, title, duration });
  },
  chapterRead: (storyId: string, chapterId: string, chapterNumber: number) => {
    captureEvent('chapter_read', { storyId, chapterId, chapterNumber });
  },

  // Creator events
  storyCreated: (storyId: string, title: string, genre: string) => {
    captureEvent('story_created', { storyId, title, genre });
  },
  storyPublished: (storyId: string, title: string) => {
    captureEvent('story_published', { storyId, title });
  },
  chapterAdded: (storyId: string, chapterNumber: number) => {
    captureEvent('chapter_added', { storyId, chapterNumber });
  },

  // Social events
  storyRated: (storyId: string, rating: number) => {
    captureEvent('story_rated', { storyId, rating });
  },
  commentPosted: (storyId: string, commentLength: number) => {
    captureEvent('comment_posted', { storyId, commentLength });
  },
  userFollowed: (followedUserId: string) => {
    captureEvent('user_followed', { followedUserId });
  },

  // Collection events
  collectionCreated: (collectionId: string, name: string) => {
    captureEvent('collection_created', { collectionId, name });
  },
  storyAddedToCollection: (storyId: string, collectionId: string) => {
    captureEvent('story_added_to_collection', { storyId, collectionId });
  },

  // Subscription events
  subscriptionStarted: (tier: string, price: number) => {
    captureEvent('subscription_started', { tier, price });
  },
  subscriptionCanceled: (tier: string) => {
    captureEvent('subscription_canceled', { tier });
  },

  // Achievement events
  achievementUnlocked: (achievementId: string, title: string, rarity: string) => {
    captureEvent('achievement_unlocked', { achievementId, title, rarity });
  },

  // Search events
  searchPerformed: (query: string, filters: Record<string, any>) => {
    captureEvent('search_performed', { query, filters });
  },
  searchResultClicked: (storyId: string, position: number) => {
    captureEvent('search_result_clicked', { storyId, position });
  },
};

export default posthog;
