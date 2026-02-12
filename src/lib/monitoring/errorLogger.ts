/**
 * Error Logging Service
 * 
 * Centralized error logging for the application.
 * Can be extended to integrate with Sentry, LogRocket, or other monitoring services.
 * 
 * @version 1.0.0
 * @created February 11, 2026
 */

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  apiEndpoint?: string;
  input?: any;
}

export interface LoggedError {
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  
  /**
   * Log an error with context
   */
  log(
    message: string, 
    options: {
      error?: Error | unknown;
      context?: ErrorContext;
      severity?: ErrorSeverity;
    } = {}
  ): void {
    const { error, context, severity = 'error' } = options;
    
    const loggedError: LoggedError = {
      message,
      severity,
      timestamp: new Date().toISOString(),
      context,
    };

    // Add error details if available
    if (error instanceof Error) {
      loggedError.error = error;
      loggedError.stack = error.stack;
    } else if (error) {
      // Handle non-Error objects
      loggedError.context = {
        ...context,
        errorObject: error,
      };
    }

    // Console logging in development
    if (this.isDevelopment) {
      this.logToConsole(loggedError);
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring(loggedError);
    }

    // Always log critical errors
    if (severity === 'critical') {
      console.error('[CRITICAL ERROR]', loggedError);
    }
  }

  /**
   * Log to console with appropriate method
   */
  private logToConsole(loggedError: LoggedError): void {
    const { message, severity, error, context } = loggedError;
    
    const prefix = `[${severity.toUpperCase()}] ${loggedError.timestamp}`;
    const logData = {
      message,
      ...(context && { context }),
      ...(error && { error }),
    };

    switch (severity) {
      case 'debug':
        console.debug(prefix, logData);
        break;
      case 'info':
        console.info(prefix, logData);
        break;
      case 'warning':
        console.warn(prefix, logData);
        break;
      case 'error':
      case 'critical':
        console.error(prefix, logData);
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack);
        }
        break;
    }
  }

  /**
   * Send error to monitoring service (Sentry, LogRocket, etc.)
   * 
   * TODO: Integrate with actual monitoring service
   */
  private sendToMonitoring(loggedError: LoggedError): void {
    // Example integration points:
    
    // Sentry
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(loggedError.error || new Error(loggedError.message), {
    //     level: loggedError.severity,
    //     extra: loggedError.context,
    //   });
    // }

    // LogRocket
    // if (typeof LogRocket !== 'undefined') {
    //   LogRocket.captureException(loggedError.error || new Error(loggedError.message), {
    //     extra: loggedError.context,
    //   });
    // }

    // For now, just store in a queue for future processing
    if (typeof window !== 'undefined') {
      // Client-side: Could send to /api/log endpoint
      this.queueForRemoteLogging(loggedError);
    }
  }

  /**
   * Queue error for remote logging
   */
  private queueForRemoteLogging(loggedError: LoggedError): void {
    // Store in memory queue (in production, send to API)
    if (!window._errorQueue) {
      window._errorQueue = [];
    }
    
    window._errorQueue.push(loggedError);

    // TODO: Implement batched sending to /api/log endpoint
    // Example:
    // if (window._errorQueue.length >= 10) {
    //   this.flushErrorQueue();
    // }
  }

  /**
   * Convenience methods for different severity levels
   */
  debug(message: string, context?: ErrorContext): void {
    this.log(message, { severity: 'debug', context });
  }

  info(message: string, context?: ErrorContext): void {
    this.log(message, { severity: 'info', context });
  }

  warning(message: string, context?: ErrorContext): void {
    this.log(message, { severity: 'warning', context });
  }

  error(message: string, error?: Error | unknown, context?: ErrorContext): void {
    this.log(message, { severity: 'error', error, context });
  }

  critical(message: string, error?: Error | unknown, context?: ErrorContext): void {
    this.log(message, { severity: 'critical', error, context });
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

// Convenience exports
export const logError = errorLogger.error.bind(errorLogger);
export const logWarning = errorLogger.warning.bind(errorLogger);
export const logInfo = errorLogger.info.bind(errorLogger);
export const logDebug = errorLogger.debug.bind(errorLogger);
export const logCritical = errorLogger.critical.bind(errorLogger);

// Extend Window interface for TypeScript
declare global {
  interface Window {
    _errorQueue?: LoggedError[];
  }
}
