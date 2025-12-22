'use client';

import * as React from 'react';

export function PrismDivider({ className }: { className?: string }) {
  return (
    <div className={`relative h-[1px] w-full my-8 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[1px]" />
    </div>
  );
}

