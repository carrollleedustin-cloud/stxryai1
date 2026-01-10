'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * PORTAL EFFECT
 * A spinning, glowing portal that can wrap any content.
 * Perfect for highlighting special elements or transitions.
 */

interface PortalEffectProps {
  children?: ReactNode;
  size?: number;
  color?: 'cyan' | 'violet' | 'pink' | 'rainbow';
  intensity?: 'low' | 'medium' | 'high';
  spinning?: boolean;
  className?: string;
}

const COLORS = {
  cyan: ['#00ffd5', '#00c8ff', '#40ffb0'],
  violet: ['#8020ff', '#c020ff', '#6040ff'],
  pink: ['#ff40c0', '#ff4080', '#ff6090'],
  rainbow: ['#00ffd5', '#8020ff', '#ff40c0', '#ffc040'],
};

export function PortalEffect({
  children,
  size = 300,
  color = 'cyan',
  intensity = 'medium',
  spinning = true,
  className = '',
}: PortalEffectProps) {
  const colors = COLORS[color];
  const intensityOpacity = { low: 0.3, medium: 0.5, high: 0.8 };
  const opacity = intensityOpacity[intensity];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${colors.join(', ')}, ${colors[0]})`,
          opacity: opacity * 0.5,
          filter: 'blur(20px)',
        }}
        animate={spinning ? { rotate: 360 } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '10%',
          background: `conic-gradient(from 180deg, ${colors.join(', ')}, ${colors[0]})`,
          opacity: opacity * 0.7,
          filter: 'blur(10px)',
        }}
        animate={spinning ? { rotate: -360 } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '20%',
          background: `radial-gradient(circle, ${colors[0]}40 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [opacity, opacity * 1.2, opacity],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center mask */}
      <div className="absolute rounded-full bg-[#03030a]" style={{ inset: '25%' }} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * PARTICLE SYSTEM
 * Floating particles that add ambiance
 */
interface ParticleSystemProps {
  count?: number;
  color?: string;
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

export function ParticleSystem({
  count = 50,
  color = '#00ffd5',
  speed = 'medium',
  className = '',
}: ParticleSystemProps) {
  const speeds = { slow: 20, medium: 12, fast: 6 };
  const duration = speeds[speed];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const delay = Math.random() * duration;
        const particleDuration = duration + Math.random() * 10;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: '-10px',
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
            animate={{
              y: [0, -window.innerHeight - 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: particleDuration,
              delay: delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
}

export default PortalEffect;
