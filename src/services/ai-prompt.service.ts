import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "../logger";

/**
 * Service responsible for managing AI prompts and data preparation
 * Separates prompt management from insight generation logic
 */
export class AIPromptService {
  private systemPrompt: string;

  constructor() {
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
      throw new Error("System prompt file not found");
    }
  }

  /**
   * Get the current system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Reload system prompt from file (useful during development)
   */
  reloadSystemPrompt(): void {
    try {
      this.systemPrompt = this.loadSystemPrompt();
      logger.info("System prompt reloaded successfully");
    } catch (error) {
      logger.error("Failed to reload system prompt:", error);
      throw new Error("Failed to reload system prompt");
    }
  }

  /**
   * Create user prompt for Instagram analysis
   */
  createAnalysisPrompt(analysisData: string): string {
    const currentDateTime = new Date().toISOString();

    return `Please analyze the following Instagram account data:

CURRENT DATE/TIME: ${currentDateTime}
IMPORTANT: When analyzing post performance, consider post age - recent posts (within 24-48 hours) need time to mature and should not be compared directly to older posts for performance evaluation.

${analysisData}

Using your expertise as defined in the system instructions, provide 3-4 actionable insights covering the analysis framework categories (engagement analysis, growth trends, content performance, and posting optimization).

Return your analysis in the exact JSON format specified in your system instructions.`;
  }

  /**
   * Reconstruct the original Apify JSON format from normalized posts data
   */
  reconstructApifyFormat(posts: any[]): any {
    if (posts.length === 0) {
      return {
        username: null,
        followersCount: 0,
        latestPosts: [],
      };
    }

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

      latestPosts: posts.map((post) => ({
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
      })),
    };
  }

  /**
   * Prepare analysis data for LLM consumption
   */
  prepareAnalysisData(posts: any[], _username: string): string {
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
}
