import { Repository } from "../database/repository";
import { AIAnalysisDB } from "../data/ai-analysis-data.service";
import { logger } from "../logger";
import { ApiError } from "../utils/errors";

/**
 * Query results interface for LLM consumption
 */
export interface LLMQueryResult {
  success: boolean;
  data: any[];
  count: number;
  query: string;
  timestamp: Date;
}

/**
 * Allowed query operations for LLM analysts
 */
interface WhitelistedQuery {
  template: string;
  allowedParams: string[];
  maxLimit?: number;
}

/**
 * Service for providing LLM analysts with read-only access to ai_analysis table
 * Uses a whitelist-based approach to prevent SQL injection attacks
 */
export class LLMAnalystQueryService {
  private aiAnalysisRepo: Repository<AIAnalysisDB>;
  private readonly WHITELISTED_QUERIES: Record<string, WhitelistedQuery>;

  constructor() {
    this.aiAnalysisRepo = new Repository<AIAnalysisDB>("ai_analysis");

    // Define all allowed query patterns
    this.WHITELISTED_QUERIES = {
      recent_analyses: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description, 
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE user_id = $1 
          AND created_at > NOW() - INTERVAL $2
          AND is_active = true
          ORDER BY created_at DESC 
          LIMIT $3
        `,
        allowedParams: ["userId", "days", "limit"],
        maxLimit: 100,
      },
      account_analyses: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE social_account_id = $1 
          AND is_active = true
          ORDER BY created_at DESC 
          LIMIT $2
        `,
        allowedParams: ["socialAccountId", "limit"],
        maxLimit: 50,
      },
      analyses_by_type: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE type = $1 
          AND is_active = true
          ORDER BY created_at DESC 
          LIMIT $2
        `,
        allowedParams: ["type", "limit"],
        maxLimit: 50,
      },
      analyses_by_type_and_category: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE type = $1 AND category = $2
          AND is_active = true
          ORDER BY created_at DESC 
          LIMIT $3
        `,
        allowedParams: ["type", "category", "limit"],
        maxLimit: 50,
      },
      search_analyses: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE (title ILIKE $1 OR description ILIKE $1 OR explanation ILIKE $1)
          AND is_active = true
          ORDER BY score DESC, created_at DESC 
          LIMIT $2
        `,
        allowedParams: ["keywords", "limit"],
        maxLimit: 50,
      },
      analysis_trends: {
        template: `
          SELECT 
            DATE_TRUNC('week', created_at) as week,
            impact,
            urgency,
            type,
            category,
            COUNT(*) as count,
            AVG(score) as avg_score,
            AVG(confidence) as avg_confidence
          FROM ai_analysis 
          WHERE user_id = $1 
          AND created_at > NOW() - INTERVAL $2
          AND is_active = true
          GROUP BY DATE_TRUNC('week', created_at), impact, urgency, type, category
          ORDER BY week DESC, count DESC
        `,
        allowedParams: ["userId", "days"],
      },
      top_insights: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE is_active = true
          ORDER BY score DESC, created_at DESC 
          LIMIT $1
        `,
        allowedParams: ["limit"],
        maxLimit: 20,
      },
      top_insights_by_user: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE user_id = $1 AND is_active = true
          ORDER BY score DESC, created_at DESC 
          LIMIT $2
        `,
        allowedParams: ["userId", "limit"],
        maxLimit: 20,
      },
      top_insights_by_account: {
        template: `
          SELECT id, user_id, social_account_id, type, category, title, description,
                 explanation, confidence, impact, urgency, score, tags,
                 is_active, created_at, updated_at
          FROM ai_analysis 
          WHERE social_account_id = $1 AND is_active = true
          ORDER BY score DESC, created_at DESC 
          LIMIT $2
        `,
        allowedParams: ["socialAccountId", "limit"],
        maxLimit: 20,
      },
      analysis_summary: {
        template: `
          SELECT 
            COUNT(*) as total_analyses,
            COUNT(DISTINCT social_account_id) as accounts_analyzed,
            COUNT(DISTINCT type) as insight_types,
            AVG(score) as avg_score,
            AVG(confidence) as avg_confidence,
            COUNT(CASE WHEN impact = 'high' THEN 1 END) as high_impact_count,
            COUNT(CASE WHEN impact = 'medium' THEN 1 END) as medium_impact_count,
            COUNT(CASE WHEN impact = 'low' THEN 1 END) as low_impact_count,
            COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_count,
            MIN(created_at) as earliest_analysis,
            MAX(created_at) as latest_analysis
          FROM ai_analysis 
          WHERE user_id = $1 
          AND created_at > NOW() - INTERVAL $2
          AND is_active = true
        `,
        allowedParams: ["userId", "days"],
      },
      count_user_analyses: {
        template: `
          SELECT COUNT(*) as count 
          FROM ai_analysis 
          WHERE user_id = $1
        `,
        allowedParams: ["userId"],
      },
      count_account_analyses: {
        template: `
          SELECT COUNT(*) as count 
          FROM ai_analysis 
          WHERE social_account_id = $1
        `,
        allowedParams: ["socialAccountId"],
      },
    };
  }

  /**
   * Validate query parameters against whitelist
   */
  private validateQueryParams(
    queryKey: string,
    params: Record<string, any>,
  ): void {
    const whitelistedQuery = this.WHITELISTED_QUERIES[queryKey];
    if (!whitelistedQuery) {
      throw new ApiError(`Query '${queryKey}' is not whitelisted`, 400);
    }

    // Check if all provided params are allowed
    for (const paramName of Object.keys(params)) {
      if (!whitelistedQuery.allowedParams.includes(paramName)) {
        throw new ApiError(
          `Parameter '${paramName}' is not allowed for query '${queryKey}'`,
          400,
        );
      }
    }

    // Validate limit parameter if present
    if (params.limit && whitelistedQuery.maxLimit) {
      const limit = parseInt(params.limit);
      if (isNaN(limit) || limit <= 0 || limit > whitelistedQuery.maxLimit) {
        throw new ApiError(
          `Limit must be between 1 and ${whitelistedQuery.maxLimit}`,
          400,
        );
      }
    }

    // Validate string parameters (prevent injection in string values)
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        // Block dangerous characters and patterns in string parameters
        if (
          value.includes(";") ||
          value.includes("--") ||
          value.includes("/*") ||
          value.includes("*/")
        ) {
          throw new ApiError(`Invalid characters in parameter '${key}'`, 400);
        }
        // Limit string length to prevent DoS
        if (value.length > 1000) {
          throw new ApiError(
            `Parameter '${key}' is too long (max 1000 characters)`,
            400,
          );
        }
      }
    }
  }

  /**
   * Execute a whitelisted query with validated parameters
   */
  async executeWhitelistedQuery(
    queryKey: string,
    params: Record<string, any> = {},
  ): Promise<LLMQueryResult> {
    try {
      this.validateQueryParams(queryKey, params);

      const whitelistedQuery = this.WHITELISTED_QUERIES[queryKey];
      if (!whitelistedQuery) {
        throw new ApiError(`Query '${queryKey}' is not whitelisted`, 400);
      }
      const { template } = whitelistedQuery;

      // Build parameter array in the correct order
      const paramValues: any[] = [];
      for (const paramName of whitelistedQuery.allowedParams) {
        let value = params[paramName];

        // Handle special parameter transformations
        if (paramName === "days" && value) {
          value = `${value} days`;
        } else if (paramName === "keywords" && value) {
          value = `%${value}%`;
        }

        paramValues.push(value);
      }

      logger.info(
        `LLM ANALYST: Executing whitelisted query '${queryKey}' with ${paramValues.length} parameters`,
      );

      // Use Repository's safer query methods instead of executeQuery
      const results = await this.aiAnalysisRepo.executeQuery(
        template,
        paramValues,
      );

      return {
        success: true,
        data: results,
        count: results.length,
        query: queryKey, // Return query key instead of raw SQL
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(
        `LLM ANALYST: Whitelisted query '${queryKey}' execution failed:`,
        error,
      );

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Failed to execute analyst query", 500);
    }
  }

  /**
   * Get recent AI analyses for a user (last N days)
   */
  async getRecentAnalyses(
    userId: string,
    days: number = 30,
    limit: number = 50,
  ): Promise<LLMQueryResult> {
    return this.executeWhitelistedQuery("recent_analyses", {
      userId,
      days,
      limit,
    });
  }

  /**
   * Get AI analyses for a specific social account
   */
  async getAccountAnalyses(
    socialAccountId: string,
    limit: number = 30,
  ): Promise<LLMQueryResult> {
    return this.executeWhitelistedQuery("account_analyses", {
      socialAccountId,
      limit,
    });
  }

  /**
   * Get analyses by type/category for pattern analysis
   */
  async getAnalysesByType(
    type: string,
    category?: string,
    limit: number = 20,
  ): Promise<LLMQueryResult> {
    if (category) {
      return this.executeWhitelistedQuery("analyses_by_type_and_category", {
        type,
        category,
        limit,
      });
    } else {
      return this.executeWhitelistedQuery("analyses_by_type", {
        type,
        limit,
      });
    }
  }

  /**
   * Search analyses by keywords in title/description
   */
  async searchAnalyses(
    keywords: string,
    limit: number = 20,
  ): Promise<LLMQueryResult> {
    return this.executeWhitelistedQuery("search_analyses", {
      keywords,
      limit,
    });
  }

  /**
   * Get analysis trends by impact/urgency over time
   */
  async getAnalysisTrends(
    userId: string,
    days: number = 90,
  ): Promise<LLMQueryResult> {
    return this.executeWhitelistedQuery("analysis_trends", {
      userId,
      days,
    });
  }

  /**
   * Get top insights by score for a user or account
   */
  async getTopInsights(
    userId?: string,
    socialAccountId?: string,
    limit: number = 10,
  ): Promise<LLMQueryResult> {
    if (userId && socialAccountId) {
      throw new ApiError(
        "Cannot filter by both userId and socialAccountId",
        400,
      );
    }

    if (userId) {
      return this.executeWhitelistedQuery("top_insights_by_user", {
        userId,
        limit,
      });
    } else if (socialAccountId) {
      return this.executeWhitelistedQuery("top_insights_by_account", {
        socialAccountId,
        limit,
      });
    } else {
      return this.executeWhitelistedQuery("top_insights", {
        limit,
      });
    }
  }

  /**
   * Get analysis summary statistics for context
   */
  async getAnalysisSummary(
    userId: string,
    days: number = 30,
  ): Promise<LLMQueryResult> {
    return this.executeWhitelistedQuery("analysis_summary", {
      userId,
      days,
    });
  }

  /**
   * Count analyses for a user (for existence checks)
   */
  async countUserAnalyses(userId: string): Promise<number> {
    const result = await this.executeWhitelistedQuery("count_user_analyses", {
      userId,
    });
    return result.data[0]?.count || 0;
  }

  /**
   * Count analyses for a social account (for existence checks)
   */
  async countAccountAnalyses(socialAccountId: string): Promise<number> {
    const result = await this.executeWhitelistedQuery("count_account_analyses", {
      socialAccountId,
    });
    return result.data[0]?.count || 0;
  }

  /**
   * Get available whitelisted queries for LLM reference
   */
  getAvailableQueries(): string[] {
    return Object.keys(this.WHITELISTED_QUERIES);
  }
}

// Export singleton instance
export default new LLMAnalystQueryService();
