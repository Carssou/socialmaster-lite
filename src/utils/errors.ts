/**
 * Base API error class with enhanced error handling
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
  correlationId: string | undefined;
  isOperational: boolean;

  /**
   * Create a new API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param code Error code for client identification
   * @param details Additional error details
   * @param correlationId Request correlation ID
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    correlationId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code || this.getDefaultErrorCode(statusCode);
    this.details = details;
    this.correlationId = correlationId;
    this.isOperational = true; // This is an expected error

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get default error code based on status code
   */
  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "UNPROCESSABLE_ENTITY";
      case 429:
        return "TOO_MANY_REQUESTS";
      case 500:
        return "INTERNAL_SERVER_ERROR";
      case 502:
        return "BAD_GATEWAY";
      case 503:
        return "SERVICE_UNAVAILABLE";
      default:
        return "UNKNOWN_ERROR";
    }
  }
}

/**
 * Specific error classes for common scenarios
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any, correlationId?: string) {
    super(message, 400, "VALIDATION_ERROR", details, correlationId);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(
    message: string = "Authentication required",
    correlationId?: string,
  ) {
    super(message, 401, "AUTHENTICATION_ERROR", undefined, correlationId);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Access denied", correlationId?: string) {
    super(message, 403, "AUTHORIZATION_ERROR", undefined, correlationId);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, correlationId?: string) {
    super(`${resource} not found`, 404, "NOT_FOUND", undefined, correlationId);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, correlationId?: string) {
    super(message, 409, "CONFLICT", undefined, correlationId);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Rate limit exceeded", correlationId?: string) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", undefined, correlationId);
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(
    message: string = "Service temporarily unavailable",
    correlationId?: string,
  ) {
    super(message, 503, "SERVICE_UNAVAILABLE", undefined, correlationId);
    this.name = "ServiceUnavailableError";
  }
}

import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
// import { BusinessMetrics } from '../services/monitoring/business-metrics'; // Removed enterprise monitoring

/**
 * Generate correlation ID if not present
 */
function getCorrelationId(req: Request): string {
  // Try to get from performance middleware first
  let correlationId = (req as any).requestId;

  // Try headers
  if (!correlationId) {
    correlationId =
      (req.headers["x-correlation-id"] as string) ||
      (req.headers["x-request-id"] as string);
  }

  // Generate new one if still not found
  if (!correlationId) {
    correlationId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  return correlationId;
}

/**
 * Enhanced error handler middleware for Express
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const correlationId = getCorrelationId(req);
  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred";
  let details = undefined;
  let isOperational = false;

  // Handle ApiError and its subclasses
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.code || "UNKNOWN_ERROR";
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;

    // Update correlation ID if not set
    if (!err.correlationId) {
      err.correlationId = correlationId;
    }
  } else if (err.name === "ValidationError" || err.name === "ZodError") {
    // Handle Zod or other validation errors
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = err.errors || err.issues || err.details || err.message;
    isOperational = true;
  } else if (
    err.name === "UnauthorizedError" ||
    err.name === "JsonWebTokenError"
  ) {
    // Handle JWT authentication errors
    statusCode = 401;
    errorCode = "AUTHENTICATION_ERROR";
    message = "Authentication failed";
    isOperational = true;
  } else if (err.name === "TokenExpiredError") {
    // Handle expired JWT tokens
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Authentication token has expired";
    isOperational = true;
  } else if (err.code === "ECONNREFUSED") {
    // Handle database connection errors
    statusCode = 503;
    errorCode = "SERVICE_UNAVAILABLE";
    message = "Database connection failed";
    isOperational = true;
  } else if (err.code === "23505") {
    // Handle PostgreSQL unique constraint violation
    statusCode = 409;
    errorCode = "DUPLICATE_ENTRY";
    message = "Resource already exists";
    isOperational = true;
  } else if (err.code === "23503") {
    // Handle PostgreSQL foreign key constraint violation
    statusCode = 400;
    errorCode = "FOREIGN_KEY_VIOLATION";
    message = "Invalid reference to related resource";
    isOperational = true;
  }

  // Extract user ID for error tracking
  const userId = (req as any).user?.id || (req as any).user?.userId;

  // Log the error with structured logging
  const logData = {
    correlationId,
    statusCode,
    errorCode,
    message,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId,
    details,
    stack: isOperational ? undefined : err.stack, // Only log stack for unexpected errors
    isOperational,
  };

  if (isOperational) {
    logger.warn("Operational error occurred", logData);
  } else {
    logger.error("Unexpected error occurred", logData);
  }

  // Track error in business metrics - REMOVED: Enterprise monitoring
  // BusinessMetrics.trackError(errorCode, message, {
  //   userId,
  //   statusCode,
  //   correlationId,
  //   url: req.originalUrl,
  //   method: req.method,
  //   severity: statusCode >= 500 ? 'high' : 'medium',
  // });

  // Send standardized error response
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    },
  };

  // Add additional debug info in development
  if (process.env.NODE_ENV === "development" && !isOperational) {
    response.error = {
      ...response.error,
      stack: err.stack,
    } as any;
  }

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const correlationId = getCorrelationId(req);

  logger.warn("Route not found", {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found",
      correlationId,
      timestamp: new Date().toISOString(),
    },
  });
};
