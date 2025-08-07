// Database optimization configuration
import { logger } from './logger';

/**
 * Apply query optimizations to the database
 * @param client Database client
 */
export const applyQueryOptimizations = async (client: any): Promise<void> => {
  try {
    // Set statement timeout
    await client.query('SET statement_timeout = $1', [
      process.env.DB_STATEMENT_TIMEOUT || 10000,
    ]);

    // Enable query plan caching
    await client.query('SET plan_cache_mode = auto');

    // Set work memory for complex operations
    await client.query('SET work_mem = $1', ['4MB']);

    // Set maintenance work memory for index creation, etc.
    await client.query('SET maintenance_work_mem = $1', ['64MB']);

    // Set effective cache size estimate
    await client.query('SET effective_cache_size = $1', ['1GB']);

    // Set random page cost (lower values favor index scans)
    await client.query('SET random_page_cost = 1.1');

    // Enable parallel query execution
    await client.query('SET max_parallel_workers_per_gather = 2');

    logger.info('Applied database query optimizations');
  } catch (error) {
    logger.warn('Failed to apply database query optimizations', { error });
  }
};

/**
 * Create database indexes for better performance
 * @param client Database client
 */
export const createPerformanceIndexes = async (client: any): Promise<void> => {
  try {
    // Check if we're in a test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Create indexes for frequently queried columns (simplified schema)
    const indexQueries = [
      // Users table indexes
      'CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))',
      'CREATE INDEX IF NOT EXISTS idx_users_tier ON users (tier)',

      // Social accounts indexes
      'CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts (platform)',
      'CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts (user_id)',

      // Post metrics indexes
      'CREATE INDEX IF NOT EXISTS idx_post_metrics_engagement ON post_metrics (engagement_rate DESC)',
      'CREATE INDEX IF NOT EXISTS idx_post_metrics_date ON post_metrics (date)',

      // Account metrics indexes
      'CREATE INDEX IF NOT EXISTS idx_account_metrics_date_range ON account_metrics (social_account_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_account_metrics_growth ON account_metrics (follower_growth DESC)',
    ];

    for (const query of indexQueries) {
      await client.query(query);
    }

    logger.info('Created performance indexes');
  } catch (error) {
    logger.warn('Failed to create performance indexes', { error });
  }
};

/**
 * Analyze tables to update statistics for the query planner
 * @param client Database client
 */
export const analyzeDatabase = async (client: any): Promise<void> => {
  try {
    // Check if we're in a test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Analyze main tables (simplified schema)
    const tables = [
      'users',
      'social_accounts',
      'post_metrics',
      'account_metrics',
      'ai_analysis',
      'tier_settings',
    ];

    for (const table of tables) {
      await client.query(`ANALYZE ${table}`);
    }

    logger.info('Analyzed database tables');
  } catch (error) {
    logger.warn('Failed to analyze database tables', { error });
  }
};
