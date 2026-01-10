'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ModerationResult } from '@/services/enhancedModerationService';
import Icon from '@/components/ui/AppIcon';

interface ModerationWarningProps {
  result: ModerationResult;
  onDismiss?: () => void;
  className?: string;
}

export function ModerationWarning({ result, onDismiss, className = '' }: ModerationWarningProps) {
  if (!result.flagged) {
    return null;
  }

  const severityColors = {
    low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    medium:
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200',
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    critical:
      'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
  };

  const severityIcons = {
    low: '⚠️',
    medium: '⚠️',
    high: '🚫',
    critical: '🚫',
  };

  const colorClass = severityColors[result.severity] || severityColors.low;
  const icon = severityIcons[result.severity] || '⚠️';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-lg border p-4 ${colorClass} ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold mb-1">
              {result.autoAction === 'block'
                ? 'Content Blocked'
                : result.autoAction === 'review'
                  ? 'Content Needs Review'
                  : 'Content Warning'}
            </div>
            <div className="text-sm opacity-90 mb-2">
              {result.severity === 'critical' || result.autoAction === 'block'
                ? 'This content violates our community guidelines and cannot be published.'
                : 'This content may need revision before publishing.'}
            </div>

            {result.suggestions.length > 0 && (
              <div className="mt-3 space-y-1">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-sm flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}

            {result.confidence > 0 && (
              <div className="mt-2 text-xs opacity-75">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
            )}
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
