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
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        timestamp: post.timestamp,
        type: post.type || "Image",
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        location: post.location || null,
        isVideo: post.type === "Video",
        videoUrl: post.videoUrl || null,
        engagement: {
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          shares: 0,
          saves: 0,
        },
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
      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();

      // Store raw Apify results if socialAccountId provided
      if (socialAccountId && items && items.length > 0) {
        await this.apifyResultsRepo.create({
          social_account_id: socialAccountId,
          run_id: run.id,
          actor_id: process.env.APIFY_INSTAGRAM_ACTOR,
          username: username,
          raw_data: items[0], // Store the complete raw response
          processing_status: 'completed',
          processed_at: new Date(),
        });
        logger.info(`Stored raw Apify results for run: ${run.id}`);
      }

      if (!items || items.length === 0) {
        throw new ApifyError(`No profile found for username: ${username}`);
      }

      const data = items[0] as any;
      const posts = (data.latestPosts || []).slice(0, 12);

      // Calculate engagement metrics
      const totalLikes = posts.reduce(
        (sum: number, post: any) => sum + (post.likesCount || 0),
        0,
      );
      const totalComments = posts.reduce(
        (sum: number, post: any) => sum + (post.commentsCount || 0),
        0,
      );
      const avgLikes = Math.round(totalLikes / posts.length) || 0;
      const avgComments = Math.round(totalComments / posts.length) || 0;
      const _engagementRate = data.followersCount
        ? Number(
            (((avgLikes + avgComments) / data.followersCount) * 100).toFixed(2),
          )
        : 0;

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
          shortCode: post.shortCode,
          caption: post.caption || "",
          likesCount: post.likesCount || 0,
          url: post.url,
          displayUrl: post.displayUrl,
          timestamp: post.timestamp,
          commentsCount: post.commentsCount || 0,
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

      // Calculate engagement metrics
      const posts = profile.latestPosts;
      const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
      const totalComments = posts.reduce(
        (sum, post) => sum + post.commentsCount,
        0,
      );
      const avgLikes = Math.round(totalLikes / posts.length) || 0;
      const avgComments = Math.round(totalComments / posts.length) || 0;
      const engagementRate = profile.followersCount
        ? Number(
            (((avgLikes + avgComments) / profile.followersCount) * 100).toFixed(
              2,
            ),
          )
        : 0;

      // Store account metrics (only if not exists within 12 hours)
      const recentMetrics = await this.accountMetricsRepo.executeQuery(
        `SELECT id FROM account_metrics 
         WHERE social_account_id = $1 
         AND collected_at > NOW() - INTERVAL '12 hours'`,
        [socialAccountId]
      );

      if (recentMetrics.length === 0) {
        await this.accountMetricsRepo.create({
          social_account_id: socialAccountId,
          date: new Date(),
          followers: profile.followersCount,
          following: profile.followsCount,
          total_posts: profile.postsCount,
          avg_engagement_rate: engagementRate,
          reach_growth: 0, // Not available from Apify
          follower_growth: 0, // Not available from Apify
          collected_at: new Date(),
        });
        logger.info('Created new account metrics entry');
      } else {
        logger.info('Account metrics already exist within 12h - skipping');
      }

      // Store post metrics for recent posts with rich data
      for (const post of posts) {
        const postEngagementRate = profile.followersCount
          ? Number(
              (
                ((post.likesCount + post.commentsCount) /
                  profile.followersCount) *
                100
              ).toFixed(2),
            )
          : 0;

        // Generate a UUID for content_id (in a real app, this would link to a content table)
        const contentId = require('crypto').randomUUID();

        await this.postMetricsRepo.create({
          content_id: contentId,
          social_account_id: socialAccountId,
          platform_post_id: post.shortCode,
          platform: Platform.INSTAGRAM,
          published_at: new Date(post.timestamp),
          likes: post.likesCount,
          comments: post.commentsCount,
          shares: 0, // Instagram doesn't provide shares count
          views: 0,
          reach: 0,
          impressions: 0,
          engagement_rate: postEngagementRate,
          click_through_rate: 0,
          collected_at: new Date(),
          // Rich Apify data
          input_url: `https://www.instagram.com/${username}/`, // The original scraping URL
          post_url: post.url,
          short_code: post.shortCode,
          caption: post.caption || '',
          alt_text: post.alt || '',
          post_type: post.type,
          dimensions_height: post.dimensionsHeight || 0,
          dimensions_width: post.dimensionsWidth || 0,
          display_url: post.displayUrl,
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          first_comment: post.firstComment || '',
          latest_comments: post.latestComments || [],
          owner_full_name: post.ownerFullName || '',
          owner_username: post.ownerUsername || username,
          owner_id: post.ownerId || '',
          is_sponsored: post.isSponsored || false,
          child_posts: post.childPosts || [],
          images: post.images || [],
        });
      }

      logger.info(
        `Successfully collected metrics for ${username}: ${posts.length} posts stored`,
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
}

export default new ApifyService();
