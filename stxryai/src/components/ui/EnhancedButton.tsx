'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'link'
  | 'plasma';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-spectral-cyan text-void-absolute hover:bg-spectral-cyan-dim shadow-spectral hover:shadow-glow-md',
  secondary:
    'bg-spectral-violet text-text-primary hover:bg-spectral-violet-bright shadow-elevation-1',
  ghost:
    'border border-membrane-hover hover:bg-membrane-hover hover:border-membrane-active text-text-primary',
  destructive: 'bg-spectral-rose text-text-primary hover:bg-red-600 shadow-elevation-1',
  success: 'bg-spectral-emerald text-void-absolute hover:bg-green-600 shadow-elevation-1',
  warning: 'bg-spectral-amber text-void-absolute hover:bg-amber-600 shadow-elevation-1',
  link: 'text-spectral-cyan underline-offset-4 hover:underline hover:text-text-primary',
  plasma: 'bg-gradient-plasma text-text-primary hover:brightness-110 shadow-plasma',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-11 px-6 text-lg gap-2',
  xl: 'h-12 px-8 text-xl gap-2.5',
};

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spectral-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void-absolute disabled:pointer-events-none disabled:opacity-50';

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button className={classes} ref={ref} disabled={loading || disabled} {...props}>
        {loading && <Loader2 className="animate-spin" size={16} />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="flex-1">{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';
