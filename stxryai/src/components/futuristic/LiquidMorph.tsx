'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LiquidMorphProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const LiquidMorph = ({ children, className = '', intensity = 0.3 }: LiquidMorphProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animate = () => {
      timeRef.current += 0.02;
      const time = timeRef.current;

      // Create liquid morphing effect using CSS filters
      const wave1 = Math.sin(time) * intensity;
      const wave2 = Math.cos(time * 1.3) * intensity;
      const wave3 = Math.sin(time * 0.7) * intensity;

      element.style.setProperty('--wave-1', `${wave1}`);
      element.style.setProperty('--wave-2', `${wave2}`);
      element.style.setProperty('--wave-3', `${wave3}`);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity]);

  return (
    <motion.div
      ref={ref}
      className={`liquid-morph ${className}`}
      style={
        {
          '--intensity': intensity,
        } as React.CSSProperties
      }
    >
      {children}
    </motion.div>
  );
};

export default LiquidMorph;
