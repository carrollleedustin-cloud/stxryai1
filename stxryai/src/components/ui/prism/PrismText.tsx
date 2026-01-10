'use client';

import * as React from 'react';

type PrismTextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'code';
type PrismTextGradient = 'none' | 'primary' | 'secondary' | 'gold' | 'silver';

export interface PrismTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: any;
  variant?: PrismTextVariant;
  gradient?: PrismTextGradient;
}

const variants: Record<PrismTextVariant, string> = {
  h1: 'text-4xl md:text-6xl font-bold tracking-tighter font-display',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight font-display',
  h3: 'text-xl md:text-2xl font-semibold tracking-tight',
  body: 'text-base leading-relaxed text-slate-300',
  label: 'text-sm font-medium uppercase tracking-wider text-slate-400',
  code: 'font-mono text-sm bg-black/30 px-1 py-0.5 rounded text-fuchsia-300',
};

const gradients: Record<PrismTextGradient, string> = {
  none: '',
  primary:
    'bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-gradient-x',
  secondary: 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500',
  gold: 'bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600',
  silver: 'bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400',
};

export function PrismText({
  as: Component = 'p',
  variant = 'body',
  gradient = 'none',
  className,
  children,
  ...props
}: PrismTextProps) {
  // Use h1-h3 defaults for 'as' if not specified
  if (Component === 'p') {
    if (variant === 'h1') Component = 'h1';
    if (variant === 'h2') Component = 'h2';
    if (variant === 'h3') Component = 'h3';
    if (variant === 'code') Component = 'code';
    if (variant === 'label') Component = 'span';
  }

  const classes = [variants[variant], gradients[gradient], className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
