import { Repository } from "../database/repository";
import { logger } from "../logger";
import { TIME_INTERVALS } from "../config/constants";
import { ApifyPostDB, ApifyResultDB } from "../services/apify.service";

/**
 * Data access layer for Apify-related database operations
 * Separates database concerns from business logic
 */
export class ApifyDataService {
  private apifyResultsRepo: Repository<ApifyResultDB>;
  private apifyPostsRepo: Repository<ApifyPostDB>;

  constructor() {
    this.apifyResultsRepo = new Repository<ApifyResultDB>("apify_results");
    this.apifyPostsRepo = new Repository<ApifyPostDB>("apify_posts");
  }

  /**
   * Check if we have recent Apify results (within threshold)
   */
  async getRecentApifyResult(
    socialAccountId: string,
  ): Promise<ApifyResultDB | null> {
    const results = (await this.apifyResultsRepo.executeQuery(
      `SELECT * FROM apify_results 
       WHERE social_account_id = $1 
       AND created_at > NOW() - INTERVAL '${TIME_INTERVALS.RECENT_DATA_THRESHOLD_HOURS} hours'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [socialAccountId],
    )) as ApifyResultDB[];

    return results[0] || null;
  }

  /**
   * Store Apify result metadata
   */
  async storeApifyResult(data: {
    socialAccountId: string;
    runId: string;
    actorId: string;
    username: string;
  }): Promise<ApifyResultDB> {
    return this.apifyResultsRepo.create({
      social_account_id: data.socialAccountId,
      run_id: data.runId,
      actor_id: data.actorId,
      username: data.username,
      raw_data: null, // No longer store raw data
      processing_status: "completed",
      processed_at: new Date(),
    });
  }

  /**
   * Get posts count for a specific Apify result
   */
  async getPostsCount(apifyResultId: string): Promise<number> {
    const result = (await this.apifyPostsRepo.executeQuery(
      "SELECT COUNT(*) as count FROM apify_posts WHERE apify_result_id = $1",
      [apifyResultId],
    )) as { count: number }[];

    return result[0]?.count || 0;
  }

  /**
   * Get all posts for a specific Apify result
   */
  async getPostsByResultId(apifyResultId: string): Promise<ApifyPostDB[]> {
    return (await this.apifyPostsRepo.executeQuery(
      "SELECT * FROM apify_posts WHERE apify_result_id = $1 ORDER BY post_index",
      [apifyResultId],
    )) as ApifyPostDB[];
  }

  /**
   * Get posts by username (for AI analysis)
   */
  async getPostsByUsername(username: string): Promise<ApifyPostDB[]> {
    return (await this.apifyPostsRepo.executeQuery(
      `SELECT * FROM apify_posts 
       WHERE profile_username = $1 
       AND post_is_pinned = false
       AND profile_id = post_owner_id
       ORDER BY post_timestamp DESC, post_index`,
      [username],
    )) as ApifyPostDB[];
  }

  /**
   * Get posts for analytics (limited set)
   */
  async getPostsForAnalytics(username: string): Promise<ApifyPostDB[]> {
    return (await this.apifyPostsRepo.executeQuery(
      `SELECT * FROM apify_posts 
       WHERE profile_username = $1 
       ORDER BY post_timestamp DESC, post_index`,
      [username],
    )) as ApifyPostDB[];
  }

  /**
   * Store a single post with UPSERT logic
   * This is extracted from the massive UPSERT query
   */
  async upsertPost(postData: {
    postId: string;
    apifyResultId: string;
    postIndex: number;
    profileData: any;
    postDetails: any;
  }): Promise<void> {
    const { postId, apifyResultId, postIndex, profileData, postDetails } =
      postData;

    // Simplified UPSERT with proper parameter management
    await this.apifyPostsRepo.executeQuery(
      `
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
        $33, $34, $35, $36, $37, $38, $39, $40, DEFAULT, NOW(), 1
      )
      ON CONFLICT (post_id) DO UPDATE SET
        apify_result_id = EXCLUDED.apify_result_id,
        post_index = EXCLUDED.post_index,
        profile_followers_count = EXCLUDED.profile_followers_count,
        profile_follows_count = EXCLUDED.profile_follows_count,
        profile_posts_count = EXCLUDED.profile_posts_count,
        post_likes_count = EXCLUDED.post_likes_count,
        post_comments_count = EXCLUDED.post_comments_count,
        post_video_view_count = EXCLUDED.post_video_view_count,
        post_video_play_count = EXCLUDED.post_video_play_count,
        last_updated_at = NOW(),
        scrape_count = apify_posts.scrape_count + 1
      `,
      [
        postId,
        apifyResultId,
        postIndex,
        // Profile data (to be normalized later)
        profileData.id,
        profileData.url,
        profileData.fbid,
        profileData.private,
        profileData.fullName,
        profileData.inputUrl,
        profileData.username,
        profileData.verified,
        profileData.biography,
        profileData.hasChannel,
        profileData.postsCount,
        profileData.followersCount,
        profileData.followsCount,
        profileData.profilePicUrl,
        // Post data
        postDetails.alt,
        postDetails.url,
        postDetails.type,
        JSON.stringify(postDetails.images || []),
        postDetails.caption,
        postDetails.ownerId,
        JSON.stringify(postDetails.hashtags || []),
        postDetails.isPinned,
        JSON.stringify(postDetails.mentions || []),
        postDetails.timestamp ? new Date(postDetails.timestamp) : null,
        JSON.stringify(postDetails.childPosts || []),
        postDetails.likesCount,
        postDetails.commentsCount,
        postDetails.location ? JSON.stringify(postDetails.location) : null,
        postDetails.videoViewCount,
        postDetails.videoPlayCount,
        postDetails.videoDurationMs,
        postDetails.accessibility,
        JSON.stringify(postDetails.coauthorProducers || []),
        JSON.stringify(postDetails.fundraiser),
        postDetails.hasAudio,
        postDetails.isVideo,
        postDetails.productType,
      ],
    );
  }

  /**
   * Batch upsert posts for better performance
   */
  async batchUpsertPosts(
    posts: Array<{
      postId: string;
      apifyResultId: string;
      postIndex: number;
      profileData: any;
      postDetails: any;
    }>,
  ): Promise<void> {
    // Process in batches to avoid parameter limits
    const batchSize = 50; // Conservative batch size

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);

      await Promise.all(batch.map((post) => this.upsertPost(post)));

      logger.info(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)} (${batch.length} posts)`,
      );
    }
  }
}
