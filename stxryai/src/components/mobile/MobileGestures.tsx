'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// Swipeable Card Component
interface SwipeableCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export function SwipeableCard({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  threshold = 100,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // Horizontal swipe
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > threshold || velocity.x > 500) {
        onSwipeRight?.();
      } else if (offset.x < -threshold || velocity.x < -500) {
        onSwipeLeft?.();
      }
    }
    // Vertical swipe
    else {
      if (offset.y > threshold || velocity.y > 500) {
        onSwipeDown?.();
      } else if (offset.y < -threshold || velocity.y < -500) {
        onSwipeUp?.();
      }
    }

    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      style={{ x, y, rotate }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="cursor-grab"
    >
      {children}
    </motion.div>
  );
}

// Long Press Component
interface LongPressProps {
  onLongPress: () => void;
  onPress?: () => void;
  duration?: number;
  children: React.ReactNode;
}

export function LongPress({
  onLongPress,
  onPress,
  duration = 500,
  children,
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleStart = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, duration);
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      if (isPressed) {
        onPress?.();
      }
    }
    setIsPressed(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      {children}
      {isPressed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none"
        />
      )}
    </motion.div>
  );
}

// Pinch to Zoom Component
interface PinchToZoomProps {
  children: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
}

export function PinchToZoom({
  children,
  minZoom = 1,
  maxZoom = 4,
}: PinchToZoomProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastDistance = useRef(0);
  const isPinching = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching.current = true;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastDistance.current = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const delta = distance - lastDistance.current;
        const scaleChange = 1 + delta / 200;

        setScale((prev) => Math.max(minZoom, Math.min(maxZoom, prev * scaleChange)));
        lastDistance.current = distance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching.current = false;
        if (scale <= 1.1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, minZoom, maxZoom]);

  return (
    <motion.div
      drag={scale > 1}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      animate={{ scale, x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="touch-none"
    >
      {children}
    </motion.div>
  );
}

// Double Tap Component
interface DoubleTapProps {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
  children: React.ReactNode;
}

export function DoubleTap({
  onDoubleTap,
  onSingleTap,
  delay = 300,
  children,
}: DoubleTapProps) {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleTap = () => {
    setTapCount((prev) => prev + 1);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (tapCount === 0) {
        onSingleTap?.();
      } else if (tapCount === 1) {
        onDoubleTap();
      }
      setTapCount(0);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div onClick={handleTap} className="cursor-pointer">
      {children}
    </div>
  );
}

// Swipe to Reveal Component
interface SwipeToRevealProps {
  leftAction?: {
    icon: string;
    color: string;
    onAction: () => void;
  };
  rightAction?: {
    icon: string;
    color: string;
    onAction: () => void;
  };
  children: React.ReactNode;
  threshold?: number;
}

export function SwipeToReveal({
  leftAction,
  rightAction,
  children,
  threshold = 80,
}: SwipeToRevealProps) {
  const x = useMotionValue(0);
  const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (leftAction && info.offset.x > threshold) {
      setIsRevealed('left');
      x.set(80);
    } else if (rightAction && info.offset.x < -threshold) {
      setIsRevealed('right');
      x.set(-80);
    } else {
      setIsRevealed(null);
      x.set(0);
    }
  };

  const handleAction = (action: 'left' | 'right') => {
    if (action === 'left' && leftAction) {
      leftAction.onAction();
    } else if (action === 'right' && rightAction) {
      rightAction.onAction();
    }
    setIsRevealed(null);
    x.set(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Action */}
      {leftAction && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-start px-6"
          style={{ backgroundColor: leftAction.color }}
          onClick={() => handleAction('left')}
        >
          <span className="text-3xl">{leftAction.icon}</span>
        </motion.div>
      )}

      {/* Right Action */}
      {rightAction && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-6"
          style={{ backgroundColor: rightAction.color }}
          onClick={() => handleAction('right')}
        >
          <span className="text-3xl">{rightAction.icon}</span>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: rightAction ? -100 : 0,
          right: leftAction ? 100 : 0,
        }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-gray-900 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Haptic Feedback Hook (for supported devices)
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(30),
    success: () => vibrate([10, 50, 10]),
    warning: () => vibrate([20, 100, 20]),
    error: () => vibrate([30, 100, 30, 100, 30]),
    selection: () => vibrate(5),
  };
}
