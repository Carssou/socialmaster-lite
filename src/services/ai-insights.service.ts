import { setTimeout } from "timers";
import {
  ApiError,
  LLMProviderError,
  DataRetrievalError,
  InsightProcessingError,
} from "../utils/errors";
import { RetryHandler } from "../utils/retry";
import { logger } from "../logger";
import { TIME_INTERVALS } from "../config/constants";
import { LLMClientService } from "./llm-client.service";
import { AIPromptService } from "./ai-prompt.service";
import { AIResponseProcessorService } from "./ai-response-processor.service";
import {
  AIAnalysisDataService,
  AIAnalysisDB,
} from "../data/ai-analysis-data.service";
import apifyService from "./apify.service";
import llmAnalystQueryService from "./llm-analyst-query.service";

/**
 * Service for generating AI insights from Instagram metrics using LLM
 * REFACTORED: Clean implementation using separated concerns and focused services
 */
export class AIInsightsService {
  private llmClient: LLMClientService;
  private promptService: AIPromptService;
  private responseProcessor: AIResponseProcessorService;
  private dataService: AIAnalysisDataService;

  constructor() {
    this.llmClient = new LLMClientService();
    this.promptService = new AIPromptService();
    this.responseProcessor = new AIResponseProcessorService();
    this.dataService = new AIAnalysisDataService();

    // Validate configuration on startup
    this.llmClient.validateConfiguration();
  }

  /**
   * Reload system prompt from file (useful during development)
   */
  public reloadSystemPrompt(): void {
    try {
      this.promptService.reloadSystemPrompt();
      logger.info("System prompt reloaded successfully");
    } catch (error) {
      logger.error("Failed to reload system prompt:", error);
      throw new ApiError("Failed to reload system prompt", 500);
    }
  }

  /**
   * Generate insights for a social account using LLM analysis
   * MAIN ENTRY POINT: Orchestrates the entire insight generation process
   */
  async generateAccountInsights(
    userId: string,
    socialAccountId: string,
    forceRefresh: boolean = false,
  ): Promise<AIAnalysisDB[]> {
    try {
      logger.info(
        `AI INSIGHTS: Generating AI insights for account: ${socialAccountId}, user: ${userId}`,
      );

      // Step 1: Check for recent insights first
      let recentInsights: AIAnalysisDB[] = [];

      if (forceRefresh) {
        // For user-requested insights, check 2-day threshold
        recentInsights =
          await this.dataService.getRecentInsightsForUserRequest(
            socialAccountId,
          );

        if (recentInsights.length > 0) {
          logger.info(
            `AI INSIGHTS: User-requested insights blocked - existing insights from ${recentInsights[0]!.created_at} (less than ${TIME_INTERVALS.AI_INSIGHTS_USER_REQUEST_CACHE_HOURS}h old)`,
          );
          return recentInsights;
        }

        logger.info(
          "AI INSIGHTS: No recent user-requested insights found (2-day check), generating new ones...",
        );
      } else {
        // For automatic insights, check 7-day threshold
        recentInsights =
          await this.dataService.getRecentInsights(socialAccountId);

        if (recentInsights.length > 0) {
          logger.info(
            `AI INSIGHTS: Using existing AI insights from ${recentInsights[0]!.created_at} (less than ${TIME_INTERVALS.AI_INSIGHTS_CACHE_HOURS}h old)`,
          );
          return recentInsights;
        }

        logger.info(
          "AI INSIGHTS: No recent automatic insights found (7-day check), generating new ones...",
        );
      }

      // Step 2: Generate new insights
      const insights = await this.generateNewInsights(userId, socialAccountId);

      logger.info(
        `AI INSIGHTS: Successfully generated and stored ${insights.length} insights for account: ${socialAccountId}`,
      );
      return insights;
    } catch (error) {
      const errorMessage = `Failed to generate insights for account ${socialAccountId}`;

      // Log error with appropriate level based on type
      if (
        error instanceof LLMProviderError ||
        error instanceof DataRetrievalError
      ) {
        logger.warn(`${errorMessage} (retryable):`, error);
      } else {
        logger.error(`${errorMessage}:`, error);
      }

      // Re-throw specific error types
      if (
        error instanceof LLMProviderError ||
        error instanceof DataRetrievalError ||
        error instanceof InsightProcessingError ||
        error instanceof ApiError
      ) {
        throw error;
      }

      // Categorize unknown errors
      if (error instanceof Error) {
        const errorName = error.name.toLowerCase();
        const errorMessage = error.message.toLowerCase();

        // Network/connection errors
        if (
          errorName.includes("network") ||
          errorName.includes("timeout") ||
          errorMessage.includes("econnreset") ||
          errorMessage.includes("socket hang up")
        ) {
          throw LLMProviderError.connectionError();
        }

        // JSON/parsing errors
        if (
          errorName.includes("syntaxerror") ||
          errorMessage.includes("unexpected token") ||
          errorMessage.includes("invalid json")
        ) {
          throw LLMProviderError.invalidResponse(error.message);
        }
      }

      // Default fallback error
      throw new ApiError(errorMessage, 500);
    }
  }

