/**
 * Service Worker Registration for PWA
 * Handles SW registration, updates, and offline capabilities.
 */

type UpdateCallback = () => void;

interface ServiceWorkerConfig {
  onUpdate?: UpdateCallback;
  onSuccess?: UpdateCallback;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  /**
   * Register the service worker
   */
  async register(config?: ServiceWorkerConfig): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return false;
    }

    this.config = config || {};

    // Listen for online/offline events
    window.addEventListener('online', () => this.config.onOnline?.());
    window.addEventListener('offline', () => this.config.onOffline?.());

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content available; please refresh.');
              this.config.onUpdate?.();
            } else {
              // Content cached for offline use
              console.log('Content cached for offline use.');
              this.config.onSuccess?.();
            }
          }
        };
      };

      // Check for updates periodically
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000
      ); // Every hour

      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      return true;
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Check if app is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Request background sync
   */
  async requestBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      return false;
    }

    try {
      await (
        this.registration as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> };
        }
      ).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  /**
   * Cache a list of URLs for offline use
   */
  async cacheUrls(urls: string[]): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    });
  }

  /**
   * Clear specific cache
   */
  async clearCache(cacheName: string): Promise<boolean> {
    try {
      return await caches.delete(cacheName);
    } catch (error) {
      console.error('Cache deletion failed:', error);
      return false;
    }
  }

  /**
   * Get cache storage estimate
   */
  async getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  } | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;

      return { usage, quota, percentage };
    } catch (error) {
      console.error('Storage estimate failed:', error);
      return null;
    }
  }

  /**
   * Request persistent storage
   */
  async requestPersistentStorage(): Promise<boolean> {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      return false;
    }

    try {
      return await navigator.storage.persist();
    } catch (error) {
      console.error('Persistent storage request failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export for use in components
export function registerServiceWorker(config?: ServiceWorkerConfig) {
  if (process.env.NODE_ENV === 'production') {
    return serviceWorkerManager.register(config);
  }
  return Promise.resolve(false);
}

export function unregisterServiceWorker() {
  return serviceWorkerManager.unregister();
}
