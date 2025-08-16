import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { 
  LLMProviderError, 
  DataRetrievalError, 
  InsightProcessingError 
} from "../src/utils/errors";
import { RetryHandler } from "../src/utils/retry";

describe("AI Insights Error Handling", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set required environment variables
    process.env.LLM_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test-key-for-testing";

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Error Classification", () => {
    it("should classify LLM provider rate limit errors correctly", async () => {
      const rateLimitError = LLMProviderError.rateLimited(60);
      
      expect(rateLimitError.retryable).toBe(true);
      expect(rateLimitError.retryAfter).toBe(60);
      expect(rateLimitError.statusCode).toBe(429);
      expect(rateLimitError.code).toBe("LLM_PROVIDER_ERROR");
    });

    it("should classify LLM provider quota exceeded errors correctly", async () => {
      const quotaError = LLMProviderError.quotaExceeded();
      
      expect(quotaError.retryable).toBe(false);
      expect(quotaError.statusCode).toBe(429);
      expect(quotaError.code).toBe("LLM_PROVIDER_ERROR");
    });

    it("should classify data retrieval errors correctly", async () => {
      const dataError = DataRetrievalError.apifyError("API timeout");
      
      expect(dataError.retryable).toBe(true);
      expect(dataError.statusCode).toBe(503);
      expect(dataError.code).toBe("DATA_RETRIEVAL_ERROR");
    });

    it("should classify insight processing errors correctly", async () => {
      const processingError = InsightProcessingError.parseError("Invalid JSON response");
      
      expect(processingError.retryable).toBe(false);
      expect(processingError.statusCode).toBe(502);
      expect(processingError.code).toBe("INSIGHT_PROCESSING_ERROR");
    });

    it("should classify insufficient data errors as non-retryable", async () => {
      const insufficientDataError = DataRetrievalError.insufficientData();
      
      expect(insufficientDataError.retryable).toBe(false);
      expect(insufficientDataError.statusCode).toBe(422);
    });
  });

  describe("Retry Logic", () => {
    it("should retry retryable operations", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        if (attemptCount < 3) {
          throw LLMProviderError.connectionError();
        }
        return "success";
      };

      const result = await RetryHandler.execute(operation, { maxAttempts: 3 }, "test operation");
      
      expect(result).toBe("success");
      expect(attemptCount).toBe(3);
    });

    it("should not retry non-retryable operations", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw LLMProviderError.quotaExceeded();
      };

      await expect(
        RetryHandler.execute(operation, { maxAttempts: 3 }, "test operation")
      ).rejects.toThrow(LLMProviderError);
      
      expect(attemptCount).toBe(1);
    });

    it("should respect retry-after delays", async () => {
      const startTime = Date.now();
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw LLMProviderError.rateLimited(1); // 1 second retry-after
      };

      await expect(
        RetryHandler.execute(operation, { maxAttempts: 2 }, "test operation")
      ).rejects.toThrow(LLMProviderError);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(800); // Allow some margin for test execution
    });

    it("should handle exponential backoff correctly", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw LLMProviderError.connectionError();
      };

      const startTime = Date.now();
      
      await expect(
        RetryHandler.execute(
          operation, 
          { maxAttempts: 3, initialDelayMs: 100, backoffFactor: 2 }, 
          "test operation"
        )
      ).rejects.toThrow(LLMProviderError);

      const elapsed = Date.now() - startTime;
      // Should have delays of ~100ms + ~200ms = ~300ms minimum
      expect(elapsed).toBeGreaterThan(250);
    });
  });

  describe("Error Context and Logging", () => {
    it("should provide detailed error context for debugging", () => {
      const error = LLMProviderError.invalidResponse("Malformed JSON");
      
      expect(error.message).toContain("Invalid LLM response: Malformed JSON");
      expect(error.details).toEqual({ retryable: false, retryAfter: undefined });
      expect(error.name).toBe("LLMProviderError");
    });

    it("should include correlation IDs in errors", () => {
      const correlationId = "test-correlation-123";
      const error = DataRetrievalError.apifyError("Test error", correlationId);
      
      expect(error.correlationId).toBe(correlationId);
    });

    it("should handle error chaining correctly", () => {
      const originalError = new Error("Original network error");
      const wrappedError = new DataRetrievalError(
        `Wrapped error: ${originalError.message}`,
        503,
        true
      );
      
      expect(wrappedError.message).toContain("Original network error");
      expect(wrappedError.retryable).toBe(true);
    });
  });

  describe("Retry Handler Edge Cases", () => {
    it("should handle undefined retry-after values", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw new LLMProviderError("Test error", 503, true, undefined);
      };

      await expect(
        RetryHandler.execute(operation, { maxAttempts: 2 }, "test operation")
      ).rejects.toThrow(LLMProviderError);
      
      expect(attemptCount).toBe(2);
    });

    it("should cap delays at maxDelayMs", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw LLMProviderError.connectionError();
      };

      const startTime = Date.now();
      
      await expect(
        RetryHandler.execute(
          operation, 
          { 
            maxAttempts: 3, 
            initialDelayMs: 1000, 
            maxDelayMs: 500, // Cap lower than initial delay
            backoffFactor: 2 
          }, 
          "test operation"
        )
      ).rejects.toThrow(LLMProviderError);

      const elapsed = Date.now() - startTime;
      // Should be capped at maxDelayMs (500ms) * 2 attempts = ~1000ms
      expect(elapsed).toBeLessThan(1500);
    });

    it("should handle network errors as retryable", async () => {
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        const networkError = new Error("ECONNRESET");
        networkError.name = "NetworkError";
        throw networkError;
      };

      await expect(
        RetryHandler.execute(operation, { maxAttempts: 2 }, "test operation")
      ).rejects.toThrow("ECONNRESET");
      
      expect(attemptCount).toBe(2); // Should retry network errors
    });
  });
});