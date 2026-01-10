/**
 * Dynamic import utilities for code splitting and lazy loading.
 * Provides wrappers around Next.js dynamic imports with loading states.
 */

'use client';

import React, { Suspense, ComponentType, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Default loading component
function DefaultLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

// Default error component
function DefaultError({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="mb-2 text-red-600 dark:text-red-400">Failed to load component</p>
      <p className="mb-4 text-sm text-gray-500">{error.message}</p>
      {retry && (
        <button
          onClick={retry}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

interface LazyComponentOptions {
  /** Custom loading component */
  loading?: ReactNode;
  /** Disable SSR for this component */
  ssr?: boolean;
  /** Delay before showing loader (ms) */
  delay?: number;
}

/**
 * Create a lazy-loaded component with loading state
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): ComponentType<P> {
  const { loading = <DefaultLoader />, ssr = true, delay = 0 } = options;

  const LazyComponent = dynamic(importFn, {
    loading: () => <>{loading}</>,
    ssr,
  });

  // Wrapper to handle delay
  if (delay > 0) {
    const DelayedComponent = (props: P) => {
      const [showLoader, setShowLoader] = React.useState(false);

      React.useEffect(() => {
        const timer = setTimeout(() => setShowLoader(true), delay);
        return () => clearTimeout(timer);
      }, []);

      return (
        <Suspense fallback={showLoader ? loading : null}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };

    DelayedComponent.displayName = `DelayedLazy(${importFn.name || 'Component'})`;
    return DelayedComponent;
  }

  return LazyComponent;
}

/**
 * Preload a dynamic component
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<unknown> }>
): void {
  importFn().catch(() => {
    // Silently fail preload
  });
}

/**
 * HOC for wrapping components with Suspense
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback: ReactNode = <DefaultLoader />
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

/**
 * Lazy load with error boundary
 */
interface LazyWithErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function createLazyWithErrorBoundary<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions & { errorFallback?: ReactNode } = {}
): ComponentType<P> {
  const { loading = <DefaultLoader />, ssr = true, errorFallback } = options;

  const LazyComponent = dynamic(importFn, {
    loading: () => <>{loading}</>,
    ssr,
  });

  class ErrorBoundaryWrapper extends React.Component<P, LazyWithErrorBoundaryState> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): LazyWithErrorBoundaryState {
      return { hasError: true, error };
    }

    retry = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError && this.state.error) {
        if (errorFallback) {
          return <>{errorFallback}</>;
        }
        return <DefaultError error={this.state.error} retry={this.retry} />;
      }

      return <LazyComponent {...this.props} />;
    }
  }

  return ErrorBoundaryWrapper;
}

/**
 * Common lazy-loaded component patterns
 */
export const LazyPatterns = {
  /**
   * Create a modal that loads only when opened
   */
  modal: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
    createLazyComponent(importFn, {
      ssr: false,
      loading: (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <DefaultLoader />
        </div>
      ),
    }),

  /**
   * Create a heavy component that loads with a delay
   */
  heavy: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
    createLazyComponent(importFn, {
      delay: 200,
      loading: <DefaultLoader />,
    }),

  /**
   * Create a client-only component
   */
  clientOnly: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
    createLazyComponent(importFn, {
      ssr: false,
    }),
};

export { DefaultLoader, DefaultError };
