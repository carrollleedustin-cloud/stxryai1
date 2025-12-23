'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { performanceMonitor, errorTracker, userAnalytics } from './index';

/**
 * React hook for monitoring integration
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackError, measureAsync } = useMonitoring();
 * 
 *   const handleClick = async () => {
 *     await measureAsync('button_click_action', async () => {
 *       // Do something
 *     });
 *   };
 * 
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useMonitoring(userId?: string) {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    if (pathname) {
      userAnalytics.trackPageView(pathname, userId);
    }
  }, [pathname, userId]);

  // Track component mount time
  useEffect(() => {
    const mountTime = performance.now();
    performanceMonitor.recordMetric('component_mount', mountTime, 'ms', { path: pathname || 'unknown' });
  }, [pathname]);

  /**
   * Track a custom event
   */
  const trackEvent = useCallback(
    (
      eventName: string,
      category: 'navigation' | 'interaction' | 'conversion' | 'engagement',
      properties?: Record<string, unknown>
    ) => {
      userAnalytics.trackEvent(eventName, category, properties, userId);
    },
    [userId]
  );

  /**
   * Track an error
   */
  const trackError = useCallback(
    (error: Error | string, metadata?: Record<string, unknown>) => {
      errorTracker.trackError(error, 'client', { ...metadata, userId, path: pathname });
    },
    [userId, pathname]
  );

  /**
   * Measure async function performance
   */
  const measureAsync = useCallback(
    async <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, string | number | boolean>): Promise<T> => {
      return performanceMonitor.measureAsync(name, fn, { ...metadata, path: pathname || 'unknown' });
    },
    [pathname]
  );

  /**
   * Measure sync function performance
   */
  const measureSync = useCallback(
    <T>(name: string, fn: () => T, metadata?: Record<string, string | number | boolean>): T => {
      return performanceMonitor.measureSync(name, fn, { ...metadata, path: pathname || 'unknown' });
    },
    [pathname]
  );

  return {
    trackEvent,
    trackError,
    measureAsync,
    measureSync,
    trackStoryStarted: (storyId: string, storyTitle: string) =>
      userAnalytics.trackStoryStarted(storyId, storyTitle, userId),
    trackStoryCompleted: (storyId: string, storyTitle: string, duration: number) =>
      userAnalytics.trackStoryCompleted(storyId, storyTitle, duration, userId),
    trackChoiceMade: (storyId: string, chapterId: string, choiceId: string) =>
      userAnalytics.trackChoiceMade(storyId, chapterId, choiceId, userId),
  };
}

/**
 * Higher-order component for error boundary with monitoring
 */
export function withErrorMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function MonitoredComponent(props: P) {
    useEffect(() => {
      const startTime = performance.now();
      performanceMonitor.recordMetric(`${componentName}_render`, performance.now() - startTime, 'ms');
    });

    return React.createElement(WrappedComponent, props);
  };
}

