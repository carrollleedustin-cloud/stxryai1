'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

interface PerformanceReaderProps {
  content: string;
  title?: string;
  onProgress?: (progress: number) => void;
}

const PerformanceReader = ({ content, title, onProgress }: PerformanceReaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<string[]>([]);
  const [visibleWords, setVisibleWords] = useState<Set<number>>(new Set());
  const [readingPace, setReadingPace] = useState(1);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isWatching, setIsWatching] = useState(false);
  
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 0.98]);

  // Parse content into words
  useEffect(() => {
    const parsed = content.split(/\s+/).filter(w => w.length > 0);
    setWords(parsed);
  }, [content]);

  // Track scroll velocity for adaptive behavior
  useEffect(() => {
    let lastScrollTop = 0;
    let velocityTimer: NodeJS.Timeout;

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const currentScroll = containerRef.current.scrollTop;
      const now = Date.now();
      const timeDelta = now - lastScrollTime;
      
      if (timeDelta > 0) {
        const velocity = Math.abs(currentScroll - lastScrollTop) / timeDelta;
        setScrollVelocity(velocity);
        setLastScrollTime(now);
        
        // Adapt reading pace based on scroll velocity
        if (velocity > 0.5) {
          setReadingPace(1.5); // Fast reader
        } else if (velocity < 0.1) {
          setReadingPace(0.7); // Slow, contemplative
        } else {
          setReadingPace(1);
        }
      }
      
      lastScrollTop = currentScroll;
      
      // Track visible words
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordElements = container.querySelectorAll('.word-emerge');
      
      const newVisible = new Set<number>();
      wordElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (
          rect.top < containerRect.bottom &&
          rect.bottom > containerRect.top
        ) {
          newVisible.add(index);
        }
      });
      
      setVisibleWords(newVisible);
      
      // Report progress
      if (onProgress && containerRef.current) {
        const progress = containerRef.current.scrollTop / 
          (containerRef.current.scrollHeight - containerRef.current.clientHeight);
        onProgress(Math.min(1, Math.max(0, progress)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(velocityTimer);
    };
  }, [lastScrollTime, onProgress]);

  // Mouse tracking for stalking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseEnter = () => setIsWatching(true);
    const handleMouseLeave = () => setIsWatching(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Word emergence animation
  const getWordDelay = (index: number) => {
    const baseDelay = index * (0.02 / readingPace);
    const randomOffset = (Math.random() - 0.5) * 0.1;
    return baseDelay + randomOffset;
  };

  // Calculate stalk transform based on mouse position
  const getStalkTransform = (wordIndex: number, wordElement: HTMLElement | null) => {
    if (!wordElement || !isWatching) return { x: 0, y: 0 };
    
    const rect = wordElement.getBoundingClientRect();
    const wordCenterX = rect.left + rect.width / 2;
    const wordCenterY = rect.top + rect.height / 2;
    
    const deltaX = mousePosition.x - wordCenterX;
    const deltaY = mousePosition.y - wordCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 300;
    
    if (distance > maxDistance) return { x: 0, y: 0 };
    
    const intensity = 1 - (distance / maxDistance);
    const maxOffset = 5;
    
    return {
      x: (deltaX / distance) * maxOffset * intensity,
      y: (deltaY / distance) * maxOffset * intensity,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="performance-engine h-screen overflow-y-auto hide-scrollbar"
      style={{ 
        background: 'var(--void-black)',
        position: 'relative',
      }}
    >
      {/* Watching Indicator */}
      {isWatching && (
        <motion.div
          className="watching-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            width: '12px',
            height: '12px',
            background: 'var(--neon-cyan)',
            borderRadius: '50%',
            boxShadow: 'var(--glow-cyan)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Scroll Tension Indicator */}
      <motion.div
        className="scroll-tension-indicator"
        style={{
          height: `${scrollYProgress.get() * 100}%`,
        }}
      />

      {/* Content Container */}
      <motion.div
        style={{ opacity, scale }}
        className="sentient-container void-space"
      >
        {title && (
          <motion.h1
            className="neon-text breathing-text text-6xl mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {title}
          </motion.h1>
        )}

        <div className="space-y-6">
          {words.map((word, index) => {
            const isVisible = visibleWords.has(index);
            const wordRef = useRef<HTMLSpanElement>(null);
            const stalk = getStalkTransform(index, wordRef.current);
            
            return (
              <motion.span
                key={index}
                ref={wordRef}
                className="word-emerge word-fracture inline-block mr-2"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{
                  opacity: isVisible ? 1 : 0.3,
                  y: 0,
                  filter: isVisible ? 'blur(0px)' : 'blur(5px)',
                  x: stalk.x,
                  y: stalk.y,
                  scale: isVisible ? 1 : 0.95,
                }}
                transition={{
                  duration: 0.6,
                  delay: getWordDelay(index),
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{
                  scale: 1.1,
                  textShadow: 'var(--glow-cyan)',
                  transition: { duration: 0.2 },
                }}
                style={{
                  fontSize: `${14 + Math.sin(index * 0.1) * 2}px`,
                  color: isVisible 
                    ? `hsl(${180 + Math.sin(index * 0.05) * 20}, 100%, ${50 + Math.sin(index * 0.1) * 10}%)`
                    : 'rgba(0, 255, 255, 0.2)',
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </div>

        {/* Bleed Effect */}
        <motion.div
          className="bleed-effect"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};

export default PerformanceReader;

