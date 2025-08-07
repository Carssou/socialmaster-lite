import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import authService from "../services/auth.service";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";

const router = Router();

// Validation middleware
const updateProfileValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
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
 * @route GET /api/user/profile
 * @desc Get current user profile
 * @access Private
 */
router.get("/profile", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const user = await authService.getUserById(userId);
    
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Map database columns to TypeScript model
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user: userProfile },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route PUT /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.put("/profile", authenticate, updateProfileValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const userId = req.user!.id;
    const { name } = req.body;

    // For now, only allow updating the name
    // This is simplified - in the future we might add more fields
    if (!name) {
      throw new ApiError("No valid fields provided to update", 400);
    }

    // Update using repository pattern
    const { Repository } = await import("../database/repository");
    const userRepository = new Repository("users");
    
    await userRepository.update(userId, {
      name,
      updated_at: new Date(),
    });

    const updatedUser = await authService.getUserById(userId);
    
    if (!updatedUser) {
      throw new ApiError("User not found", 404);
    }

    // Map database columns to TypeScript model
    const userProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      tier: updatedUser.tier,
      isActive: updatedUser.is_active,
      emailVerified: updatedUser.email_verified,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: userProfile },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

export default router;