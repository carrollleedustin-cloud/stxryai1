/**
 * Error Tracking Service
 * 
 * Lightweight error tracking abstraction that can be configured with Sentry
 * or fall back to console/API logging when Sentry is not configured.
 * 
 * Setup instructions for Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set SENTRY_DSN in environment variables
 * 4. The wizard will create sentry.client.config.ts and sentry.server.config.ts
 */

export interface ErrorContext {
  userId?: string;
  email?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

interface BreadcrumbData {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

class ErrorTrackingService {
  private isInitialized = false;
  private userId: string | null = null;
  private userEmail: string | null = null;
  private breadcrumbs: BreadcrumbData[] = [];
  private readonly MAX_BREADCRUMBS = 50;

  /**
   * Initialize the error tracking service
   * Call this once at app startup
   */
  init() {
    if (this.isInitialized) return;

    // Check if Sentry is configured
    const hasSentry = !!process.env.NEXT_PUBLIC_SENTRY_DSN || !!process.env.SENTRY_DSN;

    if (hasSentry) {
      console.info('[ErrorTracking] Sentry DSN detected - using Sentry for error tracking');
      // Sentry initialization is handled by @sentry/nextjs automatically
      // when sentry.client.config.ts and sentry.server.config.ts are present
    } else {
      console.info('[ErrorTracking] No Sentry DSN - using fallback error tracking');
    }

    this.isInitialized = true;

    // Set up global error handlers for uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
          tags: { type: 'unhandledrejection' },
        });
      });
    }
  }

  /**
   * Set the current user for error context
   */
  setUser(userId: string | null, email?: string | null) {
    this.userId = userId;
    this.userEmail = email || null;

    // If Sentry is available, set user there too
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser(userId ? { id: userId, email: email || undefined } : null);
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | unknown, context?: ErrorContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const level = context?.level || 'error';

    // Try Sentry first
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(errorObj, {
        level,
        user: context?.userId ? { id: context.userId, email: context.email } : undefined,
        extra: context?.extra,
        tags: context?.tags,
      });
      return;
    }

    // Fallback: Log to console and send to our API
    console.error('[ErrorTracking]', errorObj.message, {
      stack: errorObj.stack,
      context,
      userId: this.userId,
    });

    // Send to our analytics error endpoint
    this.sendToAPI('error', {
      message: errorObj.message,
      stack: errorObj.stack,
      type: level,
      source: typeof window !== 'undefined' ? 'client' : 'server',
      userId: context?.userId || this.userId || undefined,
      metadata: { ...context?.extra, tags: context?.tags },
    });
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(message: string, context?: ErrorContext) {
    const level = context?.level || 'info';

    // Try Sentry first
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, {
        level,
        extra: context?.extra,
        tags: context?.tags,
      });
      return;
    }

    // Fallback: Log and send to API
    console.log('[ErrorTracking]', message, context);

    this.sendToAPI('info', {
      message,
      type: level,
      source: typeof window !== 'undefined' ? 'client' : 'server',
      userId: context?.userId || this.userId || undefined,
      metadata: context?.extra,
    });
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(data: BreadcrumbData) {
    this.breadcrumbs.push({
      ...data,
      level: data.level || 'info',
    });

    // Keep breadcrumbs manageable
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }

    // Try Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        category: data.category,
        message: data.message,
        level: data.level || 'info',
        data: data.data,
      });
    }
  }

  /**
   * Get current breadcrumbs (for debugging)
   */
  getBreadcrumbs(): BreadcrumbData[] {
    return [...this.breadcrumbs];
  }

  /**
   * Set extra context that will be attached to all errors
   */
  setContext(name: string, context: Record<string, unknown>) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setContext(name, context);
    }
  }

  /**
   * Set a tag that will be attached to all errors
   */
  setTag(key: string, value: string) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setTag(key, value);
    }
  }

  /**
   * Send error to our analytics API
   */
  private async sendToAPI(type: string, data: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/errors', JSON.stringify({
          ...data,
          timestamp: Date.now(),
        }));
      } else {
        // Fallback to fetch
        fetch('/api/analytics/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now(),
          }),
          keepalive: true,
        }).catch(() => {
          // Silently fail - we don't want error tracking to cause errors
        });
      }
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();

// Export type for use in components
export type { BreadcrumbData };

// Convenience functions
export const captureException = (error: Error | unknown, context?: ErrorContext) => 
  errorTracking.captureException(error, context);

export const captureMessage = (message: string, context?: ErrorContext) =>
  errorTracking.captureMessage(message, context);

export const setUser = (userId: string | null, email?: string | null) =>
  errorTracking.setUser(userId, email);

export const addBreadcrumb = (data: BreadcrumbData) =>
  errorTracking.addBreadcrumb(data);
