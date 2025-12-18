/**
 * Centralized API Error Handler
 * Provides consistent error handling, logging, and user-friendly messages across all API integrations
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown,
    public service?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  statusCode?: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Wraps async API calls with standardized error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: {
    service: string;
    operation: string;
    fallback?: T;
  }
): Promise<APIResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const apiError = normalizeError(error, context.service);

    // Log error for monitoring
    logError(apiError, context);

    // Return user-friendly error response
    return {
      success: false,
      error: getUserFriendlyMessage(apiError),
      details: apiError.message,
      statusCode: apiError.statusCode,
    };
  }
}

/**
 * Retry wrapper for transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    retryableStatusCodes?: number[];
    service: string;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableStatusCodes = [408, 429, 500, 502, 503, 504],
    service,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const apiError = normalizeError(error, service);
      const isRetryable = apiError.statusCode && retryableStatusCodes.includes(apiError.statusCode);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Retrying ${service} (attempt ${attempt + 1}/${maxRetries})...`);
    }
  }

  throw lastError;
}

/**
 * Normalize different error types into APIError
 */
function normalizeError(error: unknown, service: string): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    // Parse Supabase errors
    if ('code' in error && 'details' in error) {
      const supabaseError = error as any;
      return new APIError(
        supabaseError.message,
        supabaseError.code === 'PGRST116' ? 404 : 500,
        error,
        service
      );
    }

    // Parse fetch errors
    if ('status' in error) {
      const fetchError = error as any;
      return new APIError(error.message, fetchError.status, error, service);
    }

    return new APIError(error.message, undefined, error, service);
  }

  // Unknown error type
  return new APIError('An unexpected error occurred', 500, error, service);
}

/**
 * Get user-friendly error messages
 */
function getUserFriendlyMessage(error: APIError): string {
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You need to be logged in to perform this action.',
    403: "You don't have permission to perform this action.",
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    409: 'This action conflicts with existing data.',
    429: 'Too many requests. Please slow down and try again later.',
    500: 'Server error. Our team has been notified.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service is currently under maintenance.',
    504: 'Request took too long to process. Please try again.',
  };

  if (error.statusCode && statusMessages[error.statusCode]) {
    return statusMessages[error.statusCode];
  }

  // Service-specific messages
  if (error.service === 'stripe' && error.message.includes('card')) {
    return 'Payment failed. Please check your card details.';
  }

  if (error.service === 'ai' && error.message.includes('quota')) {
    return 'AI service quota exceeded. Please try again later.';
  }

  if (error.service === 'supabase' && error.message.includes('unique')) {
    return 'This value already exists. Please use a different one.';
  }

  return 'Something went wrong. Please try again.';
}

/**
 * Log errors for monitoring and debugging
 */
function logError(error: APIError, context: { service: string; operation: string }) {
  const logLevel = error.statusCode && error.statusCode < 500 ? 'warn' : 'error';

  const logData = {
    level: logLevel,
    service: error.service || context.service,
    operation: context.operation,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
  };

  console[logLevel]('[API Error]', logData);

  // In production, send to error tracking service
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Dynamic import to avoid bundling error tracking in client if not configured
    import('@/lib/error-tracking').then(({ errorTracking }) => {
      errorTracking.captureException(error, {
        level: logLevel === 'error' ? 'error' : 'warning',
        tags: {
          service: error.service || context.service,
          operation: context.operation,
        },
        extra: {
          statusCode: error.statusCode,
          message: error.message,
        },
        contexts: {
          api: logData,
        },
      });
    }).catch(() => {
      // Error tracking not available, silently fail
    });
  }
}

/**
 * Validate API response
 */
export function validateResponse<T>(
  response: APIResponse<T>,
  onError?: (error: ErrorResponse) => void
): response is SuccessResponse<T> {
  if (!response.success) {
    const errorResponse = response as ErrorResponse;
    onError?.(errorResponse);
    return false;
  }
  return true;
}

/**
 * Rate limit wrapper using simple in-memory tracking
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  async waitForSlot(key: string, limit: number, windowMs: number): Promise<void> {
    while (!(await this.checkLimit(key, limit, windowMs))) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Batch API calls to reduce network overhead
 */
export class BatchProcessor<T, R> {
  private queue: Array<{
    input: T;
    resolve: (value: R) => void;
    reject: (error: unknown) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private processBatch: (items: T[]) => Promise<R[]>,
    private options: {
      maxBatchSize?: number;
      maxWaitMs?: number;
    } = {}
  ) {
    this.options.maxBatchSize = options.maxBatchSize || 10;
    this.options.maxWaitMs = options.maxWaitMs || 50;
  }

  async add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ input, resolve, reject });

      if (this.queue.length >= this.options.maxBatchSize!) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.maxWaitMs);
      }
    });
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);
    const inputs = batch.map((item) => item.input);

    try {
      const results = await this.processBatch(inputs);
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}
