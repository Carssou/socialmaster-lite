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
      logger.info(
        `AI INSIGHTS: Generating AI insights for account: ${socialAccountId}, user: ${userId}`,
      );

      // Check if we have recent AI insights (less than 12 hours old)
      const recentInsights = await this.aiAnalysisRepo.executeQuery(
        `SELECT * FROM ai_analysis 
         WHERE social_account_id = $1 
         AND created_at > NOW() - INTERVAL '12 hours'
         AND is_active = true
         ORDER BY created_at DESC`,
        [socialAccountId],
      );

      logger.info(
        `AI INSIGHTS: Found ${recentInsights.length} recent insights (< 12h)`,
      );

      if (recentInsights.length > 0) {
        logger.info(
          `AI INSIGHTS: Using existing AI insights from ${recentInsights[0].created_at} (less than 12h old)`,
        );
        return recentInsights as AIAnalysisDB[];
      }

      logger.info(
        "AI INSIGHTS: No recent AI insights found, generating new ones...",
      );

      // Get recent account metrics for trend analysis
      logger.info("AI INSIGHTS: Fetching account metrics...");
      const accountMetrics =
        await apifyService.instance.getRecentAccountMetrics(
          socialAccountId,
          30,
        );
      logger.info(
        `AI INSIGHTS: Found ${accountMetrics.length} account metrics`,
      );

      if (accountMetrics.length === 0) {
        logger.error(
          `AI INSIGHTS: No account metrics found for analysis - account ${socialAccountId}`,
        );
        throw new ApiError("No account metrics found for analysis", 404);
      }

      // Get recent post metrics
      logger.info("AI INSIGHTS: Fetching post metrics...");
      const postMetrics = await apifyService.instance.getRecentPostMetrics(
        socialAccountId,
        50,
      );
      logger.info(`AI INSIGHTS: Found ${postMetrics.length} post metrics`);

      // Log sample metrics for debugging
      if (accountMetrics.length > 0) {
        const latest = accountMetrics[0];
        logger.info(
          `AI INSIGHTS: Latest metrics - Followers: ${latest?.followers}, Posts: ${latest?.total_posts}, Engagement: ${latest?.avg_engagement_rate}`,
        );
      }

      // Generate insights using LLM
      logger.info("AI INSIGHTS: Calling LLM to generate insights...");
      const insights = await this.generateLLMInsights(
        accountMetrics,
        postMetrics,
        socialAccountId, // Pass socialAccountId to fetch raw data
      );
      logger.info(`AI INSIGHTS: LLM generated ${insights.length} raw insights`);

      // Store insights in database
      logger.info("AI INSIGHTS: Storing insights in database...");
      const storedInsights: AIAnalysisDB[] = [];
      for (const insight of insights) {
        logger.info(`AI INSIGHTS: Storing insight: ${insight.title}`);
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
        `AI INSIGHTS: Successfully generated and stored ${storedInsights.length} insights for account: ${socialAccountId}`,
      );
      return storedInsights;
    } catch (error) {
      logger.error(
        `Failed to generate insights for account ${socialAccountId}:`,
        error,
      );

      // Re-throw ApiErrors without modification to preserve status codes
      if (error instanceof ApiError) {
        throw error;
      }

      // Only wrap non-ApiErrors as 500
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
    socialAccountId: string,
  ): Promise<LLMInsightResponse[]> {
    const userPrompt = await this.createUserPrompt(
      accountMetrics,
      postMetrics,
      socialAccountId,
    );

    try {
      // Call LLM API to generate insights
      logger.info("AI INSIGHTS: Calling LLM for insight generation...");
      logger.info(
        `AI INSIGHTS: User prompt length: ${userPrompt.length} characters`,
      );
      const response = await this.callLLM(this.systemPrompt, userPrompt);
      logger.info("AI INSIGHTS: LLM call completed successfully");

      // Parse JSON response from LLM (handle markdown code blocks)
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
  private async createUserPrompt(
    accountMetrics: any[],
    postMetrics: any[],
    socialAccountId: string,
  ): Promise<string> {
    const analysisData = await this.prepareAnalysisData(
      accountMetrics,
      postMetrics,
      socialAccountId,
    );

    const currentDateTime = new Date().toISOString();
    
    return `Please analyze the following Instagram account data:

CURRENT DATE/TIME: ${currentDateTime}
IMPORTANT: When analyzing post performance, consider post age - recent posts (within 24-48 hours) need time to mature and should not be compared directly to older posts for performance evaluation.

${analysisData}

Using your expertise as defined in the system instructions, provide 3-4 actionable insights covering the analysis framework categories (engagement analysis, growth trends, content performance, and posting optimization).

Return your analysis in the exact JSON format specified in your system instructions.`;
  }

  /**
   * Prepare COMPLETE Apify data for LLM analysis from apify_posts table
   */
  private async prepareAnalysisData(
    accountMetrics: any[],
    postMetrics: any[],
    socialAccountId: string,
  ): Promise<string> {
    // Get social account username
    const socialAccount = await this.aiAnalysisRepo.executeQuery(
      `SELECT username FROM social_accounts WHERE id = $1`,
      [socialAccountId],
    );

    if (socialAccount.length === 0) {
      throw new ApiError("Social account not found", 404);
    }

    const username = socialAccount[0].username;

    // Query ALL posts from apify_posts table for this username (excluding pinned posts)
    const posts = await this.aiAnalysisRepo.executeQuery(
      `SELECT post_id, profile_posts_count, profile_followers_count, profile_follows_count,
              post_alt, post_type, post_caption, post_hashtags, post_mentions, post_timestamp,
              post_child_posts, post_likes_count, post_comments_count, post_location,
              post_video_view_count, post_video_play_count, post_video_duration_ms,
              post_coauthor_producers, post_fundraiser, post_has_audio, post_is_video
       FROM apify_posts 
       WHERE profile_username = $1 
       AND post_is_pinned = false
       AND profile_id = post_owner_id
       ORDER BY post_timestamp DESC, post_index`,
      [username],
    );

    if (posts.length === 0) {
      // No posts found - trigger Apify sync first
      logger.info("No Apify posts found - triggering fresh sync...");

      await apifyService.instance.collectInstagramMetrics(
        socialAccountId,
        username,
      );

      // Wait for Apify data to be fully processed and inserted
      logger.info("Waiting 60 seconds for Apify data to be fully processed...");
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Now fetch the fresh posts (excluding pinned posts)
      const freshPosts = await this.aiAnalysisRepo.executeQuery(
        `SELECT post_id, profile_posts_count, profile_followers_count, profile_follows_count,
                post_alt, post_type, post_caption, post_hashtags, post_mentions, post_timestamp,
                post_child_posts, post_likes_count, post_comments_count, post_location,
                post_video_view_count, post_video_play_count, post_video_duration_ms,
                post_coauthor_producers, post_fundraiser, post_has_audio, post_is_video
         FROM apify_posts 
         WHERE profile_username = $1 
         AND post_is_pinned = false
         AND profile_id = post_owner_id
         ORDER BY post_timestamp DESC, post_index`,
        [username],
      );

      if (freshPosts.length === 0) {
        throw new ApiError("Failed to collect Instagram data via Apify", 500);
      }

      const reconstructedData = this.reconstructApifyFormat(freshPosts);

      return `INSTAGRAM DATA FROM APIFY (FRESH SYNC):

Username: ${reconstructedData.username}
Posts included: ${reconstructedData.latestPosts?.length || 0}

APIFY DATASET:
${JSON.stringify(reconstructedData, null, 2)}

This dataset includes relevant Instagram data for analysis:
- Profile information (bio, verified status, follower counts)
- Complete post history with captions, hashtags, mentions
- Engagement numbers (likes, comments) for each post  
- Post timestamps and content types
- Video metrics where available

Analyze this dataset to provide specific, data-driven insights.`;
    }

    // Reconstruct the original nested JSON format AI expects
    const reconstructedData = this.reconstructApifyFormat(posts);

    logger.info(
      `AI INSIGHTS: Sending reconstructed Apify data: ${JSON.stringify(reconstructedData).length} characters`,
    );
    logger.info(
      `AI INSIGHTS: Total posts in dataset: ${reconstructedData.latestPosts?.length || 0}`,
    );

    return `INSTAGRAM DATA FROM APIFY:

Username: ${reconstructedData.username}
Posts included: ${reconstructedData.latestPosts?.length || 0}

APIFY DATASET:
${JSON.stringify(reconstructedData, null, 2)}

This dataset includes relevant Instagram data for analysis:
- Profile information (bio, verified status, follower counts)
- Complete post history with captions, hashtags, mentions
- Engagement numbers (likes, comments) for each post  
- Post timestamps and content types
- Video metrics where available

Analyze this dataset to provide specific, data-driven insights.`;
  }

  /**
   * Reconstruct the original Apify JSON format from normalized apify_posts table data
   */
  private reconstructApifyFormat(posts: any[]): any {
    if (posts.length === 0) {
      // Return structure that matches expected format even when empty
      return {
        username: null,
        followersCount: 0,
        latestPosts: []
      };
    }

    // Get profile data from first row (duplicated across all posts)
    const firstPost = posts[0];
    
    return {
      id: firstPost.profile_id,
      url: firstPost.profile_url,
      fbid: firstPost.profile_fbid,
      private: firstPost.profile_private,
      fullName: firstPost.profile_full_name,
      inputUrl: firstPost.profile_input_url,
      username: firstPost.profile_username,
      verified: firstPost.profile_verified,
      biography: firstPost.profile_biography,
      hasChannel: firstPost.profile_has_channel,
      postsCount: firstPost.profile_posts_count,
      followersCount: firstPost.profile_followers_count,
      followsCount: firstPost.profile_follows_count,
      profilePicUrl: firstPost.profile_pic_url,
      
      // Reconstruct latestPosts array from all post rows
      latestPosts: posts.map(post => ({
        id: post.post_id,
        alt: post.post_alt,
        url: post.post_url,
        type: post.post_type,
        images: post.post_images,
        caption: post.post_caption,
        ownerId: post.post_owner_id,
        hashtags: post.post_hashtags,
        isPinned: post.post_is_pinned,
        mentions: post.post_mentions,
        timestamp: post.post_timestamp,
        childPosts: post.post_child_posts,
        likesCount: post.post_likes_count,
        commentsCount: post.post_comments_count,
        location: post.post_location,
        videoViewCount: post.post_video_view_count,
        videoPlayCount: post.post_video_play_count,
        videoDurationMs: post.post_video_duration_ms,
        accessibility: post.post_accessibility,
        coauthorProducers: post.post_coauthor_producers,
        fundraiser: post.post_fundraiser,
        hasAudio: post.post_has_audio,
        isVideo: post.post_is_video,
        productType: post.post_product_type,
      }))
    };
  }

  /**
   * Fallback method for processed data analysis
   */
  private prepareProcessedAnalysisData(
    accountMetrics: any[],
    postMetrics: any[],
  ): string {
    const latest = accountMetrics[0];
    const oldest = accountMetrics[accountMetrics.length - 1];

    const followerGrowth = latest
      ? latest.followers - (oldest?.followers || latest.followers)
      : 0;
    const avgEngagement =
      postMetrics.length > 0
        ? postMetrics.reduce((sum, post) => {
            const rate =
              typeof post.engagement_rate === "number"
                ? post.engagement_rate
                : 0;
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
  .map((post, i) => {
    const rate =
      typeof post.engagement_rate === "number" ? post.engagement_rate : 0;
    return `Post ${i + 1}: ${post.likes || 0} likes, ${post.comments || 0} comments, ${rate.toFixed(4)}% engagement`;
  })
  .join("\n")}

ENGAGEMENT TRENDS:
- Best performing post: ${Math.max(...postMetrics.map((p) => (typeof p.engagement_rate === "number" ? p.engagement_rate : 0))).toFixed(4)}% engagement
- Worst performing post: ${Math.min(...postMetrics.map((p) => (typeof p.engagement_rate === "number" ? p.engagement_rate : 0))).toFixed(4)}% engagement
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
    const explanation = `INSIGHTS:\n${insight.insights.map((i) => `• ${i}`).join("\n")}\n\nRECOMMENDATIONS:\n${insight.recommendations.map((r) => `• ${r}`).join("\n")}`;

    // Use categories directly - system prompt is aligned with database schema
    const dbType = insight.type;
    const dbCategory = insight.category;

    return this.aiAnalysisRepo.create({
      user_id: userId,
      social_account_id: socialAccountId,
      type: dbType,
      category: dbCategory,
      title: insight.title,
      description: insight.description,
      explanation: explanation,
      confidence: insight.confidence, // AI returns integer 0-100 directly
      impact: insight.impact.toLowerCase(),
      urgency: insight.urgency.toLowerCase(),
      is_active: true,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      supporting_data: supportingData,
      generation_metadata: {
        generatedAt: new Date(),
        version: "1.0",
        algorithm: "llm_generated",
        llmModel:
          process.env.LLM_PROVIDER === "openai"
            ? process.env.OPENAI_MODEL || "gpt-4"
            : process.env.ANTHROPIC_MODEL || "claude-3-sonnet",
        originalType: insight.type,
        originalCategory: insight.category,
        originalInsights: insight.insights,
        originalRecommendations: insight.recommendations,
      },
    });
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

    const response = await openai.chat.completions.create({
      model,
      // Remove max_completion_tokens limit
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
      throw new ApiError("Empty response from OpenAI", 500);
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
