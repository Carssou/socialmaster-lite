// Configuration constants to eliminate magic numbers across the application
// Many values can be overridden via environment variables for different deployment environments

/**
 * Parse environment variable as integer with fallback
 */
function parseEnvInt(envVar: string, fallback: number): number {
  const value = process.env[envVar];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse environment variable as float with fallback
 */
function parseEnvFloat(envVar: string, fallback: number): number {
  const value = process.env[envVar];
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export const TIME_INTERVALS = {
  // Cache/refresh intervals (configurable via environment variables)
  RECENT_DATA_THRESHOLD_HOURS: parseEnvInt("RECENT_DATA_THRESHOLD_HOURS", 12),
  AI_INSIGHTS_CACHE_HOURS: parseEnvInt("AI_INSIGHTS_CACHE_HOURS", 168), // 7 days (168 hours) for automatic generation
  AI_INSIGHTS_USER_REQUEST_CACHE_HOURS: parseEnvInt(
    "AI_INSIGHTS_USER_REQUEST_CACHE_HOURS",
    48,
  ), // 2 days (48 hours) for user-requested generation
  APIFY_DATA_PROCESSING_DELAY_MS: parseEnvInt(
    "APIFY_DATA_PROCESSING_DELAY_MS",
    60000,
  ), // 1 minute

  // UI behavior periods (configurable via environment variables)
  NEW_INSIGHT_THRESHOLD_DAYS: parseEnvInt("NEW_INSIGHT_THRESHOLD_DAYS", 7), // Days to mark insights as "new" in UI

  // Retention periods (configurable via environment variables)
  AI_INSIGHT_VALIDITY_DAYS: parseEnvInt("AI_INSIGHT_VALIDITY_DAYS", 60),

  // API limits (configurable via environment variables)
  DEFAULT_ACCOUNT_METRICS_LIMIT: parseEnvInt(
    "DEFAULT_ACCOUNT_METRICS_LIMIT",
    10,
  ),
  DEFAULT_POST_METRICS_LIMIT: parseEnvInt("DEFAULT_POST_METRICS_LIMIT", 20),
  DEFAULT_USER_INSIGHTS_LIMIT: parseEnvInt("DEFAULT_USER_INSIGHTS_LIMIT", 20),
  DEFAULT_ACCOUNT_INSIGHTS_LIMIT: parseEnvInt(
    "DEFAULT_ACCOUNT_INSIGHTS_LIMIT",
    10,
  ),

  // Batch processing (configurable via environment variables)
  MAX_POSTS_FOR_ANALYSIS: parseEnvInt("MAX_POSTS_FOR_ANALYSIS", 250),
  SUPPORTING_DATA_ACCOUNT_METRICS_LIMIT: parseEnvInt(
    "SUPPORTING_DATA_ACCOUNT_METRICS_LIMIT",
    5,
  ),
  SUPPORTING_DATA_POST_METRICS_LIMIT: parseEnvInt(
    "SUPPORTING_DATA_POST_METRICS_LIMIT",
    10,
  ),
} as const;

export const APIFY_CONFIG = {
  // Default Apify actor configuration (some configurable via environment variables)
  DEFAULT_RESULTS_TYPE: process.env.APIFY_DEFAULT_RESULTS_TYPE || "details",
  DEFAULT_RESULTS_LIMIT: parseEnvInt("APIFY_DEFAULT_RESULTS_LIMIT", 1),
  DEFAULT_SEARCH_TYPE: process.env.APIFY_DEFAULT_SEARCH_TYPE || "user",
  DEFAULT_SEARCH_LIMIT: parseEnvInt("APIFY_DEFAULT_SEARCH_LIMIT", 250),
  DEFAULT_ADD_PARENT_DATA: process.env.APIFY_DEFAULT_ADD_PARENT_DATA === "true",
} as const;

export const DATABASE_CONFIG = {
  // Query batch sizes (configurable via environment variables)
  BATCH_INSERT_SIZE: parseEnvInt("DB_BATCH_INSERT_SIZE", 100),
  MAX_QUERY_PARAMETERS: parseEnvInt("DB_MAX_QUERY_PARAMETERS", 50), // PostgreSQL limit consideration
} as const;

export const LLM_CONFIG = {
  // LLM API configuration (configurable via environment variables)
  DEFAULT_OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-5-mini",
  DEFAULT_ANTHROPIC_MODEL:
    process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: parseEnvInt("LLM_MAX_TOKENS", 2000),
  DEFAULT_TEMPERATURE: parseEnvFloat("LLM_TEMPERATURE", 0.3),
} as const;

export const VALIDATION_LIMITS = {
  // Input validation limits (some configurable via environment variables)
  MAX_USERNAME_LENGTH: parseEnvInt("MAX_USERNAME_LENGTH", 30),
  MAX_CAPTION_LENGTH: parseEnvInt("MAX_CAPTION_LENGTH", 2200), // Instagram limit
  MAX_BIO_LENGTH: parseEnvInt("MAX_BIO_LENGTH", 150), // Instagram limit
  MAX_HASHTAGS_PER_POST: parseEnvInt("MAX_HASHTAGS_PER_POST", 30), // Instagram limit
  MAX_MENTIONS_PER_POST: parseEnvInt("MAX_MENTIONS_PER_POST", 20),
} as const;
