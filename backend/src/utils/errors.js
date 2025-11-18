/**
 * Custom Error Classes
 * Provides structured error handling throughout the application
 */

/**
 * Base API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

/**
 * 401 Unauthorized
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

/**
 * 403 Forbidden
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

/**
 * 404 Not Found
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

/**
 * 409 Conflict
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message);
  }
}

/**
 * 422 Unprocessable Entity
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(422, message);
  }
}

/**
 * 429 Too Many Requests
 */
class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(429, message);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}

/**
 * 503 Service Unavailable
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable') {
    super(503, message);
  }
}

/**
 * Error handler middleware
 * Catches all errors and sends appropriate response
 */
function errorHandler(err, req, res, next) {
  const logger = require('./logger');

  // Default to 500 if statusCode not set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  if (statusCode >= 500) {
    logger.error('Internal server error', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * Async handler wrapper
 * Catches async errors and passes to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
    },
  });
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
