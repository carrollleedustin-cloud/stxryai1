/**
 * Custom form hook for type-safe form handling.
 * Works with the validation schemas from @/lib/validation/schemas.
 */

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  Validator,
  ValidationResult,
  ValidationError,
  ValidationFailure,
} from '@/lib/validation/schemas';

// Type guard for validation failure
function isValidationFailure<T>(
  result: ValidationResult<T>
): result is ValidationFailure {
  return result.success === false;
}

interface UseFormOptions<T> {
  initialValues: T;
  validator?: Validator<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: string, error: string) => void;
  setValues: (values: Partial<T>) => void;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validator,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validateForm = useCallback((): boolean => {
    if (!validator) return true;

    const result = validator.safeParse(values);

    if (isValidationFailure(result)) {
      const newErrors: Record<string, string> = {};
      result.errors.forEach((err: ValidationError) => {
        const key = err.path.join('.');
        if (!newErrors[key]) {
          newErrors[key] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [validator, values]);

  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      if (!validator) return null;

      const testValues = { ...values, [field]: value };
      const result = validator.safeParse(testValues);

      if (isValidationFailure(result)) {
        const fieldError = result.errors.find(
          (err: ValidationError) => err.path[0] === field
        );
        return fieldError?.message || null;
      }

      return null;
    },
    [validator, values]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValuesState((prev) => ({ ...prev, [name]: newValue }));
      setIsDirty(true);

      if (validateOnChange) {
        const error = validateField(name, newValue);
        setErrors((prev) => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name, value);
        setErrors((prev) => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [validateOnBlur, validateField]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      const isFormValid = validateForm();
      if (!isFormValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    reset,
    validate: validateForm,
  };
}

/**
 * Helper hook for field-level form state
 */
export function useField<T>(
  form: UseFormReturn<T>,
  name: keyof T & string
) {
  return {
    value: form.values[name],
    error: form.errors[name],
    touched: form.touched[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    name,
  };
}

export type { UseFormOptions, UseFormReturn };
