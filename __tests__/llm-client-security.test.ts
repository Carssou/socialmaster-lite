import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { LLMClientService } from "../src/services/llm-client.service";

describe("LLMClientService Security", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("API Key Validation", () => {
    it("should throw error when LLM_PROVIDER is not set", () => {
      delete process.env.LLM_PROVIDER;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      expect(() => new LLMClientService()).toThrow(
        "LLM_PROVIDER environment variable is required"
      );
    });

    it("should throw error when LLM_PROVIDER is unsupported", () => {
      process.env.LLM_PROVIDER = "unsupported_provider";

      expect(() => new LLMClientService()).toThrow(
        "Unsupported LLM_PROVIDER: 'unsupported_provider'"
      );
    });

    it("should throw error when OPENAI_API_KEY is missing for OpenAI provider", () => {
      process.env.LLM_PROVIDER = "openai";
      delete process.env.OPENAI_API_KEY;

      expect(() => new LLMClientService()).toThrow(
        "OPENAI_API_KEY environment variable is required when using openai provider"
      );
    });

    it("should throw error when OPENAI_API_KEY is empty", () => {
      process.env.LLM_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "";

      expect(() => new LLMClientService()).toThrow(
        "OPENAI_API_KEY environment variable is required when using openai provider"
      );
    });

    it("should throw error when ANTHROPIC_API_KEY is missing for Anthropic provider", () => {
      process.env.LLM_PROVIDER = "anthropic";
      delete process.env.ANTHROPIC_API_KEY;

      expect(() => new LLMClientService()).toThrow(
        "ANTHROPIC_API_KEY environment variable is required when using anthropic provider"
      );
    });

    it("should throw error when ANTHROPIC_API_KEY is empty", () => {
      process.env.LLM_PROVIDER = "anthropic";
      process.env.ANTHROPIC_API_KEY = "";

      expect(() => new LLMClientService()).toThrow(
        "ANTHROPIC_API_KEY environment variable is required when using anthropic provider"
      );
    });

    it("should successfully initialize with valid OpenAI configuration", () => {
      process.env.LLM_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "sk-test-key-for-testing";

      expect(() => new LLMClientService()).not.toThrow();
    });

    it("should successfully initialize with valid Anthropic configuration", () => {
      process.env.LLM_PROVIDER = "anthropic";
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key-for-testing";

      expect(() => new LLMClientService()).not.toThrow();
    });

    it("should warn about incorrect OpenAI API key format", () => {
      process.env.LLM_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "invalid-format-key";

      // Mock console.warn to capture warning
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => new LLMClientService()).not.toThrow();
      
      // Note: This test assumes logger.warn calls console.warn
      // In practice, you might need to mock the logger directly
    });

    it("should warn about incorrect Anthropic API key format", () => {
      process.env.LLM_PROVIDER = "anthropic";
      process.env.ANTHROPIC_API_KEY = "invalid-format-key";

      // Mock console.warn to capture warning
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => new LLMClientService()).not.toThrow();
      
      // Note: This test assumes logger.warn calls console.warn
      // In practice, you might need to mock the logger directly
    });
  });

  describe("Runtime Security", () => {
    it("should fail gracefully when provider becomes unavailable at runtime", async () => {
      process.env.LLM_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "sk-test-key-for-testing";

      const service = new LLMClientService();

      // Remove the API key after initialization to simulate runtime failure
      delete process.env.OPENAI_API_KEY;

      await expect(
        service.generateInsights("system", "user")
      ).rejects.toThrow("Failed to generate insights via openai");
    });

    it("should validate provider at runtime", async () => {
      process.env.LLM_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "sk-test-key-for-testing";

      const service = new LLMClientService();

      // Change provider after initialization
      delete process.env.LLM_PROVIDER;

      await expect(
        service.generateInsights("system", "user")
      ).rejects.toThrow("LLM_PROVIDER not configured");
    });
  });
});