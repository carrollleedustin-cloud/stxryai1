'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

interface SentientReaderProps {
  content: string;
  title?: string;
  choices?: Array<{ id: string; text: string; onClick: () => void }>;
}

const SentientReader = ({ content, title, choices = [] }: SentientReaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<Array<{ text: string; index: number }>>([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [readingPace, setReadingPace] = useState(1);
  const [scrollTension, setScrollTension] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isStalking, setIsStalking] = useState(false);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const textOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.3]);

  // Parse content into words with punctuation handling
  useEffect(() => {
    const regex = /(\S+|\s+)/g;
    const matches = content.match(regex) || [];
    const wordArray = matches
      .filter((m) => m.trim().length > 0)
      .map((text, index) => ({ text, index }));
    setWords(wordArray);
  }, [content]);

  // Track scroll and reading behavior
  useEffect(() => {
    let lastScrollTop = 0;
    let lastTime = Date.now();
    let velocityHistory: number[] = [];

    const handleScroll = () => {
      if (!containerRef.current) return;

      const currentScroll = containerRef.current.scrollTop;
      const now = Date.now();
      const timeDelta = now - lastTime;

      if (timeDelta > 0) {
        const velocity = Math.abs(currentScroll - lastScrollTop) / timeDelta;
        velocityHistory.push(velocity);
        if (velocityHistory.length > 10) velocityHistory.shift();

        const avgVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;

        // Calculate reading pace
        if (avgVelocity > 0.8) {
          setReadingPace(1.8);
        } else if (avgVelocity < 0.15) {
          setReadingPace(0.6);
        } else {
          setReadingPace(1);
        }

        // Calculate scroll tension
        const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        const progress = currentScroll / maxScroll;
        setScrollTension(progress);

        // Update visible word range
        const containerRect = containerRef.current.getBoundingClientRect();
        const wordElements = containerRef.current.querySelectorAll('.word-stalk');
        const visible: number[] = [];

        wordElements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
            visible.push(index);
          }
        });

        if (visible.length > 0) {
          setVisibleRange({ start: visible[0], end: visible[visible.length - 1] });
        }
      }

      lastScrollTop = currentScroll;
      lastTime = now;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Mouse tracking for stalking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsStalking(true);
    };

    const handleMouseLeave = () => setIsStalking(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Calculate stalk offset for each word
  const getStalkOffset = useCallback(
    (wordIndex: number, element: HTMLElement | null) => {
      if (!element || !isStalking) return { x: 0, y: 0 };

      const rect = element.getBoundingClientRect();
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + rect.height / 2;

      const deltaX = mousePosition.x - wordCenterX;
      const deltaY = mousePosition.y - wordCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 400;

      if (distance > maxDistance) return { x: 0, y: 0 };

      const intensity = (1 - distance / maxDistance) * 8;

      return {
        x: (deltaX / distance) * intensity,
        y: (deltaY / distance) * intensity,
      };
    },
    [mousePosition, isStalking]
  );

  // Word emergence delay
  const getWordDelay = (index: number) => {
    const baseDelay = index * (0.03 / readingPace);
    const randomOffset = (Math.random() - 0.5) * 0.15;
    return Math.max(0, baseDelay + randomOffset);
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
      {/* Scroll Tension Indicator */}
      <motion.div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
        style={{
          width: '2px',
          height: '200px',
          background: 'rgba(0, 255, 255, 0.2)',
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: `${scrollTension * 100}%`,
            background: 'var(--neon-cyan)',
            boxShadow: 'var(--glow-cyan)',
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="sentient-container void-space max-w-4xl mx-auto"
      >
        {title && (
          <motion.h1
            className="neon-text breathing-text text-5xl md:text-7xl mb-16 font-mono"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {title}
          </motion.h1>
        )}

        {/* Text Content - Words that stalk */}
        <div className="space-y-4 text-lg md:text-xl leading-relaxed">
          {words.map((word, index) => {
            const isVisible = index >= visibleRange.start && index <= visibleRange.end;
            const wordRef = useRef<HTMLSpanElement>(null);
            const stalk = getStalkOffset(index, wordRef.current);

            return (
              <motion.span
                key={index}
                ref={wordRef}
                className="word-stalk word-fracture inline-block mr-2"
                initial={{
                  opacity: 0,
                  y: 30,
                  filter: 'blur(15px)',
                }}
                animate={{
                  opacity: isVisible ? 1 : 0.2,
                  y: 0,
                  filter: isVisible ? 'blur(0px)' : 'blur(8px)',
                  x: stalk.x,
                  y: stalk.y,
                  scale: isVisible ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.8,
                  delay: getWordDelay(index),
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{
                  scale: 1.15,
                  textShadow: 'var(--glow-cyan)',
                  transition: { duration: 0.15 },
                }}
                style={{
                  color: isVisible
                    ? `hsl(${180 + Math.sin(index * 0.1) * 30}, 100%, ${50 + Math.sin(index * 0.15) * 15}%)`
                    : 'rgba(0, 255, 255, 0.15)',
                  fontSize: `${16 + Math.sin(index * 0.08) * 3}px`,
                }}
              >
                {word.text}
              </motion.span>
            );
          })}
        </div>

        {/* Choices - Predatory Buttons */}
        {choices.length > 0 && (
          <motion.div
            className="mt-16 space-y-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: words.length * 0.03, duration: 1 }}
          >
            {choices.map((choice, index) => (
              <motion.button
                key={choice.id}
                onClick={choice.onClick}
                className="w-full glass-void predatory-hover p-6 rounded-lg neon-border text-left group"
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: words.length * 0.03 + index * 0.1 }}
              >
                <span className="neon-text text-lg font-mono flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-150 transition-transform" />
                  {choice.text}
                  <ArrowRight
                    className="ml-auto group-hover:translate-x-2 transition-transform"
                    size={20}
                  />
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Bleed Effect */}
        <motion.div
          className="bleed-effect mt-16"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};

export default SentientReader;
