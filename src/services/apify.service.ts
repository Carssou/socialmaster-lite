import { Repository } from "../database/repository";
import { logger } from "../logger";
import { TIME_INTERVALS } from "../config/constants";
import { ApifyClientService } from "./apify-client.service";
import { ApifyTransformService } from "./apify-transform.service";
import { ApifyDataService } from "../data/apify-data.service";
// import { Platform } from "../types/models";

// Interface for Instagram post data from Apify (expanded to match actual API response)
export interface InstagramPost {
  id: string;
  type: string;
  shortCode: string;
  caption: string;
  likesCount: number;
  url: string;
  displayUrl: string;
  timestamp: string;
  commentsCount: number;
  // Rich data fields from actual Apify response
  inputUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  dimensionsHeight?: number;
  dimensionsWidth?: number;
  images?: any[];
  alt?: string;
  firstComment?: string;
  latestComments?: any[];
  ownerFullName?: string;
  ownerUsername?: string;
  ownerId?: string;
  isSponsored?: boolean;
  childPosts?: any[];
}

// Interface for Instagram profile data from Apify
export interface InstagramProfile {
  id: string;
  username: string;
  url: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  latestPosts: InstagramPost[];
}

// Custom error class for Apify operations
export class ApifyError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApifyError";
  }
}

// Database interface for account metrics (aligned with actual schema)
interface AccountMetricsDB {
  id: string;
  social_account_id: string;
  date: Date;
  followers: number;
  following: number;
  total_posts: number;
  avg_engagement_rate: number;
  reach_growth: number;
  follower_growth: number;
  collected_at: Date;
}

// Database interface for post metrics (expanded schema with rich Apify data)
interface PostMetricsDB {
  id: string;
  content_id: string;
  social_account_id: string;
  platform: string;
  platform_post_id: string;
  published_at: Date;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  click_through_rate: number;
  collected_at: Date;
  // Rich Apify data fields
  input_url: string;
  post_url: string;
  short_code: string;
  caption: string;
  alt_text: string;
  post_type: string;
  dimensions_height: number;
  dimensions_width: number;
  display_url: string;
  hashtags: string[];
  mentions: string[];
  first_comment: string;
  latest_comments: any[];
  owner_full_name: string;
  owner_username: string;
  owner_id: string;
  is_sponsored: boolean;
  child_posts: any[];
  images: any[];
}

// Database interface for apify_posts table
// Database interface for apify_results table
export interface ApifyResultDB {
  id: string;
  social_account_id: string;
  run_id: string;
  actor_id: string;
  username: string;
  raw_data?: any;
  processing_status?: string;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ApifyPostDB {
  post_id: string; // PRIMARY KEY - Instagram post ID
  apify_result_id: string;
  post_index: number;

  // Profile-level fields (duplicated for each post)
  profile_id: string;
  profile_url: string;
  profile_fbid: string;
  profile_private: boolean;
  profile_full_name: string;
  profile_input_url: string;
  profile_username: string;
  profile_verified: boolean;
  profile_biography: string;
  profile_has_channel: boolean;
  profile_posts_count: number;
  profile_followers_count: number;
  profile_follows_count: number;
  profile_pic_url: string;

  // Post-level fields (post_id moved to top as PK)
  post_alt: string;
  post_url: string;
  post_type: string;
  post_images: any[];
  post_caption: string;
  post_owner_id: string;
  post_hashtags: string[];
  post_is_pinned: boolean;
  post_mentions: string[];
  post_timestamp: Date | null;
  post_child_posts: any[];
  post_likes_count: number;
  post_comments_count: number;
  post_location: any;
  post_video_view_count: number;
  post_video_play_count: number;
  post_video_duration_ms: number;
  post_accessibility: string;
  post_coauthor_producers: any[];
  post_fundraiser: any;
  post_has_audio: boolean;
  post_is_video: boolean;
  post_product_type: string;

  // Tracking fields
  first_scraped_at: Date;
  last_updated_at: Date;
  scrape_count: number;
}

/**
 * Service for collecting Instagram data via Apify API
 * Refactored to follow Single Responsibility Principle
 * Orchestrates interactions between client, transform, and data services
 */
export class ApifyService {
  private clientService: ApifyClientService;
  private transformService: ApifyTransformService;
  private dataService: ApifyDataService;
  private accountMetricsRepo: Repository<AccountMetricsDB>;
  private postMetricsRepo: Repository<PostMetricsDB>;

  constructor() {
    this.clientService = new ApifyClientService();
    this.transformService = new ApifyTransformService();
    this.dataService = new ApifyDataService();
    this.accountMetricsRepo = new Repository<AccountMetricsDB>(
      "account_metrics",
    );
    this.postMetricsRepo = new Repository<PostMetricsDB>("post_metrics");

    // Validate configuration on startup
    this.clientService.validateConfiguration();
  }

  /**
   * Parse raw Apify data back to InstagramProfile format
   * @param rawData Raw Apify response data
   * @returns Instagram profile data
   */
  private parseApifyDataToProfile(rawData: any): InstagramProfile {
    return this.transformService.transformApifyDataToProfile(rawData);
  }

  /**
   * Reconstruct InstagramProfile from apify_posts table data
   * @param apifyResultId The apify_result_id to reconstruct profile for
   * @returns Instagram profile data
   */
  private async reconstructProfileFromPosts(
    apifyResultId: string,
  ): Promise<InstagramProfile> {
    const posts = await this.dataService.getPostsByResultId(apifyResultId);

    if (posts.length === 0) {
      throw new ApifyError(
        `No posts found for apify_result_id: ${apifyResultId}`,
      );
    }

    return this.transformService.reconstructProfileFromPosts(posts);
  }

