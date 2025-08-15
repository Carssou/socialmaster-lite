// Configuration constants to eliminate magic numbers across the application

export const TIME_INTERVALS = {
  // Cache/refresh intervals
  RECENT_DATA_THRESHOLD_HOURS: 12,
  AI_INSIGHTS_CACHE_HOURS: 168, // 7 days (168 hours) for automatic generation
  AI_INSIGHTS_USER_REQUEST_CACHE_HOURS: 48, // 2 days (48 hours) for user-requested generation
  APIFY_DATA_PROCESSING_DELAY_MS: 60000, // 1 minute

  // Retention periods
  AI_INSIGHT_VALIDITY_DAYS: 60,

  // API limits
  DEFAULT_ACCOUNT_METRICS_LIMIT: 10,
  DEFAULT_POST_METRICS_LIMIT: 20,
  DEFAULT_USER_INSIGHTS_LIMIT: 20,
  DEFAULT_ACCOUNT_INSIGHTS_LIMIT: 10,

  // Batch processing
  MAX_POSTS_FOR_ANALYSIS: 250,
  SUPPORTING_DATA_ACCOUNT_METRICS_LIMIT: 5,
  SUPPORTING_DATA_POST_METRICS_LIMIT: 10,
} as const;

export const APIFY_CONFIG = {
  // Default Apify actor configuration
  DEFAULT_RESULTS_TYPE: "details",
  DEFAULT_RESULTS_LIMIT: 1,
  DEFAULT_SEARCH_TYPE: "user",
  DEFAULT_SEARCH_LIMIT: 250,
  DEFAULT_ADD_PARENT_DATA: false,
} as const;

export const DATABASE_CONFIG = {
  // Query batch sizes
  BATCH_INSERT_SIZE: 100,
  MAX_QUERY_PARAMETERS: 50, // PostgreSQL limit consideration
} as const;

export const LLM_CONFIG = {
  // LLM API configuration
  DEFAULT_OPENAI_MODEL: "gpt-5-mini",
  DEFAULT_ANTHROPIC_MODEL: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 2000,
  DEFAULT_TEMPERATURE: 0.3,
} as const;

export const VALIDATION_LIMITS = {
  // Input validation limits
  MAX_USERNAME_LENGTH: 30,
  MAX_CAPTION_LENGTH: 2200, // Instagram limit
  MAX_BIO_LENGTH: 150, // Instagram limit
  MAX_HASHTAGS_PER_POST: 30, // Instagram limit
  MAX_MENTIONS_PER_POST: 20,
} as const;
