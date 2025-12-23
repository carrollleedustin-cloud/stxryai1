/**
 * StxryAI Monitoring & Observability Stack
 * 
 * Provides:
 * - Performance monitoring
 * - Error tracking
 * - User analytics
 * - API metrics
 * - Real-time alerts
 */

// ============================================
// Types
// ============================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'info';
  source: 'client' | 'server' | 'api';
  userId?: string;
  sessionId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface APIMetric {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  duration: number;
  timestamp: number;
  userId?: string;
  error?: string;
}

export interface UserEvent {
  eventName: string;
  category: 'navigation' | 'interaction' | 'conversion' | 'engagement';
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

// ============================================
// Performance Monitoring
// ============================================

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: PerformanceMetric['unit'], metadata?: Record<string, string | number | boolean>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only the last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // In production, send to analytics backend
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Measure execution time of an async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, string | number | boolean>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: false });
      throw error;
    }
  }

  /**
   * Measure execution time of a sync function
   */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, string | number | boolean>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: false });
      throw error;
    }
  }

  /**
   * Get Web Vitals metrics
   */
  captureWebVitals() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals via PerformanceObserver
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue, 'count');
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Time to First Byte (from Navigation Timing)
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.recordMetric('TTFB', navEntry.responseStart - navEntry.requestStart, 'ms');
        this.recordMetric('DOMContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.startTime, 'ms');
        this.recordMetric('Load', navEntry.loadEventEnd - navEntry.startTime, 'ms');
      }
    } catch {
      // PerformanceObserver not supported
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number; values: number[] }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0, values: [] };
      }
      summary[metric.name].values.push(metric.value);
      summary[metric.name].min = Math.min(summary[metric.name].min, metric.value);
      summary[metric.name].max = Math.max(summary[metric.name].max, metric.value);
      summary[metric.name].count++;
    });

    // Calculate averages
    Object.keys(summary).forEach((key) => {
      const values = summary[key].values;
      summary[key].avg = values.reduce((a, b) => a + b, 0) / values.length;
      delete (summary[key] as any).values; // Remove values array from output
    });

    return summary;
  }

  private async sendToAnalytics(metric: PerformanceMetric) {
    // Send to PostHog or custom analytics endpoint
    try {
      // Using navigator.sendBeacon for non-blocking, reliable data sending
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/metrics', JSON.stringify(metric));
      }
    } catch {
      // Silently fail - don't break the app for analytics
    }
  }
}

// ============================================
// Error Tracking
// ============================================

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private readonly MAX_ERRORS = 100;

  /**
   * Track an error
   */
  trackError(error: Error | string, source: ErrorEvent['source'] = 'client', metadata?: Record<string, unknown>) {
    const errorEvent: ErrorEvent = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      type: 'error',
      source,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata,
      timestamp: Date.now(),
    };

    this.errors.push(errorEvent);

    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracker]', errorEvent);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorEvent);
    }
  }

  /**
   * Track a warning
   */
  trackWarning(message: string, metadata?: Record<string, unknown>) {
    const event: ErrorEvent = {
      message,
      type: 'warning',
      source: 'client',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata,
      timestamp: Date.now(),
    };

    this.errors.push(event);
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Catch unhandled errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.trackError(error || String(message), 'client', {
        source,
        lineno,
        colno,
      });
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      this.trackError(event.reason || 'Unhandled Promise Rejection', 'client', {
        type: 'unhandledrejection',
      });
    };
  }

  /**
   * Get recent errors
   */
  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  private async sendToErrorService(error: ErrorEvent) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/errors', JSON.stringify(error));
      }
    } catch {
      // Silently fail
    }
  }
}

// ============================================
// API Metrics
// ============================================

class APIMonitor {
  private metrics: APIMetric[] = [];
  private readonly MAX_METRICS = 500;

