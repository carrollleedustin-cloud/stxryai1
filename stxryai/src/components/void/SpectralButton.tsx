'use client';

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

interface SpectralButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'plasma' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * SPECTRAL BUTTON
 * Interactive elements that glow with inner light.
 * Every click is a commitment, every hover an invitation.
 */
export default function SpectralButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: SpectralButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2.5
    font-ui font-medium tracking-widest uppercase
    rounded-lg overflow-hidden
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeStyles = {
    sm: 'text-[0.625rem] px-4 py-2',
    md: 'text-xs px-6 py-3',
    lg: 'text-xs px-8 py-4',
  };

  const variantStyles = {
    primary: `
      text-void-absolute bg-spectral-cyan
      hover:shadow-[0_0_40px_rgba(0,245,212,0.4)]
      active:scale-[0.98]
    `,
    secondary: `
      text-text-primary bg-void-elevated
      border border-membrane
      hover:border-spectral-cyan hover:text-spectral-cyan
      active:scale-[0.98]
    `,
    ghost: `
      text-text-secondary bg-transparent
      hover:text-text-primary hover:bg-void-mist
      active:scale-[0.98]
    `,
    plasma: `
      text-text-primary
      bg-gradient-to-r from-plasma-orange to-plasma-pink
      hover:shadow-[0_0_40px_rgba(255,107,53,0.3)]
      active:scale-[0.98]
    `,
    danger: `
      text-text-primary bg-spectral-rose
      hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]
      active:scale-[0.98]
    `,
  };

  const content = (
    <>
      {/* Shimmer effect */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
      )}

      {/* Top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        }}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Content */}
      <span className={`relative flex items-center gap-2.5 ${loading ? 'opacity-0' : ''}`}>
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </span>
    </>
  );

  const buttonElement = (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {content}
    </motion.button>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={fullWidth ? 'w-full block' : ''}>
        {buttonElement}
      </Link>
    );
  }

  return buttonElement;
}

/**
 * ICON BUTTON
 * Circular, minimal, powerful
 */
export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & HTMLMotionProps<'button'>) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantStyles = {
    primary: 'text-void-absolute bg-spectral-cyan hover:shadow-[0_0_20px_rgba(0,245,212,0.4)]',
    ghost: 'text-text-tertiary bg-transparent hover:text-text-primary hover:bg-void-mist',
    danger: 'text-spectral-rose bg-transparent hover:bg-spectral-rose/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center justify-center
        rounded-lg transition-all duration-200
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * FLOATING ACTION BUTTON
 * A prominent action that hovers above content
 */
export function FloatingAction({
  children,
  icon,
  onClick,
  position = 'bottom-right',
}: {
  children?: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}) {
  const positionStyles = {
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'left-6 bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-6',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        fixed z-50 ${positionStyles[position]}
        flex items-center gap-3
        px-5 py-4 rounded-full
        bg-spectral-cyan text-void-absolute
        font-ui text-xs font-medium tracking-wider uppercase
        shadow-[0_0_30px_rgba(0,245,212,0.4)]
      `}
    >
      {icon}
      {children}
    </motion.button>
  );
}
