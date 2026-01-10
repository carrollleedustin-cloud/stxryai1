/**
 * Hook for managing push notifications
 * Handles subscription, permission requests, and initialization
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pushNotificationService } from '@/services/pushNotificationService';

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSupported(pushNotificationService.isSupported());
    setPermission(pushNotificationService.getPermissionStatus());

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isSupported) return;

    const checkSubscription = async () => {
      try {
        const subscriptions = await pushNotificationService.getSubscriptions(user.id);
        setIsSubscribed(subscriptions.length > 0);
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    };

    checkSubscription();
  }, [user, isSupported]);

  const subscribe = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const subscription = await pushNotificationService.subscribe(user.id);
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await pushNotificationService.unsubscribe(user.id);
      if (success) {
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    const newPermission = await pushNotificationService.requestPermission();
    setPermission(newPermission);
    return newPermission;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}
