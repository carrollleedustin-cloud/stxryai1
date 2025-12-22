# StxryAI: Technical Implementation Guide

**Purpose:** Detailed technical specifications and implementation patterns for executing the strategic roadmap  
**Audience:** Engineering teams, architects, technical leads  
**Status:** Ready for implementation

---

## Table of Contents

1. [Phase 1: Foundation & Retention (Weeks 1-12)](#phase-1)
2. [Phase 2: Scale & Engagement (Weeks 13-24)](#phase-2)
3. [Phase 3: Monetization (Weeks 25-36)](#phase-3)
4. [Phase 4: Innovation (Weeks 37-48)](#phase-4)
5. [Phase 5: Market Expansion (Weeks 49-72)](#phase-5)
6. [Technical Standards & Best Practices](#standards)
7. [Deployment & DevOps](#deployment)
8. [Monitoring & Observability](#monitoring)

---

## Phase 1: Foundation & Retention (Weeks 1-12) {#phase-1}

### Week 1-2: Reading Streaks & Gamification

#### Database Schema Updates

```sql
-- Add streak tracking table
CREATE TABLE reading_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_read_date DATE,
  freeze_count INTEGER DEFAULT 0 NOT NULL, -- Free passes per month
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Add daily challenges table
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL, -- 'genre_read', 'story_complete', 'choices_made'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0 NOT NULL,
  reward_xp INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_type, DATE(created_at))
);

-- Add streak milestones table
CREATE TABLE streak_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL, -- 7, 14, 30, 100, 365
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reward_xp INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, milestone_days)
);

-- Create indexes
CREATE INDEX idx_reading_streaks_user_id ON reading_streaks(user_id);
CREATE INDEX idx_daily_challenges_user_id ON daily_challenges(user_id);
CREATE INDEX idx_streak_milestones_user_id ON streak_milestones(user_id);
```

#### Service Implementation

```typescript
// src/services/streakService.ts
import { supabase } from '@/lib/supabase/client';

export const streakService = {
  async updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    milestone?: number;
  }> {
    try {
      // Get current streak
      const { data: streak } = await supabase
        .from('reading_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!streak) {
        // Create new streak
        const { data: newStreak } = await supabase
          .from('reading_streaks')
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_read_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        return {
          currentStreak: 1,
          longestStreak: 1,
        };
      }

      const today = new Date().toISOString().split('T')[0];
      const lastRead = streak.last_read_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;
      let milestone: number | undefined;

      if (lastRead === today) {
        // Already read today
        return {
          currentStreak: streak.current_streak,
          longestStreak: streak.longest_streak,
        };
      } else if (lastRead === yesterday) {
        // Continue streak
        newCurrentStreak = streak.current_streak + 1;
        newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);

        // Check for milestone
        if ([7, 14, 30, 100, 365].includes(newCurrentStreak)) {
          milestone = newCurrentStreak;
          await this.recordMilestone(userId, newCurrentStreak);
        }
      } else {
        // Streak broken, check for freeze
        if (streak.freeze_count > 0) {
          // Use freeze to maintain streak
          await supabase
            .from('reading_streaks')
            .update({ freeze_count: streak.freeze_count - 1 })
            .eq('user_id', userId);
        } else {
          // Reset streak
          newCurrentStreak = 1;
        }
      }

      // Update streak
      const { data: updated } = await supabase
        .from('reading_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_read_date: today,
        })
        .eq('user_id', userId)
        .select()
        .single();

      return {
        currentStreak: updated.current_streak,
        longestStreak: updated.longest_streak,
        milestone,
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  async recordMilestone(userId: string, days: number): Promise<void> {
    const xpRewards: Record<number, number> = {
      7: 100,
      14: 250,
      30: 500,
      100: 2000,
      365: 10000,
    };

    await supabase.from('streak_milestones').insert({
      user_id: userId,
      milestone_days: days,
      achieved_at: new Date().toISOString(),
      reward_xp: xpRewards[days] || 0,
    });

    // Award XP
    await supabase.rpc('award_xp', {
      user_id: userId,
      xp_amount: xpRewards[days] || 0,
    });
  },

  async getDailyChallenge(userId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    let { data: challenge } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('created_at', `gte.${today}`)
      .single();

    if (!challenge) {
      // Create new daily challenge
      const challengeTypes = ['genre_read', 'story_complete', 'choices_made'];
      const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

      const targets: Record<string, number> = {
        genre_read: 1,
        story_complete: 1,
        choices_made: 10,
      };

      const rewards: Record<string, number> = {
        genre_read: 50,
        story_complete: 100,
        choices_made: 75,
      };

      const { data: newChallenge } = await supabase
        .from('daily_challenges')
        .insert({
          user_id: userId,
          challenge_type: type,
          target_value: targets[type],
          reward_xp: rewards[type],
        })
        .select()
        .single();

      challenge = newChallenge;
    }

    return challenge;
  },

  async completeChallenge(userId: string, challengeId: string): Promise<void> {
    const { data: challenge } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challenge && !challenge.completed_at) {
      await supabase
        .from('daily_challenges')
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq('id', challengeId);

      // Award XP
      await supabase.rpc('award_xp', {
        user_id: userId,
        xp_amount: challenge.reward_xp,
      });
    }
  },
};
```

#### Frontend Component

```typescript
// src/components/gamification/StreakDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { streakService } from '@/services/streakService';
import { motion } from 'framer-motion';

export function StreakDisplay({ userId }: { userId: string }) {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      try {
        const result = await streakService.updateStreak(userId);
        setStreak({
          current: result.currentStreak,
          longest: result.longestStreak,
        });
      } catch (error) {
        console.error('Error loading streak:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStreak();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div
      className="flex gap-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center">
        <span className="text-3xl">🔥</span>
        <span className="text-sm font-semibold">{streak.current} day streak</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl">⭐</span>
        <span className="text-sm font-semibold">Best: {streak.longest} days</span>
      </div>
    </motion.div>
  );
}
```

---

### Week 3-4: Push Notifications

#### Service Implementation

```typescript
// src/services/pushNotificationService.ts
import { supabase } from '@/lib/supabase/client';

export const pushNotificationService = {
  async subscribeToPushNotifications(userId: string): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Save subscription to database
      await supabase.from('push_subscriptions').insert({
        user_id: userId,
        subscription: subscription.toJSON(),
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  },

  async sendNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // Call API endpoint to send notification
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notification,
        }),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  async scheduleNotification(
    userId: string,
    notification: any,
    delayMs: number
  ): Promise<void> {
    setTimeout(() => {
      this.sendNotification(userId, notification);
    }, delayMs);
  },
};
```

#### API Route

```typescript
// src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json();

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (!subscriptions) {
      return NextResponse.json({ success: false });
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub.subscription, JSON.stringify(notification))
      )
    );

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.status === 'fulfilled').length,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
```

---

### Week 5-6: Advanced Search & Filters

#### Database Schema

```sql
-- Add search index for full-text search
CREATE INDEX idx_stories_search ON stories USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Add mood/theme tags
CREATE TABLE story_moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  mood TEXT NOT NULL, -- 'dark', 'light', 'mysterious', 'romantic', 'humorous'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(story_id, mood)
);

CREATE INDEX idx_story_moods_story_id ON story_moods(story_id);
CREATE INDEX idx_story_moods_mood ON story_moods(mood);
```

#### Service Implementation

```typescript
// src/services/advancedSearchService.ts
export const advancedSearchService = {
  async searchStories(filters: {
    query?: string;
    genres?: string[];
    moods?: string[];
    minLength?: number;
    maxLength?: number;
    minRating?: number;
    difficulty?: string;
    sortBy?: 'relevance' | 'newest' | 'popular' | 'rating';
    page?: number;
    pageSize?: number;
  }): Promise<any[]> {
    let query = supabase
      .from('stories')
      .select(
        `
        *,
        moods:story_moods(mood),
        author:users!user_id(display_name, avatar_url)
      `
      )
      .eq('is_published', true);

    // Full-text search
    if (filters.query) {
      query = query.textSearch('search_vector', filters.query, { type: 'websearch' });
    }

    // Genre filter
    if (filters.genres?.length) {
      query = query.in('genre', filters.genres);
    }

    // Mood filter
    if (filters.moods?.length) {
      // This requires a join with story_moods
      const { data: storyIds } = await supabase
        .from('story_moods')
        .select('story_id')
        .in('mood', filters.moods);

      if (storyIds) {
        query = query.in(
          'id',
          storyIds.map((s) => s.story_id)
        );
      }
    }

    // Length filter (estimated_duration in minutes)
    if (filters.minLength) {
      query = query.gte('estimated_duration', filters.minLength);
    }
    if (filters.maxLength) {
      query = query.lte('estimated_duration', filters.maxLength);
    }

    // Rating filter
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    // Difficulty filter
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('published_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('published_at', { ascending: false });
    }

    // Pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  },

  async getSavedSearches(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async saveSearch(userId: string, name: string, filters: any): Promise<void> {
    await supabase.from('saved_searches').insert({
      user_id: userId,
      name,
      filters,
    });
  },
};
```

---

### Week 7-8: PWA Implementation

#### Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'stxryai-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

#### Manifest

```json
{
  "name": "StxryAI - Interactive Fiction",
  "short_name": "StxryAI",
  "description": "Create and read interactive stories powered by AI",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

---

## Phase 2: Scale & Engagement (Weeks 13-24) {#phase-2}

### Week 13-20: ML-Powered Recommendation Engine

#### Database Schema

```sql
-- Story embeddings for semantic similarity
CREATE TABLE story_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(story_id)
);

-- User reading history for collaborative filtering
CREATE TABLE user_reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  rating INTEGER, -- 1-5 if rated
  completion_percentage NUMERIC(5, 2),
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, story_id)
);

-- Cached recommendations
CREATE TABLE user_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  score NUMERIC(5, 3), -- 0-1 confidence score
  reason TEXT, -- 'collaborative', 'content_based', 'trending'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, story_id)
);

-- Create indexes
CREATE INDEX idx_story_embeddings_story_id ON story_embeddings(story_id);
CREATE INDEX idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_expires ON user_recommendations(expires_at);
```

#### Recommendation Service

```typescript
// src/services/recommendationService.ts
import { supabase } from '@/lib/supabase/client';
import { openai } from '@/lib/ai/openai';

export const recommendationService = {
  async generateRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // Check cache first
      const { data: cached } = await supabase
        .from('user_recommendations')
        .select('story_id, score, reason')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(limit);

      if (cached && cached.length > 0) {
        return cached;
      }

      // Get user's reading history
      const { data: history } = await supabase
        .from('user_reading_history')
        .select('story_id, rating, completion_percentage')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!history || history.length === 0) {
        // Return trending stories for new users
        return this.getTrendingStories(limit);
      }

      // Collaborative filtering
      const collaborativeRecs = await this.getCollaborativeRecommendations(
        userId,
        history,
        limit / 2
      );

      // Content-based filtering
      const contentRecs = await this.getContentBasedRecommendations(
        userId,
        history,
        limit / 2
      );

      // Combine and deduplicate
      const allRecs = [...collaborativeRecs, ...contentRecs];
      const uniqueRecs = Array.from(
        new Map(allRecs.map((r) => [r.story_id, r])).values()
      ).slice(0, limit);

      // Cache recommendations
      await supabase.from('user_recommendations').insert(
        uniqueRecs.map((rec) => ({
          user_id: userId,
          story_id: rec.story_id,
          score: rec.score,
          reason: rec.reason,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }))
      );

      return uniqueRecs;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getTrendingStories(limit);
    }
  },

  async getCollaborativeRecommendations(
    userId: string,
    userHistory: any[],
    limit: number
  ): Promise<any[]> {
    try {
      // Find similar users (users who read similar stories)
      const userStoryIds = userHistory.map((h) => h.story_id);

      const { data: similarUsers } = await supabase
        .from('user_reading_history')
        .select('user_id')
        .in('story_id', userStoryIds)
        .neq('user_id', userId)
        .limit(100);

      if (!similarUsers || similarUsers.length === 0) {
        return [];
      }

      const similarUserIds = [...new Set(similarUsers.map((u) => u.user_id))];

      // Get stories read by similar users but not by current user
      const { data: recommendations } = await supabase
        .from('user_reading_history')
        .select('story_id, rating')
        .in('user_id', similarUserIds)
        .not('story_id', 'in', `(${userStoryIds.join(',')})`)
        .order('rating', { ascending: false })
        .limit(limit);

      return (
        recommendations?.map((rec) => ({
          story_id: rec.story_id,
          score: (rec.rating || 3) / 5,
          reason: 'collaborative',
        })) || []
      );
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return [];
    }
  },

  async getContentBasedRecommendations(
    userId: string,
    userHistory: any[],
    limit: number
  ): Promise<any[]> {
    try {
      // Get user's preferred genres
      const { data: stories } = await supabase
        .from('stories')
        .select('genre')
        .in(
          'id',
          userHistory.map((h) => h.story_id)
        );

      if (!stories) return [];

      const genreFrequency = stories.reduce(
        (acc, s) => {
          acc[s.genre] = (acc[s.genre] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const preferredGenres = Object.entries(genreFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);

      // Find similar stories in preferred genres
      const { data: recommendations } = await supabase
        .from('stories')
        .select('id, genre, rating')
        .in('genre', preferredGenres)
        .not(
          'id',
          'in',
          `(${userHistory.map((h) => h.story_id).join(',')})`
        )
        .order('rating', { ascending: false })
        .limit(limit);

      return (
        recommendations?.map((rec) => ({
          story_id: rec.id,
          score: rec.rating / 5,
          reason: 'content_based',
        })) || []
      );
    } catch (error) {
      console.error('Error getting content-based recommendations:', error);
      return [];
    }
  },

  async getTrendingStories(limit: number): Promise<any[]> {
    const { data } = await supabase
      .from('stories')
      .select('id, view_count, rating')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    return (
      data?.map((story) => ({
        story_id: story.id,
        score: story.rating / 5,
        reason: 'trending',
      })) || []
    );
  },
};
```

---

### Week 9-24: Mobile Apps (iOS/Android)

#### React Native Setup

```bash
# Initialize React Native project
npx create-expo-app stxryai-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @supabase/supabase-js @supabase/react-native
npm install expo-secure-store expo-notifications
npm install react-native-gesture-handler react-native-reanimated
```

#### Shared Business Logic

```typescript
// src/services/shared/storyService.ts (shared between web and mobile)
export const storyService = {
  async getStories(filters?: StoryFilters) {
    // Implementation shared between web and mobile
  },

  async getStoryById(storyId: string) {
    // Implementation shared between web and mobile
  },

  // ... other methods
};
```

#### Mobile-Specific Implementation

```typescript
// mobile/src/screens/StoryReaderScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { storyService } from '@/services/storyService';

export function StoryReaderScreen({ storyId }: { storyId: string }) {
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      const storyData = await storyService.getStoryById(storyId);
      setStory(storyData);

      const chapters = await storyService.getStoryChapters(storyId);
      if (chapters.length > 0) {
        setChapter(chapters[0]);
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">{story?.title}</Text>
      <Text className="text-lg leading-6 mb-6">{chapter?.content}</Text>

      {/* Choices */}
      <View className="gap-2">
        {/* Render choices */}
      </View>
    </ScrollView>
  );
}
```

---

## Phase 3: Monetization (Weeks 25-36) {#phase-3}

### Week 25-32: Story Marketplace

#### Database Schema

```sql
-- Premium stories
CREATE TABLE premium_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  subscription_price NUMERIC(10, 2),
  subscription_interval TEXT, -- 'month', 'year'
  creator_revenue_share NUMERIC(3, 2) DEFAULT 0.70 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(story_id)
);

-- Story purchases
CREATE TABLE story_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL, -- 'one_time', 'subscription'
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, story_id, purchase_type)
);

