import { logger } from "../logger";
import { LLM_CONFIG } from "../config/constants";

/**
 * Service responsible only for LLM API interactions
 * Separated from business logic and data processing
 */
export class LLMClientService {
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
