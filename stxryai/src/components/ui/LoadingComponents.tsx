'use client';

/**
 * Enhanced Loading Components
 * Beautiful loading states, skeletons, and spinners
 */

import { motion } from 'framer-motion';

// Spinner Loader
export function Spinner({
  size = 'md',
  color = 'purple',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    purple: 'border-purple-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.purple
      } border-t-transparent rounded-full animate-spin`}
    />
  );
}

// Dots Loader
export function DotsLoader() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-purple-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Pulse Loader
export function PulseLoader() {
  return (
    <motion.div
      className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );
}

// Full Page Loader
export function FullPageLoader({
  message = 'Loading...',
  progress,
}: {
  message?: string;
  progress?: number;
}) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-sm w-full px-4">
        <PulseLoader />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-700 dark:text-gray-300 font-medium"
        >
          {message}
        </motion.p>
        {progress !== undefined && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Components
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}
    />
  );
}

// Progress Bar
export function ProgressBar({
  progress,
  className = '',
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// Loading Button
export function LoadingButton({
  loading,
  children,
  className = '',
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      disabled={loading}
      className={`relative ${className} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}

// Shimmer Effect
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Story Card Skeleton
export function StoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
        <ShimmerEffect className="h-full" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
          </div>
          <SkeletonAvatar size="lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
