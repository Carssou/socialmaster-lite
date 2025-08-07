import { ApifyClient } from 'apify-client';
import { Repository } from '../database/repository';
import { ApiError } from '../utils/errors';
import { logger } from '../config/logger';
import { Platform } from '../types/models';

// Interface for Instagram post data from Apify
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
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ApifyError';
  }
}

// Database interface for account metrics
interface AccountMetricsDB {
  id: string;
  social_account_id: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  collected_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Database interface for post metrics
interface PostMetricsDB {
  id: string;
  social_account_id: string;
  post_id: string;
  platform: string;
  post_type: string;
  content: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  engagement_rate: number;
  posted_at: Date;
  collected_at: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Service for collecting Instagram data via Apify API
 * Follows the pattern from instagram-scraper.ts but integrated with the app architecture
 */
export class ApifyService {
  private client: ApifyClient;
  private accountMetricsRepo: Repository<AccountMetricsDB>;
  private postMetricsRepo: Repository<PostMetricsDB>;

  constructor() {
    if (!process.env.APIFY_API_TOKEN) {
      throw new ApifyError('APIFY_API_TOKEN environment variable is not configured');
    }

    this.client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    this.accountMetricsRepo = new Repository<AccountMetricsDB>('account_metrics');
    this.postMetricsRepo = new Repository<PostMetricsDB>('post_metrics');
  }

  /**
   * Scrape Instagram profile data using Apify
   * @param username Instagram username to scrape
   * @returns Instagram profile data
   */
  async scrapeInstagramProfile(username: string): Promise<InstagramProfile> {
    try {
      logger.info(`Starting Instagram scrape for username: ${username}`);

      const input = {
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'details',
        resultsLimit: 1,
        searchType: 'user',
        searchLimit: 250,
        addParentData: false,
      };

      if (!process.env.APIFY_INSTAGRAM_ACTOR) {
        throw new ApifyError('APIFY_INSTAGRAM_ACTOR environment variable is not configured');
      }
      
      const run = await this.client.actor(process.env.APIFY_INSTAGRAM_ACTOR).call(input);
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

      if (!items || items.length === 0) {
        throw new ApifyError(`No profile found for username: ${username}`);
      }

      const data = items[0] as any;
      const posts = (data.latestPosts || []).slice(0, 12);

      // Calculate engagement metrics
      const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likesCount || 0), 0);
      const totalComments = posts.reduce((sum: number, post: any) => sum + (post.commentsCount || 0), 0);
      const avgLikes = Math.round(totalLikes / posts.length) || 0;
      const avgComments = Math.round(totalComments / posts.length) || 0;
      const engagementRate = data.followersCount
        ? Number((((avgLikes + avgComments) / data.followersCount) * 100).toFixed(2))
        : 0;

      const profile: InstagramProfile = {
        id: data.id,
        username: data.username,
        url: data.url,
        fullName: data.fullName || data.username,
        biography: data.biography || '',
        followersCount: data.followersCount || 0,
        followsCount: data.followsCount || 0,
        postsCount: data.postsCount || 0,
        private: Boolean(data.private),
        verified: Boolean(data.verified),
        profilePicUrl: data.profilePicUrl || '',
        profilePicUrlHD: data.profilePicUrlHD || '',
        latestPosts: posts.map((post: any) => ({
          id: post.id,
          type: post.type,
          shortCode: post.shortCode,
          caption: post.caption || '',
          likesCount: post.likesCount || 0,
          url: post.url,
          displayUrl: post.displayUrl,
          timestamp: post.timestamp,
          commentsCount: post.commentsCount || 0,
        })),
      };

      logger.info(`Successfully scraped Instagram profile: ${username} (${profile.followersCount} followers)`);
      return profile;
    } catch (error) {
      if (error instanceof ApifyError) {
        throw error;
      }
      logger.error(`Failed to scrape Instagram profile ${username}:`, error);
      throw new ApifyError(`Failed to scrape Instagram profile: ${username}`, error);
    }
  }

  /**
   * Collect and store Instagram metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param username Instagram username
   */
  async collectInstagramMetrics(socialAccountId: string, username: string): Promise<void> {
    try {
      logger.info(`Collecting Instagram metrics for account: ${socialAccountId} (${username})`);

      const profile = await this.scrapeInstagramProfile(username);

      // Calculate engagement metrics
      const posts = profile.latestPosts;
      const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
      const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
      const avgLikes = Math.round(totalLikes / posts.length) || 0;
      const avgComments = Math.round(totalComments / posts.length) || 0;
      const engagementRate = profile.followersCount
        ? Number((((avgLikes + avgComments) / profile.followersCount) * 100).toFixed(2))
        : 0;

      // Store account metrics
      await this.accountMetricsRepo.create({
        social_account_id: socialAccountId,
        followers_count: profile.followersCount,
        following_count: profile.followsCount,
        posts_count: profile.postsCount,
        engagement_rate: engagementRate,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        collected_at: new Date(),
      });

      // Store post metrics for recent posts
      for (const post of posts) {
        const postEngagementRate = profile.followersCount
          ? Number((((post.likesCount + post.commentsCount) / profile.followersCount) * 100).toFixed(2))
          : 0;

        await this.postMetricsRepo.create({
          social_account_id: socialAccountId,
          post_id: post.id,
          platform: Platform.INSTAGRAM,
          post_type: post.type,
          content: post.caption,
          likes_count: post.likesCount,
          comments_count: post.commentsCount,
          shares_count: 0, // Instagram doesn't provide shares count via Apify
          engagement_rate: postEngagementRate,
          posted_at: new Date(post.timestamp),
          collected_at: new Date(),
        });
      }

      logger.info(`Successfully collected metrics for ${username}: ${posts.length} posts stored`);
    } catch (error) {
      logger.error(`Failed to collect Instagram metrics for ${socialAccountId}:`, error);
      throw new ApifyError(`Failed to collect Instagram metrics for account: ${socialAccountId}`, error);
    }
  }

  /**
   * Get recent account metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param limit Number of recent metrics to retrieve (default: 10)
   */
  async getRecentAccountMetrics(socialAccountId: string, limit: number = 10): Promise<AccountMetricsDB[]> {
    return this.accountMetricsRepo.executeQuery(
      'SELECT * FROM account_metrics WHERE social_account_id = $1 ORDER BY collected_at DESC LIMIT $2',
      [socialAccountId, limit]
    );
  }

  /**
   * Get recent post metrics for a social account
   * @param socialAccountId Database ID of the social account
   * @param limit Number of recent posts to retrieve (default: 20)
   */
  async getRecentPostMetrics(socialAccountId: string, limit: number = 20): Promise<PostMetricsDB[]> {
    return this.postMetricsRepo.executeQuery(
      'SELECT * FROM post_metrics WHERE social_account_id = $1 ORDER BY posted_at DESC LIMIT $2',
      [socialAccountId, limit]
    );
  }
}

export default new ApifyService();