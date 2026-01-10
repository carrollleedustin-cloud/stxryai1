'use client';

import { AlertCircle, RefreshCw, Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { EnhancedButton } from './EnhancedButton';

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  variant = 'error',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}) {
  const variantStyles = {
    error: {
      border: 'border-spectral-rose/20',
      bg: 'bg-spectral-rose/5',
      icon: 'text-spectral-rose',
    },
    warning: {
      border: 'border-spectral-amber/20',
      bg: 'bg-spectral-amber/5',
      icon: 'text-spectral-amber',
    },
    info: {
      border: 'border-spectral-cyan/20',
      bg: 'bg-spectral-cyan/5',
      icon: 'text-spectral-cyan',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`p-6 ${styles.bg} border ${styles.border} rounded-lg`}>
      <div className="flex items-start gap-4">
        <AlertCircle className={`w-6 h-6 ${styles.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-text-primary">{title}</h3>
          {message && <p className="text-sm text-text-secondary">{message}</p>}
          {onRetry && (
            <EnhancedButton
              variant="ghost"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </EnhancedButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mb-4 flex justify-center text-text-ghost opacity-50">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6 max-w-md mx-auto">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

export function NotFoundError({
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist or has been moved.",
  onGoHome,
  onGoBack,
}: {
  title?: string;
  message?: string;
  onGoHome?: () => void;
  onGoBack?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void-absolute p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <FileQuestion className="w-24 h-24 text-text-ghost opacity-30" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">404</h1>
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="text-text-secondary">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          {onGoBack && (
            <EnhancedButton
              variant="ghost"
              onClick={onGoBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </EnhancedButton>
          )}
          {onGoHome && (
            <EnhancedButton
              variant="primary"
              onClick={onGoHome}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go Home
            </EnhancedButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function ServerError({
  title = 'Server Error',
  message = 'Something went wrong on our end. Please try again later.',
  onRetry,
  onGoHome,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void-absolute p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="w-24 h-24 text-spectral-rose opacity-50" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">500</h1>
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="text-text-secondary">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <EnhancedButton
              variant="primary"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </EnhancedButton>
          )}
          {onGoHome && (
            <EnhancedButton
              variant="ghost"
              onClick={onGoHome}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go Home
            </EnhancedButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function NoResults({
  searchTerm,
  onClearSearch,
}: {
  searchTerm?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search.`
          : 'Try adjusting your filters or search terms.'
      }
      action={
        onClearSearch && (
          <EnhancedButton variant="ghost" onClick={onClearSearch}>
            Clear Search
          </EnhancedButton>
        )
      }
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="warning"
    />
  );
}

export function PermissionError({ message }: { message?: string }) {
  return (
    <ErrorMessage
      title="Permission Denied"
      message={message || "You don't have permission to access this resource."}
      variant="warning"
    />
  );
}
