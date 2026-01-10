'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphismProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  border?: boolean;
  hover?: boolean;
}

export function Glassmorphism({
  children,
  className = '',
  blur = 'lg',
  opacity = 0.8,
  border = true,
  hover = false,
}: GlassmorphismProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const baseClasses = `${blurClasses[blur]} bg-white/10 dark:bg-black/10 ${border ? 'border border-white/20 dark:border-white/10' : ''} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ scale: 1.02, opacity: 1 }}
        style={{ opacity }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} style={{ opacity }}>
      {children}
    </div>
  );
}
