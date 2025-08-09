import { ApifyClient } from "apify-client";
import { Repository } from "../database/repository";
import { logger } from "../logger";
import { Platform } from "../types/models";

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
interface ApifyPostDB {
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
 * Follows the pattern from instagram-scraper.ts but integrated with the app architecture
 */
export class ApifyService {
  private client: ApifyClient;
  private accountMetricsRepo: Repository<AccountMetricsDB>;
  private postMetricsRepo: Repository<PostMetricsDB>;
  private apifyResultsRepo: Repository<any>;
  private apifyPostsRepo: Repository<ApifyPostDB>;

  constructor() {
    if (!process.env.APIFY_API_TOKEN) {
      throw new ApifyError(
        "APIFY_API_TOKEN environment variable is not configured",
      );
    }

    this.client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    this.accountMetricsRepo = new Repository<AccountMetricsDB>(
      "account_metrics",
    );
    this.postMetricsRepo = new Repository<PostMetricsDB>("post_metrics");
    this.apifyResultsRepo = new Repository("apify_results");
    this.apifyPostsRepo = new Repository<ApifyPostDB>("apify_posts");
  }

  /**
   * Parse raw Apify data back to InstagramProfile format
   * @param rawData Raw Apify response data
   * @returns Instagram profile data
   */
  private parseApifyDataToProfile(rawData: any): InstagramProfile {
    const data = rawData;
    const posts = data.latestPosts || [];

    return {
      id: data.id,
      username: data.username,
      url: data.url,
      fullName: data.fullName || data.username,
      biography: data.biography || "",
      followersCount: data.followersCount || 0,
      followsCount: data.followsCount || 0,
      postsCount: data.postsCount || 0,
      private: Boolean(data.private),
      verified: Boolean(data.verified),
      profilePicUrl: data.profilePicUrl || "",
      profilePicUrlHD: data.profilePicUrlHD || data.profilePicUrl || "",
      latestPosts: posts.map((post: any) => ({
        id: post.id,
        shortCode: post.shortCode,
        url: post.url,
        displayUrl: post.displayUrl,
        caption: post.caption || "",
        timestamp: post.timestamp,
        type: post.type || "Image",
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        location: post.location,
        isVideo: post.type === "Video",
        images: post.images || [],
        alt: post.alt || "",
        childPosts: post.childPosts || [],
        videoViewCount: post.videoViewCount,
        videoPlayCount: post.videoPlayCount,
        videoDurationMs: post.videoDurationMs,
        accessibility: post.accessibility,
        coauthorProducers: post.coauthorProducers,
        fundraiser: post.fundraiser,
        hasAudio: post.hasAudio,
        productType: post.productType,
        isPinned: post.isPinned,
        ownerId: post.ownerId,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
      })),
    };
  }

  /**
   * Reconstruct InstagramProfile from apify_posts table data
   * @param apifyResultId The apify_result_id to reconstruct profile for
   * @returns Instagram profile data
   */
  private async reconstructProfileFromPosts(
    apifyResultId: string,
  ): Promise<InstagramProfile> {
    const posts = await this.apifyPostsRepo.executeQuery(
      "SELECT * FROM apify_posts WHERE apify_result_id = $1 ORDER BY post_index",
      [apifyResultId],
    );

    if (posts.length === 0) {
      throw new ApifyError(
        `No posts found for apify_result_id: ${apifyResultId}`,
      );
    }

    // Get profile data from the first post (since it's duplicated in all rows)
    const firstPost = posts[0];

    const profile: InstagramProfile = {
      id: firstPost.profile_id,
      username: firstPost.profile_username,
      url: firstPost.profile_url,
      fullName: firstPost.profile_full_name || firstPost.profile_username,
      biography: firstPost.profile_biography || "",
      followersCount: firstPost.profile_followers_count || 0,
      followsCount: firstPost.profile_follows_count || 0,
      postsCount: firstPost.profile_posts_count || 0,
      private: Boolean(firstPost.profile_private),
      verified: Boolean(firstPost.profile_verified),
      profilePicUrl: firstPost.profile_pic_url || "",
      profilePicUrlHD: firstPost.profile_pic_url || "", // HD not stored separately
      latestPosts: posts.map((post) => ({
        id: post.post_id,
        type: post.post_type || "Image",
        shortCode: "", // Not stored in our schema
        caption: post.post_caption || "",
        likesCount: post.post_likes_count || 0,
        url: post.post_url,
        displayUrl: "", // Not stored in our schema
        timestamp: post.post_timestamp,
        commentsCount: post.post_comments_count || 0,
        inputUrl: firstPost.profile_input_url,
        hashtags: post.post_hashtags || [],
        mentions: post.post_mentions || [],
        images: post.post_images || [],
        alt: post.post_alt || "",
        childPosts: post.post_child_posts || [],
        ownerId: post.post_owner_id,
        location: post.post_location,
        videoViewCount: post.post_video_view_count,
        videoPlayCount: post.post_video_play_count,
        videoDurationMs: post.post_video_duration_ms,
        accessibility: post.post_accessibility,
        coauthorProducers: post.post_coauthor_producers || [],
        fundraiser: post.post_fundraiser,
        hasAudio: post.post_has_audio,
        isVideo: post.post_is_video,
        productType: post.post_product_type,
        isPinned: post.post_is_pinned,
      })),
    };

    return profile;
  }

