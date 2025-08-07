import { readFileSync } from "fs";
import { join } from "path";
import { Repository } from "../database/repository";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";
import {
  InsightType,
  InsightCategory,
  ImpactLevel,
  UrgencyLevel,
} from "../types/models";
import apifyService from "./apify.service";

// Database interface for AI analysis
interface AIAnalysisDB {
  id: string;
  user_id: string;
  social_account_id?: string;
  type: string;
  category: string;
  title: string;
  description: string;
  explanation: string;
  confidence: number;
  impact: string;
  urgency: string;
  score: number;
  tags?: string[];
  is_active: boolean;
  is_acknowledged?: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  acknowledgment_notes?: string;
  valid_until?: Date;
  supporting_data?: Record<string, any>;
  generation_metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Interface for LLM-generated insight response
interface LLMInsightResponse {
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
 * Service for generating AI insights from Instagram metrics using LLM
 */
export class AIInsightsService {
  private aiAnalysisRepo: Repository<AIAnalysisDB>;
  private systemPrompt: string;

  constructor() {
    this.aiAnalysisRepo = new Repository<AIAnalysisDB>("ai_analysis");
    this.systemPrompt = this.loadSystemPrompt();
  }

  /**
   * Load system prompt from file for easy iteration
   */
  private loadSystemPrompt(): string {
    try {
      const promptPath = join(
        process.cwd(),
        "src/prompts/instagram-insights.prompt.md",
      );
      return readFileSync(promptPath, "utf-8");
    } catch (error) {
      logger.error("Failed to load system prompt file:", error);
      throw new ApiError("System prompt file not found", 500);
    }
  }

  /**
   * Reload system prompt from file (useful during development)
   */
  public reloadSystemPrompt(): void {
    try {
      this.systemPrompt = this.loadSystemPrompt();
      logger.info("System prompt reloaded successfully");
    } catch (error) {
      logger.error("Failed to reload system prompt:", error);
      throw new ApiError("Failed to reload system prompt", 500);
    }
  }

  /**
   * Generate insights for a social account using LLM analysis
   */
  async generateAccountInsights(
    userId: string,
    socialAccountId: string,
  ): Promise<AIAnalysisDB[]> {
    try {
      logger.info(`Generating AI insights for account: ${socialAccountId}`);

      // Check if we have recent AI insights (less than 12 hours old)
      const recentInsights = await this.aiAnalysisRepo.executeQuery(
        `SELECT * FROM ai_analysis 
         WHERE social_account_id = $1 
         AND created_at > NOW() - INTERVAL '12 hours'
         AND is_active = true
         ORDER BY created_at DESC`,
        [socialAccountId]
      );

      if (recentInsights.length > 0) {
        logger.info(`Using existing AI insights from ${recentInsights[0].created_at} (less than 12h old)`);
        return recentInsights as AIAnalysisDB[];
      }

      logger.info('No recent AI insights found, generating new ones...');

      // Get recent account metrics for trend analysis
      const accountMetrics = await apifyService.getRecentAccountMetrics(
        socialAccountId,
        30,
      );
      if (accountMetrics.length === 0) {
        throw new ApiError("No account metrics found for analysis", 404);
      }

      // Get recent post metrics
      const postMetrics = await apifyService.getRecentPostMetrics(
        socialAccountId,
        50,
      );

      // Generate insights using LLM
      const insights = await this.generateLLMInsights(
        accountMetrics,
        postMetrics,
      );

      // Store insights in database
      const storedInsights: AIAnalysisDB[] = [];
      for (const insight of insights) {
        const storedInsight = await this.storeInsight(
          userId,
          socialAccountId,
          insight,
          {
            accountMetrics: accountMetrics.slice(0, 5), // Include recent metrics
            postMetrics: postMetrics.slice(0, 10), // Include recent posts
          },
        );
        storedInsights.push(storedInsight);
      }

      logger.info(
        `Generated ${storedInsights.length} insights for account: ${socialAccountId}`,
      );
      return storedInsights;
    } catch (error) {
      logger.error(
        `Failed to generate insights for account ${socialAccountId}:`,
        error,
      );
      throw new ApiError(
        `Failed to generate insights for account: ${socialAccountId}`,
        500,
      );
    }
  }

