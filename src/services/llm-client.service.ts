import { logger } from "../logger";
import { LLM_CONFIG } from "../config/constants";
import llmAnalystQueryService from "./llm-analyst-query.service";
import { RetryHandler } from "../utils/retry";
import { LLMProviderError } from "../utils/errors";

/**
 * Function definition for LLM analyst query tools
 */
interface LLMFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Service responsible only for LLM API interactions
 * Separated from business logic and data processing
 * Now supports function calling for analyst queries
 *
 * Features:
 * - Exponential backoff retry logic for rate limits and transient errors
 * - Automatic handling of 429 (rate limit) and 5xx server errors
 * - Respect for Retry-After headers from API providers
 * - Comprehensive error classification and logging
 */
export class LLMClientService {
  private readonly requiredApiKeys: Map<string, string>;

  constructor() {
    // Define required API keys for each provider
    this.requiredApiKeys = new Map([
      ["openai", "OPENAI_API_KEY"],
      ["anthropic", "ANTHROPIC_API_KEY"],
    ]);

    // Validate configuration immediately on instantiation
    this.validateConfiguration();
  }
  /**
   * Define analyst query functions available to the LLM
   */
  private getAnalystQueryFunctions(): LLMFunction[] {
    return [
      {
        name: "getAccountAnalyses",
        description:
          "ALWAYS call this first before generating insights. Returns previous insights for this specific Instagram account so you can avoid repeating recommendations and build upon past analysis.",
        parameters: {
          type: "object",
          properties: {
            socialAccountId: {
              type: "string",
              description: "Social account ID to get analyses for",
            },
            limit: {
              type: "number",
              description: "Maximum results to return (default: 30)",
            },
          },
          required: ["socialAccountId"],
        },
      },
      {
        name: "searchAnalyses",
        description:
          "Search past insights by topic (e.g. 'engagement', 'posting time', 'hashtags'). Use this when you want to see if you've already analyzed a specific topic or strategy before.",
        parameters: {
          type: "object",
          properties: {
            keywords: {
              type: "string",
              description:
                "Topic or strategy to search for (e.g. 'engagement rate', 'posting frequency', 'content type')",
            },
            limit: {
              type: "number",
              description: "Maximum results to return (default: 20)",
            },
          },
          required: ["keywords"],
        },
      },
      {
        name: "getTopInsights",
        description:
          "Get the highest-scoring previous insights to see what recommendations have been most impactful for this user or account.",
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to filter by (optional)",
            },
            socialAccountId: {
              type: "string",
              description: "Social account ID to filter by (optional)",
            },
            limit: {
              type: "number",
              description: "Maximum results to return (default: 10)",
            },
          },
          required: [],
        },
      },
      {
        name: "getAnalysisSummary",
        description:
          "Get overview statistics about how many previous insights exist, their impact levels, and types. Useful to understand the scope of past analysis.",
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to get summary for",
            },
            days: {
              type: "number",
              description: "Number of days to analyze (default: 30)",
            },
          },
          required: ["userId"],
        },
      },
    ];
  }

  /**
   * Execute an analyst query function call
   */
  private async executeAnalystFunction(
    functionName: string,
    parameters: any,
  ): Promise<any> {
    logger.info(
      `LLM ANALYST: Executing function ${functionName} with parameters:`,
      parameters,
    );

    try {
      switch (functionName) {
        case "getAccountAnalyses":
          return await llmAnalystQueryService.getAccountAnalyses(
            parameters.socialAccountId,
            parameters.limit,
          );

        case "searchAnalyses":
          return await llmAnalystQueryService.searchAnalyses(
            parameters.keywords,
            parameters.limit,
          );

        case "getTopInsights":
          return await llmAnalystQueryService.getTopInsights(
            parameters.userId,
            parameters.socialAccountId,
            parameters.limit,
          );

        case "getAnalysisSummary":
          return await llmAnalystQueryService.getAnalysisSummary(
            parameters.userId,
            parameters.days,
          );

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      logger.error(`LLM ANALYST: Function ${functionName} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate insights with analyst context (function calling enabled)
   */
  async generateInsightsWithContext(
    systemPrompt: string,
    userPrompt: string,
    userId: string,
    socialAccountId?: string,
  ): Promise<string> {
    const provider = this.getValidatedProvider();

    try {
      switch (provider) {
        case "openai":
          return await this.callOpenAIWithFunctions(
            systemPrompt,
            userPrompt,
            userId,
            socialAccountId,
          );
        case "anthropic":
          return await this.callAnthropicWithFunctions(
            systemPrompt,
            userPrompt,
            userId,
            socialAccountId,
          );
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`LLM API call with context failed (${provider}):`, error);
      throw new Error(
        `Failed to generate insights with context via ${provider}`,
      );
    }
  }

  /**
   * Call LLM service for insight generation
   * Supports both OpenAI and Anthropic based on environment configuration
   */
  async generateInsights(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const provider = this.getValidatedProvider();

    try {
      switch (provider) {
        case "openai":
          return await this.callOpenAI(systemPrompt, userPrompt);
        case "anthropic":
          return await this.callAnthropic(systemPrompt, userPrompt);
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`LLM API call failed (${provider}):`, error);
      throw new Error(`Failed to generate insights via ${provider}`);
    }
  }

  /**
   * Call OpenAI API for insight generation with rate limiting and retry logic
   */
  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    return await RetryHandler.forAIInsights().execute(
      async () => {
        const apiKey = this.getApiKey("openai");

        const { OpenAI } = await import("openai");
        const openai = new OpenAI({
          apiKey: apiKey,
        });

        const model =
          process.env.OPENAI_MODEL || LLM_CONFIG.DEFAULT_OPENAI_MODEL;

        try {
          const response = await openai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const content = response.choices[0]?.message?.content;

          logger.info(`OPENAI RESPONSE: Full response object:`, {
            choices: response.choices?.length || 0,
            model: response.model,
            usage: response.usage,
            firstChoiceFinishReason: response.choices[0]?.finish_reason,
          });

          if (!content) {
            logger.error(
              `OPENAI RESPONSE: Empty content! Full response:`,
              response,
            );
            throw LLMProviderError.connectionError();
          }

          logger.info(
            `OPENAI RESPONSE: Content length: ${content.length} characters`,
          );
          logger.info(
            `OPENAI RESPONSE: First 500 characters:`,
            content.substring(0, 500),
          );
          logger.info(
            `OPENAI RESPONSE: Last 200 characters:`,
            content.substring(Math.max(0, content.length - 200)),
          );

          return content;
        } catch (error: any) {
          // Handle OpenAI-specific errors and convert to retryable errors
          if (error?.status === 429) {
            const retryAfter = error?.headers?.["retry-after"]
              ? parseInt(error.headers["retry-after"])
              : undefined;
            throw LLMProviderError.rateLimited(retryAfter);
          }

          if (error?.status >= 500) {
            throw LLMProviderError.connectionError();
          }

          if (error?.code === "insufficient_quota") {
            throw LLMProviderError.quotaExceeded();
          }

          // Re-throw as LLM provider error for proper retry handling
          throw new LLMProviderError(
            `OpenAI API error: ${error?.message || "Unknown error"}`,
            error?.status || 503,
            true,
          );
        }
      },
      {},
      "OpenAI API call",
    );
  }

  /**
   * Call Anthropic API for insight generation with rate limiting and retry logic
   */
  private async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    return await RetryHandler.forAIInsights().execute(
      async () => {
        const apiKey = this.getApiKey("anthropic");

        const { Anthropic } = await import("@anthropic-ai/sdk");
        const anthropic = new Anthropic({
          apiKey: apiKey,
        });

        const model =
          process.env.ANTHROPIC_MODEL || LLM_CONFIG.DEFAULT_ANTHROPIC_MODEL;
        const maxTokens = parseInt(
          process.env.LLM_MAX_TOKENS ||
            LLM_CONFIG.DEFAULT_MAX_TOKENS.toString(),
          10,
        );

        try {
          const response = await anthropic.messages.create({
            model,
            max_tokens: maxTokens,
            temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          });

          const content = response.content[0];
          if (!content || content.type !== "text") {
            throw LLMProviderError.connectionError();
          }

          return content.text;
        } catch (error: any) {
          // Handle Anthropic-specific errors and convert to retryable errors
          if (error?.status === 429) {
            const retryAfter = error?.headers?.["retry-after"]
              ? parseInt(error.headers["retry-after"])
              : undefined;
            throw LLMProviderError.rateLimited(retryAfter);
          }

          if (error?.status >= 500) {
            throw LLMProviderError.connectionError();
          }

          if (error?.error?.type === "credit_limit_exceeded") {
            throw LLMProviderError.quotaExceeded();
          }

          // Re-throw as LLM provider error for proper retry handling
          throw new LLMProviderError(
            `Anthropic API error: ${error?.message || "Unknown error"}`,
            error?.status || 503,
            true,
          );
        }
      },
      {},
      "Anthropic API call",
    );
  }

  /**
   * Call OpenAI API with function calling support
   */
  private async callOpenAIWithFunctions(
    systemPrompt: string,
    userPrompt: string,
    userId: string,
    socialAccountId?: string,
  ): Promise<string> {
    const apiKey = this.getApiKey("openai");

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const model = process.env.OPENAI_MODEL || LLM_CONFIG.DEFAULT_OPENAI_MODEL;
    const functions = this.getAnalystQueryFunctions();

    // Convert our function format to OpenAI format
    const tools = functions.map((func) => ({
      type: "function" as const,
      function: {
        name: func.name,
        description: func.description,
        parameters: func.parameters,
      },
    }));

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Allow multiple function calls
    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      const response = await RetryHandler.forAIInsights().execute(
        async () => {
          try {
            return await openai.chat.completions.create({
              model,
              messages,
              tools,
              tool_choice: "auto",
            });
          } catch (error: any) {
            // Handle OpenAI-specific errors and convert to retryable errors
            if (error?.status === 429) {
              const retryAfter = error?.headers?.["retry-after"]
                ? parseInt(error.headers["retry-after"])
                : undefined;
              throw LLMProviderError.rateLimited(retryAfter);
            }

            if (error?.status >= 500) {
              throw LLMProviderError.connectionError();
            }

            if (error?.code === "insufficient_quota") {
              throw LLMProviderError.quotaExceeded();
            }

            // Re-throw as LLM provider error for proper retry handling
            throw new LLMProviderError(
              `OpenAI function call error: ${error?.message || "Unknown error"}`,
              error?.status || 503,
              true,
            );
          }
        },
        {},
        `OpenAI function call (iteration ${iteration + 1})`,
      );

      const choice = response.choices[0];
      if (!choice?.message) {
        throw new Error("Empty response from OpenAI");
      }

      const message = choice.message;
      messages.push(message);

      // If no tool calls, we're done
      if (!message.tool_calls || message.tool_calls.length === 0) {
        const content = message.content;
        if (!content) {
          throw new Error("Empty content from OpenAI");
        }
        logger.info(
          `OPENAI RESPONSE: Final content length: ${content.length} characters`,
        );
        return content;
      }

      // Execute tool calls
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          let parameters;

          try {
            parameters = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            logger.error(
              `Failed to parse function arguments for ${functionName}:`,
              error,
            );
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: "Invalid function arguments format",
              }),
            });
            continue;
          }

          // Auto-inject userId/socialAccountId if not provided
          if (!parameters.userId && userId) {
            parameters.userId = userId;
          }
          if (
            !parameters.socialAccountId &&
            socialAccountId &&
            functionName === "getAccountAnalyses"
          ) {
            parameters.socialAccountId = socialAccountId;
          }

          const result = await this.executeAnalystFunction(
            functionName,
            parameters,
          );

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      }

      iteration++;
    }

    throw new Error("Max function call iterations reached");
  }

  /**
   * Call Anthropic API with function calling support
   */
  private async callAnthropicWithFunctions(
    systemPrompt: string,
    userPrompt: string,
    userId: string,
    socialAccountId?: string,
  ): Promise<string> {
    const apiKey = this.getApiKey("anthropic");

    const { Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const model =
      process.env.ANTHROPIC_MODEL || LLM_CONFIG.DEFAULT_ANTHROPIC_MODEL;
    const maxTokens = parseInt(
      process.env.LLM_MAX_TOKENS || LLM_CONFIG.DEFAULT_MAX_TOKENS.toString(),
      10,
    );

    const functions = this.getAnalystQueryFunctions();

    // Convert our function format to Anthropic format
    const tools = functions.map((func) => ({
      name: func.name,
      description: func.description,
      input_schema: func.parameters,
    }));

    const messages: any[] = [{ role: "user", content: userPrompt }];
    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      const response = await RetryHandler.forAIInsights().execute(
        async () => {
          try {
            return await anthropic.messages.create({
              model,
              max_tokens: maxTokens,
              temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
              system: systemPrompt,
              messages,
              tools,
            });
          } catch (error: any) {
            // Handle Anthropic-specific errors and convert to retryable errors
            if (error?.status === 429) {
              const retryAfter = error?.headers?.["retry-after"]
                ? parseInt(error.headers["retry-after"])
                : undefined;
              throw LLMProviderError.rateLimited(retryAfter);
            }

            if (error?.status >= 500) {
              throw LLMProviderError.connectionError();
            }

            if (error?.error?.type === "credit_limit_exceeded") {
              throw LLMProviderError.quotaExceeded();
            }

            // Re-throw as LLM provider error for proper retry handling
            throw new LLMProviderError(
              `Anthropic function call error: ${error?.message || "Unknown error"}`,
              error?.status || 503,
              true,
            );
          }
        },
        {},
        `Anthropic function call (iteration ${iteration + 1})`,
      );

      const content = response.content;
      if (!content || content.length === 0) {
        throw new Error("Invalid response from Anthropic");
      }

      let hasToolUse = false;
      let finalText = "";

      for (const block of content) {
        if (block.type === "text") {
          finalText += block.text;
        } else if (block.type === "tool_use") {
          hasToolUse = true;

          // Store any text that came before tool use
          if (finalText) {
            messages.push({
              role: "assistant",
              content: [{ type: "text", text: finalText }],
            });
            finalText = ""; // Clear after adding to messages
          }

          const functionName = block.name;
          const parameters = block.input as any;

          // Validate parameters object
          if (!parameters || typeof parameters !== "object") {
            logger.error(
              `Invalid function parameters for ${functionName}:`,
              parameters,
            );

            // Add the malformed tool use to conversation
            messages.push({
              role: "assistant",
              content: [block],
            });

            // Add error response
            messages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: JSON.stringify({
                    success: false,
                    error: "Invalid function parameters format",
                  }),
                },
              ],
            });
            continue;
          }

          // Auto-inject userId/socialAccountId if not provided
          if (!parameters.userId && userId) {
            parameters.userId = userId;
          }
          if (
            !parameters.socialAccountId &&
            socialAccountId &&
            functionName === "getAccountAnalyses"
          ) {
            parameters.socialAccountId = socialAccountId;
          }

          const result = await this.executeAnalystFunction(
            functionName,
            parameters,
          );

          // Add the tool use to conversation
          messages.push({
            role: "assistant",
            content: [block],
          });

          // Add the tool result
          messages.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(result),
              },
            ],
          });
        }
      }

      if (!hasToolUse) {
        logger.info(
          `ANTHROPIC RESPONSE: Final content length: ${finalText.length} characters`,
        );
        return finalText;
      }

      iteration++;
    }

    throw new Error("Max function call iterations reached");
  }

  /**
   * Validate LLM configuration on startup
   * Ensures all required API keys are present and properly configured
   */
  validateConfiguration(): void {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    // Validate provider is set
    if (!provider) {
      throw new Error(
        "LLM_PROVIDER environment variable is required. Set to 'openai' or 'anthropic'",
      );
    }

    // Validate provider is supported
    if (!this.requiredApiKeys.has(provider)) {
      const supportedProviders = Array.from(this.requiredApiKeys.keys()).join(
        ", ",
      );
      throw new Error(
        `Unsupported LLM_PROVIDER: '${provider}'. Supported providers: ${supportedProviders}`,
      );
    }

    // Validate required API key for the provider
    const requiredKeyName = this.requiredApiKeys.get(provider);
    if (!requiredKeyName) {
      throw new Error(`No API key mapping found for provider: ${provider}`);
    }

    const apiKey = process.env[requiredKeyName];
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error(
        `${requiredKeyName} environment variable is required when using ${provider} provider`,
      );
    }

    // Provider-specific API key format validation
    switch (provider) {
      case "openai":
        if (!apiKey.startsWith("sk-")) {
          logger.warn(
            "OPENAI_API_KEY should start with 'sk-'. Please verify your API key is correct.",
          );
        }
        break;
      case "anthropic":
        if (!apiKey.startsWith("sk-ant-")) {
          logger.warn(
            "ANTHROPIC_API_KEY should start with 'sk-ant-'. Please verify your API key is correct.",
          );
        }
        break;
    }

    logger.info(
      `LLM Provider '${provider}' configuration validated successfully`,
    );
  }

  /**
   * Get the current provider with validation
   */
  private getValidatedProvider(): string {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();
    if (!provider) {
      throw new Error(
        "LLM_PROVIDER not configured. Service initialization failed.",
      );
    }
    return provider;
  }

  /**
   * Securely get API key for the current provider
   */
  private getApiKey(provider: string): string {
    const keyName = this.requiredApiKeys.get(provider);
    if (!keyName) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const apiKey = process.env[keyName];
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error(
        `${keyName} not configured. Please check your environment variables.`,
      );
    }

    return apiKey;
  }
}
