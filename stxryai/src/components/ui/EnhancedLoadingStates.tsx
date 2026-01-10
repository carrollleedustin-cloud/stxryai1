'use client';

import { Loader2 } from 'lucide-react';

export function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4 p-4 bg-void-surface border border-membrane rounded-lg">
      <div className="h-4 bg-void-mist rounded w-3/4"></div>
      <div className="h-4 bg-void-mist rounded w-1/2"></div>
      <div className="h-20 bg-void-mist rounded"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-void-mist rounded"
          style={{ width: `${100 - i * 10}%` }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-pulse bg-void-mist rounded-full flex-shrink-0`}
    ></div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <Loader2
      className="animate-spin text-spectral-cyan"
      size={sizeMap[size]}
      style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.4))' }}
    />
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-void-absolute/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4 p-8 bg-void-surface border border-membrane rounded-lg shadow-elevation-3">
        <LoadingSpinner size="lg" />
        {message && <p className="text-text-secondary font-medium">{message}</p>}
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void-absolute">
      <div className="text-center space-y-6">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Loading...</h2>
          <p className="text-text-tertiary">Please wait while we prepare your experience</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingButton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {children && <span className="text-text-secondary">{children}</span>}
    </div>
  );
}

export function SkeletonStoryCard() {
  return (
    <div className="animate-pulse bg-void-surface border border-membrane rounded-lg overflow-hidden">
      <div className="h-48 bg-void-mist"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-void-mist rounded w-3/4"></div>
        <div className="h-4 bg-void-mist rounded w-full"></div>
        <div className="h-4 bg-void-mist rounded w-5/6"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-void-mist rounded w-20"></div>
          <div className="h-8 bg-void-mist rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-void-surface border border-membrane rounded-lg">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-void-mist rounded w-1/3"></div>
            <div className="h-3 bg-void-mist rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
