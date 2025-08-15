import { setTimeout } from "timers";
import { ApiError } from "../utils/errors";
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
      logger.error(
        `Failed to generate insights for account ${socialAccountId}:`,
        error,
      );

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Failed to generate insights for account: ${socialAccountId}`,
        500,
      );
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
    const posts = await this.getPostsForAnalysis(socialAccountId, username);

    // Step 3: Prepare analysis data and prompts
    const analysisData = this.promptService.prepareAnalysisData(
      posts,
      username,
    );
    const userPrompt = this.promptService.createAnalysisPrompt(analysisData);
    const systemPrompt = this.promptService.getSystemPrompt();

    // Step 4: Call LLM for insights
    logger.info("AI INSIGHTS: Calling LLM to generate insights...");
    const llmResponse = await this.llmClient.generateInsights(
      systemPrompt,
      userPrompt,
    );

    // Step 5: Process LLM response
    const insights = this.responseProcessor.parseInsightResponse(llmResponse);
    logger.info(`AI INSIGHTS: LLM generated ${insights.length} raw insights`);

    // Step 6: Convert to database format and store
    const storedInsights: AIAnalysisDB[] = [];
    const supportingData = {
      postsAnalyzed: posts.length,
      analysisTimestamp: new Date(),
    };

    for (const insight of insights) {
      logger.info(`AI INSIGHTS: Storing insight: ${insight.title}`);
      const dbInsight = this.responseProcessor.convertInsightToDbFormat(
        userId,
        socialAccountId,
        insight,
        supportingData,
      );
      const stored = await this.dataService.storeInsight(dbInsight);
      storedInsights.push(stored);
    }

    return storedInsights;
  }

  /**
   * Get posts for analysis with fallback to fresh data if needed
   * DATA RETRIEVAL: Handles data availability with automatic fallback
   */
  private async getPostsForAnalysis(
    socialAccountId: string,
    username: string,
  ): Promise<any[]> {
    let posts = await this.dataService.getPostsForAnalysis(username);

    if (posts.length === 0) {
      // No posts found - trigger fresh Apify sync
      logger.info("No Apify posts found - triggering fresh sync...");

      await apifyService.instance.collectInstagramMetrics(
        socialAccountId,
        username,
      );

      // Wait for processing
      logger.info(
        `Waiting ${TIME_INTERVALS.APIFY_DATA_PROCESSING_DELAY_MS / 1000} seconds for Apify data to be processed...`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, TIME_INTERVALS.APIFY_DATA_PROCESSING_DELAY_MS),
      );

      // Retry fetching posts
      posts = await this.dataService.getPostsForAnalysis(username);

      if (posts.length === 0) {
        throw new ApiError("Failed to collect Instagram data via Apify", 500);
      }
    }

    logger.info(`AI INSIGHTS: Retrieved ${posts.length} posts for analysis`);
    return posts;
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
