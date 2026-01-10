'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContentModeration } from '@/hooks/useContentModeration';
import { ModerationWarning } from './ModerationWarning';

interface ModerationIndicatorProps {
  text: string;
  contentType: 'story' | 'comment' | 'profile' | 'message' | 'chapter';
  contentId?: string;
  authorId?: string;
  showWarning?: boolean;
  className?: string;
}

export function ModerationIndicator({
  text,
  contentType,
  contentId,
  authorId,
  showWarning = true,
  className = '',
}: ModerationIndicatorProps) {
  const { checkContent, isChecking, lastResult, isFlagged, severity } = useContentModeration({
    contentType,
    contentId,
    authorId,
    autoCheck: true,
    debounceMs: 1500,
  });

  // Trigger check when text changes
  useEffect(() => {
    if (checkContent && text) {
      checkContent(text);
    }
  }, [text, checkContent]);

  if (!text || text.length < 10) {
    return null;
  }

  return (
    <div className={className}>
      {/* Loading indicator */}
      {isChecking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Checking content...</span>
        </motion.div>
      )}

      {/* Warning display */}
      {showWarning && lastResult && isFlagged && (
        <ModerationWarning result={lastResult} className="mt-2" />
      )}

      {/* Status indicator (subtle) */}
      {!isChecking && lastResult && !isFlagged && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-1"
        >
          <span>✓</span>
          <span>Content looks good</span>
        </motion.div>
      )}
    </div>
  );
}
