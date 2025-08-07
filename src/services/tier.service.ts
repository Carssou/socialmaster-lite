import { Repository } from "../database/repository";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";

// Interface for tier settings
interface TierSettings {
  tier: string;
  max_accounts: number;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Interface for tier limits response
interface TierLimits {
  tier: string;
  max_accounts: number;
  description: string;
}

/**
 * Service for managing user tiers and limits
 */
export class TierService {
  private tierRepository: Repository<TierSettings>;

  constructor() {
    this.tierRepository = new Repository<TierSettings>("tier_settings", "tier");
  }

  /**
   * Get tier limits and settings
   * @param tier Tier name (e.g., 'free', 'basic')
   * @returns Tier limits and description
   */
  async getTierLimits(tier: string): Promise<TierLimits> {
    const settings = await this.tierRepository.findByField("tier", tier);

    if (!settings.length || !settings[0]) {
      logger.warn(`Tier not found: ${tier}`);
      throw new ApiError(`Invalid tier: ${tier}`, 400);
    }

    const tierSettings = settings[0];

    if (!tierSettings.is_active) {
      logger.warn(`Inactive tier requested: ${tier}`);
      throw new ApiError(`Tier is no longer active: ${tier}`, 400);
    }

    return {
      tier: tierSettings.tier,
      max_accounts: tierSettings.max_accounts,
      description: tierSettings.description,
    };
  }

  /**
   * Get maximum accounts allowed for a specific user
   * @param userId User ID
   * @returns Maximum number of accounts allowed
   */
  async getMaxAccountsForUser(userId: string): Promise<number> {
    // Get user's tier
    const userRepository = new Repository<any>("users");
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Get tier limits
    const tierLimits = await this.getTierLimits(user.tier || "free");

    logger.debug(
      `User ${userId} (${tierLimits.tier}) max accounts: ${tierLimits.max_accounts}`,
    );

    return tierLimits.max_accounts;
  }

  /**
   * Check if user can add another social account
   * @param userId User ID
   * @param currentAccountCount Current number of accounts user has
   * @returns Boolean indicating if user can add another account
   */
  async canAddAccount(
    userId: string,
    currentAccountCount: number,
  ): Promise<boolean> {
    const maxAccounts = await this.getMaxAccountsForUser(userId);
    return currentAccountCount < maxAccounts;
  }

  /**
   * Get all available tiers
   * @returns List of active tiers
   */
  async getAvailableTiers(): Promise<TierLimits[]> {
    const tiers = await this.tierRepository.findByField("is_active", true);

    return tiers.map((tier) => ({
      tier: tier.tier,
      max_accounts: tier.max_accounts,
      description: tier.description,
    }));
  }

  /**
   * Update user's tier
   * @param userId User ID
   * @param newTier New tier name
   * @returns Updated user data
   */
  async updateUserTier(userId: string, newTier: string): Promise<any> {
    // Validate tier exists and is active
    await this.getTierLimits(newTier);

    // Update user's tier
    const userRepository = new Repository<any>("users");
    const updatedUser = await userRepository.update(userId, { tier: newTier });

    if (!updatedUser) {
      throw new ApiError("Failed to update user tier", 500);
    }

    logger.info(`User ${userId} tier updated to ${newTier}`);

    return updatedUser;
  }
}

export default new TierService();
