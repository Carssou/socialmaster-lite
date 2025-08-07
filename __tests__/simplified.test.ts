/**
 * Phase 6: Simplified Integration Tests
 * Tests core functionality without complex type checking
 */

import { AuthService } from '../src/services/auth.service';
import tierService from '../src/services/tier.service';
import { SocialAccountService } from '../src/services/social-account.service';
import { pgPool } from '../src/database';
import { query } from '../src/database/index';

describe('Phase 6: Core Functionality Tests', () => {
  let testUserId: string;
  const testUserEmail = `phase6-test-${Date.now()}@example.com`;

  beforeAll(() => {
    // Set environment variables for Apify (to avoid initialization errors)
    process.env.APIFY_API_TOKEN = 'fake-token-for-testing';
    process.env.APIFY_INSTAGRAM_ACTOR = 'fake-actor-id';
  });

  describe('1. Database Connection and Schema', () => {
    test('Database connection works', async () => {
      const result = await query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    test('All required tables exist', async () => {
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      
      const tableNames = tables.map((t: any) => t.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('social_accounts');
      expect(tableNames).toContain('tier_settings');
      expect(tableNames).toContain('account_metrics');
      expect(tableNames).toContain('post_metrics');
      expect(tableNames).toContain('ai_analysis');
    });

    test('Tier settings are configured', async () => {
      const tierCount = await query('SELECT COUNT(*) as count FROM tier_settings');
      expect(parseInt((tierCount[0] as any).count)).toBeGreaterThanOrEqual(2);
    });
  });

  describe('2. User Registration (Simplified Flow)', () => {
    test('User registration creates inactive user with free tier', async () => {
      const authService = new AuthService();
      
      const result = await authService.register({
        email: testUserEmail,
        name: 'Phase 6 Test User',
        password: 'testpassword123'
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUserEmail);
      expect(result.user.tier).toBe('free');
      expect(result.user.isActive).toBe(false);
      expect(result.accessToken).toBeDefined();
      
      testUserId = result.user.id;
    });

    test('Duplicate email registration fails', async () => {
      const authService = new AuthService();
      
      await expect(authService.register({
        email: testUserEmail,
        name: 'Duplicate User',
        password: 'testpassword123'
      })).rejects.toThrow();
    });
  });

  describe('3. Tier Service', () => {
    test('Free tier allows 1 account', async () => {
      const limits = await tierService.getTierLimits('free');
      expect(limits.tier).toBe('free');
      expect(limits.max_accounts).toBe(1);
    });

    test('Basic tier allows 5 accounts', async () => {
      const limits = await tierService.getTierLimits('basic');
      expect(limits.tier).toBe('basic');
      expect(limits.max_accounts).toBe(5);
    });

    test('Invalid tier throws error', async () => {
      await expect(tierService.getTierLimits('nonexistent')).rejects.toThrow();
    });
  });

  describe('4. Social Account Service', () => {
    test('Can create social account within tier limits', async () => {
      const socialAccountService = new SocialAccountService();
      
      const account = await socialAccountService.createAccount(testUserId, {
        platform: 'instagram',
        platform_account_id: `test-${Date.now()}`,
        username: `testuser${Date.now()}`,
        display_name: 'Test User',
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      expect(account).toBeDefined();
      expect(account.user_id).toBe(testUserId);
      expect(account.is_active).toBe(true);
    });

    test('Second account fails for free tier user', async () => {
      const socialAccountService = new SocialAccountService();
      
      await expect(socialAccountService.createAccount(testUserId, {
        platform: 'instagram',
        platform_account_id: `test-second-${Date.now()}`,
        username: `seconduser${Date.now()}`,
        display_name: 'Second User',
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })).rejects.toThrow();
    });

    test('Account usage summary is correct', async () => {
      const socialAccountService = new SocialAccountService();
      
      const summary = await socialAccountService.getAccountUsageSummary(testUserId);
      expect(summary.current_accounts).toBe(1);
      expect(summary.max_accounts).toBe(1);
      expect(summary.tier).toBe('free');
      expect(summary.can_add_more).toBe(false);
    });
  });

  describe('5. Authentication Flow', () => {
    test('Login fails for inactive user', async () => {
      const authService = new AuthService();
      
      await expect(authService.login({
        email: testUserEmail,
        password: 'testpassword123'
      })).rejects.toThrow();
    });

    test('Login fails with wrong password', async () => {
      const authService = new AuthService();
      
      await expect(authService.login({
        email: testUserEmail,
        password: 'wrongpassword'
      })).rejects.toThrow();
    });

    test('Refresh token fails for inactive user', async () => {
      const authService = new AuthService();
      
      const registerResult = await authService.register({
        email: `refresh-test-${Date.now()}@example.com`,
        name: 'Refresh Test',
        password: 'testpassword123'
      });

      // Should fail because user is inactive by default
      await expect(authService.refreshToken(registerResult.refreshToken)).rejects.toThrow();
    });
  });

  describe('6. Error Handling', () => {
    test('Services handle invalid input gracefully', async () => {
      // Test various error conditions
      await expect(tierService.getTierLimits('')).rejects.toThrow();
      
      const socialAccountService = new SocialAccountService();
      await expect(socialAccountService.getAccount('invalid-id', 'invalid-user')).rejects.toThrow();
    });
  });

  afterAll(async () => {
    // Cleanup: Close database connections
    await pgPool.end();
  });
});