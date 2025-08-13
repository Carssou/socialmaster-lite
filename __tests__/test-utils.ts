import { pgPool } from '../src/database';

/**
 * Clean up test data by deleting records created during tests
 * This helps prevent constraint violations on subsequent test runs
 */
export class TestCleanup {
  private static createdUserIds: string[] = [];
  private static createdAccountIds: string[] = [];

  /**
   * Track a user ID for cleanup
   */
  static trackUser(userId: string) {
    this.createdUserIds.push(userId);
  }

  /**
   * Track a social account ID for cleanup
   */
  static trackAccount(accountId: string) {
    this.createdAccountIds.push(accountId);
  }

  /**
   * Clean up all tracked test data
   */
  static async cleanup() {
    const client = await pgPool.connect();
    
    try {
      // Delete social accounts first (due to foreign key constraints)
      if (this.createdAccountIds.length > 0) {
        await client.query(
          `DELETE FROM social_accounts WHERE id = ANY($1)`,
          [this.createdAccountIds]
        );
        this.createdAccountIds = [];
      }

      // Delete users
      if (this.createdUserIds.length > 0) {
        await client.query(
          `DELETE FROM users WHERE id = ANY($1)`,
          [this.createdUserIds]
        );
        this.createdUserIds = [];
      }

      // Delete any AI analyses (if they exist and reference users)
      await client.query(
        `DELETE FROM ai_analyses WHERE user_id NOT IN (SELECT id FROM users)`
      );

      // Delete any account metrics (if they exist and reference social accounts)
      await client.query(
        `DELETE FROM account_metrics WHERE social_account_id NOT IN (SELECT id FROM social_accounts)`
      );

      // Delete any post metrics (if they exist and reference social accounts)
      await client.query(
        `DELETE FROM post_metrics WHERE social_account_id NOT IN (SELECT id FROM social_accounts)`
      );

    } finally {
      client.release();
    }
  }

  /**
   * Clean up test users by email pattern (for tests using timestamp-based emails)
   */
  static async cleanupTestUsers() {
    const client = await pgPool.connect();
    
    try {
      // Delete test users and related data
      const result = await client.query(
        `SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%social-test%'`
      );
      
      const testUserIds = result.rows.map(row => row.id);
      
      if (testUserIds.length > 0) {
        // Delete related social accounts first
        await client.query(
          `DELETE FROM social_accounts WHERE user_id = ANY($1)`,
          [testUserIds]
        );
        
        // Delete AI analyses
        await client.query(
          `DELETE FROM ai_analyses WHERE user_id = ANY($1)`,
          [testUserIds]
        );
        
        // Delete the users
        await client.query(
          `DELETE FROM users WHERE id = ANY($1)`,
          [testUserIds]
        );
      }
    } finally {
      client.release();
    }
  }
}

/**
 * Helper function to generate unique test emails
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;
}

/**
 * Helper function to generate unique usernames
 */
export function generateTestUsername(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}