'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * NEBULA BACKGROUND
 * A living, breathing background that responds to user presence.
 * The cosmos awakens to your existence.
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  color: string;
}

interface NebulaBackgroundProps {
  variant?: 'cosmos' | 'aurora' | 'minimal' | 'kids' | 'subtle';
  interactive?: boolean;
  particleCount?: number;
  className?: string;
}

const COLORS = {
  cosmos: ['#00ffd5', '#8020ff', '#ff40c0', '#00c8ff'],
  aurora: ['#00ffd5', '#40ffb0', '#00d4aa', '#4080ff'],
  minimal: ['#ffffff', '#d0d0e8', '#9090b0'],
  kids: ['#9b5de5', '#f15bb5', '#fee440', '#00f5d4', '#00bbf9'],
  subtle: ['#00ffd5', '#8020ff', '#9090b0'],
};

export function NebulaBackground({
  variant = 'cosmos',
  interactive = true,
  particleCount = 100,
  className = '',
}: NebulaBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  // Initialize stars
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  useEffect(() => {
    if (dimensions.width === 0) return;
    
    const colors = COLORS[variant];
    const newStars: Star[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setStars(newStars);
  }, [dimensions, particleCount, variant]);
  
  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [interactive, mouseX, mouseY]);
  
  // Background gradient transforms based on mouse
  const gradientX = useTransform(smoothMouseX, [0, dimensions.width], [20, 80]);
  const gradientY = useTransform(smoothMouseY, [0, dimensions.height], [20, 80]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* Base gradient layer */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: variant === 'kids' 
            ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : variant === 'subtle'
            ? 'linear-gradient(180deg, #03030a 0%, #070714 50%, #0c0c1e 100%)'
            : 'linear-gradient(180deg, #000000 0%, #03030a 30%, #070714 60%, #0c0c1e 100%)',
        }}
      />
      
      {/* Interactive nebula clouds */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at ${gradientX}% ${gradientY}%, ${variant === 'kids' ? 'rgba(155,93,229,0.15)' : 'rgba(0,255,213,0.08)'} 0%, transparent 50%),
            radial-gradient(ellipse at ${100 - (gradientX.get() || 50)}% ${100 - (gradientY.get() || 50)}%, ${variant === 'kids' ? 'rgba(241,91,181,0.15)' : 'rgba(128,32,255,0.08)'} 0%, transparent 50%)
          `,
        }}
        onMouseMove={handleMouseMove}
      />
      
      {/* Animated nebula blob 1 */}
      <motion.div
        className="absolute"
        style={{
          width: '60vw',
          height: '60vw',
          left: '10%',
          top: '20%',
          background: variant === 'kids'
            ? 'radial-gradient(circle, rgba(155,93,229,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,255,213,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
          borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
        }}
        animate={{
          borderRadius: [
            '40% 60% 60% 40% / 60% 40% 60% 40%',
            '60% 40% 50% 50% / 40% 60% 40% 60%',
            '50% 50% 40% 60% / 50% 50% 60% 40%',
            '40% 60% 60% 40% / 60% 40% 60% 40%',
          ],
          x: [0, 50, -30, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Animated nebula blob 2 */}
      <motion.div
        className="absolute"
        style={{
          width: '50vw',
          height: '50vw',
          right: '10%',
          bottom: '20%',
          background: variant === 'kids'
            ? 'radial-gradient(circle, rgba(241,91,181,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(128,32,255,0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
          borderRadius: '60% 40% 50% 50% / 40% 60% 40% 60%',
        }}
        animate={{
          borderRadius: [
            '60% 40% 50% 50% / 40% 60% 40% 60%',
            '40% 60% 60% 40% / 60% 40% 60% 40%',
            '50% 50% 40% 60% / 50% 50% 60% 40%',
            '60% 40% 50% 50% / 40% 60% 40% 60%',
          ],
          x: [0, -40, 30, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Star field */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star) => (
          <motion.circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={star.color}
            initial={{ opacity: star.opacity * 0.3 }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.twinkleSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: `blur(${star.size > 2 ? 1 : 0}px)`,
            }}
          />
        ))}
      </svg>
      
      {/* Constellation lines (subtle) */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {stars.slice(0, 20).map((star, i) => {
          const nextStar = stars[(i + 1) % 20];
          if (!nextStar) return null;
          const distance = Math.hypot(nextStar.x - star.x, nextStar.y - star.y);
          if (distance > 300) return null;
          
          return (
            <motion.line
              key={`line-${i}`}
              x1={star.x}
              y1={star.y}
              x2={nextStar.x}
              y2={nextStar.y}
              stroke={COLORS[variant][0]}
              strokeWidth={0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          );
        })}
      </svg>
      
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

/**
 * SHOOTING STAR
 * Occasional magical moments
 */
export function ShootingStar({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-white"
      style={{
        top: `${Math.random() * 30}%`,
        left: `${Math.random() * 100}%`,
        boxShadow: '0 0 6px #fff, 0 0 12px #00ffd5',
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: [0, -200],
        y: [0, 200],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 10 + 5,
        ease: 'easeOut',
      }}
    >
      <div 
        className="absolute -top-px left-0 w-24 h-px"
        style={{
          background: 'linear-gradient(90deg, rgba(0,255,213,0.8), transparent)',
          transform: 'rotate(-45deg)',
          transformOrigin: 'left center',
        }}
      />
    </motion.div>
  );
}

export default NebulaBackground;


