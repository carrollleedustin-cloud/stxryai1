'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Check for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.style.cursor === 'pointer'
      );
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
        }}
        animate={{
          x: -10,
          y: -10,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 transition-all ${
            isHovering
              ? 'bg-white border-white scale-150'
              : 'bg-transparent border-white'
          }`}
        />
      </motion.div>

      {/* Cursor trail */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-[9998] mix-blend-difference"
          style={{
            left: position.x,
            top: position.y,
          }}
          animate={{
            x: -4,
            y: -4,
            scale: 1 - i * 0.2,
            opacity: 0.3 - i * 0.05,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
            delay: i * 0.05,
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white" />
        </motion.div>
      ))}

      {/* Ripple effect on click */}
      <motion.div
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 0, opacity: 0 }}
      />
    </>
  );
};

export default CustomCursor;

