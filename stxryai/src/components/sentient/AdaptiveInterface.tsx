'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveInterfaceProps {
  children: React.ReactNode;
}

const AdaptiveInterface = ({ children }: AdaptiveInterfaceProps) => {
  const [isClient, setIsClient] = useState(false);
  const [behavior, setBehavior] = useState({
    scrollSpeed: 0,
    mouseVelocity: 0,
    timeOnPage: 0,
    interactionCount: 0,
    readingPace: 1,
  });
  
  const [mood, setMood] = useState<'neutral' | 'aggressive' | 'contemplative' | 'predatory'>('neutral');
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0, time: Date.now() });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine mood based on behavior - separate effect to avoid nesting
  useEffect(() => {
    if (behavior.scrollSpeed > 0.8 && behavior.mouseVelocity > 0.5) {
      setMood('aggressive');
    } else if (behavior.scrollSpeed < 0.1 && behavior.mouseVelocity < 0.1) {
      setMood('contemplative');
    } else if (behavior.interactionCount > 10 && behavior.mouseVelocity > 0.3) {
      setMood('predatory');
    } else {
      setMood('neutral');
    }
  }, [behavior]);

  useEffect(() => {
    let lastScrollTop = 0;
    let lastScrollTime = Date.now();
    let interactionTimer: NodeJS.Timeout;

    const trackScroll = () => {
      if (!containerRef.current) return;
      const currentScroll = containerRef.current.scrollTop;
      const now = Date.now();
      const speed = Math.abs(currentScroll - lastScrollTop) / (now - lastScrollTime);
      
      setBehavior(prev => ({
        ...prev,
        scrollSpeed: speed,
        readingPace: speed > 0.5 ? 1.5 : speed < 0.1 ? 0.7 : 1,
      }));
      
      lastScrollTop = currentScroll;
      lastScrollTime = now;
    };

    const trackMouse = (e: MouseEvent) => {
      const now = Date.now();
      const timeDelta = now - lastMousePosition.time;
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastMousePosition.x, 2) +
        Math.pow(e.clientY - lastMousePosition.y, 2)
      );
      const velocity = timeDelta > 0 ? distance / timeDelta : 0;
      
      setBehavior(prev => ({
        ...prev,
        mouseVelocity: velocity,
        interactionCount: prev.interactionCount + 1,
      }));
      
      setLastMousePosition({ x: e.clientX, y: e.clientY, time: now });
    };

    const trackTime = () => {
      setBehavior(prev => ({
        ...prev,
        timeOnPage: prev.timeOnPage + 1,
      }));
    };

    if (!isClient || typeof window === 'undefined') return;

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', trackScroll, { passive: true });
      window.addEventListener('mousemove', trackMouse);
      const timeInterval = setInterval(trackTime, 1000);
      
      return () => {
        container.removeEventListener('scroll', trackScroll);
        window.removeEventListener('mousemove', trackMouse);
        clearInterval(timeInterval);
        clearTimeout(interactionTimer);
      };
    }
  }, [lastMousePosition, isClient]);

  // Mood-based styling
  const getMoodStyles = () => {
    switch (mood) {
      case 'aggressive':
        return {
          filter: 'brightness(1.2) contrast(1.1)',
          animation: 'neon-pulse 1s ease-in-out infinite',
        };
      case 'contemplative':
        return {
          filter: 'brightness(0.9) contrast(0.95)',
          animation: 'breathe 4s ease-in-out infinite',
        };
      case 'predatory':
        return {
          filter: 'brightness(1.1) contrast(1.15) saturate(1.2)',
          animation: 'ritual-float 3s ease-in-out infinite',
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={containerRef}
      className="adaptive-interface"
      style={{
        minHeight: '100vh',
        position: 'relative',
        ...(isClient ? getMoodStyles() : {}),
      }}
      suppressHydrationWarning
    >
      {/* Behavior Indicator - Only render on client */}
      {isClient && (
        <motion.div
          className="fixed top-4 left-4 z-50 glass-void px-4 py-2 rounded"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-xs neon-text">
            <div>Pace: {behavior.readingPace.toFixed(1)}x</div>
            <div>Mood: {mood}</div>
            <div>Time: {behavior.timeOnPage}s</div>
          </div>
        </motion.div>
      )}

      {/* Adaptive Overlay Effects - Only render on client */}
      {isClient && (
        <AnimatePresence>
          {mood === 'predatory' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 0, 255, 0.2) 0%, transparent 50%)',
              }}
            />
          )}
        </AnimatePresence>
      )}

      {children}
    </div>
  );
};

export default AdaptiveInterface;

