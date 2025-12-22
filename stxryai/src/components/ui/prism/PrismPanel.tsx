'use client';

import * as React from 'react';

type PrismPanelTone = 'card' | 'surface';

export interface PrismPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PrismPanelTone;
}

const toneClasses: Record<PrismPanelTone, string> = {
  card: 'bg-card/50',
  surface: 'bg-background/25',
};

export function PrismPanel({ tone = 'card', className, ...props }: PrismPanelProps) {
  const base =
    'rounded-3xl border border-border backdrop-blur-glass shadow-elevation-1';
  const classes = [base, toneClasses[tone], className].filter(Boolean).join(' ');
  return <div className={classes} {...props} />;
}


