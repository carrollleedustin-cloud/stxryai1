'use client';

import * as React from 'react';

export interface PrismInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function PrismInput({ label, error, icon, className, ...props }: PrismInputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            className={`
              w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 
              text-slate-200 placeholder:text-slate-600
              focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
              transition-all duration-300
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-xs ml-1 animate-pulse">{error}</p>
      )}
    </div>
  );
}

