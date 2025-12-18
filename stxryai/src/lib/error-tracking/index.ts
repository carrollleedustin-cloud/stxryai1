/**
 * Error Tracking Service Abstraction
 * Provides a unified interface for error tracking services (Sentry, LogRocket, etc.)
 * 
 * Setup Instructions:
 * 
 * 1. Install Sentry (recommended):
 *    npm install @sentry/nextjs
 * 
 * 2. Initialize Sentry in your app:
 *    npx @sentry/wizard@latest -i nextjs
 * 
 * 3. Add environment variables:
 *    NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
 *    SENTRY_AUTH_TOKEN=your_auth_token (for source maps)
 * 
 * 4. Uncomment the Sentry integration below and configure
 */

interface ErrorTrackingContext {
  userId?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

interface ErrorTrackingOptions {
  level?: 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
}

class ErrorTrackingService {
  private isEnabled: boolean;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    // Enable if Sentry DSN is configured
    this.isEnabled = this.isProduction && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  }

  /**
   * Initialize error tracking service
   * Call this in your app initialization
   */
  init(): void {
    if (!this.isEnabled) {
      if (this.isProduction) {
        console.warn(
          '[Error Tracking] Error tracking is disabled. Set NEXT_PUBLIC_SENTRY_DSN to enable.'
        );
      }
      return;
    }

    // TODO: Initialize Sentry here
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 0.1, // Adjust based on traffic
    //   beforeSend(event) {
    //     // Filter sensitive data
    //     return event;
    //   },
    // });
  }

  /**
   * Capture an exception/error
   */
  captureException(error: Error | unknown, options?: ErrorTrackingOptions): void {
    if (!this.isEnabled) {
      // In development, still log to console
      if (!this.isProduction) {
        console.error('[Error Tracking]', error, options);
      }
      return;
    }

    // TODO: Send to Sentry
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error, {
    //   level: options?.level || 'error',
    //   tags: options?.tags,
    //   extra: options?.extra,
    //   contexts: options?.contexts,
    // });
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(message: string, options?: ErrorTrackingOptions): void {
    if (!this.isEnabled) {
      if (!this.isProduction) {
        console.log('[Error Tracking]', message, options);
      }
      return;
    }

    // TODO: Send to Sentry
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureMessage(message, {
    //   level: options?.level || 'info',
    //   tags: options?.tags,
    //   extra: options?.extra,
    // });
  }

  /**
   * Set user context for error tracking
   */
  setUser(context: ErrorTrackingContext): void {
    if (!this.isEnabled) return;

    // TODO: Set Sentry user context
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setUser({
    //   id: context.userId,
    //   email: context.email,
    //   username: context.username,
    // });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isEnabled) return;

    // TODO: Clear Sentry user context
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level?: 'error' | 'warning' | 'info'): void {
    if (!this.isEnabled) {
      if (!this.isProduction) {
        console.debug('[Breadcrumb]', { message, category, level });
      }
      return;
    }

    // TODO: Add Sentry breadcrumb
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.addBreadcrumb({
    //   message,
    //   category: category || 'default',
    //   level: level || 'info',
    //   timestamp: Date.now() / 1000,
    // });
  }

  /**
   * Set additional context/tags
   */
  setContext(name: string, context: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    // TODO: Set Sentry context
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setContext(name, context);
  }

  /**
   * Set tag for filtering
   */
  setTag(key: string, value: string): void {
    if (!this.isEnabled) return;

    // TODO: Set Sentry tag
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setTag(key, value);
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();

// Export types
export type { ErrorTrackingContext, ErrorTrackingOptions };

