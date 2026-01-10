/**
 * Utility to add timeout to promises, especially for database queries
 * This prevents the app from freezing when the database is unavailable
 */

export interface TimeoutOptions {
  timeout?: number; // Timeout in milliseconds, default 8000ms (8 seconds)
  errorMessage?: string;
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param options Timeout options
 * @returns The promise result or throws a timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions = {}
): Promise<T> {
  const { timeout = 8000, errorMessage = 'Request timed out' } = options;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeout);
    }),
  ]);
}

/**
 * Checks if an error is a connection/network error
 */
export function isConnectionError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();

  // Check for common connection error patterns
  return (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorString.includes('failed to fetch') ||
    errorString.includes('network error') ||
    // Supabase specific errors
    error?.code === 'PGRST301' || // Connection error
    error?.code === 'PGRST302' || // Timeout
    error?.status === 0 || // Network error
    error?.status === 408 || // Request timeout
    error?.status === 503 || // Service unavailable
    error?.status === 504 // Gateway timeout
  );
}

/**
 * Checks if an error indicates the Supabase project is paused or deleted
 */
export function isSupabasePausedError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();

  return (
    isConnectionError(error) ||
    errorMessage.includes('project may be paused') ||
    errorMessage.includes('project may be deleted') ||
    errorMessage.includes('supabase project') ||
    error?.code === 'PGRST301' ||
    error?.status === 503 ||
    error?.status === 504
  );
}

/**
 * Gets a user-friendly error message for database connection issues
 */
export function getConnectionErrorMessage(error: any): string {
  if (isSupabasePausedError(error)) {
    return 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.';
  }

  if (isConnectionError(error)) {
    return 'Cannot connect to database. Please check your internet connection and try again.';
  }

  return error?.message || 'An unexpected error occurred';
}
