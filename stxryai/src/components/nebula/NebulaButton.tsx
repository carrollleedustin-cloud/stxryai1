'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/**
 * NEBULA BUTTON
 * Clickable portals to new dimensions.
 * Every click is a journey.
 */

interface NebulaButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'plasma' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  magnetic?: boolean;
}

const VARIANTS = {
  primary: {
    background: '#00ffd5',
    color: '#000000',
    hoverBg: '#40ffb0',
    glow: '0 0 40px rgba(0,255,213,0.4), 0 0 80px rgba(0,255,213,0.2)',
  },
  secondary: {
    background: 'linear-gradient(135deg, #8020ff, #c020ff)',
    color: '#ffffff',
    hoverBg: 'linear-gradient(135deg, #9040ff, #d040ff)',
    glow: '0 0 40px rgba(128,32,255,0.4), 0 0 80px rgba(128,32,255,0.2)',
  },
  ghost: {
    background: 'transparent',
    color: '#f0f0ff',
    hoverBg: 'rgba(255,255,255,0.05)',
    glow: '0 0 20px rgba(0,255,213,0.2)',
  },
  plasma: {
    background: 'linear-gradient(135deg, #ff6600, #ff40c0)',
    color: '#ffffff',
    hoverBg: 'linear-gradient(135deg, #ff8020, #ff60d0)',
    glow: '0 0 40px rgba(255,64,192,0.4), 0 0 80px rgba(255,102,0,0.2)',
  },
  danger: {
    background: '#ff3366',
    color: '#ffffff',
    hoverBg: '#ff5080',
    glow: '0 0 40px rgba(255,51,102,0.4)',
  },
};

const SIZES = {
  sm: { padding: '0.625rem 1.25rem', fontSize: '0.75rem', gap: '0.5rem' },
  md: { padding: '0.875rem 1.75rem', fontSize: '0.875rem', gap: '0.625rem' },
  lg: { padding: '1rem 2.25rem', fontSize: '1rem', gap: '0.75rem' },
  xl: { padding: '1.25rem 3rem', fontSize: '1.125rem', gap: '1rem' },
};

export function NebulaButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  href,
  onClick,
  className = '',
  magnetic = true,
}: NebulaButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];
  
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!magnetic || disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    
    setMagneticOffset({ x: offsetX, y: offsetY });
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMagneticOffset({ x: 0, y: 0 });
  };
  
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || loading) return;
    
    // Create ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    
    onClick?.();
  };
  
  const buttonContent = (
    <>
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: 'rgba(255,255,255,0.3)',
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 500, height: 500, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
      
      {/* Shimmer overlay */}
      <motion.span
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
          opacity: 0,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center" style={{ gap: sizeStyle.gap }}>
        {loading ? (
          <motion.span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </span>
    </>
  );
  
  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: variantStyle.color,
    background: variantStyle.background,
    border: variant === 'ghost' ? '1px solid rgba(255,255,255,0.15)' : 'none',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
  
  const MotionComponent = href ? motion.create(Link) : motion.button;
  
  return (
    <MotionComponent
      href={href as string}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      className={className}
      style={buttonStyles}
      whileHover={!disabled ? {
        scale: 1.02,
        y: -3,
        boxShadow: variantStyle.glow,
      } : undefined}
      whileTap={!disabled ? { scale: 0.98, y: 0 } : undefined}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {buttonContent}
    </MotionComponent>
  );
}

/**
 * FLOATING ACTION BUTTON
 * Always there when you need it
 */
interface FABProps {
  icon: ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'primary' | 'plasma';
}

export function NebulaFAB({ 
  icon, 
  onClick, 
  position = 'bottom-right',
  variant = 'primary',
}: FABProps) {
  const positionStyles = {
    'bottom-right': { bottom: '2rem', right: '2rem' },
    'bottom-left': { bottom: '2rem', left: '2rem' },
    'top-right': { top: '2rem', right: '2rem' },
    'top-left': { top: '2rem', left: '2rem' },
  };
  
  const colors = variant === 'primary' 
    ? { bg: '#00ffd5', glow: 'rgba(0,255,213,0.4)' }
    : { bg: 'linear-gradient(135deg, #ff6600, #ff40c0)', glow: 'rgba(255,64,192,0.4)' };
  
  return (
    <motion.button
      className="fixed z-50 w-16 h-16 rounded-full flex items-center justify-center text-black"
      style={{
        ...positionStyles[position],
        background: colors.bg,
        boxShadow: `0 4px 20px ${colors.glow}`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1, boxShadow: `0 8px 40px ${colors.glow}` }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {icon}
    </motion.button>
  );
}

export default NebulaButton;


