// Database configuration
import { Pool } from 'pg';
import { createClient } from 'redis';
import { logger } from './logger';
import { env } from './env';

// PostgreSQL connection pool with fixed settings
export const pgPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  // Simplified connection pool settings to fix hanging issue
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Remove problematic statement_timeout that was causing hangs
  // statement_timeout: env.DB_STATEMENT_TIMEOUT,
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Pool error handling
pgPool.on('error', err => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

// Redis client with optimized settings
export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: retries => {
      // Exponential backoff with max delay of 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      return delay;
    },
  },
});

// Redis error handling
redisClient.on('error', err => {
  logger.error('Redis Client Error:', err);
});

import {
  applyQueryOptimizations,
  createPerformanceIndexes,
  analyzeDatabase,
} from './database-optimization';

// Initialize connections
export const initializeDatabase = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Test PostgreSQL connection
    const client = await pgPool.connect();
    const result = await client.query('SELECT NOW() as now');

    logger.info(
      `Connected to PostgreSQL (${env.DB_NAME}) at ${result.rows[0].now}`
    );

    // Apply query optimizations
    await applyQueryOptimizations(client);

    // Create performance indexes
    await createPerformanceIndexes(client);

    // Analyze database tables
    await analyzeDatabase(client);

    // Release the client
    client.release();

    // Log pool statistics
    const poolStats = await getPoolStats();
    logger.info('PostgreSQL connection pool initialized', poolStats);

    return true;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
};

// Get connection pool statistics
export const getPoolStats = async () => {
  return {
    total: pgPool.totalCount,
    idle: pgPool.idleCount,
    waiting: pgPool.waitingCount,
  };
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    await redisClient.quit();
    await pgPool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};