  /**
   * Generate insights using LLM with crafted system prompt
   */
  private async generateLLMInsights(
    accountMetrics: any[],
    postMetrics: any[],
  ): Promise<LLMInsightResponse[]> {
    const userPrompt = this.createUserPrompt(accountMetrics, postMetrics);

    try {
      // Call LLM API to generate insights
      logger.info("Calling LLM for insight generation...");
      const response = await this.callLLM(this.systemPrompt, userPrompt);

      // Parse JSON response from LLM (handle markdown code blocks)
      let parsedResponse: LLMInsightResponse[];
      try {
        // Remove markdown code blocks if present
        const cleanResponse = response.replace(/```json\n?/, '').replace(/```$/, '').trim();
        parsedResponse = JSON.parse(cleanResponse);
      } catch (parseError) {
        logger.error("Failed to parse LLM response as JSON:", parseError);
        logger.debug("Raw LLM response:", response);
        throw new ApiError("LLM returned invalid JSON format", 500);
      }

      // Validate response structure
      if (!Array.isArray(parsedResponse)) {
        throw new ApiError("LLM response must be an array of insights", 500);
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
          throw new ApiError(
            `Invalid insight structure at index ${index}`,
            500,
          );
        }
      });

      logger.info(
        `Successfully generated ${parsedResponse.length} insights via LLM`,
      );
      return parsedResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Failed to generate LLM insights:", error);
      throw new ApiError("Failed to generate insights from LLM", 500);
    }
  }

  /**
   * Create user prompt aligned with system prompt in instagram-insights.prompt.md
   * This method creates a concise user prompt that references the detailed system instructions
   */
  private createUserPrompt(accountMetrics: any[], postMetrics: any[]): string {
    const analysisData = this.prepareAnalysisData(accountMetrics, postMetrics);

    return `Please analyze the following Instagram account data:

${analysisData}

Using your expertise as defined in the system instructions, provide 3-4 actionable insights covering the analysis framework categories (engagement analysis, growth trends, content performance, and posting optimization).

Return your analysis in the exact JSON format specified in your system instructions.`;
  }

  /**
   * Prepare data for LLM analysis
   */
  private prepareAnalysisData(
    accountMetrics: any[],
    postMetrics: any[],
  ): string {
    const latest = accountMetrics[0];
    const oldest = accountMetrics[accountMetrics.length - 1];

    const followerGrowth = latest
      ? latest.followers -
        (oldest?.followers || latest.followers)
      : 0;
    const avgEngagement =
      postMetrics.length > 0
        ? postMetrics.reduce((sum, post) => {
            const rate = typeof post.engagement_rate === 'number' ? post.engagement_rate : 0;
            return sum + rate;
          }, 0) / postMetrics.length
        : 0;

    return `
ACCOUNT OVERVIEW:
- Current followers: ${latest?.followers || 0}
- Following: ${latest?.following || 0}
- Total posts: ${latest?.total_posts || 0}
- Follower growth: ${followerGrowth} over ${accountMetrics.length} data points
- Average engagement rate: ${avgEngagement.toFixed(4)}%

RECENT POSTS PERFORMANCE (${postMetrics.length} posts):
${postMetrics
  .slice(0, 20)
  .map(
    (post, i) => {
      const rate = typeof post.engagement_rate === 'number' ? post.engagement_rate : 0;
      return `Post ${i + 1}: ${post.likes || 0} likes, ${post.comments || 0} comments, ${rate.toFixed(4)}% engagement`;
    }
  )
  .join("\n")}

ENGAGEMENT TRENDS:
- Best performing post: ${Math.max(...postMetrics.map((p) => typeof p.engagement_rate === 'number' ? p.engagement_rate : 0)).toFixed(4)}% engagement
- Worst performing post: ${Math.min(...postMetrics.map((p) => typeof p.engagement_rate === 'number' ? p.engagement_rate : 0)).toFixed(4)}% engagement
- Content types: ${this.analyzeContentTypes(postMetrics)}
`;
  }

