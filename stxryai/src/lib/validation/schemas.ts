/**
 * Validation schemas for form validation.
 * Provides type-safe validation with detailed error messages.
 */

// Type definitions
export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: ValidationError[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export type Validator<T> = {
  parse: (data: unknown) => T;
  safeParse: (data: unknown) => ValidationResult<T>;
  optional: () => Validator<T | undefined>;
  nullable: () => Validator<T | null>;
  default: (defaultValue: T) => Validator<T>;
};

// Type guard for failure
function isFailure<T>(result: ValidationResult<T>): result is ValidationFailure {
  return result.success === false;
}

export class ValidationException extends Error {
  constructor(public errors: ValidationError[]) {
    super(errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '));
    this.name = 'ValidationException';
  }
}

// Utility functions
function createValidator<T>(
  validate: (data: unknown, path: string[]) => ValidationResult<T>
): Validator<T> {
  return {
    parse: (data: unknown) => {
      const result = validate(data, []);
      if (isFailure(result)) {
        throw new ValidationException(result.errors);
      }
      return result.data;
    },
    safeParse: (data: unknown) => validate(data, []),
    optional: () =>
      createValidator((data, path) => {
        if (data === undefined) {
          return { success: true, data: undefined as T | undefined };
        }
        return validate(data, path) as ValidationResult<T | undefined>;
      }),
    nullable: () =>
      createValidator((data, path) => {
        if (data === null) {
          return { success: true, data: null as T | null };
        }
        return validate(data, path) as ValidationResult<T | null>;
      }),
    default: (defaultValue: T) =>
      createValidator((data, path) => {
        if (data === undefined || data === null) {
          return { success: true, data: defaultValue };
        }
        return validate(data, path);
      }),
  };
}

// String validator
interface StringValidatorOptions {
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  pattern?: RegExp;
  trim?: boolean;
}

export function string(options: StringValidatorOptions = {}) {
  return createValidator<string>((data, path) => {
    if (typeof data !== 'string') {
      return {
        success: false,
        errors: [{ path, message: 'Expected string', code: 'invalid_type' }],
      };
    }

    const value = options.trim ? data.trim() : data;
    const errors: ValidationError[] = [];

    if (options.min !== undefined && value.length < options.min) {
      errors.push({
        path,
        message: `Must be at least ${options.min} characters`,
        code: 'too_short',
      });
    }

    if (options.max !== undefined && value.length > options.max) {
      errors.push({ path, message: `Must be at most ${options.max} characters`, code: 'too_long' });
    }

    if (options.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ path, message: 'Invalid email address', code: 'invalid_email' });
    }

    if (options.url) {
      try {
        new URL(value);
      } catch {
        errors.push({ path, message: 'Invalid URL', code: 'invalid_url' });
      }
    }

    if (options.pattern && !options.pattern.test(value)) {
      errors.push({ path, message: 'Invalid format', code: 'invalid_pattern' });
    }

    return errors.length > 0 ? { success: false, errors } : { success: true, data: value };
  });
}

// Number validator
interface NumberValidatorOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
}

export function number(options: NumberValidatorOptions = {}) {
  return createValidator<number>((data, path) => {
    const value = typeof data === 'string' ? parseFloat(data) : data;

    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        errors: [{ path, message: 'Expected number', code: 'invalid_type' }],
      };
    }

    const errors: ValidationError[] = [];

    if (options.min !== undefined && value < options.min) {
      errors.push({ path, message: `Must be at least ${options.min}`, code: 'too_small' });
    }
    if (options.max !== undefined && value > options.max) {
      errors.push({ path, message: `Must be at most ${options.max}`, code: 'too_big' });
    }
    if (options.integer && !Number.isInteger(value)) {
      errors.push({ path, message: 'Must be an integer', code: 'invalid_integer' });
    }
    if (options.positive && value <= 0) {
      errors.push({ path, message: 'Must be positive', code: 'invalid_positive' });
    }

    return errors.length > 0 ? { success: false, errors } : { success: true, data: value };
  });
}