  /**
   * Track an API call
   */
  trackAPICall(
    endpoint: string,
    method: APIMetric['method'],
    statusCode: number,
    duration: number,
    userId?: string,
    error?: string
  ) {
    const metric: APIMetric = {
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: Date.now(),
      userId,
      error,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Alert on slow API calls or errors
    if (duration > 2000 || statusCode >= 500) {
      this.alertOnAnomaly(metric);
    }
  }

  /**
   * Wrap fetch for automatic tracking
   */
  wrapFetch(originalFetch: typeof fetch): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || 'GET').toUpperCase() as APIMetric['method'];
      const start = performance.now();

      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - start;

        // Only track API calls, not assets
        if (url.startsWith('/api/') || url.includes('/api/')) {
          this.trackAPICall(url, method, response.status, duration);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.trackAPICall(url, method, 0, duration, undefined, (error as Error).message);
        throw error;
      }
    };
  }

  /**
   * Get API metrics summary
   */
  getSummary(): Record<string, { avgDuration: number; errorRate: number; count: number }> {
    const summary: Record<string, { durations: number[]; errors: number; count: number }> = {};

    this.metrics.forEach((metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!summary[key]) {
        summary[key] = { durations: [], errors: 0, count: 0 };
      }
      summary[key].durations.push(metric.duration);
      if (metric.statusCode >= 400) summary[key].errors++;
      summary[key].count++;
    });

    const result: Record<string, { avgDuration: number; errorRate: number; count: number }> = {};
    Object.entries(summary).forEach(([key, data]) => {
      result[key] = {
        avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
        errorRate: (data.errors / data.count) * 100,
        count: data.count,
      };
    });

    return result;
  }

  private alertOnAnomaly(metric: APIMetric) {
    // In production, this would send an alert
    if (process.env.NODE_ENV === 'development') {
      console.warn('[APIMonitor] Anomaly detected:', metric);
    }
  }
}

// ============================================
// User Analytics
// ============================================

class UserAnalytics {
  private events: UserEvent[] = [];
  private sessionId: string;
  private readonly MAX_EVENTS = 500;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track a user event
   */
  trackEvent(
    eventName: string,
    category: UserEvent['category'],
    properties?: Record<string, unknown>,
    userId?: string
  ) {
    const event: UserEvent = {
      eventName,
      category,
      properties,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    this.events.push(event);

    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, userId?: string) {
    this.trackEvent('page_view', 'navigation', { path }, userId);
  }

  /**
   * Track story started
   */
  trackStoryStarted(storyId: string, storyTitle: string, userId?: string) {
    this.trackEvent('story_started', 'engagement', { storyId, storyTitle }, userId);
  }

  /**
   * Track story completed
   */
  trackStoryCompleted(storyId: string, storyTitle: string, duration: number, userId?: string) {
    this.trackEvent('story_completed', 'conversion', { storyId, storyTitle, duration }, userId);
  }

  /**
   * Track choice made
   */
  trackChoiceMade(storyId: string, chapterId: string, choiceId: string, userId?: string) {
    this.trackEvent('choice_made', 'interaction', { storyId, chapterId, choiceId }, userId);
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: UserEvent['category']): UserEvent[] {
    return this.events.filter((e) => e.category === category);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToAnalytics(event: UserEvent) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/events', JSON.stringify(event));
      }
    } catch {
      // Silently fail
    }
  }
}

// ============================================
// Exports
// ============================================

export const performanceMonitor = new PerformanceMonitor();
export const errorTracker = new ErrorTracker();
export const apiMonitor = new APIMonitor();
export const userAnalytics = new UserAnalytics();

// Initialize global error handlers
if (typeof window !== 'undefined') {
  errorTracker.setupGlobalHandlers();
  
  // Start capturing web vitals after page load
  if (document.readyState === 'complete') {
    performanceMonitor.captureWebVitals();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.captureWebVitals();
    });
  }
}

// Default export for easy importing
const monitoring = {
  performance: performanceMonitor,
  errors: errorTracker,
  api: apiMonitor,
  analytics: userAnalytics,
};

export default monitoring;

