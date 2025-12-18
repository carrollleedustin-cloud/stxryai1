'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxContainer({ children, className = '' }: ParallaxContainerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

