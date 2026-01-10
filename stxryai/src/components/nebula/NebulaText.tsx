'use client';

import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

/**
 * NEBULA TEXT
 * Typography that tells stories before you even read it.
 * Words that breathe, glow, and come alive.
 */

interface NebulaTitleProps {
  children: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gradient?: 'nebula' | 'aurora' | 'sunset' | 'cosmos' | 'rainbow';
  animate?: boolean;
  className?: string;
}

const GRADIENTS = {
  nebula: 'linear-gradient(135deg, #8020ff 0%, #00ffd5 50%, #ff40c0 100%)',
  aurora: 'linear-gradient(135deg, #00ffd5 0%, #40ffb0 50%, #4080ff 100%)',
  sunset: 'linear-gradient(135deg, #ff6600 0%, #ff40c0 50%, #8020ff 100%)',
  cosmos: 'linear-gradient(135deg, #4080ff 0%, #8020ff 50%, #c020ff 100%)',
  rainbow: 'linear-gradient(90deg, #ff4080, #ff8040, #ffc040, #40ff80, #00ffd5, #6040ff, #8020ff)',
};

const SIZES = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl lg:text-5xl',
  lg: 'text-4xl md:text-5xl lg:text-6xl',
  xl: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
  '2xl': 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl',
};

export function NebulaTitle({
  children,
  size = 'lg',
  gradient = 'nebula',
  animate = true,
  className = '',
}: NebulaTitleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.h1
      ref={ref}
      className={`font-display leading-[0.9] tracking-tight ${SIZES[size]} ${className}`}
      style={{
        background: GRADIENTS[gradient],
        backgroundSize: animate ? '200% 200%' : '100% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
              backgroundPosition: animate ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%',
            }
          : {}
      }
      transition={{
        opacity: { duration: 0.6 },
        y: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        backgroundPosition: { duration: 8, repeat: Infinity, ease: 'linear' },
      }}
    >
      {children}
    </motion.h1>
  );
}

/**
 * SPLIT TEXT ANIMATION
 * Each letter emerges from the void
 */
interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  gradient?: boolean;
}

export function SplitText({
  children,
  className = '',
  delay = 0,
  stagger = 0.03,
  gradient = false,
}: SplitTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const letters = children.split('');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ perspective: '1000px' }}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          className="inline-block"
          variants={letterVariants}
          style={{
            transformOrigin: 'bottom',
            ...(gradient && {
              background: GRADIENTS.nebula,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }),
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * GLOWING TEXT
 * Text that pulses with inner light
 */
interface GlowTextProps {
  children: ReactNode;
  color?: 'cyan' | 'violet' | 'pink' | 'gold';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const GLOW_COLORS = {
  cyan: { color: '#00ffd5', glow: 'rgba(0,255,213,0.5)' },
  violet: { color: '#8020ff', glow: 'rgba(128,32,255,0.5)' },
  pink: { color: '#ff40c0', glow: 'rgba(255,64,192,0.5)' },
  gold: { color: '#ffc040', glow: 'rgba(255,192,64,0.5)' },
};

export function GlowText({
  children,
  color = 'cyan',
  intensity = 'medium',
  className = '',
}: GlowTextProps) {
  const glowStyle = GLOW_COLORS[color];
  const glowSizes = {
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 30px',
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        color: glowStyle.color,
        textShadow: `${glowSizes[intensity]} ${glowStyle.glow}`,
      }}
      animate={{
        textShadow: [
          `${glowSizes[intensity]} ${glowStyle.glow}`,
          `0 0 ${parseInt(glowSizes[intensity].split(' ')[2]) * 1.5}px ${glowStyle.glow}`,
          `${glowSizes[intensity]} ${glowStyle.glow}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * TYPEWRITER TEXT
 * Words appear as if being typed
 */
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  cursor = true,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startTyping = () => {
      setIsTyping(true);
      let i = 0;

      const typeNextChar = () => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
          timeout = setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
          onComplete?.();
        }
      };

      timeout = setTimeout(typeNextChar, delay);
    };

    startTyping();

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-1 bg-current"
          animate={{ opacity: isTyping ? 1 : [1, 0] }}
          transition={{
            opacity: isTyping ? {} : { duration: 0.5, repeat: Infinity },
          }}
        />
      )}
    </span>
  );
}

/**
 * MAGIC TEXT - Kids Zone
 * Fun, bouncy text for children
 */
interface MagicTextProps {
  children: string;
  color?: 'rainbow' | 'purple' | 'pink' | 'cyan' | 'gold';
  wobble?: boolean;
  bounce?: boolean;
  className?: string;
}

export function MagicText({
  children,
  color = 'rainbow',
  wobble = false,
  bounce = true,
  className = '',
}: MagicTextProps) {
  const letters = children.split('');
  const colors = ['#9b5de5', '#f15bb5', '#fee440', '#00f5d4', '#00bbf9'];

  return (
    <span className={`inline-flex ${className}`}>
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          className="inline-block font-bold"
          style={{
            color:
              color === 'rainbow'
                ? colors[i % colors.length]
                : GLOW_COLORS[color === 'gold' ? 'gold' : color]?.color || '#ffffff',
            textShadow: `0 0 20px ${colors[i % colors.length]}50`,
          }}
          animate={
            bounce
              ? {
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }
              : wobble
                ? {
                    rotate: [-5, 5, -5],
                  }
                : undefined
          }
          transition={{
            duration: 0.5,
            delay: i * 0.05,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * ANIMATED COUNTER
 * Numbers that count up with style
 */
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default NebulaTitle;