  /**
   * Generate new insights using LLM analysis
   * CORE LOGIC: Main insight generation workflow
   */
  private async generateNewInsights(
    userId: string,
    socialAccountId: string,
  ): Promise<AIAnalysisDB[]> {
    // Step 1: Get username for data retrieval
    const username =
      await this.dataService.getSocialAccountUsername(socialAccountId);
    if (!username) {
      throw new ApiError("Social account not found", 404);
    }

    // Step 2: Get posts for analysis (with fallback to fresh data)
    const posts = await RetryHandler.forDataRetrieval().execute(
      () => this.getPostsForAnalysis(socialAccountId, username),
      {},
      "data retrieval for posts analysis",
    );

    // Step 3: Check if there are any existing insights to provide context
    const hasExistingInsights = await this.checkForExistingInsights(
      userId,
      socialAccountId,
    );

    // Step 4: Prepare analysis data and prompts
    const analysisData = this.promptService.prepareAnalysisData(
      posts,
      username,
    );
    const userPrompt = this.promptService.createAnalysisPrompt(analysisData);
    const systemPrompt = this.promptService.getSystemPrompt();

    // Step 5: Call LLM with or without context based on existing insights
    let llmResponse: string;

    if (hasExistingInsights) {
      logger.info(
        "AI INSIGHTS: Existing insights found - generating context-aware insights...",
      );
      llmResponse = await RetryHandler.forAIInsights().execute(
        () =>
          this.llmClient.generateInsightsWithContext(
            systemPrompt,
            userPrompt,
            userId,
            socialAccountId,
          ),
        {},
        "LLM context-aware insights generation",
      );
    } else {
      logger.info(
        "AI INSIGHTS: No existing insights found - generating first-time insights...",
      );
      llmResponse = await RetryHandler.forAIInsights().execute(
        () => this.llmClient.generateInsights(systemPrompt, userPrompt),
        {},
        "LLM first-time insights generation",
      );
    }

    // Step 6: Process LLM response
    let insights;
    try {
      insights = this.responseProcessor.parseInsightResponse(llmResponse);
      logger.info(`AI INSIGHTS: LLM generated ${insights.length} raw insights`);
    } catch (error) {
      logger.error("AI INSIGHTS: Failed to parse LLM response:", error);
      throw InsightProcessingError.parseError(
        error instanceof Error ? error.message : "Unknown parsing error",
      );
    }

    // Step 7: Convert to database format and store
    const storedInsights: AIAnalysisDB[] = [];
    const supportingData = {
      postsAnalyzed: posts.length,
      analysisTimestamp: new Date(),
    };

    for (const insight of insights) {
      try {
        logger.info(`AI INSIGHTS: Storing insight: ${insight.title}`);

        // Convert insight to database format with validation
        const dbInsight = this.responseProcessor.convertInsightToDbFormat(
          userId,
          socialAccountId,
          insight,
          supportingData,
        );

        // Store insight with retry logic for database operations
        const stored = await RetryHandler.execute(
          () => this.dataService.storeInsight(dbInsight),
          { maxAttempts: 2, initialDelayMs: 500 },
          `storing insight: ${insight.title}`,
        );

        storedInsights.push(stored);
      } catch (error) {
        logger.error(
          `AI INSIGHTS: Failed to store insight '${insight.title}':`,
          error,
        );

        // If insight conversion fails, it's a processing error
        if (error instanceof Error && error.message.includes("validation")) {
          throw InsightProcessingError.validationError(
            `Failed to validate insight '${insight.title}': ${error.message}`,
          );
        }

        // Database storage errors are typically retryable
        if (!(error instanceof ApiError)) {
          throw new DataRetrievalError(
            `Failed to store insight '${insight.title}': ${error instanceof Error ? error.message : "Unknown error"}`,
            500,
            true,
          );
        }

        throw error;
      }
    }

    return storedInsights;
  }

