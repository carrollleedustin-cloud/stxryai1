/**
 * Push Notification Service
 * Manages browser push notification subscriptions and sending
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface PushSubscriptionData {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  // Push preferences
  pushEnabled: boolean;
  pushStoryUpdates: boolean;
  pushFriendActivity: boolean;
  pushEngagementReminders: boolean;
  pushSocialNotifications: boolean;
  pushPersonalizedRecommendations: boolean;
  // Email preferences
  emailStoryComments: boolean;
  emailNewFollowers: boolean;
  emailClubActivity: boolean;
  emailCollaboration: boolean;
  emailWeeklyDigest: boolean;
  emailAnnouncements: boolean;
  // In-app preferences
  inappAll: boolean;
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// ========================================
// SERVICE CLASS
// ========================================

class PushNotificationService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== PERMISSION MANAGEMENT ====================

  /**
   * Request notification permission from browser
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Check current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to database
      const supabase = this.getSupabase();
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: this.arrayBufferToBase64(
            subscription.getKey('p256dh')?.buffer || new ArrayBuffer(0)
          ),
          auth: this.arrayBufferToBase64(
            subscription.getKey('auth')?.buffer || new ArrayBuffer(0)
          ),
          user_agent: navigator.userAgent,
        },
        {
          onConflict: 'user_id,endpoint',
        }
      );

      if (error) {
        console.error('Failed to save subscription:', error);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to remove subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Get user's push subscriptions
   */
  async getSubscriptions(userId: string): Promise<PushSubscriptionData[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    return (data || []).map(this.mapSubscriptionData);
  }

  // ==================== PREFERENCES MANAGEMENT ====================

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create default
        return await this.createDefaultPreferences(userId);
      }
      console.error('Error fetching preferences:', error);
      throw error;
    }

    return this.mapPreferences(data);
  }

  /**
   * Create default notification preferences
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating preferences:', error);
      throw error;
    }

    return this.mapPreferences(data);
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<{
      pushEnabled: boolean;
      pushStoryUpdates: boolean;
      pushFriendActivity: boolean;
      pushEngagementReminders: boolean;
      pushSocialNotifications: boolean;
      pushPersonalizedRecommendations: boolean;
      emailStoryComments: boolean;
      emailNewFollowers: boolean;
      emailClubActivity: boolean;
      emailCollaboration: boolean;
      emailWeeklyDigest: boolean;
      emailAnnouncements: boolean;
      inappAll: boolean;
      quietHoursEnabled: boolean;
      quietHoursStart: string;
      quietHoursEnd: string;
      timezone: string;
    }>
  ): Promise<NotificationPreferences> {
    const supabase = this.getSupabase();

    const updateData: any = {};

    if (preferences.pushEnabled !== undefined)
      updateData.push_enabled = preferences.pushEnabled;
    if (preferences.pushStoryUpdates !== undefined)
      updateData.push_story_updates = preferences.pushStoryUpdates;
    if (preferences.pushFriendActivity !== undefined)
      updateData.push_friend_activity = preferences.pushFriendActivity;
    if (preferences.pushEngagementReminders !== undefined)
      updateData.push_engagement_reminders = preferences.pushEngagementReminders;
    if (preferences.pushSocialNotifications !== undefined)
      updateData.push_social_notifications = preferences.pushSocialNotifications;
    if (preferences.pushPersonalizedRecommendations !== undefined)
      updateData.push_personalized_recommendations =
        preferences.pushPersonalizedRecommendations;
    if (preferences.emailStoryComments !== undefined)
      updateData.email_story_comments = preferences.emailStoryComments;
    if (preferences.emailNewFollowers !== undefined)
      updateData.email_new_followers = preferences.emailNewFollowers;
    if (preferences.emailClubActivity !== undefined)
      updateData.email_club_activity = preferences.emailClubActivity;
    if (preferences.emailCollaboration !== undefined)
      updateData.email_collaboration = preferences.emailCollaboration;
    if (preferences.emailWeeklyDigest !== undefined)
      updateData.email_weekly_digest = preferences.emailWeeklyDigest;
    if (preferences.emailAnnouncements !== undefined)
      updateData.email_announcements = preferences.emailAnnouncements;
    if (preferences.inappAll !== undefined) updateData.inapp_all = preferences.inappAll;
    if (preferences.quietHoursEnabled !== undefined)
      updateData.quiet_hours_enabled = preferences.quietHoursEnabled;
    if (preferences.quietHoursStart !== undefined)
      updateData.quiet_hours_start = preferences.quietHoursStart;
    if (preferences.quietHoursEnd !== undefined)
      updateData.quiet_hours_end = preferences.quietHoursEnd;
    if (preferences.timezone !== undefined) updateData.timezone = preferences.timezone;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          ...updateData,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }

    return this.mapPreferences(data);
  }

  /**
   * Check if user should receive push notification
   */
  async shouldSendPush(
    userId: string,
    notificationType: 'story_update' | 'friend_activity' | 'engagement_reminder' | 'social' | 'personalized_recommendation'
  ): Promise<boolean> {
    const supabase = this.getSupabase();

    // Use database function to check preferences
    const { data, error } = await supabase.rpc('should_send_push_notification', {
      p_user_id: userId,
      p_notification_type: notificationType,
    });

    if (error) {
      console.error('Error checking push preferences:', error);
      // Default to true if check fails
      return true;
    }

    return data === true;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convert VAPID key from URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }

  /**
   * Map database subscription data to interface
   */
  private mapSubscriptionData(data: any): PushSubscriptionData {
    return {
      id: data.id,
      userId: data.user_id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.user_agent,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Map database preferences data to interface
   */
  private mapPreferences(data: any): NotificationPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      pushEnabled: data.push_enabled ?? true,
      pushStoryUpdates: data.push_story_updates ?? true,
      pushFriendActivity: data.push_friend_activity ?? true,
      pushEngagementReminders: data.push_engagement_reminders ?? true,
      pushSocialNotifications: data.push_social_notifications ?? true,
      pushPersonalizedRecommendations: data.push_personalized_recommendations ?? false,
      emailStoryComments: data.email_story_comments ?? true,
      emailNewFollowers: data.email_new_followers ?? true,
      emailClubActivity: data.email_club_activity ?? false,
      emailCollaboration: data.email_collaboration ?? true,
      emailWeeklyDigest: data.email_weekly_digest ?? true,
      emailAnnouncements: data.email_announcements ?? true,
      inappAll: data.inapp_all ?? true,
      quietHoursEnabled: data.quiet_hours_enabled ?? false,
      quietHoursStart: data.quiet_hours_start?.slice(0, 5) || '22:00',
      quietHoursEnd: data.quiet_hours_end?.slice(0, 5) || '08:00',
      timezone: data.timezone || 'UTC',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

