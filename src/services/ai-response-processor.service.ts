import { logger } from "../logger";
import { TIME_INTERVALS, LLM_CONFIG } from "../config/constants";
import { AIAnalysisDB } from "../data/ai-analysis-data.service";

// Interface for LLM-generated insight response
export interface LLMInsightResponse {
  type: string;
  category: string;
  title: string;
  description: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  impact: string;
  urgency: string;
}

/**
 * Service responsible for processing LLM responses and converting to database format
 * Separates response processing from API calls and database operations
 */
export class AIResponseProcessorService {
  /**
   * Parse and validate LLM response
   */
  parseInsightResponse(response: string): LLMInsightResponse[] {
    let parsedResponse: LLMInsightResponse[];

    try {
      // Remove markdown code blocks if present
      const cleanResponse = response
        .replace(/```json\n?/, "")
        .replace(/```$/, "")
        .trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      logger.error("Failed to parse LLM response as JSON:", parseError);
      logger.debug("Raw LLM response:", response);
      throw new Error("LLM returned invalid JSON format");
    }

    // Validate response structure
    if (!Array.isArray(parsedResponse)) {
      throw new Error("LLM response must be an array of insights");
    }

    // Validate each insight has required fields
    parsedResponse.forEach((insight, index) => {
      if (
        !insight.type ||
        !insight.category ||
        !insight.title ||
        !insight.insights ||
        !insight.recommendations
      ) {
        throw new Error(`Invalid insight structure at index ${index}`);
      }
    });

    logger.info(
      `Successfully parsed ${parsedResponse.length} insights from LLM response`,
    );
    return parsedResponse;
  }

  /**
   * Convert LLM insight to database format
   */
  convertInsightToDbFormat(
    userId: string,
    socialAccountId: string,
    insight: LLMInsightResponse,
    supportingData: any,
  ): Partial<AIAnalysisDB> {
    // Convert insights and recommendations to explanation text
    const explanation = `INSIGHTS:\n${insight.insights.map((i) => `• ${i}`).join("\n")}\n\nRECOMMENDATIONS:\n${insight.recommendations.map((r) => `• ${r}`).join("\n")}`;

    return {
      user_id: userId,
      social_account_id: socialAccountId,
      type: insight.type,
      category: insight.category,
      title: insight.title,
      description: insight.description,
      explanation: explanation,
      confidence: insight.confidence,
      impact: insight.impact.toLowerCase(),
      urgency: insight.urgency.toLowerCase(),
      is_active: true,
      valid_until: new Date(
        Date.now() +
          TIME_INTERVALS.AI_INSIGHT_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
      ),
      supporting_data: supportingData,
      generation_metadata: {
        generatedAt: new Date(),
        version: "1.0",
        algorithm: "llm_generated",
        llmModel: this.getLLMModelName(),
        originalType: insight.type,
        originalCategory: insight.category,
        originalInsights: insight.insights,
        originalRecommendations: insight.recommendations,
      },
    };
  }

  /**
   * Get the current LLM model name for metadata
   */
  private getLLMModelName(): string {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    switch (provider) {
      case "openai":
        return process.env.OPENAI_MODEL || LLM_CONFIG.DEFAULT_OPENAI_MODEL;
      case "anthropic":
        return (
          process.env.ANTHROPIC_MODEL || LLM_CONFIG.DEFAULT_ANTHROPIC_MODEL
        );
      default:
        return "unknown";
    }
  }

  /**
   * Process multiple insights for batch storage
   */
  processInsightsBatch(
    userId: string,
    socialAccountId: string,
    insights: LLMInsightResponse[],
    supportingData: any,
  ): Partial<AIAnalysisDB>[] {
    return insights.map((insight) =>
      this.convertInsightToDbFormat(
        userId,
        socialAccountId,
        insight,
        supportingData,
      ),
    );
  }
}
