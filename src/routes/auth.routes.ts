import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import authService from "../services/auth.service";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";

// Rate limiting only for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
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
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", authLimiter, registerValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const { email, name, password } = req.body;
    
    logger.info(`Registration attempt for email: ${email}`);
    
    const result = await authService.register({
      email,
      name,
      password,
    });

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Account is pending approval.",
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post("/login", authLimiter, loginValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const { email, password } = req.body;
    
    logger.info(`Login attempt for email: ${email}`);
    
    const result = await authService.login({
      email,
      password,
    });

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post("/refresh", refreshValidation, async (req: Request, res: Response) => {
  try {
    checkValidationErrors(req);

    const { refreshToken } = req.body;
    
    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      logger.error("Token refresh error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

export default router;