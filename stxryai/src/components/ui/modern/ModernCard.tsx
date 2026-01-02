'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'gradient' | 'neumorphic' | 'holographic' | 'neon';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

// ============================================================================
// MODERN CARD COMPONENT
// ============================================================================

export default function ModernCard({
  children,
  variant = 'glass',
  hover = true,
  glow = false,
  className = '',
  onClick,
}: ModernCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        };

      case 'gradient':
        return {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
        };

      case 'neumorphic':
        return {
          background: '#1a1a1a',
          boxShadow: '12px 12px 24px #0d0d0d, -12px -12px 24px #272727',
          border: 'none',
        };

      case 'holographic':
        return {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1), rgba(251, 191, 36, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative' as const,
        };

      case 'neon':
        return {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #8b5cf6',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.1)',
        };

      default:
        return {};
    }
  };

  const hoverAnimation = hover
    ? {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <motion.div
      whileHover={hoverAnimation}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={getVariantStyles()}
    >
      {/* Holographic border effect */}
      {variant === 'holographic' && (
        <div
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #fbbf24)',
            zIndex: -1,
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-30 -z-10 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)',
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
