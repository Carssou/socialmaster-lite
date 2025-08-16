import { setTimeout } from "timers";
import { logger } from "../logger";
import {
  LLMProviderError,
  DataRetrievalError,
  InsightProcessingError,
  ApiError,
} from "./errors";

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  jitterMs?: number;
}

export interface RetryableError {
  retryable: boolean;
  retryAfter?: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  jitterMs: 100,
};

/**
 * Utility class for handling retryable operations with exponential backoff
 */
export class RetryHandler {
  /**
   * Execute a function with retry logic
   */
  static async execute<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    operationName: string = "operation",
  ): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;
    let attempt = 1;

    while (attempt <= opts.maxAttempts) {
      try {
        logger.debug(
          `Attempting ${operationName} (attempt ${attempt}/${opts.maxAttempts})`,
        );
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          logger.error(
            `${operationName} failed with non-retryable error:`,
            error,
          );
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt >= opts.maxAttempts) {
          logger.error(
            `${operationName} failed after ${opts.maxAttempts} attempts:`,
            error,
          );
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, opts, error);

        logger.warn(
          `${operationName} failed (attempt ${attempt}/${opts.maxAttempts}), retrying in ${delay}ms:`,
          error instanceof Error ? error.message : error,
        );

        await this.sleep(delay);
        attempt++;
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: unknown): boolean {
    // Check specific error types
    if (
      error instanceof LLMProviderError ||
      error instanceof DataRetrievalError ||
      error instanceof InsightProcessingError
    ) {
      return error.retryable;
    }

    // Check for network errors (axios, fetch, etc.)
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorName = error.name.toLowerCase();

      // Network-related errors that are typically retryable
      const retryablePatterns = [
        "network error",
        "timeout",
        "connection reset",
        "econnreset",
        "enotfound",
        "socket hang up",
        "connect etimedout",
        "read etimedout",
      ];

      if (
        retryablePatterns.some(
          (pattern) =>
            errorMessage.includes(pattern) || errorName.includes(pattern),
        )
      ) {
        return true;
      }
    }

    // Check HTTP status codes for retryable conditions
    if (error instanceof ApiError) {
      // 5xx server errors are generally retryable
      // 429 (rate limit) is retryable with backoff
      return error.statusCode >= 500 || error.statusCode === 429;
    }

    // Default to non-retryable for unknown errors
    return false;
  }

  /**
   * Calculate delay for next retry attempt
   */
  private static calculateDelay(
    attempt: number,
    options: RetryOptions,
    error?: unknown,
  ): number {
    // Check if error specifies a retry-after time
    let baseDelay = options.initialDelayMs;

    if (error instanceof LLMProviderError && error.retryAfter) {
      baseDelay = error.retryAfter * 1000; // Convert seconds to milliseconds
    }

    // Apply exponential backoff
    const exponentialDelay =
      baseDelay * Math.pow(options.backoffFactor, attempt - 1);

    // Apply max delay limit
    const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);

    // Add jitter to prevent thundering herd
    const jitter = options.jitterMs ? Math.random() * options.jitterMs : 0;

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retry handler with custom options for AI insights operations
   */
  static forAIInsights(): typeof RetryHandler {
    const aiInsightsOptions: RetryOptions = {
      maxAttempts: 3,
      initialDelayMs: 2000,
      maxDelayMs: 60000,
      backoffFactor: 2,
      jitterMs: 500,
    };

    return {
      execute: <T>(
        operation: () => Promise<T>,
        options: Partial<RetryOptions> = {},
        operationName: string = "AI insights operation",
      ) =>
        this.execute(
          operation,
          { ...aiInsightsOptions, ...options },
          operationName,
        ),
    } as typeof RetryHandler;
  }

  /**
   * Create a retry handler with custom options for data retrieval operations
   */
  static forDataRetrieval(): typeof RetryHandler {
    const dataRetrievalOptions: RetryOptions = {
      maxAttempts: 2,
      initialDelayMs: 1000,
      maxDelayMs: 15000,
      backoffFactor: 3,
      jitterMs: 200,
    };

    return {
      execute: <T>(
        operation: () => Promise<T>,
        options: Partial<RetryOptions> = {},
        operationName: string = "data retrieval operation",
      ) =>
        this.execute(
          operation,
          { ...dataRetrievalOptions, ...options },
          operationName,
        ),
    } as typeof RetryHandler;
  }
}
