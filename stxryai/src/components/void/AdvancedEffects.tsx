'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

/**
 * GLASS CARD
 * A refined glassmorphism card with noise texture and light streaks
 */
export function GlassCard({
  children,
  className = '',
  intensity = 1,
  hoverEffect = true,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  hoverEffect?: boolean;
}) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl ${className}`}
      whileHover={hoverEffect ? { 
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        y: -5
      } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Grain/Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Light Streak */}
      <motion.div 
        className="absolute -inset-[100%] opacity-20 pointer-events-none"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent 20%, transparent 80%, rgba(255,255,255,0.1), transparent)',
        }}
      />

      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * BENTO GRID
 * A flexible grid layout for modern UI
 */
export function BentoGrid({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoItem({
  children,
  className = '',
  size = 'medium',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'tall' | 'wide';
}) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-2',
    tall: 'col-span-1 row-span-2',
    wide: 'col-span-1 md:col-span-3 row-span-1',
  };

  return (
    <GlassCard className={`${sizeClasses[size]} ${className}`}>
      {children}
    </GlassCard>
  );
}

/**
 * NOISE OVERLAY
 * A global or container-level noise texture
 */
export function NoiseOverlay({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/**
 * NARRATIVE CONSTELLATION
 * A unique node-based visualization for story paths
 */
export function NarrativeConstellation({
  nodes = [],
  connections = [],
  className = '',
}: {
  nodes?: { id: string; x: number; y: number; label: string; type?: 'choice' | 'event' | 'outcome' }[];
  connections?: { from: string; to: string }[];
  className?: string;
}) {
  return (
    <div className={`relative w-full aspect-video bg-void-black/20 rounded-3xl overflow-hidden border border-white/5 ${className}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--spectral-cyan)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--spectral-violet)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--spectral-cyan)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {connections.map((conn, i) => {
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (!from || !to) return null;
          return (
            <motion.line
              key={`${conn.from}-${conn.to}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: i * 0.1 
          }}
          className="absolute group cursor-pointer"
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`w-3 h-3 rounded-full blur-[2px] ${
                node.type === 'choice' ? 'bg-spectral-cyan' : 
                node.type === 'outcome' ? 'bg-spectral-rose' : 'bg-spectral-violet'
              }`}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              <div className="bg-void-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-ui uppercase tracking-widest text-white">
                {node.label}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Background Star Field Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              opacity: Math.random() 
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * HOLOGRAPHIC CARD
 * A card with holographic shimmer and parallax tilt effects
 */
export function HolographicCard({ 
  children, 
  className = '',
  glowColor = 'spectral-cyan',
  intensity = 1,
  enableTilt = true,
}: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: string;
  intensity?: number;
  enableTilt?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePos({ x, y });
    
    if (enableTilt) {
      rotateX.set((y - 0.5) * 20 * intensity);
      rotateY.set((x - 0.5) * -20 * intensity);
    }
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0.5, y: 0.5 });
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl bg-void-black/60 backdrop-blur-xl border border-white/10 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: enableTilt ? springRotateX : 0,
        rotateY: enableTilt ? springRotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      role="region"
      aria-label="Interactive holographic card"
    >
      {/* Holographic gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.4 * intensity : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, var(--${glowColor}) 0%, transparent 50%)`,
        }}
      />
      
      {/* Rainbow shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.15 * intensity : 0 }}
        style={{
          background: `linear-gradient(${135 + mousePos.x * 90}deg, 
            transparent 0%, 
            rgba(0, 245, 212, 0.2) 25%, 
            rgba(123, 44, 191, 0.2) 50%, 
            rgba(255, 107, 53, 0.2) 75%, 
            transparent 100%)`,
        }}
      />
      
      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: `inset 0 0 30px var(--${glowColor})10, 0 0 20px var(--${glowColor})20`,
        }}
      />
      
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * MORPHING BLOB
 * An animated blob that morphs between shapes
 */
export function MorphingBlob({
  className = '',
  color = 'spectral-cyan',
  size = 200,
  speed = 8,
}: {
  className?: string;
  color?: string;
  size?: number;
  speed?: number;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 blur-3xl"
        style={{ background: `var(--${color})` }}
        animate={{
          borderRadius: [
            '60% 40% 30% 70%/60% 30% 70% 40%',
            '30% 60% 70% 40%/50% 60% 30% 60%',
            '60% 40% 30% 70%/60% 30% 70% 40%',
          ],
          scale: [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * AURORA BACKDROP
 * Animated northern lights effect
 */
export function AuroraBackdrop({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary aurora */}
      <motion.div
        className="absolute -top-1/2 left-1/4 w-full h-full opacity-30"
        style={{
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              rgba(0, 245, 212, 0.1) 20%,
              rgba(123, 44, 191, 0.15) 40%,
              rgba(0, 245, 212, 0.1) 60%,
              transparent 100%
            )
          `,
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          scaleY: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Secondary aurora */}
      <motion.div
        className="absolute -top-1/4 right-1/4 w-3/4 h-full opacity-20"
        style={{
          background: `
            linear-gradient(
              200deg,
              transparent 0%,
              rgba(123, 44, 191, 0.15) 30%,
              rgba(255, 107, 53, 0.1) 60%,
              transparent 100%
            )
          `,
          filter: 'blur(50px)',
        }}
        animate={{
          x: ['10%', '-10%', '10%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * NEON TEXT
 * Text with animated neon glow effect
 */
export function NeonText({
  children,
  color = 'spectral-cyan',
  className = '',
  intensity = 1,
  flicker = false,
}: {
  children: string;
  color?: string;
  className?: string;
  intensity?: number;
  flicker?: boolean;
}) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      style={{
        color: `var(--${color})`,
        textShadow: `
          0 0 ${5 * intensity}px var(--${color}),
          0 0 ${10 * intensity}px var(--${color}),
          0 0 ${20 * intensity}px var(--${color}),
          0 0 ${40 * intensity}px var(--${color})
        `,
      }}
      animate={flicker ? {
        opacity: [1, 0.8, 1, 0.9, 1],
        textShadow: [
          `0 0 ${5 * intensity}px var(--${color}), 0 0 ${10 * intensity}px var(--${color}), 0 0 ${20 * intensity}px var(--${color}), 0 0 ${40 * intensity}px var(--${color})`,
          `0 0 ${3 * intensity}px var(--${color}), 0 0 ${6 * intensity}px var(--${color}), 0 0 ${12 * intensity}px var(--${color}), 0 0 ${24 * intensity}px var(--${color})`,
          `0 0 ${5 * intensity}px var(--${color}), 0 0 ${10 * intensity}px var(--${color}), 0 0 ${20 * intensity}px var(--${color}), 0 0 ${40 * intensity}px var(--${color})`,
        ],
      } : {}}
      transition={flicker ? { duration: 0.5, repeat: Infinity } : {}}
    >
      {children}
    </motion.span>
  );
}

/**
 * SCROLL PROGRESS INDICATOR
 * Visual indicator of page scroll progress
 */
export function ScrollProgressIndicator({ color = 'spectral-cyan' }: { color?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
      style={{
        scaleX,
        background: `linear-gradient(90deg, var(--${color}), var(--spectral-violet))`,
      }}
    />
  );
}

/**
 * PARALLAX SECTION
 * Section with parallax scrolling effect
 */
export function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-50 * speed}px`, `${50 * speed}px`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * CURSOR FOLLOWER
 * Custom cursor with trailing effect
 */
export function CursorFollower({ 
  enabled = true,
  color = 'spectral-cyan',
}: { 
  enabled?: boolean;
  color?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [data-cursor-hover]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [enabled, cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: `var(--${color})` }}
          animate={{
            scale: isHovering ? 1.5 : 1,
            opacity: isHovering ? 0.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>
      
      {/* Trailing dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
        }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: `var(--${color})` }}
        />
      </motion.div>
    </>
  );
}

/**
 * REVEAL ON SCROLL
 * Content that reveals with animation on scroll
 */
export function RevealOnScroll({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  threshold = 0.2,
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FLOATING ELEMENTS
 * Container that makes children float with different animations
 */
export function FloatingContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`relative ${className}`}>{children}</div>;
}

export function FloatingItem({
  children,
  delay = 0,
  duration = 6,
  distance = 15,
  rotation = 5,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  rotation?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
        rotate: [-rotation, rotation, -rotation],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * MAGNETIC ELEMENT
 * Element that follows cursor when nearby
 */
export function MagneticElement({
  children,
  className = '',
  strength = 0.3,
  distance = 100,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (dist < distance) {
      const force = (distance - dist) / distance;
      x.set(distanceX * strength * force);
      y.set(distanceY * strength * force);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [distance, strength, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

/**
 * SPLIT TEXT ANIMATION
 * Animates text letter by letter
 */
export function SplitTextAnimation({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  type = 'char',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  type?: 'char' | 'word';
}) {
  const parts = type === 'char' ? text.split('') : text.split(' ');
  
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {part === ' ' || type === 'word' ? `${part}\u00A0` : part}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * GRADIENT BORDER
 * Element with animated gradient border
 */
export function GradientBorder({
  children,
  className = '',
  borderWidth = 2,
  animationDuration = 4,
}: {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  animationDuration?: number;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-px rounded-2xl"
        style={{
          background: `linear-gradient(var(--rotation), var(--spectral-cyan), var(--spectral-violet), var(--spectral-rose), var(--spectral-cyan))`,
          backgroundSize: '300% 300%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Content container */}
      <div 
        className="relative bg-void-black rounded-2xl"
        style={{ margin: borderWidth }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * RIPPLE EFFECT
 * Creates ripple on click
 */
export function RippleButton({
  children,
  className = '',
  onClick,
  rippleColor = 'white',
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  rippleColor?: string;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 1000);
    
    onClick?.();
  };

  return (
    <button 
      className={`relative overflow-hidden ${className}`} 
      onClick={handleClick}
      aria-label={typeof children === 'string' ? children : 'Interactive button'}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
              opacity: 0.3,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0 }}
            animate={{ width: 500, height: 500, x: -250, y: -250, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

