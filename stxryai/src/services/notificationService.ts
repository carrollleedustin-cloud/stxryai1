/**
 * Enhanced Notification Service
 * Provides comprehensive notification management with push support.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  action_url?: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  read_at?: string;
}

export type NotificationType =
  | 'story_published'
  | 'story_comment'
  | 'story_rating'
  | 'story_featured'
  | 'achievement_unlocked'
  | 'badge_earned'
  | 'streak_milestone'
  | 'goal_completed'
  | 'follower_new'
  | 'following_activity'
  | 'club_invite'
  | 'club_activity'
  | 'collaboration_invite'
  | 'collaboration_comment'
  | 'system_announcement'
  | 'weekly_digest'
  | 'reading_reminder';

export interface NotificationPreferences {
  // Email notifications
  email_story_comments: boolean;
  email_new_followers: boolean;
  email_club_activity: boolean;
  email_collaboration: boolean;
  email_weekly_digest: boolean;
  email_announcements: boolean;

  // Push notifications
  push_enabled: boolean;
  push_story_activity: boolean;
  push_social: boolean;
  push_achievements: boolean;
  push_reminders: boolean;

  // In-app notifications
  inapp_all: boolean;

  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:mm format
  quiet_hours_end: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_story_comments: true,
  email_new_followers: true,
  email_club_activity: false,
  email_collaboration: true,
  email_weekly_digest: true,
  email_announcements: true,
  push_enabled: true,
  push_story_activity: true,
  push_social: true,
  push_achievements: true,
  push_reminders: false,
  inapp_all: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  { title: (data: Record<string, unknown>) => string; icon: string }
> = {
  story_published: {
    title: (data) => `Your story "${data.story_title}" is now live!`,
    icon: '📖',
  },
  story_comment: {
    title: (data) => `${data.commenter_name} commented on your story`,
    icon: '💬',
  },
  story_rating: {
    title: (data) => `Someone rated your story ${data.rating} stars!`,
    icon: '⭐',
  },
  story_featured: {
    title: (data) => `Your story "${data.story_title}" was featured!`,
    icon: '🌟',
  },
  achievement_unlocked: {
    title: (data) => `Achievement unlocked: ${data.achievement_name}`,
    icon: '🏆',
  },
  badge_earned: {
    title: (data) => `You earned the "${data.badge_name}" badge!`,
    icon: '🎖️',
  },
  streak_milestone: {
    title: (data) => `${data.streak_days} day reading streak! Keep it up!`,
    icon: '🔥',
  },
  goal_completed: {
    title: (data) => `Goal completed: ${data.goal_name}`,
    icon: '🎯',
  },
  follower_new: {
    title: (data) => `${data.follower_name} started following you`,
    icon: '👤',
  },
  following_activity: {
    title: (data) => `${data.user_name} published a new story`,
    icon: '📚',
  },
  club_invite: {
    title: (data) => `You've been invited to join "${data.club_name}"`,
    icon: '👥',
  },
  club_activity: {
    title: (data) => `New activity in "${data.club_name}"`,
    icon: '📣',
  },
  collaboration_invite: {
    title: (data) => `${data.inviter_name} invited you to collaborate`,
    icon: '✍️',
  },
  collaboration_comment: {
    title: (data) => `New comment on "${data.story_title}"`,
    icon: '📝',
  },
  system_announcement: {
    title: (data) => String(data.title || 'System Announcement'),
    icon: '📢',
  },
  weekly_digest: {
    title: () => 'Your weekly reading summary is ready',
    icon: '📊',
  },
  reading_reminder: {
    title: () => "Don't break your streak! Read something today",
    icon: '⏰',
  },
};

export const notificationService = {
  /**
   * Get user's notifications
   */
  async getNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Create a notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      actionUrl?: string;
    }
  ): Promise<Notification | null> {
    const template = NOTIFICATION_TEMPLATES[type];
    const title = template?.title(options?.data || {}) || type;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: options?.data,
        action_url: options?.actionUrl,
        is_read: false,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    // Check preferences and send push if enabled
    const prefs = await this.getUserPreferences(userId);
    if (prefs?.push_enabled && this.shouldSendPush(type, prefs)) {
      await this.sendPushNotification(userId, title, message, options?.actionUrl);
    }

    return data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      return false;
    }

    return true;
  },

  /**
   * Archive a notification
   */
  async archiveNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error archiving notification:', error);
      return false;
    }

    return true;
  },

  /**
   * Delete old notifications
   */
  async cleanupOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error cleaning up notifications:', error);
      return 0;
    }

    return data?.length || 0;
  },

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...data.preferences,
    };
  },

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    const { error } = await supabase.from('notification_preferences').upsert({
      user_id: userId,
      preferences: preferences,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error updating preferences:', error);
      return false;
    }

    return true;
  },

  /**
   * Check if push should be sent based on preferences
   */
  shouldSendPush(type: NotificationType, prefs: NotificationPreferences): boolean {
    if (!prefs.push_enabled) return false;

    // Check quiet hours
    if (prefs.quiet_hours_enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (prefs.quiet_hours_start < prefs.quiet_hours_end) {
        // Normal range (e.g., 22:00 to 08:00 doesn't wrap)
        if (currentTime >= prefs.quiet_hours_start && currentTime < prefs.quiet_hours_end) {
          return false;
        }
      } else {
        // Wraps midnight (e.g., 22:00 to 08:00)
        if (currentTime >= prefs.quiet_hours_start || currentTime < prefs.quiet_hours_end) {
          return false;
        }
      }
    }

    // Check type-specific preferences
    const storyTypes: NotificationType[] = ['story_comment', 'story_rating', 'story_featured'];
    const socialTypes: NotificationType[] = ['follower_new', 'following_activity', 'club_invite', 'club_activity'];
    const achievementTypes: NotificationType[] = ['achievement_unlocked', 'badge_earned', 'streak_milestone', 'goal_completed'];
    const reminderTypes: NotificationType[] = ['reading_reminder'];

    if (storyTypes.includes(type)) return prefs.push_story_activity;
    if (socialTypes.includes(type)) return prefs.push_social;
    if (achievementTypes.includes(type)) return prefs.push_achievements;
    if (reminderTypes.includes(type)) return prefs.push_reminders;

    return true;
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    userId: string,
    subscription: PushSubscription
  ): Promise<boolean> {
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving push subscription:', error);
      return false;
    }

    return true;
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(userId: string, endpoint: string): Promise<boolean> {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing push subscription:', error);
      return false;
    }

    return true;
  },

  /**
   * Send push notification (server-side)
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    url?: string
  ): Promise<boolean> {
    // This would typically call a serverless function or API
    // that uses web-push library to send the notification
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title,
          body,
          url,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToRealtime(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Batch create notifications for multiple users
   */
  async createBatchNotifications(
    userIds: string[],
    type: NotificationType,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      actionUrl?: string;
    }
  ): Promise<number> {
    const template = NOTIFICATION_TEMPLATES[type];
    const title = template?.title(options?.data || {}) || type;

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      data: options?.data,
      action_url: options?.actionUrl,
      is_read: false,
      is_archived: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select('id');

    if (error) {
      console.error('Error creating batch notifications:', error);
      return 0;
    }

    return data?.length || 0;
  },
};

export default notificationService;