-- Creator payouts
CREATE TABLE creator_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  stripe_payout_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_premium_stories_story_id ON premium_stories(story_id);
CREATE INDEX idx_story_purchases_user_id ON story_purchases(user_id);
CREATE INDEX idx_story_purchases_story_id ON story_purchases(story_id);
CREATE INDEX idx_creator_payouts_creator_id ON creator_payouts(creator_id);
```

#### Marketplace Service

```typescript
// src/services/marketplaceService.ts
import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const marketplaceService = {
  async listPremiumStories(filters?: any): Promise<any[]> {
    const { data } = await supabase
      .from('premium_stories')
      .select(
        `
        *,
        story:stories(id, title, description, cover_image, rating, author:users(display_name))
      `
      )
      .order('created_at', { ascending: false });

    return data || [];
  },

  async purchaseStory(
    userId: string,
    storyId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get premium story details
      const { data: premiumStory } = await supabase
        .from('premium_stories')
        .select('*')
        .eq('story_id', storyId)
        .single();

      if (!premiumStory) {
        return { success: false, error: 'Story not found' };
      }

      // Create Stripe payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(premiumStory.price * 100),
        currency: premiumStory.currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          userId,
          storyId,
        },
      });

      if (paymentIntent.status === 'succeeded') {
        // Record purchase
        await supabase.from('story_purchases').insert({
          user_id: userId,
          story_id: storyId,
          purchase_type: 'one_time',
          amount: premiumStory.price,
          currency: premiumStory.currency,
          stripe_payment_id: paymentIntent.id,
        });

        // Calculate creator payout
        const creatorShare = premiumStory.price * premiumStory.creator_revenue_share;

        // Record payout (will be processed later)
        const { data: story } = await supabase
          .from('stories')
          .select('user_id')
          .eq('id', storyId)
          .single();

        if (story) {
          await supabase.from('creator_payouts').insert({
            creator_id: story.user_id,
            amount: creatorShare,
            currency: premiumStory.currency,
            status: 'pending',
          });
        }

        return { success: true };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error) {
      console.error('Error purchasing story:', error);
      return { success: false, error: String(error) };
    }
  },

  async hasAccessToStory(userId: string, storyId: string): Promise<boolean> {
    // Check if story is free
    const { data: story } = await supabase
      .from('stories')
      .select('is_premium')
      .eq('id', storyId)
      .single();

    if (!story?.is_premium) {
      return true;
    }

    // Check if user has purchased
    const { data: purchase } = await supabase
      .from('story_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single();

    if (purchase) {
      // Check if subscription is still valid
      if (purchase.expires_at) {
        return new Date(purchase.expires_at) > new Date();
      }
      return true;
    }

    return false;
  },
};
```

---

## Phase 4: Innovation (Weeks 37-48) {#phase-4}

### Week 33-40: Adaptive Storytelling AI

#### Service Implementation

```typescript
// src/services/adaptiveStorytellingService.ts
export const adaptiveStorytellingService = {
  async analyzeUserEngagement(userId: string, storyId: string): Promise<{
    engagementLevel: 'low' | 'medium' | 'high';
    readingSpeed: 'fast' | 'normal' | 'slow';
    preferredComplexity: 'simple' | 'moderate' | 'complex';
  }> {
    // Analyze reading patterns
    const { data: metrics } = await supabase
      .from('user_engagement_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!metrics || metrics.length === 0) {
      return {
        engagementLevel: 'medium',
        readingSpeed: 'normal',
        preferredComplexity: 'moderate',
      };
    }

    // Calculate averages
    const avgTimeOnScene = metrics.reduce((sum, m) => sum + m.time_on_scene, 0) / metrics.length;
    const avgScrollDepth = metrics.reduce((sum, m) => sum + m.scroll_depth, 0) / metrics.length;
    const choiceFrequency = metrics.reduce((sum, m) => sum + m.choice_frequency, 0) / metrics.length;

    // Determine engagement level
    let engagementLevel: 'low' | 'medium' | 'high' = 'medium';
    if (avgTimeOnScene < 30 && avgScrollDepth > 80) {
      engagementLevel = 'high';
    } else if (avgTimeOnScene > 120 && avgScrollDepth < 50) {
      engagementLevel = 'low';
    }

    // Determine reading speed
    let readingSpeed: 'fast' | 'normal' | 'slow' = 'normal';
    if (avgTimeOnScene < 45) {
      readingSpeed = 'fast';
    } else if (avgTimeOnScene > 90) {
      readingSpeed = 'slow';
    }

    // Determine preferred complexity
    let preferredComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    if (choiceFrequency > 0.7) {
      preferredComplexity = 'complex';
    } else if (choiceFrequency < 0.3) {
      preferredComplexity = 'simple';
    }

    return {
      engagementLevel,
      readingSpeed,
      preferredComplexity,
    };
  },

  async generateAdaptiveContent(
    userId: string,
    storyId: string,
    currentChapter: string,
    userEngagement: any
  ): Promise<string> {
    // Build adaptive prompt based on user engagement
    const adaptationInstructions = this.buildAdaptationPrompt(userEngagement);

    const prompt = `
      You are an adaptive storytelling AI. Generate the next chapter based on the user's engagement patterns.
      
      Current Chapter:
      ${currentChapter}
      
      User Engagement Profile:
      - Engagement Level: ${userEngagement.engagementLevel}
      - Reading Speed: ${userEngagement.readingSpeed}
      - Preferred Complexity: ${userEngagement.preferredComplexity}
      
      Adaptation Instructions:
      ${adaptationInstructions}
      
      Generate the next chapter that matches the user's preferences while maintaining narrative quality.
    `;

    // Call AI API
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || '';
  },

  buildAdaptationPrompt(engagement: any): string {
    let instructions = '';

    if (engagement.engagementLevel === 'low') {
      instructions += '- Increase tension and action\n';
      instructions += '- Add dramatic events\n';
      instructions += '- Introduce plot twists\n';
    } else if (engagement.engagementLevel === 'high') {
      instructions += '- Maintain current pacing\n';
      instructions += '- Deepen character development\n';
      instructions += '- Explore emotional nuances\n';
    }

    if (engagement.readingSpeed === 'fast') {
      instructions += '- Use shorter paragraphs\n';
      instructions += '- Increase action frequency\n';
      instructions += '- Offer more immediate choices\n';
    } else if (engagement.readingSpeed === 'slow') {
      instructions += '- Use descriptive language\n';
      instructions += '- Allow for reflection\n';
      instructions += '- Develop atmosphere\n';
    }

    if (engagement.preferredComplexity === 'complex') {
      instructions += '- Introduce multiple plot threads\n';
      instructions += '- Add subtle foreshadowing\n';
      instructions += '- Offer nuanced choices\n';
    } else if (engagement.preferredComplexity === 'simple') {
      instructions += '- Keep plot straightforward\n';
      instructions += '- Offer clear choices\n';
      instructions += '- Minimize subplots\n';
    }

    return instructions;
  },
};
```

---

## Phase 5: Market Expansion (Weeks 49-72) {#phase-5}

### Week 41-56: StxryAI for Schools

#### Database Schema

```sql
-- School accounts
CREATE TABLE school_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district TEXT,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL, -- 'school', 'district', 'enterprise'
  student_limit INTEGER NOT NULL,
  active_students INTEGER DEFAULT 0 NOT NULL,
  subscription_status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Classroom management
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES school_accounts(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level INTEGER,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Student assignments
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE
);

