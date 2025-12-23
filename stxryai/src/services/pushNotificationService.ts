/**
 * Push Notification Service
 * Handles web push notifications for user engagement
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type NotificationType = 
  | 'streak_reminder'      // Your streak is about to expire!
  | 'streak_lost'          // You lost your streak
  | 'daily_challenge'      // New daily challenges available
  | 'challenge_complete'   // You completed a challenge!
  | 'story_update'         // A story you follow has a new chapter
  | 'friend_activity'      // A friend started/completed a story
  | 'achievement_unlocked' // You earned a new achievement
  | 'level_up'            // You leveled up!
  | 'weekly_summary'       // Your weekly reading summary
  | 'new_story'           // New story in your favorite genre
  | 'milestone'           // You reached a milestone!
  | 'social'              // Someone followed you, commented, etc.
  | 'promotional';        // Special offers, new features

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  streakReminders: boolean;
  dailyChallenges: boolean;
  storyUpdates: boolean;
  friendActivity: boolean;
  achievements: boolean;
  weeklySummary: boolean;
  newStories: boolean;
  promotional: boolean;
  quietHoursStart?: number; // Hour in 24h format (e.g., 22 for 10 PM)
  quietHoursEnd?: number;   // Hour in 24h format (e.g., 8 for 8 AM)
  timezone: string;
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  clicked: boolean;
  clickedAt?: string;
  createdAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: NotificationType;
    [key: string]: unknown;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

// ========================================
// NOTIFICATION TEMPLATES
// ========================================

const NOTIFICATION_TEMPLATES: Record<NotificationType, (data: Record<string, unknown>) => NotificationPayload> = {
  streak_reminder: (data) => ({
    title: '🔥 Your streak is in danger!',
    body: `You haven't read today. Your ${data.currentStreak}-day streak will reset at midnight!`,
    icon: '/icons/streak-fire.png',
    badge: '/icons/badge-96.png',
    tag: 'streak-reminder',
    data: { url: '/story-library', type: 'streak_reminder' },
    requireInteraction: true,
    actions: [
      { action: 'read', title: 'Read Now', icon: '/icons/book.png' },
      { action: 'freeze', title: 'Use Freeze', icon: '/icons/snowflake.png' },
    ],
  }),

  streak_lost: (data) => ({
    title: '💔 Streak Lost',
    body: `Your ${data.previousStreak}-day streak has ended. Start a new one today!`,
    icon: '/icons/streak-broken.png',
    tag: 'streak-lost',
    data: { url: '/story-library', type: 'streak_lost' },
    actions: [
      { action: 'restart', title: 'Start New Streak', icon: '/icons/refresh.png' },
    ],
  }),

  daily_challenge: () => ({
    title: '🎯 New Daily Challenges!',
    body: 'Fresh challenges are waiting. Complete them for XP and rewards!',
    icon: '/icons/challenge.png',
    tag: 'daily-challenge',
    data: { url: '/achievements', type: 'daily_challenge' },
    actions: [
      { action: 'view', title: 'View Challenges', icon: '/icons/target.png' },
    ],
  }),

  challenge_complete: (data) => ({
    title: '🏆 Challenge Complete!',
    body: `You completed "${data.challengeTitle}" and earned ${data.xpReward} XP!`,
    icon: '/icons/trophy.png',
    tag: 'challenge-complete',
    data: { url: '/achievements', type: 'challenge_complete' },
  }),

  story_update: (data) => ({
    title: '📖 New Chapter Available!',
    body: `"${data.storyTitle}" has a new chapter waiting for you.`,
    icon: data.storyCover as string || '/icons/book.png',
    tag: `story-${data.storyId}`,
    data: { url: `/story-reader?id=${data.storyId}`, type: 'story_update', storyId: data.storyId },
    actions: [
      { action: 'read', title: 'Read Now', icon: '/icons/book-open.png' },
    ],
  }),

  friend_activity: (data) => ({
    title: `👋 ${data.friendName} is reading!`,
    body: data.activityType === 'started' 
      ? `Started reading "${data.storyTitle}"`
      : `Just completed "${data.storyTitle}"`,
    icon: data.friendAvatar as string || '/icons/user.png',
    tag: 'friend-activity',
    data: { url: '/community-hub', type: 'friend_activity' },
  }),

  achievement_unlocked: (data) => ({
    title: '🏅 Achievement Unlocked!',
    body: `You earned "${data.achievementName}" - ${data.achievementDescription}`,
    icon: '/icons/medal.png',
    tag: 'achievement',
    data: { url: '/user-profile?tab=achievements', type: 'achievement_unlocked' },
    requireInteraction: true,
  }),

  level_up: (data) => ({
    title: '⬆️ Level Up!',
    body: `Congratulations! You're now Level ${data.newLevel}!`,
    icon: '/icons/level-up.png',
    tag: 'level-up',
    data: { url: '/user-profile', type: 'level_up' },
    requireInteraction: true,
  }),

  weekly_summary: (data) => ({
    title: '📊 Your Weekly Reading Summary',
    body: `You read ${data.chaptersRead} chapters and made ${data.choicesMade} choices this week!`,
    icon: '/icons/chart.png',
    tag: 'weekly-summary',
    data: { url: '/user-dashboard', type: 'weekly_summary' },
  }),

  new_story: (data) => ({
    title: `✨ New ${data.genre} Story!`,
    body: `"${data.storyTitle}" just launched. It looks like your kind of story!`,
    icon: data.storyCover as string || '/icons/sparkle.png',
    tag: 'new-story',
    data: { url: `/story-reader?id=${data.storyId}`, type: 'new_story', storyId: data.storyId },
    actions: [
      { action: 'read', title: 'Start Reading', icon: '/icons/book-open.png' },
      { action: 'save', title: 'Save for Later', icon: '/icons/bookmark.png' },
    ],
  }),

  milestone: (data) => ({
    title: '🎉 Milestone Reached!',
    body: data.milestoneMessage as string || 'You achieved something amazing!',
    icon: '/icons/star.png',
    tag: 'milestone',
    data: { url: '/user-profile', type: 'milestone' },
    requireInteraction: true,
  }),

  social: (data) => ({
    title: data.title as string || '👥 Social Update',
    body: data.body as string || 'Someone interacted with you!',
    icon: data.userAvatar as string || '/icons/users.png',
    tag: 'social',
    data: { url: data.url as string || '/community-hub', type: 'social' },
  }),

  promotional: (data) => ({
    title: data.title as string || '🎁 Special Offer!',
    body: data.body as string || 'Check out what\'s new!',
    icon: '/icons/gift.png',
    tag: 'promotional',
    data: { url: data.url as string || '/pricing', type: 'promotional' },
    silent: true, // Don't vibrate for promotional
  }),
};

// ========================================
// SERVICE CLASS
// ========================================

class PushNotificationService {
  private vapidPublicKey: string;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    return Notification.requestPermission();
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission | null {
    if (typeof window === 'undefined') return null;
    return Notification.permission;
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    const permission = await this.requestPermission();
    if (permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      const subscriptionJson = subscription.toJSON();
      
      // Save to database
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
          user_agent: navigator.userAgent,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,endpoint',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving subscription:', error);
        return null;
      }

      return this.mapSubscription(data);
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const supabase = this.getSupabase();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const supabase = this.getSupabase();
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return defaults
      return {
        userId,
        streakReminders: true,
        dailyChallenges: true,
        storyUpdates: true,
        friendActivity: true,
        achievements: true,
        weeklySummary: true,
        newStories: true,
        promotional: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    return {
      userId: data.user_id,
      streakReminders: data.streak_reminders ?? true,
      dailyChallenges: data.daily_challenges ?? true,
      storyUpdates: data.story_updates ?? true,
      friendActivity: data.friend_activity ?? true,
      achievements: data.achievements ?? true,
      weeklySummary: data.weekly_summary ?? true,
      newStories: data.new_stories ?? true,
      promotional: data.promotional ?? false,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const supabase = this.getSupabase();

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        streak_reminders: preferences.streakReminders,
        daily_challenges: preferences.dailyChallenges,
        story_updates: preferences.storyUpdates,
        friend_activity: preferences.friendActivity,
        achievements: preferences.achievements,
        weekly_summary: preferences.weeklySummary,
        new_stories: preferences.newStories,
        promotional: preferences.promotional,
        quiet_hours_start: preferences.quietHoursStart,
        quiet_hours_end: preferences.quietHoursEnd,
        timezone: preferences.timezone,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
  }

  /**
   * Send a notification to a user
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, unknown> = {}
  ): Promise<boolean> {
    // Check preferences
    const preferences = await this.getPreferences(userId);
    if (!this.shouldSendNotification(type, preferences)) {
      return false;
    }

    // Check quiet hours
    if (this.isQuietHours(preferences)) {
      // Schedule for after quiet hours
      await this.scheduleNotification(userId, type, data, this.getNextActiveTime(preferences));
      return true;
    }

    // Get notification payload
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      console.error('Unknown notification type:', type);
      return false;
    }

    const payload = template(data);

    // Get user's push subscriptions
    const supabase = this.getSupabase();
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subscriptions || subscriptions.length === 0) {
      return false;
    }

    // Send via server API
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptions,
          payload,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, unknown>,
    scheduledFor: Date
  ): Promise<string | null> {
    const supabase = this.getSupabase();
    const template = NOTIFICATION_TEMPLATES[type];
    const payload = template(data);

    const { data: scheduled, error } = await supabase
      .from('scheduled_notifications')
      .insert({
        user_id: userId,
        type,
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        data: payload.data,
        scheduled_for: scheduledFor.toISOString(),
        sent: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }

    return scheduled.id;
  }

  /**
   * Schedule streak reminder (called when user hasn't read today)
   */
  async scheduleStreakReminder(userId: string, currentStreak: number): Promise<void> {
    const now = new Date();
    
    // Schedule reminder for 8 PM local time
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);
    
    if (reminderTime <= now) {
      // If it's past 8 PM, don't schedule
      return;
    }

    await this.scheduleNotification(userId, 'streak_reminder', { currentStreak }, reminderTime);
  }

  /**
   * Show a local notification (for immediate display without server)
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/badge-96.png',
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
    });
  }

  // ==================== PRIVATE METHODS ====================

  private shouldSendNotification(type: NotificationType, preferences: NotificationPreferences): boolean {
    const typeToPreference: Record<NotificationType, keyof NotificationPreferences> = {
      streak_reminder: 'streakReminders',
      streak_lost: 'streakReminders',
      daily_challenge: 'dailyChallenges',
      challenge_complete: 'dailyChallenges',
      story_update: 'storyUpdates',
      friend_activity: 'friendActivity',
      achievement_unlocked: 'achievements',
      level_up: 'achievements',
      weekly_summary: 'weeklySummary',
      new_story: 'newStories',
      milestone: 'achievements',
      social: 'friendActivity',
      promotional: 'promotional',
    };

    const prefKey = typeToPreference[type];
    return preferences[prefKey] as boolean ?? true;
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (preferences.quietHoursStart === undefined || preferences.quietHoursEnd === undefined) {
      return false;
    }

    const now = new Date();
    const hour = now.getHours();

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (preferences.quietHoursStart > preferences.quietHoursEnd) {
      return hour >= preferences.quietHoursStart || hour < preferences.quietHoursEnd;
    }

    return hour >= preferences.quietHoursStart && hour < preferences.quietHoursEnd;
  }

  private getNextActiveTime(preferences: NotificationPreferences): Date {
    const now = new Date();
    const result = new Date(now);

    if (preferences.quietHoursEnd !== undefined) {
      result.setHours(preferences.quietHoursEnd, 0, 0, 0);
      
      // If quiet hours end is before current time, schedule for tomorrow
      if (result <= now) {
        result.setDate(result.getDate() + 1);
      }
    } else {
      // Default to next hour
      result.setHours(result.getHours() + 1, 0, 0, 0);
    }

    return result;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private mapSubscription(data: any): PushSubscription {
    return {
      id: data.id,
      userId: data.user_id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.user_agent,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
    };
  }
}

export const pushNotificationService = new PushNotificationService();
