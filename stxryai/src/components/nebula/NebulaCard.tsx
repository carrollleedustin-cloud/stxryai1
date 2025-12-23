'use client';

import React, { useRef, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * NEBULA CARD
 * A sentient card that responds to your presence.
 * It knows when you're looking at it.
 */

interface NebulaCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'violet' | 'pink' | 'gold' | 'rainbow';
  intensity?: 'subtle' | 'medium' | 'intense';
  hover3D?: boolean;
  onClick?: () => void;
}

const GLOW_COLORS = {
  cyan: {
    primary: '#00ffd5',
    secondary: '#00c8ff',
    glow: '0 0 40px rgba(0,255,213,0.3), 0 0 80px rgba(0,255,213,0.15)',
  },
  violet: {
    primary: '#8020ff',
    secondary: '#c020ff',
    glow: '0 0 40px rgba(128,32,255,0.3), 0 0 80px rgba(128,32,255,0.15)',
  },
  pink: {
    primary: '#ff40c0',
    secondary: '#ff4080',
    glow: '0 0 40px rgba(255,64,192,0.3), 0 0 80px rgba(255,64,192,0.15)',
  },
  gold: {
    primary: '#ffc040',
    secondary: '#ff8040',
    glow: '0 0 40px rgba(255,192,64,0.3), 0 0 80px rgba(255,192,64,0.15)',
  },
  rainbow: {
    primary: '#00ffd5',
    secondary: '#ff40c0',
    glow: '0 0 40px rgba(0,255,213,0.2), 0 0 40px rgba(255,64,192,0.2)',
  },
};

export function NebulaCard({
  children,
  className = '',
  glowColor = 'cyan',
  intensity = 'medium',
  hover3D = true,
  onClick,
}: NebulaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hover3D) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [hover3D, mouseX, mouseY]);
  
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);
  
  const colors = GLOW_COLORS[glowColor];
  const opacityMultiplier = intensity === 'subtle' ? 0.5 : intensity === 'intense' ? 1.5 : 1;

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-[20px] ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        rotateX: hover3D ? rotateX : 0,
        rotateY: hover3D ? rotateY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-[20px]"
        style={{
          padding: '1px',
          background: glowColor === 'rainbow'
            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, #8020ff 100%)`
            : `linear-gradient(135deg, ${colors.primary}40, transparent 50%, ${colors.secondary}40)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: isHovered ? opacityMultiplier : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        animate={{
          boxShadow: isHovered ? colors.glow : 'none',
          opacity: isHovered ? opacityMultiplier : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none"
        initial={false}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            transform: 'translateX(-100%)',
          }}
          animate={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </motion.div>
      
      {/* Card content */}
      <div
        className="relative rounded-[20px] p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(12,12,30,0.9) 0%, rgba(18,18,40,0.85) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          transform: 'translateZ(0)',
        }}
      >
        {children}
      </div>
      
      {/* Spotlight effect following mouse */}
      {hover3D && (
        <motion.div
          className="absolute inset-0 rounded-[20px] pointer-events-none overflow-hidden"
          style={{ opacity: isHovered ? 0.5 : 0 }}
        >
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}20, transparent 70%)`,
              x: useTransform(mouseX, [-0.5, 0.5], ['-25%', '75%']),
              y: useTransform(mouseY, [-0.5, 0.5], ['-25%', '75%']),
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * NEBULA CARD STACK
 * Cards that exist in layers of reality
 */
interface CardStackProps {
  children: ReactNode[];
  className?: string;
}

export function NebulaCardStack({ children, className = '' }: CardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <div className={`relative ${className}`} style={{ perspective: '1500px' }}>
      {React.Children.map(children, (child, index) => {
        const offset = index - activeIndex;
        const isActive = index === activeIndex;
        
        return (
          <motion.div
            key={index}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{
              z: offset * -50,
              y: offset * 20,
              scale: 1 - Math.abs(offset) * 0.05,
              opacity: 1 - Math.abs(offset) * 0.3,
              rotateX: offset * -2,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setActiveIndex(index)}
            whileHover={!isActive ? { scale: 1 - Math.abs(offset) * 0.05 + 0.02 } : undefined}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}

export default NebulaCard;


