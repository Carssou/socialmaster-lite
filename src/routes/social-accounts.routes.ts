import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import socialAccountService from "../services/social-account.service";
import apifyService from "../services/apify.service";
import tierService from "../services/tier.service";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";
import { Platform } from "../types";

const router = Router();

// Validation middleware
const createAccountValidation = [
  body("platform")
    .isIn(Object.values(Platform))
    .withMessage("Valid platform is required"),
  body("username")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Username is required and must be max 100 characters"),
  body("displayName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Display name must be max 100 characters"),
];

const updateAccountValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Username must be max 100 characters"),
  body("displayName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Display name must be max 100 characters"),
];

const accountIdValidation = [
  param("id").isUUID().withMessage("Valid account ID is required"),
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
 * @route GET /api/social-accounts
 * @desc Get all user's social accounts
 * @access Private
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    logger.info(`SOCIAL ACCOUNTS: Getting accounts for user: ${userId}`);

    const accounts = await socialAccountService.getUserAccounts(userId);
    logger.info(
      `SOCIAL ACCOUNTS: Found ${accounts.length} accounts:`,
      accounts,
    );

    // Map database columns to TypeScript model
    const mappedAccounts = accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      platformAccountId: account.platform_account_id,
      username: account.username,
      displayName: account.display_name,
      isActive: account.is_active,
      lastSyncAt: account.last_sync_at,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
    }));

    res.status(200).json({
      success: true,
      message: "Social accounts retrieved successfully",
      data: { accounts: mappedAccounts },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get social accounts error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route POST /api/social-accounts
 * @desc Add a new social media account (simplified for Instagram via Apify)
 * @access Private
 */
router.post(
  "/",
  authenticate,
  createAccountValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const { platform, username, displayName } = req.body;

      // For now, only support Instagram through Apify
      if (platform !== Platform.INSTAGRAM) {
        throw new ApiError(
          "Only Instagram accounts are currently supported",
          400,
        );
      }

      // Test the account by scraping some basic data to ensure it exists
      logger.info(`Testing Instagram account: ${username}`);

      try {
        const testData =
          await apifyService.instance.scrapeInstagramProfile(username);

        // Create social account with Apify as the token (simplified approach)
        const account = await socialAccountService.createAccount(userId, {
          platform,
          platform_account_id: testData.id || username, // Use Instagram ID if available
          username,
          display_name: displayName || testData.fullName,
          access_token: "apify-managed", // Token managed by Apify
        });

        // Map database columns to TypeScript model
        const mappedAccount = {
          id: account.id,
          platform: account.platform,
          platformAccountId: account.platform_account_id,
          username: account.username,
          displayName: account.display_name,
          isActive: account.is_active,
          lastSyncAt: account.last_sync_at,
          createdAt: account.created_at,
          updatedAt: account.updated_at,
        };

        logger.info(`Instagram account added successfully: ${username}`);

        res.status(201).json({
          success: true,
          message: "Instagram account added successfully",
          data: { account: mappedAccount },
        });
      } catch (scrapeError) {
        logger.error(
          `Failed to validate Instagram account: ${username}`,
          scrapeError,
        );
        throw new ApiError(
          "Unable to validate Instagram account. Please check the username and try again.",
          400,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Add social account error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

/**
 * @route GET /api/social-accounts/usage
 * @desc Get account usage information for current user
 * @access Private
 */
router.get(
  "/usage",
  (req: Request, res: Response, next) => {
    logger.info("USAGE ROUTE HIT - BEFORE AUTH");
    next();
  },
  authenticate,
  async (req: Request, res: Response) => {
    logger.info("USAGE ENDPOINT HIT - START");
    try {
      const userId = req.user!.id;
      logger.info(`Getting usage for user: ${userId}`);

      const usageData = await tierService.getAccountUsage(userId);
      logger.info(`Usage data retrieved:`, usageData);

      res.status(200).json({
        success: true,
        message: "Account usage retrieved successfully",
        data: usageData,
      });
    } catch (error) {
      logger.error("Get account usage error details:", error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Get account usage error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

/**
 * @route GET /api/social-accounts/:id
 * @desc Get a specific social account
 * @access Private
 */
router.get(
  "/:id",
  authenticate,
  accountIdValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.id as string;

      const account = await socialAccountService.getAccount(accountId, userId);

      // Map database columns to TypeScript model
      const mappedAccount = {
        id: account.id,
        platform: account.platform,
        platformAccountId: account.platform_account_id,
        username: account.username,
        displayName: account.display_name,
        isActive: account.is_active,
        lastSyncAt: account.last_sync_at,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      };

      res.status(200).json({
        success: true,
        message: "Social account retrieved successfully",
        data: { account: mappedAccount },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Get social account error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

/**
 * @route PUT /api/social-accounts/:id
 * @desc Update a social account
 * @access Private
 */
router.put(
  "/:id",
  authenticate,
  accountIdValidation,
  updateAccountValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.id as string;
      const { username, displayName } = req.body;

      const updates: any = {};
      if (username) updates.username = username;
      if (displayName !== undefined) updates.display_name = displayName;

      if (Object.keys(updates).length === 0) {
        throw new ApiError("No valid fields provided to update", 400);
      }

      updates.updated_at = new Date();

      const account = await socialAccountService.updateAccount(
        accountId,
        userId,
        updates,
      );

      // Map database columns to TypeScript model
      const mappedAccount = {
        id: account.id,
        platform: account.platform,
        platformAccountId: account.platform_account_id,
        username: account.username,
        displayName: account.display_name,
        isActive: account.is_active,
        lastSyncAt: account.last_sync_at,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      };

      res.status(200).json({
        success: true,
        message: "Social account updated successfully",
        data: { account: mappedAccount },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Update social account error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

/**
 * @route DELETE /api/social-accounts/:id
 * @desc Remove a social account (deactivate)
 * @access Private
 */
router.delete(
  "/:id",
  authenticate,
  accountIdValidation,
  async (req: Request, res: Response) => {
    try {
      checkValidationErrors(req);

      const userId = req.user!.id;
      const accountId = req.params.id as string;

      await socialAccountService.deactivateAccount(accountId, userId);

      res.status(200).json({
        success: true,
        message: "Social account removed successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Delete social account error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  },
);

export default router;
