import { Repository } from "../database/repository";
import { TIME_INTERVALS } from "../config/constants";

// Database interface for AI analysis
export interface AIAnalysisDB {
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

/**
 * Data access layer for AI Analysis operations
 * Separates database concerns from business logic
 */
export class AIAnalysisDataService {
  private aiAnalysisRepo: Repository<AIAnalysisDB>;

  constructor() {
    this.aiAnalysisRepo = new Repository<AIAnalysisDB>("ai_analysis");
  }

  /**
   * Check for recent AI insights within threshold for automatic generation (7 days)
   */
  async getRecentInsights(socialAccountId: string): Promise<AIAnalysisDB[]> {
    return (await this.aiAnalysisRepo.executeQuery(
      `SELECT * FROM ai_analysis 
       WHERE social_account_id = $1 
       AND created_at > NOW() - INTERVAL '${TIME_INTERVALS.AI_INSIGHTS_CACHE_HOURS} hours'
       AND is_active = true
       ORDER BY created_at DESC`,
      [socialAccountId],
    )) as AIAnalysisDB[];
  }

  /**
   * Check for recent AI insights within threshold for user-requested generation (2 days)
   */
  async getRecentInsightsForUserRequest(
    socialAccountId: string,
  ): Promise<AIAnalysisDB[]> {
    return (await this.aiAnalysisRepo.executeQuery(
      `SELECT * FROM ai_analysis 
       WHERE social_account_id = $1 
       AND created_at > NOW() - INTERVAL '${TIME_INTERVALS.AI_INSIGHTS_USER_REQUEST_CACHE_HOURS} hours'
       AND is_active = true
       ORDER BY created_at DESC`,
      [socialAccountId],
    )) as AIAnalysisDB[];
  }

  /**
   * Store AI insight in database
   */
  async storeInsight(data: Partial<AIAnalysisDB>): Promise<AIAnalysisDB> {
    return this.aiAnalysisRepo.create(data);
  }

  /**
   * Get active insights for a user
   */
  async getUserInsights(
    userId: string,
    limit: number,
  ): Promise<AIAnalysisDB[]> {
    return (await this.aiAnalysisRepo.executeQuery(
      "SELECT * FROM ai_analysis WHERE user_id = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW()) ORDER BY score DESC, created_at DESC LIMIT $2",
      [userId, limit],
    )) as AIAnalysisDB[];
  }

  /**
   * Get insights for a specific social account
   */
  async getAccountInsights(
    socialAccountId: string,
    limit: number,
  ): Promise<AIAnalysisDB[]> {
    return (await this.aiAnalysisRepo.executeQuery(
      "SELECT * FROM ai_analysis WHERE social_account_id = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW()) ORDER BY score DESC, created_at DESC LIMIT $2",
      [socialAccountId, limit],
    )) as AIAnalysisDB[];
  }

  /**
   * Mark an insight as acknowledged
   */
  async acknowledgeInsight(insightId: string, userId: string): Promise<void> {
    await this.aiAnalysisRepo.update(insightId, {
      acknowledged_by: userId,
      acknowledged_at: new Date(),
    });
  }

  /**
   * Get social account username by ID
   */
  async getSocialAccountUsername(
    socialAccountId: string,
  ): Promise<string | null> {
    const results = (await this.aiAnalysisRepo.executeQuery(
      `SELECT username FROM social_accounts WHERE id = $1`,
      [socialAccountId],
    )) as { username: string }[];

    return results[0]?.username || null;
  }

  /**
   * Get posts data for analysis
   */
  async getPostsForAnalysis(username: string): Promise<any[]> {
    return await this.aiAnalysisRepo.executeQuery(
      `SELECT profile_posts_count, profile_followers_count, profile_follows_count,
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
  }
}
