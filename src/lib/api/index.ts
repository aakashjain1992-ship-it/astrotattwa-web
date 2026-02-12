/**
 * API Utilities Index
 * 
 * Central export for all API-related utilities
 */

// Error handling
export {
  ApiError,
  ApiErrorCode,
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  rateLimitError,
  calculationError,
  unauthorizedError,
  forbiddenError,
  withErrorHandling,
  type ApiResponse,
} from './errorHandling';

// Rate limiting
export {
  rateLimit,
  RateLimitPresets,
  addRateLimitHeaders,
  type RateLimitConfig,
} from './rateLimit';
