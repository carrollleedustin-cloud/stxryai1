/**
 * React Hook for Content Moderation
 * Automatically checks content as user types
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  enhancedModerationService,
  type ModerationResult,
} from '@/services/enhancedModerationService';
import { debounce } from '@/lib/utils/debounce';

interface UseContentModerationOptions {
  contentType: 'story' | 'comment' | 'profile' | 'message' | 'chapter';
  contentId?: string;
  authorId?: string;
  autoCheck?: boolean;
  debounceMs?: number;
  onModerationComplete?: (result: ModerationResult) => void;
  onBlocked?: (result: ModerationResult) => void;
}

export function useContentModeration(options: UseContentModerationOptions) {
  const {
    contentType,
    contentId = '',
    authorId,
    autoCheck = true,
    debounceMs = 1000,
    onModerationComplete,
    onBlocked,
  } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced moderation check
  const checkContent = useCallback(
    debounce(async (text: string) => {
      if (!text.trim() || text.length < 10) {
        setLastResult(null);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsChecking(true);
      setError(null);

      try {
        const result = await enhancedModerationService.moderateContent({
          text,
          contentId: contentId || `temp-${Date.now()}`,
          contentType,
          authorId,
        });

        setLastResult(result);
        onModerationComplete?.(result);

        // Handle blocked content
        if (result.autoAction === 'block') {
          onBlocked?.(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          console.error('Content moderation error:', err);
        }
      } finally {
        setIsChecking(false);
      }
    }, debounceMs),
    [contentId, contentType, authorId, debounceMs, onModerationComplete, onBlocked]
  );

  // Manual check function
  const manualCheck = useCallback(
    async (text: string): Promise<ModerationResult | null> => {
      if (!text.trim()) {
        return null;
      }

      setIsChecking(true);
      setError(null);

      try {
        const result = await enhancedModerationService.moderateContent({
          text,
          contentId: contentId || `temp-${Date.now()}`,
          contentType,
          authorId,
        });

        setLastResult(result);
        onModerationComplete?.(result);

        if (result.autoAction === 'block') {
          onBlocked?.(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('Content moderation error:', error);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [contentId, contentType, authorId, onModerationComplete, onBlocked]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    checkContent: autoCheck ? checkContent : undefined,
    manualCheck,
    isChecking,
    lastResult,
    error,
    isFlagged: lastResult?.flagged || false,
    severity: lastResult?.severity,
    autoAction: lastResult?.autoAction,
    suggestions: lastResult?.suggestions || [],
  };
}