  /**
   * Check if there are any existing insights to provide context
   * Returns true if there are ANY insights in the database for this user or account
   * Uses direct database query to check existence regardless of business logic
   */
  private async checkForExistingInsights(
    userId: string,
    socialAccountId: string,
  ): Promise<boolean> {
    try {
      // Check for ANY insights for this user (most comprehensive check)
      const userCount = await llmAnalystQueryService.countUserAnalyses(userId);
      if (userCount > 0) {
        logger.info(
          `AI INSIGHTS: Found ${userCount} existing insights for user in database`,
        );
        return true;
      }

      // Check for ANY insights for this specific account
      const accountCount =
        await llmAnalystQueryService.countAccountAnalyses(socialAccountId);
      if (accountCount > 0) {
        logger.info(
          `AI INSIGHTS: Found ${accountCount} existing insights for account in database`,
        );
        return true;
      }

      logger.info("AI INSIGHTS: No existing insights found in database");
      return false;
    } catch (error) {
      logger.warn("AI INSIGHTS: Error checking for existing insights:", error);
      // If we can't check, assume no context (safer fallback)
      return false;
    }
  }

  /**
   * Get posts for analysis with fallback to fresh data if needed
   * DATA RETRIEVAL: Handles data availability with automatic fallback
   */
  private async getPostsForAnalysis(
    socialAccountId: string,
    username: string,
  ): Promise<any[]> {
    try {
      let posts = await this.dataService.getPostsForAnalysis(username);

      if (posts.length === 0) {
        // No posts found - trigger fresh Apify sync
        logger.info("No Apify posts found - triggering fresh sync...");

        try {
          await apifyService.instance.collectInstagramMetrics(
            socialAccountId,
            username,
          );
        } catch (error) {
          logger.error("AI INSIGHTS: Apify data collection failed:", error);
          throw DataRetrievalError.apifyError(
            error instanceof Error ? error.message : "Unknown Apify error",
          );
        }

        // Wait for processing
        logger.info(
          `Waiting ${TIME_INTERVALS.APIFY_DATA_PROCESSING_DELAY_MS / 1000} seconds for Apify data to be processed...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, TIME_INTERVALS.APIFY_DATA_PROCESSING_DELAY_MS),
        );

        // Retry fetching posts
        try {
          posts = await this.dataService.getPostsForAnalysis(username);
        } catch (error) {
          logger.error(
            "AI INSIGHTS: Failed to fetch posts after Apify sync:",
            error,
          );
          throw new DataRetrievalError(
            "Failed to retrieve posts after data collection",
            503,
            true,
          );
        }

        if (posts.length === 0) {
          throw DataRetrievalError.insufficientData();
        }
      }

      // Validate that posts have the required data for analysis
      const validPosts = posts.filter(
        (post) =>
          post &&
          typeof post === "object" &&
          post.id &&
          (post.likes || post.likes === 0) &&
          (post.comments || post.comments === 0),
      );

      if (validPosts.length === 0) {
        throw DataRetrievalError.insufficientData();
      }

      if (validPosts.length < posts.length) {
        logger.warn(
          `AI INSIGHTS: Filtered out ${posts.length - validPosts.length} invalid posts, ${validPosts.length} remain`,
        );
      }

      logger.info(
        `AI INSIGHTS: Retrieved ${validPosts.length} valid posts for analysis`,
      );
      return validPosts;
    } catch (error) {
      // Re-throw our specific errors
      if (error instanceof DataRetrievalError || error instanceof ApiError) {
        throw error;
      }

      // Wrap unexpected errors
      logger.error(
        "AI INSIGHTS: Unexpected error during post retrieval:",
        error,
      );
      throw new DataRetrievalError(
        `Unexpected error retrieving posts: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
        false,
      );
    }
  }

  /**
   * Get active insights for a user
   */
  async getUserInsights(
    userId: string,
    limit: number = TIME_INTERVALS.DEFAULT_USER_INSIGHTS_LIMIT,
  ): Promise<AIAnalysisDB[]> {
    return this.dataService.getUserInsights(userId, limit);
  }

  /**
   * Get insights for a specific social account
   */
  async getAccountInsights(
    socialAccountId: string,
    limit: number = TIME_INTERVALS.DEFAULT_ACCOUNT_INSIGHTS_LIMIT,
  ): Promise<AIAnalysisDB[]> {
    return this.dataService.getAccountInsights(socialAccountId, limit);
  }

  /**
   * Mark an insight as acknowledged by a user
   */
  async acknowledgeInsight(insightId: string, userId: string): Promise<void> {
    await this.dataService.acknowledgeInsight(insightId, userId);
  }
}

// Export singleton instance
export default new AIInsightsService();