  /**
   * Analyze content types from post data
   */
  private analyzeContentTypes(postMetrics: any[]): string {
    const types = postMetrics.reduce(
      (acc, post) => {
        acc[post.post_type] = (acc[post.post_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(types)
      .map(([type, count]) => `${type}: ${count} posts`)
      .join(", ");
  }

  /**
   * Store insight in database
   */
  private async storeInsight(
    userId: string,
    socialAccountId: string,
    insight: LLMInsightResponse,
    supportingData: any,
  ): Promise<AIAnalysisDB> {
    // Priority and score will be calculated by database triggers

    // Convert LLM response to database format
    const explanation = `INSIGHTS:\n${insight.insights.map(i => `• ${i}`).join('\n')}\n\nRECOMMENDATIONS:\n${insight.recommendations.map(r => `• ${r}`).join('\n')}`;
    
    // Map LLM response types/categories to database enums
    const dbType = this.mapToDbType(insight.type);
    const dbCategory = this.mapToDbCategory(insight.category);
    
    return this.aiAnalysisRepo.create({
      user_id: userId,
      social_account_id: socialAccountId,
      type: dbType,
      category: dbCategory,
      title: insight.title,
      description: insight.description,
      explanation: explanation,
      confidence: Math.round(insight.confidence * 100), // Convert to integer 0-100
      impact: insight.impact.toLowerCase(),
      urgency: insight.urgency.toLowerCase(),
      is_active: true,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      supporting_data: supportingData,
      generation_metadata: {
        generatedAt: new Date(),
        version: "1.0",
        algorithm: "llm_generated",
        llmModel: process.env.LLM_PROVIDER === 'openai' ? process.env.OPENAI_MODEL || 'gpt-4' : process.env.ANTHROPIC_MODEL || 'claude-3-sonnet',
        originalType: insight.type,
        originalCategory: insight.category,
        originalInsights: insight.insights,
        originalRecommendations: insight.recommendations,
      },
    });
  }

  /**
   * Map LLM insight type to database enum
   */
  private mapToDbType(llmType: string): string {
    const typeMap: Record<string, string> = {
      'engagement_analysis': 'audience_engagement',
      'growth_trend': 'growth_opportunity', 
      'content_performance': 'content_optimization',
      'posting_optimization': 'timing_optimization',
      'performance': 'performance_trend',
      'trend': 'performance_trend',
      'opportunity': 'growth_opportunity',
      'alert': 'risk_alert',
    };
    
    return typeMap[llmType.toLowerCase()] || 'performance_trend';
  }

  /**
   * Map LLM insight category to database enum
   */
  private mapToDbCategory(llmCategory: string): string {
    const categoryMap: Record<string, string> = {
      'performance': 'engagement',
      'optimization': 'strategy',
      'audience': 'audience',
    };
    
    return categoryMap[llmCategory.toLowerCase()] || llmCategory.toLowerCase();
  }

  // Score is calculated by database trigger, no longer needed

  /**
   * Get active insights for a user
   */
  async getUserInsights(
    userId: string,
    limit: number = 20,
  ): Promise<AIAnalysisDB[]> {
    return this.aiAnalysisRepo.executeQuery(
      "SELECT * FROM ai_analysis WHERE user_id = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW()) ORDER BY score DESC, created_at DESC LIMIT $2",
      [userId, limit],
    );
  }

  /**
   * Get insights for a specific social account
   */
  async getAccountInsights(
    socialAccountId: string,
    limit: number = 10,
  ): Promise<AIAnalysisDB[]> {
    return this.aiAnalysisRepo.executeQuery(
      "SELECT * FROM ai_analysis WHERE social_account_id = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW()) ORDER BY score DESC, created_at DESC LIMIT $2",
      [socialAccountId, limit],
    );
  }

  /**
   * Mark an insight as acknowledged by a user
   */
  async acknowledgeInsight(insightId: string, userId: string): Promise<void> {
    await this.aiAnalysisRepo.update(insightId, {
      acknowledged_by: userId,
      acknowledged_at: new Date(),
    });
  }

  /**
   * Call LLM service for insight generation
   * Supports both OpenAI and Anthropic based on environment configuration
   */
  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    if (!provider) {
      throw new ApiError("LLM_PROVIDER environment variable not set", 500);
    }

    try {
      switch (provider) {
        case "openai":
          return await this.callOpenAI(systemPrompt, userPrompt);
        case "anthropic":
          return await this.callAnthropic(systemPrompt, userPrompt);
        default:
          throw new ApiError(`Unsupported LLM provider: ${provider}`, 500);
      }
    } catch (error) {
      logger.error(`LLM API call failed (${provider}):`, error);
      throw new ApiError(`Failed to generate insights via ${provider}`, 500);
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
      throw new ApiError("OPENAI_API_KEY environment variable not set", 500);
    }

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = process.env.OPENAI_MODEL || "gpt-4";
    const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "2000", 10);

    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more consistent analysis
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ApiError("Empty response from OpenAI", 500);
    }

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
      throw new ApiError("ANTHROPIC_API_KEY environment variable not set", 500);
    }

    const { Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const model = process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229";
    const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "2000", 10);

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more consistent analysis
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new ApiError("Invalid response from Anthropic", 500);
    }

    return content.text;
  }
}

export default new AIInsightsService();
