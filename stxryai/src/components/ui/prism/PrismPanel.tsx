'use client';

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming this exists, if not I'll remove it or create it

type PrismPanelTone = 'card' | 'surface' | 'glass' | 'void';

export interface PrismPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PrismPanelTone;
  hoverEffect?: boolean;
}

const toneClasses: Record<PrismPanelTone, string> = {
  card: 'bg-slate-900/40 border-white/5',
  surface: 'bg-slate-950/60 border-white/5',
  glass: 'bg-white/5 border-white/10 backdrop-blur-xl',
  void: 'bg-black/80 border-white/5',
};

export function PrismPanel({
  tone = 'card',
  hoverEffect = false,
  className,
  children,
  ...props
}: PrismPanelProps) {
  const base = 'relative rounded-3xl border overflow-hidden transition-all duration-500';
  const hover = hoverEffect
    ? 'hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] group'
    : '';

  const classes = [base, toneClasses[tone], hover, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {/* Subtle gradient noise/texture could go here */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
