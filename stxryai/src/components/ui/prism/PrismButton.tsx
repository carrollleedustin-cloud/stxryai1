'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

type PrismButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type PrismButtonSize = 'sm' | 'md' | 'lg';

export interface PrismButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PrismButtonVariant;
  size?: PrismButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  glow?: boolean;
  'aria-label'?: string;
}

const variants: Record<PrismButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border-transparent',
  secondary:
    'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md',
  ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger:
    'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
};

const sizes: Record<PrismButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export function PrismButton({
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  glow = false,
  className,
  children,
  ...props
}: PrismButtonProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

  const glowEffect = glow
    ? 'shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]'
    : '';

  const classes = [base, variants[variant], sizes[size], glowEffect, className]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      {...(props as any)}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

      {isLoading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {!isLoading && icon && <span className="relative z-20">{icon}</span>}
      <span className="relative z-20">{children}</span>
    </motion.button>
  );
}
