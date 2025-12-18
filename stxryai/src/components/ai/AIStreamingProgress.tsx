'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AIStreamingProgressProps {
  isStreaming: boolean;
  progress?: number; // 0-100
  message?: string;
  estimatedTime?: number; // seconds
  tokensUsed?: number;
  estimatedCost?: number;
}

export function AIStreamingProgress({
  isStreaming,
  progress = 0,
  message = 'Generating with AI...',
  estimatedTime,
  tokensUsed,
  estimatedCost,
}: AIStreamingProgressProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!isStreaming) return null;

  return (
    <div className="w-full space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{message}{dots}</span>
          {progress > 0 && <span className="text-muted-foreground">{Math.round(progress)}%</span>}
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: progress > 0 ? `${progress}%` : '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
        <div className="flex items-center gap-4">
          {tokensUsed !== undefined && (
            <div className="flex items-center gap-1">
              <span>📊</span>
              <span>{tokensUsed.toLocaleString()} tokens</span>
            </div>
          )}
          {estimatedCost !== undefined && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>~${estimatedCost.toFixed(4)}</span>
            </div>
          )}
        </div>
        {estimatedTime !== undefined && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>~{estimatedTime}s remaining</span>
          </div>
        )}
      </div>

      {/* Animated Icon */}
      <div className="flex justify-center pt-2">
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      </div>
    </div>
  );
}