-- Student progress tracking
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES student_assignments(id) ON DELETE CASCADE,
  completion_percentage NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  comprehension_score NUMERIC(5, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_school_accounts_admin_id ON school_accounts(admin_id);
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_student_assignments_classroom_id ON student_assignments(classroom_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
```

#### Education Service

```typescript
// src/services/educationService.ts
export const educationService = {
  async createSchoolAccount(
    adminId: string,
    schoolData: {
      name: string;
      district?: string;
      licenseType: 'school' | 'district' | 'enterprise';
      studentLimit: number;
    }
  ): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data } = await supabase
      .from('school_accounts')
      .insert({
        admin_id: adminId,
        name: schoolData.name,
        district: schoolData.district,
        license_type: schoolData.licenseType,
        student_limit: schoolData.studentLimit,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    return data;
  },

  async createClassroom(
    schoolId: string,
    teacherId: string,
    classroomData: {
      name: string;
      gradeLevel?: number;
      subject?: string;
    }
  ): Promise<any> {
    const { data } = await supabase
      .from('classrooms')
      .insert({
        school_id: schoolId,
        teacher_id: teacherId,
        name: classroomData.name,
        grade_level: classroomData.gradeLevel,
        subject: classroomData.subject,
      })
      .select()
      .single();

    return data;
  },

  async assignStoryToClassroom(
    classroomId: string,
    storyId: string,
    dueDate?: Date
  ): Promise<any> {
    const { data } = await supabase
      .from('student_assignments')
      .insert({
        classroom_id: classroomId,
        story_id: storyId,
        due_date: dueDate?.toISOString(),
      })
      .select()
      .single();

    return data;
  },

  async getClassroomProgress(classroomId: string): Promise<any> {
    const { data: students } = await supabase
      .from('student_progress')
      .select(
        `
        *,
        student:users(id, display_name),
        assignment:student_assignments(story_id)
      `
      )
      .eq('assignment.classroom_id', classroomId);

    return students || [];
  },

  async generateComprehensionQuiz(storyId: string): Promise<any[]> {
    // Get story content
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    // Generate quiz questions using AI
    const prompt = `
      Generate 5 comprehension questions for this story:
      
      Title: ${story.title}
      Description: ${story.description}
      
      Format as JSON array with objects containing:
      - question: string
      - options: string[]
      - correctAnswer: number (index of correct option)
      - difficulty: 'easy' | 'medium' | 'hard'
    `;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  },
};
```

---

## Technical Standards & Best Practices {#standards}

### Code Quality Standards

**TypeScript**
- Strict mode enabled
- No `any` types (use `unknown` with type guards)
- Comprehensive interface definitions
- Generic types for reusable components

**Error Handling**
```typescript
// Standardized error handling
interface AppError {
  code: string;
  message: string;
  userMessage: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

const ErrorCodes = {
  AUTH_SESSION_EXPIRED: { recoverable: true, action: 'refresh' },
  STORY_NOT_FOUND: { recoverable: false, action: 'redirect' },
  AI_GENERATION_FAILED: { recoverable: true, action: 'retry' },
} as const;
```

**Testing**
- Unit tests: 80% coverage for services
- Integration tests: All API routes
- E2E tests: Critical user flows
- Use Vitest + Playwright

### Performance Standards

**Web Vitals Targets**
- LCP: <2.0s
- FID: <100ms
- CLS: <0.1
- TTI: <3s

**Bundle Size**
- Initial: <300KB gzipped
- Per route: <50KB gzipped
- Vendor: <100KB gzipped

### Security Standards

**Authentication**
- Supabase Auth with OAuth
- Session management
- CSRF protection
- Rate limiting

**Data Protection**
- Encryption at rest
- HTTPS/TLS
- RLS policies
- Input validation

---

## Deployment & DevOps {#deployment}

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Environment Management

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...

# .env.production (production)
# Same variables, different values
```

---

## Monitoring & Observability {#monitoring}

### Key Metrics

**Application Metrics**
- Error rate
- Response time (P50, P95, P99)
- Request volume
- User sessions

**Business Metrics**
- Daily active users
- Session duration
- Conversion rate
- Revenue

**Infrastructure Metrics**
- CPU usage
- Memory usage
- Disk usage
- Network I/O

### Alerting

```typescript
// src/lib/monitoring/alerts.ts
export const alerts = {
  errorRateHigh: {
    threshold: 0.01, // 1%
    window: 300, // 5 minutes
    action: 'notify_team',
  },
  responseTimeSlow: {
    threshold: 1000, // 1 second
    percentile: 95,
    window: 300,
    action: 'notify_team',
  },
  databaseDown: {
    threshold: 0,
    window: 60,
    action: 'page_oncall',
  },
};
```

---

**This technical guide provides the foundation for executing the strategic roadmap. Each phase builds on the previous, with clear deliverables and success metrics.**
