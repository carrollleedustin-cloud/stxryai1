import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Animated skeleton loader component
 * Use for loading states instead of spinners
 */
export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`bg-muted rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Story Card Skeleton
 * Matches the structure of StoryCard component
 */
export function StoryCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="pt-3 border-t border-border">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Story Grid Skeleton
 * Shows multiple story card skeletons
 */
export function StoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Text Skeleton
 * For loading text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

/**
 * Avatar Skeleton
 * For loading user avatars
 */
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

/**
 * Table Skeleton
 * For loading table data
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Widget Skeleton
 * For loading dashboard cards
 */
export function DashboardWidgetSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 shadow-lg">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-24 w-full mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

/**
 * List Item Skeleton
 * For loading list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <AvatarSkeleton size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Comment Skeleton
 * For loading comments
 */
export function CommentSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <AvatarSkeleton size="sm" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <TextSkeleton lines={2} />
        </div>
      </div>
    </div>
  );
}
