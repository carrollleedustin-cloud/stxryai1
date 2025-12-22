'use client';

import React, { useRef, ReactNode } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

interface TemporalRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

/**
 * TEMPORAL REVEAL
 * Content that materializes as you scroll into its dimension.
 * Like light finding form in darkness.
 */
export default function TemporalReveal({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.8,
  className = '',
  once = true,
  threshold = 0.2,
}: TemporalRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  
  const directionConfig = {
    up: { y: 60, x: 0, scale: 1 },
    down: { y: -60, x: 0, scale: 1 },
    left: { y: 0, x: 60, scale: 1 },
    right: { y: 0, x: -60, scale: 1 },
    scale: { y: 0, x: 0, scale: 0.9 },
    fade: { y: 0, x: 0, scale: 1 },
  };
  
  const config = directionConfig[direction];
  
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: config.y,
        x: config.x,
        scale: config.scale,
      }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * PARALLAX DEPTH
 * Elements that move at different speeds, creating dimensional depth
 */
export function ParallaxDepth({
  children,
  depth = 0.2,
  className = '',
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-100 * depth, 100 * depth]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * STAGGER CONTAINER
 * Children reveal in sequence, like ripples in still water
 */
export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 40,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SCROLL FADE
 * Element that fades based on scroll position
 */
export function ScrollFade({
  children,
  className = '',
  fadeStart = 0.8,
  fadeEnd = 1,
}: {
  children: ReactNode;
  className?: string;
  fadeStart?: number;
  fadeEnd?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  
  const opacity = useTransform(scrollYProgress, [0, fadeStart, fadeEnd], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, fadeStart, fadeEnd], [1, 1, 0.95]);
  
  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * DIMENSIONAL LAYER
 * Creates depth through perspective transforms on scroll
 */
export function DimensionalLayer({
  children,
  layer = 1,
  className = '',
}: {
  children: ReactNode;
  layer?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [
    -50 * layer,
    0,
    50 * layer,
  ]);
  
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [
    0.5,
    1,
    1,
    0.5,
  ]);
  
  return (
    <motion.div
      ref={ref}
      style={{
        z,
        opacity,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

