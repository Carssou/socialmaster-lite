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
 * @desc Get metrics for a specific social account
 * @access Private
 */
router.get("/accounts/:accountId/metrics", authenticate, accountIdValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const userId = req.user!.id;
    const accountId = req.params.accountId as string;
    
    // Verify user owns this account
    await socialAccountService.getAccount(accountId, userId);
    
    // Get recent account metrics (use default limit)
    const accountMetrics = await apifyService.instance.getRecentAccountMetrics(accountId);
    
    // Get recent post metrics  
    const postMetrics = await apifyService.instance.getRecentPostMetrics(accountId, 20);

    res.status(200).json({
      success: true,
      message: "Account metrics retrieved successfully",
      data: {
        accountMetrics,
        postMetrics,
        summary: {
          totalAccountMetrics: accountMetrics.length,
          totalPostMetrics: postMetrics.length,
          lastUpdated: accountMetrics[0]?.collected_at || null,
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
      logger.error("Get account metrics error:", error);
      res.status(500).json({
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
    
    // Scrape fresh data from Instagram and store metrics automatically
    const profileData = await apifyService.instance.scrapeInstagramProfile(account.username, accountId);

    logger.info(`Sync completed for Instagram account: ${account.username}`);

    res.status(200).json({
      success: true,
      message: "Account sync completed successfully",
      data: {
        username: account.username,
        syncedAt: new Date(),
        profileData: {
          followersCount: profileData.followersCount,
          followsCount: profileData.followsCount,
          postsCount: profileData.postsCount,
          latestPostsCount: profileData.latestPosts?.length || 0,
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
    const insights = await aiInsightsService.generateAccountInsights(userId, accountId);
    
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

    res.status(200).json({
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
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get AI insights error:", error);
      res.status(500).json({
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