import { SocialAccountService } from '../src/services/social-account.service';
import { AuthService } from '../src/services/auth.service';
import { ApiError } from '../src/utils/errors';
import { Platform } from '../src/types/models';

describe('SocialAccountService', () => {
  let socialAccountService: SocialAccountService;
  let authService: AuthService;
  let testUserId: string;

  const testSocialAccount = {
    platform: Platform.INSTAGRAM,
    platform_account_id: `test-${Date.now()}`,
    username: `testuser${Date.now()}`,
    display_name: 'Test User',
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };

  beforeAll(async () => {
    socialAccountService = new SocialAccountService();
    authService = new AuthService();
    
    // Create a test user
    const userResult = await authService.register({
      email: `social-test-${Date.now()}@example.com`,
      name: 'Social Test User',
      password: 'testpassword123'
    });
    testUserId = userResult.user.id;
  });

  describe('Account Creation', () => {
    test('should create social account successfully', async () => {
      const account = await socialAccountService.createAccount(testUserId, testSocialAccount);
      
      expect(account).toBeDefined();
      expect(account.user_id).toBe(testUserId);
      expect(account.platform).toBe(testSocialAccount.platform);
      expect(account.username).toBe(testSocialAccount.username);
      expect(account.is_active).toBe(true);
      expect(account.id).toBeDefined();
    });

    test('should enforce tier limits (free tier = 1 account)', async () => {
      // Try to add a second account to free tier user
      const secondAccount = {
        ...testSocialAccount,
        platform_account_id: `test-second-${Date.now()}`,
        username: `seconduser${Date.now()}`
      };

      await expect(socialAccountService.createAccount(testUserId, secondAccount))
        .rejects
        .toThrow(ApiError);
        
      try {
        await socialAccountService.createAccount(testUserId, secondAccount);
      } catch (error) {
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain('Account limit reached');
      }
    });

    test('should prevent duplicate accounts', async () => {
      await expect(socialAccountService.createAccount(testUserId, testSocialAccount))
        .rejects
        .toThrow(ApiError);
        
      try {
        await socialAccountService.createAccount(testUserId, testSocialAccount);
      } catch (error) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('already connected');
      }
    });
  });

  describe('Account Management', () => {
    test('should get user accounts', async () => {
      const accounts = await socialAccountService.getUserAccounts(testUserId);
      
      expect(accounts).toBeDefined();
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      
      const account = accounts[0];
      expect(account).toBeDefined();
      expect(account?.user_id).toBe(testUserId);
    });

    test('should get active user accounts', async () => {
      const accounts = await socialAccountService.getActiveUserAccounts(testUserId);
      
      expect(accounts).toBeDefined();
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      
      accounts.forEach(account => {
        expect(account.is_active).toBe(true);
        expect(account.user_id).toBe(testUserId);
      });
    });

    test('should get account usage summary', async () => {
      const summary = await socialAccountService.getAccountUsageSummary(testUserId);
      
      expect(summary).toBeDefined();
      expect(summary.current_accounts).toBe(1);
      expect(summary.max_accounts).toBe(1); // Free tier
      expect(summary.tier).toBe('free');
      expect(summary.can_add_more).toBe(false); // Already at limit
    });

    test('should get specific account with ownership check', async () => {
      const accounts = await socialAccountService.getUserAccounts(testUserId);
      expect(accounts.length).toBeGreaterThan(0);
      const accountId = accounts[0]!.id;
      
      const account = await socialAccountService.getAccount(accountId, testUserId);
      
      expect(account).toBeDefined();
      expect(account.id).toBe(accountId);
      expect(account.user_id).toBe(testUserId);
    });

    test('should fail to get account with wrong user', async () => {
      const accounts = await socialAccountService.getUserAccounts(testUserId);
      expect(accounts.length).toBeGreaterThan(0);
      const accountId = accounts[0]!.id;
      const fakeUserId = 'fake-user-id';
      
      await expect(socialAccountService.getAccount(accountId, fakeUserId))
        .rejects
        .toThrow(ApiError);
        
      try {
        await socialAccountService.getAccount(accountId, fakeUserId);
      } catch (error) {
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain('Access denied');
      }
    });
  });

  describe('Account Deactivation', () => {
    test('should deactivate account', async () => {
      const accounts = await socialAccountService.getUserAccounts(testUserId);
      expect(accounts.length).toBeGreaterThan(0);
      const accountId = accounts[0]!.id;
      
      await socialAccountService.deactivateAccount(accountId, testUserId);
      
      // Verify account is deactivated
      const updatedAccounts = await socialAccountService.getActiveUserAccounts(testUserId);
      const deactivatedAccount = updatedAccounts.find(acc => acc.id === accountId);
      expect(deactivatedAccount).toBeUndefined();
    });
  });
});