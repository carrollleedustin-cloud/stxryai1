'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SentientCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springX = useSpring(cursorX, { stiffness: 500, damping: 30 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 30 });

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
      
      // Add to trail
      setTrail(prev => {
        const newTrail = [{ x: e.clientX, y: e.clientY, id: Date.now() }, ...prev];
        return newTrail.slice(0, 8); // Keep last 8 positions
      });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('predatory-hover')
      );
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          left: -10,
          top: -10,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: isHovering ? 'var(--neon-magenta)' : 'var(--neon-cyan)',
            boxShadow: isHovering ? 'var(--glow-magenta)' : 'var(--glow-cyan)',
            background: isHovering ? 'rgba(255, 0, 255, 0.1)' : 'transparent',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: isHovering 
              ? 'radial-gradient(circle, var(--neon-magenta) 0%, transparent 70%)'
              : 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)',
            opacity: 0.3,
          }}
        />
      </motion.div>

      {/* Trail */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: point.x,
            top: point.y,
            width: `${8 - index}px`,
            height: `${8 - index}px`,
            background: `rgba(0, 255, 255, ${0.3 - index * 0.03})`,
            border: `1px solid rgba(0, 255, 255, ${0.5 - index * 0.05})`,
            boxShadow: 'var(--glow-cyan)',
            x: -4 + index * 0.5,
            y: -4 + index * 0.5,
          }}
          animate={{
            opacity: [0.3, 0.1, 0],
            scale: [1, 0.5, 0],
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.05,
          }}
        />
      ))}
    </>
  );
};

export default SentientCursor;

