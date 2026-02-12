/**
 * API Error Handling
 * 
 * Standardized error responses for all API endpoints.
 * Provides consistent error format and proper HTTP status codes.
 * 
 * @version 1.0.0
 * @created February 11, 2026
 */

import { NextResponse } from 'next/server';
import { logError, logWarning } from '@/lib/monitoring/errorLogger';
import { ZodError } from 'zod';

/**
 * Standard error codes
 */
export enum ApiErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    cached?: boolean;
    timestamp?: string;
    version?: string;
  };
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
  });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: Error | ApiError | ZodError | unknown,
  context?: Record<string, any>
): NextResponse<ApiResponse> {
  // Handle ApiError
  if (error instanceof ApiError) {
    // Log based on severity
    if (error.statusCode >= 500) {
      logError(error.message, error, { ...context, code: error.code });
    } else {
      logWarning(error.message, { ...context, code: error.code });
    }

    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    logWarning('Validation error', { ...context, details });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Invalid input data',
          details,
        },
      },
      { status: 400 }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    logError('API error', error, context);

    // Don't expose internal error details in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : error.message;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message,
          ...(process.env.NODE_ENV === 'development' && {
            details: { stack: error.stack },
          }),
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  logError('Unknown error type', error, context);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Validation error helper
 */
export function validationError(
  message: string,
  details?: any
): ApiError {
  return new ApiError(
    ApiErrorCode.VALIDATION_ERROR,
    message,
    400,
    details
  );
}

/**
 * Not found error helper
 */
export function notFoundError(
  resource: string
): ApiError {
  return new ApiError(
    ApiErrorCode.NOT_FOUND,
    `${resource} not found`,
    404
  );
}

/**
 * Rate limit error helper
 */
export function rateLimitError(
  retryAfter?: number
): ApiError {
  return new ApiError(
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Please try again later.',
    429,
    retryAfter ? { retryAfter } : undefined
  );
}

/**
 * Calculation error helper
 */
export function calculationError(
  message: string,
  details?: any
): ApiError {
  return new ApiError(
    ApiErrorCode.CALCULATION_ERROR,
    message,
    500,
    details
  );
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(
  message = 'Authentication required'
): ApiError {
  return new ApiError(
    ApiErrorCode.UNAUTHORIZED,
    message,
    401
  );
}

/**
 * Forbidden error helper
 */
export function forbiddenError(
  message = 'Access denied'
): ApiError {
  return new ApiError(
    ApiErrorCode.FORBIDDEN,
    message,
    403
  );
}

/**
 * Async handler wrapper with automatic error handling
 * 
 * Usage:
 * export const POST = withErrorHandling(async (req) => {
 *   // Your handler code
 *   const data = await doSomething();
 *   return successResponse(data);
 * });
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<ApiResponse<R>>>
) {
  return async (...args: T): Promise<NextResponse<ApiResponse<R>>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
