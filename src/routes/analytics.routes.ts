import { Router, Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import socialAccountService from "../services/social-account.service";
import apifyService, {
  ApifyPostDB,
  ApifyResultDB,
} from "../services/apify.service";
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
  query("forceRefresh")
    .optional()
    .isBoolean()
    .withMessage("Force refresh must be a boolean"),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      `Validation failed: ${errors
        .array()
        .map((err) => err.msg)
        .join(", ")}`,
      400,
    );
  }
};

/**
 * @route GET /api/analytics/accounts/:accountId/metrics
 * @desc Get basic metrics parsed from raw Apify data and AI insights
 * @access Private
 */
router.get(
  "/accounts/:accountId/metrics",
  authenticate,
  accountIdValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.accountId as string;

      // Verify user owns this account
      await socialAccountService.getAccount(accountId, userId);

      // Get Apify data from normalized apify_posts table
      const { Repository } = await import("../database/repository");
      const apifyPostsRepo = new Repository("apify_posts");

      // Get account username first
      const accountData = await socialAccountService.getAccount(
        accountId,
        userId,
      );

      // Get all posts for this username from apify_posts
      const posts = (await apifyPostsRepo.executeQuery(
        `SELECT * FROM apify_posts 
         WHERE profile_username = $1 
         ORDER BY post_timestamp DESC, post_index`,
        [accountData.username],
      )) as ApifyPostDB[];

      if (posts.length === 0) {
        return res.status(200).json({
          success: true,
          message:
            "No data available - sync your account first to collect metrics",
          data: {
            metrics: [],
            insights: [],
            summary: {
              requiresSync: true,
              lastUpdated: null,
            },
          },
        });
      }

      // Get profile data from first post (duplicated across all posts)
      const profileData = {
        followersCount: Number(posts[0]!.profile_followers_count) || 0,
        followsCount: Number(posts[0]!.profile_follows_count) || 0,
        postsCount: Number(posts[0]!.profile_posts_count) || 0,
      };

      // Convert posts to expected format
      const postsData = posts.map((post) => ({
        likesCount: Number(post.post_likes_count) || 0,
        commentsCount: Number(post.post_comments_count) || 0,
      }));

      // Parse basic metrics from normalized data
      const totalLikes = postsData.reduce(
        (sum: number, post: any) => sum + (post.likesCount || 0),
        0,
      );
      const totalComments = postsData.reduce(
        (sum: number, post: any) => sum + (post.commentsCount || 0),
        0,
      );
      const avgLikes = postsData.length > 0 ? totalLikes / postsData.length : 0;
      const avgComments =
        postsData.length > 0 ? totalComments / postsData.length : 0;

      // Calculate engagement rate: (avg engagements per post) ÷ followers
      // Use total/posts/followers in one calculation for maximum precision
      const totalEngagements = totalLikes + totalComments;
      const engagementRate =
        profileData.followersCount > 0 && postsData.length > 0
          ? totalEngagements / postsData.length / profileData.followersCount
          : 0;

      // Create metrics in format expected by frontend
      const basicMetrics = [
        {
          followersCount: profileData.followersCount || 0,
          followingCount: profileData.followsCount || 0,
          postsCount: profileData.postsCount || 0,
          avgLikes: avgLikes,
          avgComments: avgComments,
          engagementRate: engagementRate, // Already a decimal (0.0123 = 1.23%)
          lastUpdated: posts[0]!.last_updated_at,
          postsAnalyzed: postsData.length,
        },
      ];

      // Check if we have recent scraping results (less than 12 hours old)
      const apifyResultsRepo = new Repository("apify_results");

      const recentResults = (await apifyResultsRepo.executeQuery(
        `SELECT * FROM apify_results 
         WHERE social_account_id = $1 
         AND created_at > NOW() - INTERVAL '12 hours'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [accountId],
      )) as ApifyResultDB[];

      const hasRecentScraping = recentResults.length > 0;

      // If no recent scraping, trigger Apify scraper first
      if (!hasRecentScraping) {
        logger.info(
          `No recent scraping found for account ${accountId}, triggering Apify scraper...`,
        );
        try {
          await apifyService.instance.collectInstagramMetrics(
            accountId,
            accountData.username,
          );
          logger.info(`Apify scraper completed for ${accountData.username}`);

          // Refetch posts with fresh data
          const freshPosts = (await apifyPostsRepo.executeQuery(
            `SELECT * FROM apify_posts 
             WHERE profile_username = $1 
             ORDER BY post_timestamp DESC, post_index`,
            [accountData.username],
          )) as ApifyPostDB[];

          if (freshPosts.length > 0) {
            // Update posts array with fresh data
            posts.length = 0;
            posts.push(...freshPosts);
            logger.info(`Using fresh data: ${posts.length} posts`);
          }
        } catch (error) {
          logger.warn(
            `Failed to trigger Apify scraper for ${accountData.username}:`,
            error,
          );
          // Continue with existing data even if scraping fails
        }
      } else {
        logger.info(
          `Found recent scraping from ${recentResults[0]!.created_at}, using existing data`,
        );
      }

      // Always get existing insights first
      let existingInsights: any[] = [];
      try {
        existingInsights = await aiInsightsService.getAccountInsights(
          accountId,
          20,
        );
      } catch (error) {
        logger.info(`No existing insights for account ${accountId}:`, error);
      }

      // Generate AI insights only if there was recent scraping (or we just scraped)
      let newInsights: any[] = [];

      // Check again for recent scraping (in case we just created new results)
      const currentResults = (await apifyResultsRepo.executeQuery(
        `SELECT * FROM apify_results 
         WHERE social_account_id = $1 
         AND created_at > NOW() - INTERVAL '12 hours'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [accountId],
      )) as ApifyResultDB[];

      if (currentResults.length > 0) {
        try {
          newInsights = await aiInsightsService.generateAccountInsights(
            userId,
            accountId,
          );
          logger.info(
            `Generated ${newInsights.length} new insights based on recent scraping from ${currentResults[0]!.created_at}`,
          );
        } catch (error) {
          logger.info(
            `Could not generate new insights for account ${accountId}:`,
            error,
          );
        }
      } else {
        logger.info(
          `No recent scraping found, skipping AI insights generation for account ${accountId}`,
        );
      }

      // Combine all insights
      const allInsights = [...newInsights, ...existingInsights];

      // Remove duplicates by ID
      const uniqueInsights = allInsights.filter(
        (insight, index, arr) =>
          arr.findIndex((i) => i.id === insight.id) === index,
      );

      // Find insights created within the last 12 hours
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      // Sort by creation date (newest first)
      const insights = uniqueInsights.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return res.status(200).json({
        success: true,
        message: "Account metrics and insights retrieved successfully",
        data: {
          metrics: basicMetrics,
          insights: insights.map((insight) => ({
            id: insight.id,
            type: insight.type,
            category: insight.category,
            title: insight.title,
            description: insight.description,
            recommendation: insight.explanation,
            confidence: insight.confidence / 100, // Convert to decimal for frontend
            priority: insight.impact,
            createdAt: insight.created_at,
            isNew: new Date(insight.created_at) >= twelveHoursAgo, // Mark insights from last 12 hours as "new"
          })),
          summary: {
            totalMetrics: basicMetrics.length,
            totalInsights: insights.length,
            newInsights: insights.filter(
              (i) => new Date(i.created_at) >= twelveHoursAgo,
            ).length,
            previousInsights: insights.filter(
              (i) => new Date(i.created_at) < twelveHoursAgo,
            ).length,
            lastUpdated: posts[0]!.last_updated_at,
            dataSource: "apify_posts",
            dataIsFresh: hasRecentScraping,
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
        logger.error("Get account metrics error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

/**
 * @route POST /api/analytics/accounts/:accountId/sync
 * @desc Sync account data from Instagram via Apify
 * @access Private
 */
router.post(
  "/accounts/:accountId/sync",
  authenticate,
  syncValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.accountId as string;

      // Verify user owns this account
      const account = await socialAccountService.getAccount(accountId, userId);

      if (account.platform !== "instagram") {
        throw new ApiError(
          "Only Instagram accounts are currently supported for sync",
          400,
        );
      }

      logger.info(`Starting sync for Instagram account: ${account.username}`);

      // Scrape fresh data from Instagram AND store metrics in database
      await apifyService.instance.collectInstagramMetrics(
        accountId,
        account.username,
      );

      logger.info(`Sync completed for Instagram account: ${account.username}`);

      // Get the stored metrics to return in response
      const accountMetrics =
        await apifyService.instance.getRecentAccountMetrics(accountId, 1);
      const postMetrics = await apifyService.instance.getRecentPostMetrics(
        accountId,
        10,
      );

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
          },
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
  },
);

/**
 * @route GET /api/analytics/accounts/:accountId/insights
 * @desc Get AI insights for a specific social account
 * @access Private
 */
router.get(
  "/accounts/:accountId/insights",
  authenticate,
  insightsValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.accountId as string;
      const forceRefresh = req.query.forceRefresh === "true";

      // Verify user owns this account
      await socialAccountService.getAccount(accountId, userId);

      logger.info(
        `Getting AI insights for account: ${accountId}, forceRefresh: ${forceRefresh}`,
      );

      // Get insights (uses 12-hour cache unless forced)
      let insights: any[] = [];
      try {
        insights = await aiInsightsService.generateAccountInsights(
          userId,
          accountId,
        );
      } catch (error: any) {
        logger.info(`ANALYTICS ROUTE: Caught error generating insights:`, {
          errorType: typeof error,
          errorName: error?.name,
          errorMessage: error?.message,
          statusCode: error?.statusCode,
          isApiError: error instanceof ApiError,
        });

        // If no metrics found, return empty insights with helpful message
        if (error instanceof ApiError && error.statusCode === 404) {
          logger.info(
            `No metrics found for account ${accountId}, returning empty insights`,
          );
          return res.status(200).json({
            success: true,
            message:
              "No insights available - sync your account first to collect data for analysis",
            data: {
              insights: [],
              summary: {
                totalInsights: 0,
                highImpact: 0,
                mediumImpact: 0,
                lowImpact: 0,
                lastGenerated: null,
                requiresSync: true,
              },
            },
          });
        }
        throw error; // Re-throw other errors
      }

      // Map database columns to TypeScript model
      const mappedInsights = insights.map((insight) => ({
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
            highImpact: mappedInsights.filter((i) => i.impact === "high")
              .length,
            mediumImpact: mappedInsights.filter((i) => i.impact === "medium")
              .length,
            lowImpact: mappedInsights.filter((i) => i.impact === "low").length,
            lastGenerated: mappedInsights[0]?.createdAt || null,
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
        logger.error("Get AI insights error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

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
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        accounts: dashboardData,
        totalAccounts: accounts.length,
        summary: {
          totalInsights: dashboardData.reduce(
            (sum, acc) => sum + acc.insights.length,
            0,
          ),
          accountsWithData: dashboardData.filter(
            (acc) => acc.metrics.account !== null,
          ).length,
          lastActivity: Math.max(
            ...dashboardData.map((acc) =>
              acc.account.lastSyncAt
                ? new Date(acc.account.lastSyncAt).getTime()
                : 0,
            ),
          ),
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
