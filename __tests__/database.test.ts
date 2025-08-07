import { pgPool } from '../src/database';
import { query, transaction, recordExists, getTotalCount } from '../src/database/index';

describe('Database Layer', () => {
  describe('Database Connection', () => {
    test('should connect to database successfully', async () => {
      const client = await pgPool.connect();
      expect(client).toBeDefined();
      
      const result = await client.query('SELECT NOW() as now');
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
      
      client.release();
    });

    test('should execute simple queries', async () => {
      const result = await query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].test).toBe(1);
    });
  });

  describe('Database Schema Integrity', () => {
    test('should have all required tables', async () => {
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const tableNames = tables.map((t: any) => t.table_name);
      
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('social_accounts');
      expect(tableNames).toContain('account_metrics');
      expect(tableNames).toContain('post_metrics');
      expect(tableNames).toContain('ai_analysis');
      expect(tableNames).toContain('tier_settings');
      expect(tableNames).toContain('pgmigrations');
    });

    test('should have correct foreign key constraints', async () => {
      const constraints = await query(`
        SELECT 
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, tc.constraint_name
      `);
      
      expect(constraints.length).toBeGreaterThan(0);
      
      // Check specific foreign keys exist
      const fkNames = constraints.map((c: any) => c.constraint_name);
      expect(fkNames.some((name: string) => name.includes('social_accounts_user_id_fkey'))).toBe(true);
      expect(fkNames.some((name: string) => name.includes('account_metrics_social_account_id_fkey'))).toBe(true);
    });

    test('should have tier settings configured', async () => {
      const tierCount = await getTotalCount('tier_settings');
      expect(tierCount).toBeGreaterThanOrEqual(2); // At least free and basic
      
      // Check free tier exists
      const freeExists = await recordExists('tier_settings', { tier: 'free' });
      expect(freeExists).toBe(true);
      
      // Check basic tier exists  
      const basicExists = await recordExists('tier_settings', { tier: 'basic' });
      expect(basicExists).toBe(true);
    });
  });

  describe('Database Utilities', () => {
    test('should execute transactions correctly', async () => {
      const testData = `test-transaction-${Date.now()}`;
      
      await transaction(async (client) => {
        await client.query('BEGIN');
        const result = await client.query('SELECT $1 as test_data', [testData]);
        expect(result.rows[0].test_data).toBe(testData);
        // Transaction will be committed automatically
      });
    });

    test('should rollback failed transactions', async () => {
      try {
        await transaction(async (client) => {
          await client.query('SELECT 1');
          throw new Error('Test error to trigger rollback');
        });
      } catch (error) {
        expect(error.message).toBe('Test error to trigger rollback');
      }
    });

    test('should check record existence correctly', async () => {
      // Test with existing record
      const exists = await recordExists('tier_settings', { tier: 'free' });
      expect(exists).toBe(true);
      
      // Test with non-existing record
      const notExists = await recordExists('tier_settings', { tier: 'nonexistent' });
      expect(notExists).toBe(false);
    });

    test('should count records correctly', async () => {
      const userCount = await getTotalCount('users');
      expect(typeof userCount).toBe('number');
      expect(userCount).toBeGreaterThanOrEqual(0);
      
      const tierCount = await getTotalCount('tier_settings');
      expect(tierCount).toBeGreaterThanOrEqual(2);
    });
  });
});