  /**
   * Scrape Instagram profile data using Apify
   * REFACTORED: Broken down into smaller, focused methods
   */
  async scrapeInstagramProfile(
    username: string,
    socialAccountId?: string,
  ): Promise<InstagramProfile> {
    try {
      logger.info(`Starting Instagram scrape for username: ${username}`);

      // Step 1: Execute Apify scrape
      const scrapeResult =
        await this.clientService.scrapeInstagramProfile(username);

      // Step 2: Store results if needed
      if (socialAccountId) {
        await this.storeApifyResults(scrapeResult, socialAccountId, username);
      }

      // Step 3: Transform and return profile data
      const profile = this.parseApifyDataToProfile(scrapeResult.data);

      logger.info(
        `Successfully scraped Instagram profile: ${username} (${profile.followersCount} followers)`,
      );
      return profile;
    } catch (error) {
      if (error instanceof ApifyError) {
        throw error;
      }
      logger.error(`Failed to scrape Instagram profile ${username}:`, error);
      throw new ApifyError(
        `Failed to scrape Instagram profile: ${username}`,
        error,
      );
    }
  }

  /**
   * Store Apify scrape results in database
   * EXTRACTED: Separated storage logic from scraping logic
   */
  private async storeApifyResults(
    scrapeResult: { runId: string; actorId: string; data: any },
    socialAccountId: string,
    username: string,
  ): Promise<void> {
    const { runId, actorId, data } = scrapeResult;
    const posts = data.latestPosts || [];

    // Store metadata in apify_results
    const apifyResult = await this.dataService.storeApifyResult({
      socialAccountId,
      runId,
      actorId,
      username,
    });

    // Prepare posts for batch storage
    const postsForStorage = posts.map((post: any, index: number) => ({
      postId: post.id,
      apifyResultId: apifyResult.id,
      postIndex: index,
      profileData: this.transformService.prepareProfileDataForStorage(data),
      postDetails: this.transformService.preparePostDataForStorage(post),
    }));

    // Batch upsert posts
    await this.dataService.batchUpsertPosts(postsForStorage);

    logger.info(
      `Stored ${posts.length} posts in apify_posts and run record in apify_results for run: ${runId}`,
    );
  }

  /**
   * Collect and store Instagram metrics for a social account
   * REFACTORED: Simplified logic using data service abstractions
   */
  async collectInstagramMetrics(
    socialAccountId: string,
    username: string,
  ): Promise<void> {
    try {
      logger.info(
        `Collecting Instagram metrics for account: ${socialAccountId} (${username})`,
      );

      const profile = await this.getOrFetchProfile(socialAccountId, username);

      logger.info(
        `Successfully collected raw data for ${username}: ${profile.latestPosts.length} posts available`,
      );
    } catch (error) {
      logger.error(
        `Failed to collect Instagram metrics for ${socialAccountId}:`,
        error,
      );
      throw new ApifyError(
        `Failed to collect Instagram metrics for account: ${socialAccountId}`,
        error,
      );
    }
  }

  /**
   * Get profile data from cache or fetch fresh data
   * EXTRACTED: Cache logic separated into focused method
   */
  private async getOrFetchProfile(
    socialAccountId: string,
    username: string,
  ): Promise<InstagramProfile> {
    // Check for recent data using data service
    const recentResult =
      await this.dataService.getRecentApifyResult(socialAccountId);

    if (recentResult) {
      logger.info(
        `Found recent apify_results from ${recentResult.created_at} (less than ${TIME_INTERVALS.RECENT_DATA_THRESHOLD_HOURS}h old), checking for posts...`,
      );

      // Check if we have posts for this result
      const postsCount = await this.dataService.getPostsCount(recentResult.id);

      if (postsCount > 0) {
        logger.info(
          `Using cached posts data for apify_result_id: ${recentResult.id}`,
        );
        return this.reconstructProfileFromPosts(recentResult.id);
      } else {
        logger.info(
          `No posts found for apify_result_id: ${recentResult.id}, triggering fresh scrape...`,
        );
      }
    } else {
      logger.info("No recent data found, calling Apify API...");
    }

    // Fetch fresh data
    return this.scrapeInstagramProfile(username, socialAccountId);
  }

  /**
   * Get recent account metrics for a social account
   * UPDATED: Uses configuration constants instead of magic numbers
   */
  async getRecentAccountMetrics(
    socialAccountId: string,
    limit: number = TIME_INTERVALS.DEFAULT_ACCOUNT_METRICS_LIMIT,
  ): Promise<AccountMetricsDB[]> {
    return this.accountMetricsRepo.executeQuery(
      "SELECT * FROM account_metrics WHERE social_account_id = $1 ORDER BY collected_at DESC LIMIT $2",
      [socialAccountId, limit],
    );
  }

  /**
   * Get recent post metrics for a social account
   * UPDATED: Uses configuration constants instead of magic numbers
   */
  async getRecentPostMetrics(
    socialAccountId: string,
    limit: number = TIME_INTERVALS.DEFAULT_POST_METRICS_LIMIT,
  ): Promise<PostMetricsDB[]> {
    return this.postMetricsRepo.executeQuery(
      "SELECT * FROM post_metrics WHERE social_account_id = $1 ORDER BY published_at DESC LIMIT $2",
      [socialAccountId, limit],
    );
  }
}

// Lazy initialization to ensure environment variables are loaded
let apifyServiceInstance: ApifyService | null = null;

export default {
  get instance(): ApifyService {
    if (!apifyServiceInstance) {
      apifyServiceInstance = new ApifyService();
    }
    return apifyServiceInstance;
  },
};
