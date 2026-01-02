'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon' | 'holographic' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// ============================================================================
// MODERN BUTTON COMPONENT
// ============================================================================

export default function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}: ModernButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
        };

      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        };

      case 'ghost':
        return {
          background: 'transparent',
          color: '#8b5cf6',
          border: 'none',
        };

      case 'neon':
        return {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#8b5cf6',
          border: '2px solid #8b5cf6',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 10px rgba(139, 92, 246, 0.2)',
          textShadow: '0 0 10px rgba(139, 92, 246, 0.8)',
        };

      case 'holographic':
        return {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2), rgba(251, 191, 36, 0.2))',
          color: '#ffffff',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative' as const,
        };

      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
          backgroundSize: '200% 200%',
          color: '#ffffff',
          border: 'none',
          animation: 'gradient 3s ease infinite',
        };

      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'xl':
        return 'px-10 py-5 text-xl';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative rounded-xl font-semibold transition-all duration-300
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={getVariantStyles()}
    >
      {/* Holographic border effect */}
      {variant === 'holographic' && (
        <div
          className="absolute inset-0 rounded-xl opacity-70"
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

      {/* Content */}
      <span className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="animate-spin" size={18} />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </span>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          }}
        />
      </motion.div>
    </motion.button>
  );
}
