'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createComponentLogger } from '@/lib/logger';

const log = createComponentLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Show detailed error in development */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    log.error('Uncaught error in component tree', error, {
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);

    // TODO: Send to error tracking service
    // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.resetError}
          showDetails={showDetails ?? process.env.NODE_ENV === 'development'}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails: boolean;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails,
}: DefaultErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-4 text-6xl">😓</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We apologize for the inconvenience. Please try again or contact support if the problem
          persists.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onReset}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reload Page
          </button>
        </div>

        {showDetails && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Technical Details
            </summary>
            <div className="mt-2 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="font-mono text-sm text-red-800 dark:text-red-300">
                {error.name}: {error.message}
              </p>
              {errorInfo?.componentStack && (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-red-700 dark:text-red-400">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

/**
 * Error boundary specifically for async data loading
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
}

export function AsyncErrorBoundary({
  children,
  loadingFallback,
  errorFallback,
}: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, reset) =>
        typeof errorFallback === 'function' ? (
          errorFallback(error, reset)
        ) : (
          errorFallback || (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-red-600 dark:text-red-400">Failed to load content</p>
              <button
                onClick={reset}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          )
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