  /**
   * Scrape Instagram profile data using Apify
   * @param username Instagram username to scrape
   * @param socialAccountId Optional social account ID to store raw results
   * @returns Instagram profile data
   */
  async scrapeInstagramProfile(
    username: string,
    socialAccountId?: string,
  ): Promise<InstagramProfile> {
    try {
      logger.info(`Starting Instagram scrape for username: ${username}`);

      const input = {
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: "details",
        resultsLimit: 1,
        searchType: "user",
        searchLimit: 250,
        addParentData: false,
      };

      if (!process.env.APIFY_INSTAGRAM_ACTOR) {
        throw new ApifyError(
          "APIFY_INSTAGRAM_ACTOR environment variable is not configured",
        );
      }

      const run = await this.client
        .actor(process.env.APIFY_INSTAGRAM_ACTOR)
        .call(input);

      logger.info(
        `APIFY: Run completed with ID: ${run.id}, status: ${run.status}`,
      );

      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();

      logger.info(`APIFY: Retrieved ${items?.length || 0} items from dataset`);
      if (items && items.length > 0 && items[0]) {
        logger.info(`APIFY: First item keys:`, Object.keys(items[0] as any));
        logger.info(`APIFY: First item sample:`, {
          username: (items[0] as any).username,
          followersCount: (items[0] as any).followersCount,
          private: (items[0] as any).private,
          postsCount: (items[0] as any).postsCount,
        });
      }

      // Store data in both apify_results and apify_posts tables if socialAccountId provided
      if (socialAccountId && items && items.length > 0) {
        const data = items[0] as any;
        const posts = data.latestPosts || [];

        // Store in apify_results with raw_data: null (for run tracking)
        const apifyResult = await this.apifyResultsRepo.create({
          social_account_id: socialAccountId,
          run_id: run.id,
          actor_id: process.env.APIFY_INSTAGRAM_ACTOR,
          username: username,
          raw_data: null, // No longer store raw data here
          processing_status: "completed",
          processed_at: new Date(),
        });

        // UPSERT each post in apify_posts with profile data duplicated
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i];
          
          // Use raw SQL for UPSERT (ON CONFLICT) behavior
          await this.apifyPostsRepo.executeQuery(`
            INSERT INTO apify_posts (
              post_id, apify_result_id, post_index,
              profile_id, profile_url, profile_fbid, profile_private, profile_full_name, 
              profile_input_url, profile_username, profile_verified, profile_biography, 
              profile_has_channel, profile_posts_count, profile_followers_count, 
              profile_follows_count, profile_pic_url,
              post_alt, post_url, post_type, post_images, post_caption, post_owner_id,
              post_hashtags, post_is_pinned, post_mentions, post_timestamp, post_child_posts,
              post_likes_count, post_comments_count, post_location, post_video_view_count,
              post_video_play_count, post_video_duration_ms, post_accessibility,
              post_coauthor_producers, post_fundraiser, post_has_audio, post_is_video,
              post_product_type, first_scraped_at, last_updated_at, scrape_count
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
              $33, $34, $35, $36, $37, $38, $39, $40, NOW(), NOW(), 1
            )
            ON CONFLICT (post_id) DO UPDATE SET
              apify_result_id = EXCLUDED.apify_result_id,
              post_index = EXCLUDED.post_index,
              profile_id = EXCLUDED.profile_id,
              profile_url = EXCLUDED.profile_url,
              profile_fbid = EXCLUDED.profile_fbid,
              profile_private = EXCLUDED.profile_private,
              profile_full_name = EXCLUDED.profile_full_name,
              profile_input_url = EXCLUDED.profile_input_url,
              profile_username = EXCLUDED.profile_username,
              profile_verified = EXCLUDED.profile_verified,
              profile_biography = EXCLUDED.profile_biography,
              profile_has_channel = EXCLUDED.profile_has_channel,
              profile_posts_count = EXCLUDED.profile_posts_count,
              profile_followers_count = EXCLUDED.profile_followers_count,
              profile_follows_count = EXCLUDED.profile_follows_count,
              profile_pic_url = EXCLUDED.profile_pic_url,
              post_alt = EXCLUDED.post_alt,
              post_url = EXCLUDED.post_url,
              post_type = EXCLUDED.post_type,
              post_images = EXCLUDED.post_images,
              post_caption = EXCLUDED.post_caption,
              post_owner_id = EXCLUDED.post_owner_id,
              post_hashtags = EXCLUDED.post_hashtags,
              post_is_pinned = EXCLUDED.post_is_pinned,
              post_mentions = EXCLUDED.post_mentions,
              post_timestamp = EXCLUDED.post_timestamp,
              post_child_posts = EXCLUDED.post_child_posts,
              post_likes_count = EXCLUDED.post_likes_count,
              post_comments_count = EXCLUDED.post_comments_count,
              post_location = EXCLUDED.post_location,
              post_video_view_count = EXCLUDED.post_video_view_count,
              post_video_play_count = EXCLUDED.post_video_play_count,
              post_video_duration_ms = EXCLUDED.post_video_duration_ms,
              post_accessibility = EXCLUDED.post_accessibility,
              post_coauthor_producers = EXCLUDED.post_coauthor_producers,
              post_fundraiser = EXCLUDED.post_fundraiser,
              post_has_audio = EXCLUDED.post_has_audio,
              post_is_video = EXCLUDED.post_is_video,
              post_product_type = EXCLUDED.post_product_type,
              last_updated_at = NOW(),
              scrape_count = apify_posts.scrape_count + 1
          `, [
            post.id, apifyResult.id, i,
            data.id, data.url, data.fbid, Boolean(data.private), data.fullName,
            data.inputUrl, data.username, Boolean(data.verified), data.biography,
            Boolean(data.hasChannel), data.postsCount, data.followersCount,
            data.followsCount, data.profilePicUrl,
            post.alt, post.url, post.type, JSON.stringify(post.images || []), post.caption, post.ownerId,
            JSON.stringify(post.hashtags || []), Boolean(post.isPinned), JSON.stringify(post.mentions || []), 
            post.timestamp ? new Date(post.timestamp) : null, JSON.stringify(post.childPosts || []),
            post.likesCount, post.commentsCount, JSON.stringify(post.location), post.videoViewCount,
            post.videoPlayCount, post.videoDurationMs, post.accessibility,
            JSON.stringify(post.coauthorProducers || []), JSON.stringify(post.fundraiser), 
            Boolean(post.hasAudio), Boolean(post.isVideo), post.productType
          ]);
        }

        logger.info(
          `Stored ${posts.length} posts in apify_posts and run record in apify_results for run: ${run.id}`,
        );
      }

