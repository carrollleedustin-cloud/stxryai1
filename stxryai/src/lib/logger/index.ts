/**
 * Structured logging utility for the application.
 * Replaces console.* statements with a consistent logging interface.
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Structured metadata
 * - Environment-aware (verbose in dev, minimal in prod)
 * - Easy to integrate with external services (Sentry, LogRocket, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  /** Component or service name */
  component?: string;
  /** User ID if available */
  userId?: string;
  /** Request/action ID for tracing */
  traceId?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.minLevel = this.isDev ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, context, error);

    // In development, use colored console output
    if (this.isDev) {
      const formatted = this.formatEntry(entry);
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted, error);
          break;
      }
    } else {
      // In production, output JSON for log aggregation
      const output = {
        ...entry,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      };

      switch (level) {
        case 'warn':
          console.warn(JSON.stringify(output));
          break;
        case 'error':
          console.error(JSON.stringify(output));
          break;
        default:
          // In production, only warn and error go to console
          break;
      }
    }

    // Send errors to error tracking service in production
    if (level === 'error' && this.isProduction && typeof window !== 'undefined') {
      // Dynamic import to avoid bundling error tracking in client if not configured
      import('@/lib/error-tracking').then(({ errorTracking }) => {
        errorTracking.captureException(error || new Error(message), {
          level: 'error',
          extra: context,
        });
      }).catch(() => {
        // Error tracking not available, silently fail
      });
    }
  }

  /**
   * Debug level - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level - something went wrong
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, context, err);
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for consumers
export type { LogContext, LogLevel };

// Convenience exports for common patterns
export const createServiceLogger = (serviceName: string) =>
  logger.child({ component: serviceName });

export const createComponentLogger = (componentName: string) =>
  logger.child({ component: componentName });
