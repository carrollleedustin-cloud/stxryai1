'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/**
 * MAGIC BUTTON - Kids Zone
 * Buttons that bounce, sparkle, and make you smile!
 * Every tap is an adventure.
 */

interface MagicButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  emoji?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #9b5de5 0%, #f15bb5 100%)',
    shadowColor: 'rgba(155,93,229,0.5)',
    hoverScale: 1.05,
  },
  secondary: {
    background: 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)',
    shadowColor: 'rgba(0,245,212,0.5)',
    hoverScale: 1.05,
  },
  success: {
    background: 'linear-gradient(135deg, #40ff80 0%, #00f5d4 100%)',
    shadowColor: 'rgba(64,255,128,0.5)',
    hoverScale: 1.05,
  },
  warning: {
    background: 'linear-gradient(135deg, #fee440 0%, #ff8040 100%)',
    shadowColor: 'rgba(254,228,64,0.5)',
    hoverScale: 1.05,
  },
  outline: {
    background: 'transparent',
    shadowColor: 'rgba(155,93,229,0.3)',
    hoverScale: 1.02,
  },
};

const SIZES = {
  sm: { padding: '0.75rem 1.5rem', fontSize: '0.875rem', iconSize: '1rem' },
  md: { padding: '1rem 2rem', fontSize: '1rem', iconSize: '1.25rem' },
  lg: { padding: '1.25rem 2.5rem', fontSize: '1.25rem', iconSize: '1.5rem' },
  xl: { padding: '1.5rem 3.5rem', fontSize: '1.5rem', iconSize: '2rem' },
};

export function MagicButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  emoji,
  fullWidth = false,
  disabled = false,
  loading = false,
  href,
  onClick,
  className = '',
}: MagicButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];
  
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || loading) return;
    
    // Create sparkles
    const rect = e.currentTarget.getBoundingClientRect();
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
    }));
    
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
    
    onClick?.();
  };
  
  const buttonContent = (
    <>
      {/* Sparkle explosions */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.span
            key={sparkle.id}
            className="absolute text-lg pointer-events-none"
            style={{ left: sparkle.x, top: sparkle.y }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{
              opacity: [1, 0],
              scale: [0, 1.5],
              y: [0, -30],
              x: [0, (Math.random() - 0.5) * 40],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        initial={false}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transform: 'translateX(-100%)',
          }}
          animate={{
            transform: isPressed ? 'translateX(100%)' : 'translateX(-100%)',
          }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
      
      {/* Loading spinner */}
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.span>
      )}
      
      {/* Content */}
      <span 
        className="relative z-10 flex items-center justify-center gap-3"
        style={{ opacity: loading ? 0 : 1 }}
      >
        {emoji && <span className="text-xl">{emoji}</span>}
        {icon && iconPosition === 'left' && icon}
        <span>{children}</span>
        {icon && iconPosition === 'right' && icon}
      </span>
    </>
  );
  
  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontFamily: 'var(--font-kids)',
    fontWeight: 700,
    color: variant === 'outline' ? '#f0f0ff' : '#ffffff',
    background: variantStyle.background,
    border: variant === 'outline' ? '3px solid rgba(155,93,229,0.5)' : 'none',
    borderRadius: '100px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    boxShadow: `0 8px 0 ${variantStyle.shadowColor}`,
  };
  
  const MotionComponent = href ? motion.create(Link) : motion.button;
  
  return (
    <MotionComponent
      href={href as string}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={className}
      style={buttonStyles}
      whileHover={!disabled ? {
        scale: variantStyle.hoverScale,
        y: -4,
        boxShadow: `0 12px 0 ${variantStyle.shadowColor}`,
      } : undefined}
      whileTap={!disabled ? {
        scale: 0.95,
        y: 4,
        boxShadow: `0 4px 0 ${variantStyle.shadowColor}`,
      } : undefined}
      animate={isPressed ? {
        y: 4,
        boxShadow: `0 4px 0 ${variantStyle.shadowColor}`,
      } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {buttonContent}
    </MotionComponent>
  );
}

/**
 * MAGIC ICON BUTTON
 * Round, bouncy icon buttons for navigation
 */
interface MagicIconButtonProps {
  icon: ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  badge?: number;
}

export function MagicIconButton({
  icon,
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  badge,
}: MagicIconButtonProps) {
  const sizes = {
    sm: { button: 'w-10 h-10', icon: 'text-lg' },
    md: { button: 'w-14 h-14', icon: 'text-2xl' },
    lg: { button: 'w-18 h-18', icon: 'text-3xl' },
  };
  
  const variants = {
    primary: 'bg-gradient-to-br from-purple-500 to-pink-500',
    secondary: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    ghost: 'bg-white/10 hover:bg-white/20',
  };
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.button
        className={`relative rounded-full flex items-center justify-center ${sizes[size].button} ${variants[variant]}`}
        onClick={onClick}
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        style={{
          boxShadow: variant !== 'ghost' ? '0 4px 15px rgba(155,93,229,0.4)' : 'none',
        }}
      >
        <span className={sizes[size].icon}>{icon}</span>
        
        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white px-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </motion.button>
      
      {label && (
        <span className="text-xs font-semibold text-white/70">{label}</span>
      )}
    </div>
  );
}

/**
 * CHOICE BUTTON
 * For interactive story choices in Kids Zone
 */
interface ChoiceButtonProps {
  children: ReactNode;
  emoji?: string;
  color?: 'purple' | 'pink' | 'cyan' | 'gold';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function ChoiceButton({
  children,
  emoji,
  color = 'purple',
  onClick,
  selected = false,
  disabled = false,
}: ChoiceButtonProps) {
  const colors = {
    purple: { bg: 'rgba(155,93,229,0.2)', border: '#9b5de5', glow: 'rgba(155,93,229,0.4)' },
    pink: { bg: 'rgba(241,91,181,0.2)', border: '#f15bb5', glow: 'rgba(241,91,181,0.4)' },
    cyan: { bg: 'rgba(0,245,212,0.2)', border: '#00f5d4', glow: 'rgba(0,245,212,0.4)' },
    gold: { bg: 'rgba(254,228,64,0.2)', border: '#fee440', glow: 'rgba(254,228,64,0.4)' },
  };
  
  const scheme = colors[color];
  
  return (
    <motion.button
      className="w-full relative text-left"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, x: 10 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <div
        className="p-5 rounded-2xl border-2 transition-all duration-300"
        style={{
          background: selected ? scheme.bg : 'rgba(255,255,255,0.05)',
          borderColor: selected ? scheme.border : 'rgba(255,255,255,0.1)',
          boxShadow: selected ? `0 0 30px ${scheme.glow}` : 'none',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div className="flex items-center gap-4">
          {emoji && (
            <span className="text-3xl flex-shrink-0">{emoji}</span>
          )}
          <span 
            className="text-lg font-medium"
            style={{ 
              fontFamily: 'var(--font-kids)',
              color: selected ? scheme.border : '#ffffff',
            }}
          >
            {children}
          </span>
          <motion.span
            className="ml-auto text-2xl"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: selected ? 1 : 0, x: selected ? 0 : -10 }}
          >
            →
          </motion.span>
        </div>
      </div>
      
      {/* Selection indicator line */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full"
        style={{ background: scheme.border }}
        animate={{ height: selected ? '70%' : '0%' }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

export default MagicButton;


