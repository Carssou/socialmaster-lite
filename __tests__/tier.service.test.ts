import tierService, { TierService } from '../src/services/tier.service';
import { ApiError } from '../src/utils/errors';

describe('TierService', () => {
  describe('Tier Limits', () => {
    test('should get free tier limits', async () => {
      const limits = await tierService.getTierLimits('free');
      
      expect(limits).toBeDefined();
      expect(limits.tier).toBe('free');
      expect(limits.max_accounts).toBe(1);
      expect(limits.description).toBeDefined();
    });

    test('should get basic tier limits', async () => {
      const limits = await tierService.getTierLimits('basic');
      
      expect(limits).toBeDefined();
      expect(limits.tier).toBe('basic');
      expect(limits.max_accounts).toBe(5);
      expect(limits.description).toBeDefined();
    });

    test('should fail for invalid tier', async () => {
      await expect(tierService.getTierLimits('nonexistent'))
        .rejects
        .toThrow(ApiError);
        
      try {
        await tierService.getTierLimits('nonexistent');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('Invalid tier');
      }
    });
  });

  describe('User Tier Management', () => {
    test('should get available tiers', async () => {
      const tiers = await tierService.getAvailableTiers();
      
      expect(tiers).toBeDefined();
      expect(Array.isArray(tiers)).toBe(true);
      expect(tiers.length).toBeGreaterThan(0);
      
      const freeTier = tiers.find(t => t.tier === 'free');
      expect(freeTier).toBeDefined();
      expect(freeTier?.max_accounts).toBe(1);
      
      const basicTier = tiers.find(t => t.tier === 'basic');
      expect(basicTier).toBeDefined();
      expect(basicTier?.max_accounts).toBe(5);
    });

    test('should handle tier limits correctly', async () => {
      // Test that free tier allows 1 account
      const freeLimits = await tierService.getTierLimits('free');
      expect(freeLimits.max_accounts).toBe(1);
      
      // Test that basic tier allows 5 accounts
      const basicLimits = await tierService.getTierLimits('basic');
      expect(basicLimits.max_accounts).toBe(5);
    });
  });
});