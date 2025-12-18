'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
}

export function Confetti({
  trigger,
  count = 50,
  colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
  duration = 3,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, duration * 1000);
    }
  }, [trigger, count, colors, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              rotate: particle.rotation,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              rotate: particle.rotation + 360,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

