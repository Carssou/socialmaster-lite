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

/**
 * Service for collecting Instagram data via Apify API
 * Follows the pattern from instagram-scraper.ts but integrated with the app architecture
 */
export class ApifyService {
  private client: ApifyClient;
  private accountMetricsRepo: Repository<AccountMetricsDB>;
  private postMetricsRepo: Repository<PostMetricsDB>;
  private apifyResultsRepo: Repository<any>;

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
  }

  /**
   * Parse raw Apify data back to InstagramProfile format
   * @param rawData Raw Apify response data
   * @returns Instagram profile data
   */
  private parseApifyDataToProfile(rawData: any): InstagramProfile {
    const data = rawData;
    const posts = (data.latestPosts || []).slice(0, 12);

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
        commentsCount: post.commentsCount
      })),
    };
  }

  /**
   * Scrape Instagram profile data using Apify
   * @param username Instagram username to scrape
   * @param socialAccountId Optional social account ID to store raw results
   * @returns Instagram profile data
   */
  async scrapeInstagramProfile(username: string, socialAccountId?: string): Promise<InstagramProfile> {
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
      
      logger.info(`APIFY: Run completed with ID: ${run.id}, status: ${run.status}`);
      
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
          postsCount: (items[0] as any).postsCount
        });
      }

      // Store filtered Apify results if socialAccountId provided
      if (socialAccountId && items && items.length > 0) {
        const filteredData = this.filterApifyDataForStorage(items[0]);
        await this.apifyResultsRepo.create({
          social_account_id: socialAccountId,
          run_id: run.id,
          actor_id: process.env.APIFY_INSTAGRAM_ACTOR,
          username: username,
          raw_data: filteredData, // Store only needed fields
          processing_status: 'completed',
          processed_at: new Date(),
        });
        logger.info(`Stored filtered Apify results for run: ${run.id} with ${filteredData.latestPosts?.length || 0} posts`);
      }

      if (!items || items.length === 0) {
        throw new ApifyError(`No profile found for username: ${username}`);
      }

      const data = items[0] as any;
      const posts = (data.latestPosts || []).slice(0, 12);

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
          commentsCount: post.commentsCount
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
        [socialAccountId]
      );

      let profile: InstagramProfile;

      if (recentResults.length > 0) {
        logger.info(`Using cached Apify data from ${recentResults[0].created_at} (less than 12h old)`);
        profile = this.parseApifyDataToProfile(recentResults[0].raw_data);
      } else {
        logger.info('No recent data found, calling Apify API...');
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
      latestPosts: filteredPosts
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
  }
};