      if (!items || items.length === 0) {
        throw new ApifyError(`No profile found for username: ${username}`);
      }

      const data = items[0] as any;
      const posts = data.latestPosts || [];

      // NO ENGAGEMENT CALCULATIONS - USING RAW DATA ONLY

      const profile: InstagramProfile = {
        id: data.id,
        username: data.username,
        url: data.url,
        fullName: data.fullName || data.username,
        biography: data.biography || "",
        followersCount: data.followersCount || 0,
        followsCount: data.followsCount || 0,
        postsCount: data.postsCount || 0,
        private: Boolean(data.private),
        verified: Boolean(data.verified),
        profilePicUrl: data.profilePicUrl || "",
        profilePicUrlHD: data.profilePicUrlHD || "",
        latestPosts: posts.map((post: any) => ({
          id: post.id,
          type: post.type,
          caption: post.caption || "",
          url: post.url,
          timestamp: post.timestamp,
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          images: post.images || [],
          alt: post.alt || "",
          childPosts: post.childPosts || [],
          location: post.location,
          videoViewCount: post.videoViewCount,
          videoPlayCount: post.videoPlayCount,
          videoDurationMs: post.videoDurationMs,
          accessibility: post.accessibility,
          coauthorProducers: post.coauthorProducers,
          fundraiser: post.fundraiser,
          hasAudio: post.hasAudio,
          isVideo: post.isVideo,
          productType: post.productType,
          isPinned: post.isPinned,
          ownerId: post.ownerId,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
        })),
      };

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
   * Collect and store Instagram metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param username Instagram username
   */
  async collectInstagramMetrics(
    socialAccountId: string,
    username: string,
  ): Promise<void> {
    try {
      logger.info(
        `Collecting Instagram metrics for account: ${socialAccountId} (${username})`,
      );

      // Check if we have recent data (less than 12 hours old)
      const recentResults = await this.apifyResultsRepo.executeQuery(
        `SELECT * FROM apify_results 
         WHERE social_account_id = $1 
         AND created_at > NOW() - INTERVAL '12 hours'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [socialAccountId],
      );

      let profile: InstagramProfile;

      if (recentResults.length > 0) {
        logger.info(
          `Found recent apify_results from ${recentResults[0].created_at} (less than 12h old), checking for posts...`,
        );
        
        // Check if we have posts for this apify_result_id
        const existingPosts = await this.apifyPostsRepo.executeQuery(
          "SELECT COUNT(*) as count FROM apify_posts WHERE apify_result_id = $1",
          [recentResults[0].id]
        );
        
        if (existingPosts[0].count > 0) {
          logger.info(`Using cached posts data for apify_result_id: ${recentResults[0].id}`);
          profile = await this.reconstructProfileFromPosts(recentResults[0].id);
        } else {
          logger.info(`No posts found for apify_result_id: ${recentResults[0].id}, triggering fresh scrape...`);
          profile = await this.scrapeInstagramProfile(username, socialAccountId);
        }
      } else {
        logger.info("No recent data found, calling Apify API...");
        profile = await this.scrapeInstagramProfile(username, socialAccountId);
      }

      // Filtered raw data is already stored in apify_results table
      // No additional processing needed

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
   * Get recent account metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param limit Number of recent metrics to retrieve (default: 10)
   */
  async getRecentAccountMetrics(
    socialAccountId: string,
    limit: number = 10,
  ): Promise<AccountMetricsDB[]> {
    return this.accountMetricsRepo.executeQuery(
      "SELECT * FROM account_metrics WHERE social_account_id = $1 ORDER BY collected_at DESC LIMIT $2",
      [socialAccountId, limit],
    );
  }

  /**
   * Get recent post metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param limit Number of recent posts to retrieve (default: 20)
   */
  async getRecentPostMetrics(
    socialAccountId: string,
    limit: number = 20,
  ): Promise<PostMetricsDB[]> {
    return this.postMetricsRepo.executeQuery(
      "SELECT * FROM post_metrics WHERE social_account_id = $1 ORDER BY published_at DESC LIMIT $2",
      [socialAccountId, limit],
    );
  }

  /**
   * Filter Apify data for storage - only keep needed fields, include ALL posts
   */
  private filterApifyDataForStorage(rawData: any): any {
    // Profile-level fields to keep (based on apify-fields-complete.md)
    const profileFields = {
      id: rawData.id,
      url: rawData.url,
      fbid: rawData.fbid,
      private: rawData.private,
      fullName: rawData.fullName,
      inputUrl: rawData.inputUrl,
      username: rawData.username,
      verified: rawData.verified,
      biography: rawData.biography,
      hasChannel: rawData.hasChannel,
      postsCount: rawData.postsCount,
      followersCount: rawData.followersCount,
      followsCount: rawData.followsCount,
      profilePicUrl: rawData.profilePicUrl,
    };

    // Filter ALL posts (not just first 12) to only include relevant fields
    const filteredPosts = (rawData.latestPosts || []).map((post: any) => ({
      id: post.id,
      alt: post.alt,
      url: post.url,
      type: post.type,
      images: post.images,
      caption: post.caption,
      ownerId: post.ownerId,
      hashtags: post.hashtags,
      isPinned: post.isPinned,
      mentions: post.mentions,
      timestamp: post.timestamp,
      childPosts: post.childPosts,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      location: post.location,
      videoViewCount: post.videoViewCount,
      videoPlayCount: post.videoPlayCount,
      videoDurationMs: post.videoDurationMs,
      accessibility: post.accessibility,
      coauthorProducers: post.coauthorProducers,
      fundraiser: post.fundraiser,
      hasAudio: post.hasAudio,
      isVideo: post.isVideo,
      productType: post.productType,
    }));

    return {
      ...profileFields,
      latestPosts: filteredPosts,
    };
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
