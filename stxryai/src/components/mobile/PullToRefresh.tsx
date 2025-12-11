'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const iconRotate = useTransform(y, [0, threshold], [0, 360]);
  const iconScale = useTransform(y, [0, threshold], [0.5, 1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setCanRefresh(container.scrollTop === 0);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (disabled || !canRefresh || isRefreshing) {
      y.set(0);
      return;
    }

    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull Indicator */}
      <motion.div
        style={{
          height: useTransform(y, (value) => Math.min(value, threshold)),
        }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{
            rotate: isRefreshing ? 0 : iconRotate,
            scale: iconScale,
          }}
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          className="text-4xl"
        >
          {isRefreshing ? '⏳' : '↻'}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag={canRefresh && !disabled ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        style={{ y }}
        onDragEnd={handleDragEnd}
        className="h-full overflow-y-auto overscroll-none"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Simplified hook version
export function usePullToRefresh(onRefresh: () => Promise<void>, enabled = true) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const threshold = 100;

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY !== 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        if (distance > threshold / 2) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      startY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isRefreshing, pullDistance, onRefresh, threshold]);

  return { isRefreshing, pullDistance, threshold };
}

// Visual indicator component for hook version
export function PullToRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
}: {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
}) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
        y: pullDistance > 0 || isRefreshing ? 0 : -50,
      }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-sm rounded-full p-4 shadow-lg"
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : { rotate: rotation }}
        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        className="text-3xl"
      >
        {isRefreshing ? '⏳' : '↻'}
      </motion.div>
    </motion.div>
  );
}
