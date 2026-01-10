type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, userId, sessionId, error } = entry;
    const prefix = `[${timestamp}] ${level.toUpperCase()}`;
    const userInfo = userId ? ` [User: ${userId}]` : '';
    const sessionInfo = sessionId ? ` [Session: ${sessionId}]` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error
      ? ` Error: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
      : '';

    return `${prefix}${userInfo}${sessionInfo}: ${message}${contextStr}${errorStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    options: {
      context?: Record<string, any>;
      userId?: string;
      sessionId?: string;
      error?: Error;
    } = {}
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...options,
    };

    const formattedMessage = this.formatMessage(entry);

    // In development, always log to console
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    } else {
      // In production, you might want to send to a logging service
      // For now, use console for errors and warnings
      if (level === 'error' || level === 'warn') {
        console[level](formattedMessage);
      }
      // TODO: Send to logging service like DataDog, LogRocket, etc.
      // this.sendToLoggingService(entry);
    }
  }

  debug(
    message: string,
    options?: { context?: Record<string, any>; userId?: string; sessionId?: string }
  ) {
    this.log('debug', message, options);
  }

  info(
    message: string,
    options?: { context?: Record<string, any>; userId?: string; sessionId?: string }
  ) {
    this.log('info', message, options);
  }

  warn(
    message: string,
    options?: { context?: Record<string, any>; userId?: string; sessionId?: string; error?: Error }
  ) {
    this.log('warn', message, options);
  }

  error(
    message: string,
    options?: { context?: Record<string, any>; userId?: string; sessionId?: string; error?: Error }
  ) {
    this.log('error', message, options);
  }

  // Specialized logging methods
  apiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    options?: {
      userId?: string;
      sessionId?: string;
      error?: Error;
    }
  ) {
    const level: LogLevel = statusCode >= 400 ? 'error' : 'info';
    this.log(level, `API ${method} ${endpoint} - ${statusCode} (${duration}ms)`, {
      context: { endpoint, method, statusCode, duration },
      ...options,
    });
  }

  userAction(
    action: string,
    options?: {
      context?: Record<string, any>;
      userId?: string;
      sessionId?: string;
    }
  ) {
    this.info(`User action: ${action}`, options);
  }

  securityEvent(
    event: string,
    options?: {
      context?: Record<string, any>;
      userId?: string;
      sessionId?: string;
      error?: Error;
    }
  ) {
    this.warn(`Security event: ${event}`, options);
  }
}

export const logger = new Logger();
