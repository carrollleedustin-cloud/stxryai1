'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HolographicTextProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const HolographicText = ({
  text,
  className = '',
  size = 'lg',
  animated = true,
}: HolographicTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  useEffect(() => {
    const element = ref.current;
    if (!element || !animated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty('--mouse-x', `${x}%`);
      element.style.setProperty('--mouse-y', `${y}%`);
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [animated]);

  return (
    <motion.div
      ref={ref}
      className={`holographic-text ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.2, y: -5 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default HolographicText;
