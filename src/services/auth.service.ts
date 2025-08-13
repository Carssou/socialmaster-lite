import { Repository } from "../database/repository";
import { pgPool } from "../database";
import {
  UserRegistrationDto,
  UserLoginDto,
  AuthResponse,
} from "../types/models";
import {
  generateToken,
  generateRefreshToken,
  timeToSeconds,
} from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/password";
import { logger } from "../logger";
import { ApiError } from "../utils/errors";

// Interface to match database column names
interface UserDB {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  tier: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Authentication service for user registration, login, and token management
 */
export class AuthService {
  private userRepository: Repository<UserDB>;

  constructor() {
    this.userRepository = new Repository<UserDB>("users");
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Authentication response with user and tokens
   */
  async register(userData: UserRegistrationDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByField(
      "email",
      userData.email,
    );
    if (existingUser.length > 0) {
      throw new ApiError("User with this email already exists", 409);
    }

    // Hash the password
    const passwordHash = await hashPassword(userData.password);

    // Create the user (inactive until manually approved) - simplified, no teams
    const user = await this.userRepository.create({
      email: userData.email,
      name: userData.name,
      password_hash: passwordHash,
      tier: "free", // Default to free tier
      is_active: false, // Require manual approval
      email_verified: false,
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return the authentication response - map DB columns to TypeScript model
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier as any,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken: token,
      refreshToken,
      expiresIn: timeToSeconds(process.env.JWT_EXPIRES_IN || "86400"),
    };
  }

  /**
   * Login a user
   * @param loginData User login data
   * @returns Authentication response with user and tokens
   */
  async login(loginData: UserLoginDto): Promise<AuthResponse> {
    // Use a fresh connection client instead of pool to avoid hanging
    const client = await pgPool.connect();
    let result;
    try {
      result = await client.query("SELECT * FROM users WHERE email = $1", [
        loginData.email,
      ]);
    } finally {
      client.release(); // Always release the client back to the pool
    }

    if (result.rows.length === 0) {
      throw new ApiError("Invalid email or password", 401);
    }

    const user = result.rows[0];

    // Check if the user is active
    if (!user.is_active) {
      throw new ApiError(
        "Account is pending approval. Please wait for manual activation.",
        403,
      );
    }

    // Verify the password
    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    // Return the authentication response - map DB columns to TypeScript model
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier as any,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken: token,
      refreshToken,
      expiresIn: timeToSeconds(process.env.JWT_EXPIRES_IN || "86400"),
    };
  }

  /**
   * Refresh an authentication token
   * @param refreshToken Refresh token
   * @returns New authentication tokens
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
    // Verify and decode the refresh token
    const decoded = await this.verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: timeToSeconds(process.env.JWT_EXPIRES_IN || "86400"),
    };
  }

  /**
   * Verify a refresh token
   * @param refreshToken Refresh token to verify
   * @returns Decoded token payload
   */
  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<{ userId: string }> {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if the user exists and is active
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new ApiError("Invalid refresh token", 401);
      }

      return { userId: decoded.userId };
    } catch {
      throw new ApiError("Invalid refresh token", 401);
    }
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<UserDB | null> {
    return this.userRepository.findById(userId);
  }
}

export default new AuthService();
