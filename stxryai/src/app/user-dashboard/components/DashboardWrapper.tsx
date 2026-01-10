'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import DashboardInteractive from './DashboardInteractive';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error | any): State {
    // Ensure we always have an Error object
    const errorObj = error instanceof Error ? error : new Error(String(error || 'Unknown error'));
    return { hasError: true, error: errorObj };
  }

  componentDidCatch(error: Error | any, errorInfo: ErrorInfo) {
    // Log comprehensive error information
    const errorObj = error instanceof Error ? error : new Error(String(error || 'Unknown error'));
    console.error('=== Dashboard Error Boundary Caught Error ===');
    console.error('Error object:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', errorObj.message);
    console.error('Error stack:', errorObj.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error info:', errorInfo);
    console.error('===========================================');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h2>
            <p className="mb-6 text-muted-foreground">
              The dashboard encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs overflow-auto">
                  {this.state.error.message || 'Unknown error'}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children || <DashboardInteractive />;
  }
}

export default DashboardErrorBoundary;
