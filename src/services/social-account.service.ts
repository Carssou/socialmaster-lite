import { Repository } from "../database/repository";
import { ApiError } from "../utils/errors";
import { logger } from "../logger";
import tierService from "./tier.service";

// Interface matching the database structure
interface SocialAccountDB {
  id: string;
  user_id: string;
  platform: string;
  platform_account_id: string;
  username: string;
  display_name?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: Date;
  is_active: boolean;
  last_sync_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// DTO for creating social accounts
interface CreateSocialAccountDto {
  platform: string;
  platform_account_id: string;
  username: string;
  display_name?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: Date;
}

/**
 * Service for managing social media accounts with tier-based limits
 */
export class SocialAccountService {
  private repository: Repository<SocialAccountDB>;

  constructor() {
    this.repository = new Repository<SocialAccountDB>("social_accounts");
  }

  /**
   * Create a new social media account
   * Enforces tier-based account limits
   */
  async createAccount(
    userId: string,
    accountData: CreateSocialAccountDto,
  ): Promise<SocialAccountDB> {
    // Check current account count
    const currentCount = await this.repository.count({
      user_id: userId,
      is_active: true,
    });

    // Check if user can add another account based on their tier
    const canAdd = await tierService.canAddAccount(userId, currentCount);

    if (!canAdd) {
      const maxAccounts = await tierService.getMaxAccountsForUser(userId);
      throw new ApiError(
        `Account limit reached. Your current plan allows ${maxAccounts} account(s). You currently have ${currentCount} active account(s).`,
        403,
      );
    }

    // Check for duplicate accounts
    const existingAccounts = await this.repository.executeQuery(
      "SELECT id FROM social_accounts WHERE user_id = $1 AND platform = $2 AND platform_account_id = $3",
      [userId, accountData.platform, accountData.platform_account_id],
    );

    if (existingAccounts.length > 0) {
      throw new ApiError("Account already connected", 409);
    }

    // Create the account
    const newAccount = await this.repository.create({
      user_id: userId,
      platform: accountData.platform,
      platform_account_id: accountData.platform_account_id,
      username: accountData.username,
      display_name: accountData.display_name || "",
      access_token: accountData.access_token,
      refresh_token: accountData.refresh_token || "",
      token_expires_at: accountData.token_expires_at || new Date(),
      is_active: true,
    });

    logger.info(
      `Social account created for user ${userId}: ${accountData.platform}/${accountData.username}`,
    );

    return newAccount;
  }

  /**
   * Get all social accounts for a user
   */
  async getUserAccounts(userId: string): Promise<SocialAccountDB[]> {
    return this.repository.findByField("user_id", userId);
  }

  /**
   * Get active social accounts for a user
   */
  async getActiveUserAccounts(userId: string): Promise<SocialAccountDB[]> {
    return this.repository.executeQuery(
      "SELECT * FROM social_accounts WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
      [userId],
    );
  }

  /**
   * Get a specific social account
   */
  async getAccount(
    accountId: string,
    userId: string,
  ): Promise<SocialAccountDB> {
    const account = await this.repository.findById(accountId);

    if (!account) {
      throw new ApiError("Account not found", 404);
    }

    if (account.user_id !== userId) {
      throw new ApiError("Access denied", 403);
    }

    return account;
  }

  /**
   * Update social account
   */
  async updateAccount(
    accountId: string,
    userId: string,
    updates: Partial<CreateSocialAccountDto>,
  ): Promise<SocialAccountDB> {
    // Verify ownership
    await this.getAccount(accountId, userId);

    const updatedAccount = await this.repository.update(accountId, updates);

    if (!updatedAccount) {
      throw new ApiError("Failed to update account", 500);
    }

    logger.info(`Social account updated: ${accountId}`);

    return updatedAccount;
  }

  /**
   * Deactivate social account (soft delete)
   */
  async deactivateAccount(accountId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getAccount(accountId, userId);

    const updated = await this.repository.update(accountId, {
      is_active: false,
    });

    if (!updated) {
      throw new ApiError("Failed to deactivate account", 500);
    }

    logger.info(`Social account deactivated: ${accountId}`);
  }

  /**
   * Get user's account usage summary
   */
  async getAccountUsageSummary(userId: string): Promise<{
    current_accounts: number;
    max_accounts: number;
    tier: string;
    can_add_more: boolean;
  }> {
    const currentCount = await this.repository.count({
      user_id: userId,
      is_active: true,
    });
    const maxAccounts = await tierService.getMaxAccountsForUser(userId);
    const canAdd = await tierService.canAddAccount(userId, currentCount);

    // Get user's tier
    const userRepository = new Repository<any>("users");
    const user = await userRepository.findById(userId);

    return {
      current_accounts: currentCount,
      max_accounts: maxAccounts,
      tier: user?.tier || "free",
      can_add_more: canAdd,
    };
  }
}

export default new SocialAccountService();
