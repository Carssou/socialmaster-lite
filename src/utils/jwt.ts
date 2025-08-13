import jwt from "jsonwebtoken";
import { ApiError } from "./errors";

// JWT token payload interface
interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Generate access token
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError("JWT_SECRET not configured", 500);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "86400"; // 24 hours default

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError("JWT refresh secret not configured", 500);
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d"; // 7 days default

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError("JWT_SECRET not configured", 500);
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    throw new ApiError("Invalid or expired token", 401);
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError("JWT refresh secret not configured", 500);
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    throw new ApiError("Invalid or expired refresh token", 401);
  }
}

/**
 * Convert JWT time string to seconds
 */
export function timeToSeconds(timeString: string): number {
  // Handle numeric strings (assume seconds)
  if (/^\d+$/.test(timeString)) {
    return parseInt(timeString, 10);
  }

  // Handle time strings like "24h", "7d", "30m"
  const match = timeString.match(/^(\d+)([hmd])$/);
  if (!match) {
    return parseInt(timeString, 10) || 86400; // Default to 24 hours
  }

  const [, number, unit] = match;
  const value = parseInt(number || "0", 10);

  switch (unit) {
    case "h":
      return value * 3600; // hours to seconds
    case "d":
      return value * 24 * 3600; // days to seconds
    case "m":
      return value * 60; // minutes to seconds
    default:
      return value;
  }
}

/**
 * Extract token from authorization header
 */
export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
}
