'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  pushNotificationService,
  type NotificationPreferences as NotificationPrefs,
} from '@/services/pushNotificationService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface NotificationPreferencesProps {
  className?: string;
  onPreferencesUpdated?: (prefs: NotificationPrefs) => void;
}

export function NotificationPreferences({
  className = '',
  onPreferencesUpdated,
}: NotificationPreferencesProps) {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const [prefs, status] = await Promise.all([
          pushNotificationService.getPreferences(user.id),
          Promise.resolve(pushNotificationService.getPermissionStatus()),
        ]);

        setPreferences(prefs);
        setPermissionStatus(status);
        setEnabled(status === 'granted' && (prefs?.pushEnabled ?? true));
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleTogglePush = async (checked: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      if (checked) {
        // Request permission and subscribe
        const permission = await pushNotificationService.requestPermission();
        if (permission !== 'granted') {
          toast.error('Notification permission denied. Please enable it in your browser settings.');
          setEnabled(false);
          setSaving(false);
          return;
        }

        await pushNotificationService.subscribe(user.id);
        await pushNotificationService.updatePreferences(user.id, { pushEnabled: true });
        setEnabled(true);
        setPermissionStatus('granted');
        toast.success('Push notifications enabled! 🔔');
      } else {
        await pushNotificationService.unsubscribe(user.id);
        await pushNotificationService.updatePreferences(user.id, { pushEnabled: false });
        setEnabled(false);
        toast.success('Push notifications disabled');
      }

      // Reload preferences
      const updated = await pushNotificationService.getPreferences(user.id);
      setPreferences(updated);
      onPreferencesUpdated?.(updated!);
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      toast.error('Failed to update push notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPrefs, value: boolean | string) => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      await pushNotificationService.updatePreferences(user.id, {
        [key]: value,
      } as any);

      // Update local state
      setPreferences((prev) => (prev ? { ...prev, [key]: value } : null));

      // Reload to get updated preferences
      const updated = await pushNotificationService.getPreferences(user.id);
      setPreferences(updated);
      onPreferencesUpdated?.(updated!);

      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update preference');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">Failed to load preferences</p>
      </div>
    );
  }

  const isSupported = pushNotificationService.isSupported();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Push Notifications Toggle */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">Push Notifications</h3>
            {!isSupported && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                Not Supported
              </span>
            )}
            {permissionStatus === 'denied' && (
              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                Blocked
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified about story updates, friend activity, and more
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled && isSupported}
            onChange={(e) => handleTogglePush(e.target.checked)}
            disabled={!isSupported || saving || permissionStatus === 'denied'}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
        </label>
      </div>

      {enabled && isSupported && (
        <>
          {/* Push Notification Types */}
          <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-foreground text-sm">Notification Types</h4>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-foreground">Story Updates</span>
                  <p className="text-xs text-muted-foreground">
                    New chapters from authors you follow
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.storyUpdates}
                  onChange={(e) => handlePreferenceChange('storyUpdates', e.target.checked)}
                  disabled={saving}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-foreground">Friend Activity</span>
                  <p className="text-xs text-muted-foreground">
                    When friends finish stories or earn achievements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.friendActivity}
                  onChange={(e) => handlePreferenceChange('friendActivity', e.target.checked)}
                  disabled={saving}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-foreground">Engagement Reminders</span>
                  <p className="text-xs text-muted-foreground">
                    Streak reminders, daily goals, reading challenges
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders || preferences.dailyChallenges}
                  onChange={(e) => {
                    handlePreferenceChange('streakReminders', e.target.checked);
                    handlePreferenceChange('dailyChallenges', e.target.checked);
                  }}
                  disabled={saving}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-foreground">Social Notifications</span>
                  <p className="text-xs text-muted-foreground">
                    Comments, likes, follows, club invitations
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.friendActivity}
                  onChange={(e) => handlePreferenceChange('friendActivity', e.target.checked)}
                  disabled={saving}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Personalized Recommendations
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Story suggestions based on your reading history
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newStories}
                  onChange={(e) => handlePreferenceChange('newStories', e.target.checked)}
                  disabled={saving}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Quiet Hours</h4>
                <p className="text-xs text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quietHoursEnabled}
                  onChange={(e) => handlePreferenceChange('quietHoursEnabled', e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={
                      preferences.quietHoursStart !== undefined
                        ? `${String(preferences.quietHoursStart).padStart(2, '0')}:00`
                        : '22:00'
                    }
                    onChange={(e) => {
                      const hour = parseInt(e.target.value.split(':')[0], 10);
                      handlePreferenceChange('quietHoursStart', hour);
                    }}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    value={
                      preferences.quietHoursEnd !== undefined
                        ? `${String(preferences.quietHoursEnd).padStart(2, '0')}:00`
                        : '08:00'
                    }
                    onChange={(e) => {
                      const hour = parseInt(e.target.value.split(':')[0], 10);
                      handlePreferenceChange('quietHoursEnd', hour);
                    }}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!isSupported && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Your browser does not support push notifications. Please use a modern browser like
            Chrome, Firefox, or Edge.
          </p>
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            Notifications are blocked. Please enable them in your browser settings to receive push
            notifications.
          </p>
        </div>
      )}
    </div>
  );
}
