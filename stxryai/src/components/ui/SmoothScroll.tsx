'use client';

import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 origin-left z-50"
        style={{ scaleX }}
      />
      {children}
    </>
  );
}
