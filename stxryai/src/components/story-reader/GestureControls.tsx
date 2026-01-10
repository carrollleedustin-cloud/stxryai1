'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GESTURE CONTROLS
 * Advanced touch and gesture recognition for immersive reading
 */
interface GestureControlsProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: (position: { x: number; y: number }) => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  onDraw?: (path: Array<{ x: number; y: number; time: number }>) => void;
  sensitivity?: number;
  enableHapticFeedback?: boolean;
  showGestureHints?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
  id: number;
}

export const GestureControls: React.FC<GestureControlsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onPinch,
  onLongPress,
  onDraw,
  sensitivity = 1,
  enableHapticFeedback = true,
  showGestureHints = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [gestureStart, setGestureStart] = useState<{ x: number; y: number; time: number } | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState<Array<{ x: number; y: number; time: number }>>([]);
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [gestureHint, setGestureHint] = useState<string>('');

  // Haptic feedback
  const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback) return;

    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(patterns[pattern]);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      id: touch.identifier,
    };

    setTouches([touchPoint]);
    setGestureStart({ x: touchPoint.x, y: touchPoint.y, time: touchPoint.time });

    // Start long press timer
    const timer = setTimeout(() => {
      triggerHaptic('medium');
      onLongPress?.({ x: touchPoint.x, y: touchPoint.y });
      setGestureHint('Long press detected');
      setTimeout(() => setGestureHint(''), 2000);
    }, 500);
    setLongPressTimer(timer);

    // Start drawing if multi-touch or specific gesture
    if (e.touches.length === 1 && onDraw) {
      setIsDrawing(true);
      setDrawPath([touchPoint]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touch = e.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      id: touch.identifier,
    };

    setTouches([currentPoint]);

    // Update draw path
    if (isDrawing) {
      setDrawPath((prev) => [...prev, currentPoint]);
    }

    // Pinch gesture detection
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Compare with initial distance (simplified)
      const initialDistance = 100; // This should be stored from touch start
      const scale = distance / initialDistance;
      onPinch(scale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const endTime = Date.now();
    const touch = e.changedTouches[0];

    if (!gestureStart) return;

    const deltaX = touch.clientX - gestureStart.x;
    const deltaY = touch.clientY - gestureStart.y;
    const deltaTime = endTime - gestureStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Minimum distance and time thresholds
    const minDistance = 50 * sensitivity;
    const maxTime = 500;

    // Detect gestures
    if (distance > minDistance && deltaTime < maxTime) {
      // Swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          triggerHaptic('light');
          onSwipeRight?.();
          setGestureHint('Swipe right');
        } else {
          triggerHaptic('light');
          onSwipeLeft?.();
          setGestureHint('Swipe left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          triggerHaptic('light');
          onSwipeDown?.();
          setGestureHint('Swipe down');
        } else {
          triggerHaptic('light');
          onSwipeUp?.();
          setGestureHint('Swipe up');
        }
      }
    } else if (distance < 20 && deltaTime < 300) {
      // Tap gesture
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTap;

      if (timeSinceLastTap < 300) {
        // Double tap
        triggerHaptic('medium');
        onDoubleTap?.();
        setGestureHint('Double tap');
        setLastTap(0);
      } else {
        // Single tap
        triggerHaptic('light');
        onTap?.({ x: touch.clientX, y: touch.clientY });
        setGestureHint('Tap');
        setLastTap(currentTime);
      }
    }

    // Finish drawing gesture
    if (isDrawing && drawPath.length > 5) {
      onDraw?.(drawPath);
      setGestureHint('Drawing gesture');
    }

    // Reset state
    setTouches([]);
    setGestureStart(null);
    setIsDrawing(false);
    setDrawPath([]);

    // Clear hint after delay
    setTimeout(() => setGestureHint(''), 1500);
  };

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    const touchPoint: TouchPoint = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      id: 0,
    };

    setTouches([touchPoint]);
    setGestureStart({ x: touchPoint.x, y: touchPoint.y, time: touchPoint.time });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touches.length === 0) return;

    const currentPoint: TouchPoint = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      id: 0,
    };

    setTouches([currentPoint]);

    if (isDrawing) {
      setDrawPath((prev) => [...prev, currentPoint]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!gestureStart) return;

    const endTime = Date.now();
    const deltaX = e.clientX - gestureStart.x;
    const deltaY = e.clientY - gestureStart.y;
    const deltaTime = endTime - gestureStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const minDistance = 30 * sensitivity;
    const maxTime = 500;

    if (distance > minDistance && deltaTime < maxTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          onSwipeRight?.();
          setGestureHint('Mouse swipe right');
        } else {
          onSwipeLeft?.();
          setGestureHint('Mouse swipe left');
        }
      } else {
        if (deltaY > 0) {
          onSwipeDown?.();
          setGestureHint('Mouse swipe down');
        } else {
          onSwipeUp?.();
          setGestureHint('Mouse swipe up');
        }
      }
    } else if (distance < 20 && deltaTime < 300) {
      onTap?.({ x: e.clientX, y: e.clientY });
      setGestureHint('Mouse click');
    }

    if (isDrawing && drawPath.length > 3) {
      onDraw?.(drawPath);
      setGestureHint('Mouse drawing');
    }

    setTouches([]);
    setGestureStart(null);
    setIsDrawing(false);
    setDrawPath([]);
    setTimeout(() => setGestureHint(''), 1500);
  };

  // Draw path visualization
  const renderDrawPath = () => {
    if (!isDrawing || drawPath.length < 2) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      >
        <motion.path
          d={`M ${drawPath.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
          stroke="rgba(0, 245, 212, 0.8)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    );
  };

  return (
    <>
      {/* Gesture overlay */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-40"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none' }}
      />

      {/* Draw path visualization */}
      {renderDrawPath()}

      {/* Gesture hint */}
      <AnimatePresence>
        {showGestureHints && gestureHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/80 text-white text-sm font-medium"
          >
            {gestureHint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch indicators */}
      {touches.map((touch, index) => (
        <motion.div
          key={touch.id}
          className="fixed z-50 pointer-events-none"
          style={{ left: touch.x - 25, top: touch.y - 25 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div className="w-12 h-12 rounded-full bg-spectral-cyan/30 border-2 border-spectral-cyan flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-spectral-cyan" />
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default GestureControls;
