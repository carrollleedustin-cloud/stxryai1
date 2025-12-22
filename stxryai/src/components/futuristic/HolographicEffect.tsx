'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface HolographicEffectProps {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}

const HolographicEffect = ({ 
  children, 
  intensity = 1, 
  speed = 2,
  className = '' 
}: HolographicEffectProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty('--mouse-x', `${x}%`);
      element.style.setProperty('--mouse-y', `${y}%`);
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative holographic-wrapper ${className}`}
      style={{
        '--intensity': intensity,
        '--speed': `${speed}s`,
      } as React.CSSProperties}
    >
      <div className="holographic-shimmer" />
      <div className="holographic-content">{children}</div>
    </div>
  );
};

export default HolographicEffect;

