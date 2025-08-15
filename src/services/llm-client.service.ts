import { logger } from "../logger";
import { LLM_CONFIG } from "../config/constants";
import llmAnalystQueryService from "./llm-analyst-query.service";

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
 */
export class LLMClientService {
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
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    if (!provider) {
      throw new Error("LLM_PROVIDER environment variable not set");
    }

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
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    if (!provider) {
      throw new Error("LLM_PROVIDER environment variable not set");
    }

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
   * Call OpenAI API for insight generation
   */
  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = process.env.OPENAI_MODEL || LLM_CONFIG.DEFAULT_OPENAI_MODEL;

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
      logger.error(`OPENAI RESPONSE: Empty content! Full response:`, response);
      throw new Error("Empty response from OpenAI");
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
  }

  /**
   * Call Anthropic API for insight generation
   */
  private async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable not set");
    }

    const { Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const model =
      process.env.ANTHROPIC_MODEL || LLM_CONFIG.DEFAULT_ANTHROPIC_MODEL;
    const maxTokens = parseInt(
      process.env.LLM_MAX_TOKENS || LLM_CONFIG.DEFAULT_MAX_TOKENS.toString(),
      10,
    );

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Invalid response from Anthropic");
    }

    return content.text;
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
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
      const response = await openai.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: "auto",
      });

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
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable not set");
    }

    const { Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
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
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: LLM_CONFIG.DEFAULT_TEMPERATURE,
        system: systemPrompt,
        messages,
        tools,
      });

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
   */
  validateConfiguration(): void {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    if (!provider) {
      throw new Error("LLM_PROVIDER environment variable is required");
    }

    switch (provider) {
      case "openai":
        if (!process.env.OPENAI_API_KEY) {
          throw new Error(
            "OPENAI_API_KEY is required when using OpenAI provider",
          );
        }
        break;
      case "anthropic":
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error(
            "ANTHROPIC_API_KEY is required when using Anthropic provider",
          );
        }
        break;
      default:
        throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
    }
  }
}
