import { Router, Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import socialAccountService from "../services/social-account.service";
import apifyService from "../services/apify.service";
import aiInsightsService from "../services/ai-insights.service";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";

const router = Router();

// Validation middleware
const accountIdValidation = [
  param("accountId").isUUID().withMessage("Valid account ID is required"),
];

const syncValidation = [
  param("accountId").isUUID().withMessage("Valid account ID is required"),
];

const insightsValidation = [
  param("accountId").isUUID().withMessage("Valid account ID is required"),
  query("forceRefresh").optional().isBoolean().withMessage("Force refresh must be a boolean"),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      `Validation failed: ${errors.array().map(err => err.msg).join(", ")}`,
      400
    );
  }
};

/**
 * @route GET /api/analytics/accounts/:accountId/metrics
 * @desc Get basic metrics parsed from raw Apify data and AI insights
 * @access Private
 */
router.get("/accounts/:accountId/metrics", authenticate, accountIdValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const userId = req.user!.id;
    const accountId = req.params.accountId as string;
    
    // Verify user owns this account
    await socialAccountService.getAccount(accountId, userId);
    
    // Get raw Apify data to derive basic metrics  
    const { Repository } = await import("../database/repository");
    const apifyResultsRepo = new Repository("apify_results");
    const rawApifyData = await apifyResultsRepo.executeQuery(
      `SELECT raw_data, username, created_at FROM apify_results 
       WHERE social_account_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [accountId]
    );

    if (rawApifyData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data available - sync your account first to collect metrics",
        data: {
          metrics: [],
          insights: [],
          summary: {
            requiresSync: true,
            lastUpdated: null,
          }
        },
      });
    }

    const apifyResult = rawApifyData[0];
    const profileData = apifyResult.raw_data;
    const posts = profileData.latestPosts || [];

    // Parse basic metrics from raw data
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likesCount || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.commentsCount || 0), 0);
    const avgLikes = posts.length > 0 ? totalLikes / posts.length : 0;
    const avgComments = posts.length > 0 ? totalComments / posts.length : 0;
    
    // Calculate engagement rate (likes + comments) / followers * 100
    const totalEngagement = totalLikes + totalComments;
    const avgEngagementPerPost = posts.length > 0 ? totalEngagement / posts.length : 0;
    const engagementRate = profileData.followersCount > 0 ? 
      (avgEngagementPerPost / profileData.followersCount) * 100 : 0;

    // Create metrics in format expected by frontend
    const basicMetrics = [{
      followersCount: profileData.followersCount || 0,
      followingCount: profileData.followsCount || 0,
      postsCount: profileData.postsCount || 0,
      avgLikes: avgLikes,
      avgComments: avgComments,
      engagementRate: engagementRate / 100, // Convert to decimal for frontend calculation
      lastUpdated: apifyResult.created_at,
      postsAnalyzed: posts.length,
    }];

    // Also get AI insights to return alongside basic metrics
    let insights: any[] = [];
    try {
      insights = await aiInsightsService.generateAccountInsights(userId, accountId);
    } catch (error) {
      logger.info(`No AI insights available for account ${accountId}:`, error);
    }

    return res.status(200).json({
      success: true,
      message: "Account metrics and insights retrieved successfully",
      data: {
        metrics: basicMetrics,
        insights: insights.map(insight => ({
          id: insight.id,
          type: insight.type,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          recommendation: insight.explanation,
          confidence: insight.confidence / 100, // Convert to decimal for frontend
          priority: insight.impact,
          createdAt: insight.created_at,
        })),
        summary: {
          totalMetrics: basicMetrics.length,
          totalInsights: insights.length,
          lastUpdated: apifyResult.created_at,
          dataSource: "apify_raw",
        }
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get account metrics error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route POST /api/analytics/accounts/:accountId/sync
 * @desc Sync account data from Instagram via Apify
 * @access Private
 */
router.post("/accounts/:accountId/sync", authenticate, syncValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const userId = req.user!.id;
    const accountId = req.params.accountId as string;
    
    // Verify user owns this account
    const account = await socialAccountService.getAccount(accountId, userId);
    
    if (account.platform !== "instagram") {
      throw new ApiError("Only Instagram accounts are currently supported for sync", 400);
    }

    logger.info(`Starting sync for Instagram account: ${account.username}`);
    
    // Scrape fresh data from Instagram AND store metrics in database
    await apifyService.instance.collectInstagramMetrics(accountId, account.username);

    logger.info(`Sync completed for Instagram account: ${account.username}`);

    // Get the stored metrics to return in response
    const accountMetrics = await apifyService.instance.getRecentAccountMetrics(accountId, 1);
    const postMetrics = await apifyService.instance.getRecentPostMetrics(accountId, 10);

    res.status(200).json({
      success: true,
      message: "Account sync completed successfully",
      data: {
        username: account.username,
        syncedAt: new Date(),
        profileData: {
          followersCount: accountMetrics[0]?.followers || 0,
          followsCount: accountMetrics[0]?.following || 0,
          postsCount: accountMetrics[0]?.total_posts || 0,
          latestPostsCount: postMetrics.length || 0,
        }
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Account sync error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route GET /api/analytics/accounts/:accountId/insights
 * @desc Get AI insights for a specific social account
 * @access Private
 */
router.get("/accounts/:accountId/insights", authenticate, insightsValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const userId = req.user!.id;
    const accountId = req.params.accountId as string;
    const forceRefresh = req.query.forceRefresh === "true";
    
    // Verify user owns this account
    await socialAccountService.getAccount(accountId, userId);
    
    logger.info(`Getting AI insights for account: ${accountId}, forceRefresh: ${forceRefresh}`);
    
    // Get insights (uses 12-hour cache unless forced)
    let insights: any[] = [];
    try {
      insights = await aiInsightsService.generateAccountInsights(userId, accountId);
    } catch (error: any) {
      logger.info(`ANALYTICS ROUTE: Caught error generating insights:`, {
        errorType: typeof error,
        errorName: error?.name,
        errorMessage: error?.message,
        statusCode: error?.statusCode,
        isApiError: error instanceof ApiError
      });
      
      // If no metrics found, return empty insights with helpful message
      if (error instanceof ApiError && error.statusCode === 404) {
        logger.info(`No metrics found for account ${accountId}, returning empty insights`);
        return res.status(200).json({
          success: true,
          message: "No insights available - sync your account first to collect data for analysis",
          data: { 
            insights: [],
            summary: {
              totalInsights: 0,
              highImpact: 0,
              mediumImpact: 0,
              lowImpact: 0,
              lastGenerated: null,
              requiresSync: true,
            }
          },
        });
      }
      throw error; // Re-throw other errors
    }
    
    // Map database columns to TypeScript model
    const mappedInsights = insights.map(insight => ({
      id: insight.id,
      type: insight.type,
      category: insight.category,
      title: insight.title,
      description: insight.description,
      explanation: insight.explanation,
      confidence: insight.confidence,
      impact: insight.impact,
      urgency: insight.urgency,
      score: insight.score,
      tags: insight.tags,
      isActive: insight.is_active,
      isAcknowledged: insight.is_acknowledged,
      acknowledgedBy: insight.acknowledged_by,
      acknowledgedAt: insight.acknowledged_at,
      acknowledgmentNotes: insight.acknowledgment_notes,
      validUntil: insight.valid_until,
      supportingData: insight.supporting_data,
      generationMetadata: insight.generation_metadata,
      createdAt: insight.created_at,
      updatedAt: insight.updated_at,
    }));

    return res.status(200).json({
      success: true,
      message: "AI insights retrieved successfully",
      data: { 
        insights: mappedInsights,
        summary: {
          totalInsights: mappedInsights.length,
          highImpact: mappedInsights.filter(i => i.impact === "high").length,
          mediumImpact: mappedInsights.filter(i => i.impact === "medium").length,
          lowImpact: mappedInsights.filter(i => i.impact === "low").length,
          lastGenerated: mappedInsights[0]?.createdAt || null,
        }
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get AI insights error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route GET /api/analytics/dashboard
 * @desc Get dashboard overview with all user's account metrics and insights
 * @access Private
 */
router.get("/dashboard", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get all user's active accounts
    const accounts = await socialAccountService.getActiveUserAccounts(userId);
    
    if (accounts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: {
          accounts: [],
          totalAccounts: 0,
          recentActivity: [],
        },
      });
    }

    // Get recent metrics and insights for each account
    const dashboardData = await Promise.all(
      accounts.map(async (account) => {
        try {
          const [accountMetrics, postMetrics, insights] = await Promise.all([
            apifyService.instance.getRecentAccountMetrics(account.id, 5),
            apifyService.instance.getRecentPostMetrics(account.id, 5),
            // Get recent insights for this account (limited to 4 as per AI service)
            aiInsightsService.getAccountInsights(account.id, 4),
          ]);

          return {
            account: {
              id: account.id,
              platform: account.platform,
              username: account.username,
              displayName: account.display_name,
              lastSyncAt: account.last_sync_at,
            },
            metrics: {
              account: accountMetrics[0] || null, // Most recent
              recentPosts: postMetrics,
            },
            insights: insights.map((insight: any) => ({
              id: insight.id,
              type: insight.type,
              category: insight.category,
              title: insight.title,
              description: insight.description,
              impact: insight.impact,
              urgency: insight.urgency,
              score: insight.score,
              createdAt: insight.created_at,
            })),
          };
        } catch (error) {
          logger.warn(`Failed to get data for account ${account.id}:`, error);
          return {
            account: {
              id: account.id,
              platform: account.platform,
              username: account.username,
              displayName: account.display_name,
              lastSyncAt: account.last_sync_at,
            },
            metrics: { account: null, recentPosts: [] },
            insights: [],
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        accounts: dashboardData,
        totalAccounts: accounts.length,
        summary: {
          totalInsights: dashboardData.reduce((sum, acc) => sum + acc.insights.length, 0),
          accountsWithData: dashboardData.filter(acc => acc.metrics.account !== null).length,
          lastActivity: Math.max(...dashboardData.map(acc => 
            acc.account.lastSyncAt ? new Date(acc.account.lastSyncAt).getTime() : 0
          )),
        },
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get dashboard error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

export default router;