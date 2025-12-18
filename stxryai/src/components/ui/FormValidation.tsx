'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  value: string;
  rules: ValidationRule[];
  touched?: boolean;
  showError?: boolean;
}

export function validateField(field: FieldValidation): string | null {
  if (!field.touched && !field.showError) return null;

  for (const rule of field.rules) {
    if (!rule.test(field.value)) {
      return rule.message;
    }
  }

  return null;
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
    test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  match: (otherValue: string, message = 'Values do not match'): ValidationRule => ({
    test: (value) => value === otherValue,
    message,
  }),

  noSpaces: (message = 'This field cannot contain spaces'): ValidationRule => ({
    test: (value) => !/\s/.test(value),
    message,
  }),

  alphanumeric: (message = 'Only letters and numbers are allowed'): ValidationRule => ({
    test: (value) => /^[a-zA-Z0-9]+$/.test(value),
    message,
  }),
};

interface ValidationMessageProps {
  error: string | null;
  className?: string;
}

export function ValidationMessage({ error, className = '' }: ValidationMessageProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          className={`text-sm text-destructive mt-1 flex items-center gap-2 ${className}`}
        >
          <span className="text-destructive">⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validation: FieldValidation;
  onValidationChange?: (error: string | null) => void;
  label?: string;
  helperText?: string;
  showSuccess?: boolean;
}

export function ValidatedInput({
  validation,
  onValidationChange,
  label,
  helperText,
  showSuccess = false,
  className = '',
  ...inputProps
}: ValidatedInputProps) {
  const error = validateField(validation);
  const isValid = validation.touched && !error && validation.value.length > 0;

  // Notify parent of validation state
  if (onValidationChange && validation.touched) {
    onValidationChange(error);
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {validation.rules.some((r) => r.message.includes('required')) && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          {...inputProps}
          className={`w-full px-4 py-2 border rounded-lg transition-all ${
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : isValid && showSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-border focus:border-primary focus:ring-primary/20'
          } focus:outline-none focus:ring-2 ${className}`}
        />

        {isValid && showSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <span className="text-green-500 text-lg">✓</span>
          </motion.div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      <ValidationMessage error={error} />
    </div>
  );
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validation: FieldValidation;
  onValidationChange?: (error: string | null) => void;
  label?: string;
  helperText?: string;
  showSuccess?: boolean;
  characterCount?: boolean;
}

export function ValidatedTextarea({
  validation,
  onValidationChange,
  label,
  helperText,
  showSuccess = false,
  characterCount = false,
  maxLength,
  className = '',
  ...textareaProps
}: ValidatedTextareaProps) {
  const error = validateField(validation);
  const isValid = validation.touched && !error && validation.value.length > 0;
  const charCount = validation.value.length;
  const maxChars = maxLength ? Number(maxLength) : undefined;

  if (onValidationChange && validation.touched) {
    onValidationChange(error);
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {validation.rules.some((r) => r.message.includes('required')) && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <textarea
          {...textareaProps}
          maxLength={maxLength}
          className={`w-full px-4 py-2 border rounded-lg transition-all resize-none ${
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : isValid && showSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-border focus:border-primary focus:ring-primary/20'
          } focus:outline-none focus:ring-2 ${className}`}
        />

        {isValid && showSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-3"
          >
            <span className="text-green-500 text-lg">✓</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          <ValidationMessage error={error} />
        </div>
        {characterCount && maxChars && (
          <p
            className={`text-xs ${
              charCount > maxChars * 0.9
                ? 'text-warning'
                : charCount > maxChars
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            {charCount} / {maxChars}
          </p>
        )}
      </div>
    </div>
  );
}

