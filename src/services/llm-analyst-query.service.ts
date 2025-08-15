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
 * Service for providing LLM analysts with read-only access to ai_analysis table
 * Enables context-aware AI insights by allowing LLMs to query historical analysis data
 */
export class LLMAnalystQueryService {
  private aiAnalysisRepo: Repository<AIAnalysisDB>;

  constructor() {
    this.aiAnalysisRepo = new Repository<AIAnalysisDB>("ai_analysis");
  }

  /**
   * Validate that query is safe (SELECT only)
   * Enhanced validation to prevent SQL injection attacks
   */
  private validateQuery(query: string): void {
    const normalizedQuery = query.trim().toLowerCase();

    // Strip SQL comments before validation
    const queryWithoutComments = normalizedQuery
      .replace(/--.*$/gm, "") // Remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove block comments

    // Only allow SELECT statements
    if (!queryWithoutComments.trim().startsWith("select")) {
      throw new ApiError("Only SELECT queries are allowed", 400);
    }

    // Check for multiple statements
    if (queryWithoutComments.includes(";")) {
      throw new ApiError("Multiple statements are not allowed", 400);
    }

    // Block dangerous keywords with word boundaries to avoid false positives
    const dangerousKeywords = [
      "\\binsert\\b",
      "\\bupdate\\b",
      "\\bdelete\\b",
      "\\bdrop\\b",
      "\\bcreate\\b",
      "\\balter\\b",
      "\\btruncate\\b",
      "\\bexec\\b",
      "\\bexecute\\b",
      "\\bcall\\b",
      "\\bdeclare\\b",
      "\\binto\\b",
      "\\bgrant\\b",
      "\\brevoke\\b",
    ];

    for (const keyword of dangerousKeywords) {
      const regex = new RegExp(keyword, "i");
      if (regex.test(queryWithoutComments)) {
        throw new ApiError(
          `Query contains forbidden keyword: ${keyword.replace(/\\b/g, "")}`,
          400,
        );
      }
    }
  }

  /**
   * Execute a validated SELECT query against ai_analysis table
   */
  async executeQuery(
    query: string,
    params: any[] = [],
  ): Promise<LLMQueryResult> {
    try {
      this.validateQuery(query);

      logger.info(
        `LLM ANALYST: Executing query: ${query.substring(0, 100)}...`,
      );

      const results = await this.aiAnalysisRepo.executeQuery(query, params);

      return {
        success: true,
        data: results,
        count: results.length,
        query: query,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("LLM ANALYST: Query execution failed:", error);

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
    const query = `
      SELECT id, user_id, social_account_id, type, category, title, description, 
             explanation, confidence, impact, urgency, score, tags,
             is_active, created_at, updated_at
      FROM ai_analysis 
      WHERE user_id = $1 
      AND created_at > NOW() - INTERVAL $2
      AND is_active = true
      ORDER BY created_at DESC 
      LIMIT $3
    `;

    return this.executeQuery(query, [userId, `${days} days`, limit]);
  }

  /**
   * Get AI analyses for a specific social account
   */
  async getAccountAnalyses(
    socialAccountId: string,
    limit: number = 30,
  ): Promise<LLMQueryResult> {
    const query = `
      SELECT id, user_id, social_account_id, type, category, title, description,
             explanation, confidence, impact, urgency, score, tags,
             is_active, created_at, updated_at
      FROM ai_analysis 
      WHERE social_account_id = $1 
      AND is_active = true
      ORDER BY created_at DESC 
      LIMIT $2
    `;

    return this.executeQuery(query, [socialAccountId, limit]);
  }

  /**
   * Get analyses by type/category for pattern analysis
   */
  async getAnalysesByType(
    type: string,
    category?: string,
    limit: number = 20,
  ): Promise<LLMQueryResult> {
    let query = `
      SELECT id, user_id, social_account_id, type, category, title, description,
             explanation, confidence, impact, urgency, score, tags,
             is_active, created_at, updated_at
      FROM ai_analysis 
      WHERE type = $1 
      AND is_active = true
    `;

    const params: any[] = [type];

    if (category) {
      query += ` AND category = $2`;
      params.push(category);
      query += ` ORDER BY created_at DESC LIMIT $3`;
      params.push(limit);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $2`;
      params.push(limit);
    }

    return this.executeQuery(query, params);
  }

  /**
   * Search analyses by keywords in title/description
   */
  async searchAnalyses(
    keywords: string,
    limit: number = 20,
  ): Promise<LLMQueryResult> {
    const query = `
      SELECT id, user_id, social_account_id, type, category, title, description,
             explanation, confidence, impact, urgency, score, tags,
             is_active, created_at, updated_at
      FROM ai_analysis 
      WHERE (title ILIKE $1 OR description ILIKE $1 OR explanation ILIKE $1)
      AND is_active = true
      ORDER BY score DESC, created_at DESC 
      LIMIT $2
    `;

    return this.executeQuery(query, [`%${keywords}%`, limit]);
  }

  /**
   * Get analysis trends by impact/urgency over time
   */
  async getAnalysisTrends(
    userId: string,
    days: number = 90,
  ): Promise<LLMQueryResult> {
    const query = `
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
    `;

    return this.executeQuery(query, [userId, `${days} days`]);
  }

  /**
   * Get top insights by score for a user or account
   */
  async getTopInsights(
    userId?: string,
    socialAccountId?: string,
    limit: number = 10,
  ): Promise<LLMQueryResult> {
    let query = `
      SELECT id, user_id, social_account_id, type, category, title, description,
             explanation, confidence, impact, urgency, score, tags,
             is_active, created_at, updated_at
      FROM ai_analysis 
      WHERE is_active = true
    `;

    const params: any[] = [];

    if (userId) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(userId);
    }

    if (socialAccountId) {
      query += ` AND social_account_id = $${params.length + 1}`;
      params.push(socialAccountId);
    }

    query += ` ORDER BY score DESC, created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    return this.executeQuery(query, params);
  }

  /**
   * Get analysis summary statistics for context
   */
  async getAnalysisSummary(
    userId: string,
    days: number = 30,
  ): Promise<LLMQueryResult> {
    const query = `
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
    `;

    return this.executeQuery(query, [userId, `${days} days`]);
  }
}

// Export singleton instance
export default new LLMAnalystQueryService();