// Boolean validator
export function boolean() {
  return createValidator<boolean>((data, path) => {
    if (typeof data === 'boolean') return { success: true, data };
    if (data === 'true') return { success: true, data: true };
    if (data === 'false') return { success: true, data: false };
    return {
      success: false,
      errors: [{ path, message: 'Expected boolean', code: 'invalid_type' }],
    };
  });
}

// Array validator
export function array<T>(
  itemValidator: Validator<T>,
  options: { min?: number; max?: number } = {}
) {
  return createValidator<T[]>((data, path) => {
    if (!Array.isArray(data)) {
      return {
        success: false,
        errors: [{ path, message: 'Expected array', code: 'invalid_type' }],
      };
    }

    const errors: ValidationError[] = [];
    if (options.min !== undefined && data.length < options.min) {
      errors.push({ path, message: `Must have at least ${options.min} items`, code: 'too_short' });
    }
    if (options.max !== undefined && data.length > options.max) {
      errors.push({ path, message: `Must have at most ${options.max} items`, code: 'too_long' });
    }

    const items: T[] = [];
    for (let i = 0; i < data.length; i++) {
      const result = itemValidator.safeParse(data[i]);
      if (isFailure(result)) {
        errors.push(...result.errors.map((e) => ({ ...e, path: [...path, String(i), ...e.path] })));
      } else {
        items.push(result.data);
      }
    }

    return errors.length > 0 ? { success: false, errors } : { success: true, data: items };
  });
}

// Object validator
type ObjectShape = Record<string, Validator<unknown>>;
type InferObjectShape<T extends ObjectShape> = {
  [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
};

export function object<T extends ObjectShape>(shape: T) {
  return createValidator<InferObjectShape<T>>((data, path) => {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return {
        success: false,
        errors: [{ path, message: 'Expected object', code: 'invalid_type' }],
      };
    }

    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};
    const obj = data as Record<string, unknown>;

    for (const [key, validator] of Object.entries(shape)) {
      const fieldResult = validator.safeParse(obj[key]);
      if (isFailure(fieldResult)) {
        errors.push(...fieldResult.errors.map((e) => ({ ...e, path: [...path, key, ...e.path] })));
      } else {
        result[key] = fieldResult.data;
      }
    }

    return errors.length > 0
      ? { success: false, errors }
      : { success: true, data: result as InferObjectShape<T> };
  });
}

// Enum validator
export function enumType<T extends string>(values: readonly T[]) {
  return createValidator<T>((data, path) => {
    if (typeof data !== 'string' || !values.includes(data as T)) {
      return {
        success: false,
        errors: [{ path, message: `Must be one of: ${values.join(', ')}`, code: 'invalid_enum' }],
      };
    }
    return { success: true, data: data as T };
  });
}

// Common schemas
export const commonSchemas = {
  email: string({ email: true, trim: true }),
  password: string({ min: 8, max: 100 }),
  username: string({ min: 3, max: 30, pattern: /^[a-zA-Z0-9_-]+$/, trim: true }),
  displayName: string({ min: 1, max: 50, trim: true }),
  url: string({ url: true, trim: true }),
  uuid: string({ pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i }),
  positiveInt: number({ integer: true, positive: true }),
  rating: number({ min: 1, max: 5, integer: true }),
};

// Auth schemas
export const authSchemas = {
  login: object({ email: commonSchemas.email, password: string({ min: 1 }) }),
  register: object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    displayName: commonSchemas.displayName.optional(),
  }),
};

// Story schemas
export const storySchemas = {
  create: object({
    title: string({ min: 1, max: 200, trim: true }),
    description: string({ max: 2000, trim: true }).optional(),
    genre: string({ min: 1 }),
    difficulty: enumType(['easy', 'medium', 'hard'] as const),
    tags: array(string({ min: 1, max: 50 }), { max: 10 }).optional(),
    isPremium: boolean().default(false),
  }),
};
