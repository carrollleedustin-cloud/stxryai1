'use client';

import React, { useState, forwardRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NEBULA INPUT
 * Input fields that feel like portals to thought.
 * Every keystroke ripples through dimensions.
 */

interface NebulaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { padding: '0.625rem 1rem', fontSize: '0.875rem', iconSize: '1rem' },
  md: { padding: '0.875rem 1.25rem', fontSize: '1rem', iconSize: '1.25rem' },
  lg: { padding: '1.125rem 1.5rem', fontSize: '1.125rem', iconSize: '1.5rem' },
};

export const NebulaInput = forwardRef<HTMLInputElement, NebulaInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      icon,
      iconPosition = 'left',
      size = 'md',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const sizeStyle = SIZES[size];

    const borderColor = error
      ? 'rgba(255,64,128,0.5)'
      : success
        ? 'rgba(0,255,213,0.5)'
        : isFocused
          ? 'rgba(0,255,213,0.5)'
          : 'rgba(255,255,255,0.08)';

    const glowColor = error
      ? '0 0 20px rgba(255,64,128,0.2)'
      : success
        ? '0 0 20px rgba(0,255,213,0.2)'
        : isFocused
          ? '0 0 20px rgba(0,255,213,0.15)'
          : 'none';

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: error ? '#ff4080' : success ? '#00ffd5' : 'rgba(255,255,255,0.7)',
            }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Icon */}
          {icon && (
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              style={{
                [iconPosition === 'left' ? 'left' : 'right']: '1rem',
                color: isFocused ? '#00ffd5' : 'rgba(255,255,255,0.4)',
                fontSize: sizeStyle.iconSize,
                transition: 'color 0.2s ease',
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full outline-none transition-all duration-200"
            style={{
              padding: sizeStyle.padding,
              paddingLeft:
                icon && iconPosition === 'left' ? '3rem' : sizeStyle.padding.split(' ')[1],
              paddingRight:
                icon && iconPosition === 'right' ? '3rem' : sizeStyle.padding.split(' ')[1],
              fontSize: sizeStyle.fontSize,
              fontFamily: 'var(--font-body)',
              color: disabled ? 'rgba(255,255,255,0.3)' : '#f0f0ff',
              background: 'rgba(12,12,30,0.8)',
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              boxShadow: glowColor,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            {...props}
          />

          {/* Animated focus ring */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={false}
            animate={{
              boxShadow: isFocused
                ? '0 0 0 4px rgba(0,255,213,0.1)'
                : '0 0 0 0px rgba(0,255,213,0)',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Error or hint message */}
        <AnimatePresence mode="wait">
          {(error || hint) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm"
              style={{
                color: error ? '#ff4080' : 'rgba(255,255,255,0.5)',
              }}
            >
              {error || hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

NebulaInput.displayName = 'NebulaInput';

/**
 * NEBULA TEXTAREA
 */
interface NebulaTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const NebulaTextarea = forwardRef<HTMLTextAreaElement, NebulaTextareaProps>(
  ({ label, error, hint, className = '', disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: error ? '#ff4080' : 'rgba(255,255,255,0.7)',
            }}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full outline-none transition-all duration-200 resize-none"
          style={{
            padding: '1rem 1.25rem',
            fontSize: '1rem',
            fontFamily: 'var(--font-body)',
            color: disabled ? 'rgba(255,255,255,0.3)' : '#f0f0ff',
            background: 'rgba(12,12,30,0.8)',
            border: `1px solid ${error ? 'rgba(255,64,128,0.5)' : isFocused ? 'rgba(0,255,213,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '12px',
            boxShadow: isFocused ? '0 0 20px rgba(0,255,213,0.15)' : 'none',
            minHeight: '120px',
          }}
          {...props}
        />

        <AnimatePresence mode="wait">
          {(error || hint) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm"
              style={{
                color: error ? '#ff4080' : 'rgba(255,255,255,0.5)',
              }}
            >
              {error || hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

NebulaTextarea.displayName = 'NebulaTextarea';

/**
 * NEBULA SELECT
 */
interface SelectOption {
  value: string;
  label: string;
}

interface NebulaSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function NebulaSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  disabled,
  className = '',
}: NebulaSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{
            color: error ? '#ff4080' : 'rgba(255,255,255,0.7)',
          }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left outline-none transition-all duration-200"
          style={{
            padding: '0.875rem 1.25rem',
            paddingRight: '3rem',
            fontSize: '1rem',
            fontFamily: 'var(--font-body)',
            color: selectedOption ? '#f0f0ff' : 'rgba(255,255,255,0.4)',
            background: 'rgba(12,12,30,0.8)',
            border: `1px solid ${error ? 'rgba(255,64,128,0.5)' : isOpen ? 'rgba(0,255,213,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '12px',
            boxShadow: isOpen ? '0 0 20px rgba(0,255,213,0.15)' : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {selectedOption?.label || placeholder}
        </button>

        {/* Dropdown arrow */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(12,12,30,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    background: option.value === value ? 'rgba(0,255,213,0.1)' : 'transparent',
                    color: option.value === value ? '#00ffd5' : 'rgba(255,255,255,0.8)',
                  }}
                  onMouseEnter={(e) => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-[#ff4080]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default NebulaInput;
