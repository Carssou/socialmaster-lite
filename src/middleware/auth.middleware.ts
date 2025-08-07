import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";
import { pgPool } from "../database";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        name?: string;
      };
    }
  }
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and adds user information to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user information from database - use client connection
    const client = await pgPool.connect();
    let userResult;
    try {
      userResult = await client.query(
        "SELECT id, email, name FROM users WHERE id = $1 AND is_active = true",
        [decoded.userId],
      );
    } finally {
      client.release();
    }

    if (userResult.rows.length === 0) {
      throw new ApiError("User not found or inactive", 401);
    }

    const user = userResult.rows[0];

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Verifies JWT token if present but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      // Verify token
      const decoded = verifyToken(token);

      // Get user information from database - use client connection
      const client = await pgPool.connect();
      let userResult;
      try {
        userResult = await client.query(
          "SELECT id, email, name FROM users WHERE id = $1 AND is_active = true",
          [decoded.userId],
        );
      } finally {
        client.release();
      }

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        // Add user info to request
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    logger.debug("Optional authentication failed", { error });
    next();
  }
};
