'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useState } from 'react';

/**
 * Enhanced Button with micro-interactions
 */
interface InteractiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}

export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSpring(1, { stiffness: 300, damping: 20 });

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg',
    secondary: 'bg-card border border-border text-foreground hover:bg-accent',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'text-foreground hover:bg-accent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-lg font-medium transition-all relative overflow-hidden ${
        variants[variant]
      } ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ scale }}
      onMouseDown={() => {
        setIsPressed(true);
        scale.set(0.95);
      }}
      onMouseUp={() => {
        setIsPressed(false);
        scale.set(1);
      }}
      onMouseLeave={() => {
        setIsPressed(false);
        scale.set(1);
      }}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      {...props}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </motion.button>
  );
}

/**
 * Card with hover and tap interactions
 */
interface InteractiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverScale?: number;
  [key: string]: any;
}

export function InteractiveCard({
  children,
  onClick,
  className = '',
  hoverScale = 1.02,
  ...props
}: InteractiveCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      whileHover={{ scale: hoverScale, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Input with focus animations
 */
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export function AnimatedInput({ label, error, success, className = '', ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error ? 'border-destructive' : success ? 'border-green-500' : isFocused ? 'border-primary' : 'border-border';

  return (
    <div className="space-y-1">
      {label && (
        <motion.label
          className="block text-sm font-medium text-foreground"
          initial={false}
          animate={{ color: isFocused ? 'var(--primary)' : 'var(--foreground)' }}
        >
          {label}
        </motion.label>
      )}
      <motion.div
        className={`relative border-2 rounded-lg transition-colors ${borderColor}`}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(139, 92, 246, 0.1)'
            : '0 0 0 0px rgba(139, 92, 246, 0)',
        }}
      >
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-2 bg-transparent outline-none ${className}`}
        />
        {success && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <span className="text-green-500 text-lg">✓</span>
          </motion.div>
        )}
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Toggle switch with smooth animation
 */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, label, disabled = false }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

/**
 * Ripple effect on click
 */
export function RippleEffect({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
          animate={{ width: 200, height: 200, x: ripple.x - 100, y: ripple.y - 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/**
 * Shimmer loading effect
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/**
 * Floating action button
 */
interface FloatingActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`fixed ${positions[position]} w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center z-50`}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {icon}
      {label && (
        <motion.span
          className="absolute right-full mr-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  );
}

