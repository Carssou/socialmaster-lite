// Environment configuration and validation
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .default(() => 3000),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .transform(Number)
    .default(() => 5432),
  DB_NAME: z.string().default('social_media_manager'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_SSL: z.string().optional(),
  DB_POOL_MIN: z
    .string()
    .transform(Number)
    .default(() => 2),
  DB_POOL_MAX: z
    .string()
    .transform(Number)
    .default(() => 10),
  DB_STATEMENT_TIMEOUT: z
    .string()
    .transform(Number)
    .default(() => 10000),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET:
    process.env.NODE_ENV === 'production'
      ? z
          .string()
          .min(32)
          .refine(val => val !== 'test-jwt-secret-key-at-least-32-chars-long', {
            message: 'Production JWT_SECRET cannot use test default',
          })
      : z
          .string()
          .min(32)
          .default('test-jwt-secret-key-at-least-32-chars-long'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET:
    process.env.NODE_ENV === 'production'
      ? z
          .string()
          .min(32)
          .refine(val => val !== 'test-refresh-secret-key-at-least-32-chars', {
            message: 'Production JWT_REFRESH_SECRET cannot use test default',
          })
      : z.string().min(32).default('test-refresh-secret-key-at-least-32-chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // API Keys (will be set later)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Environment = z.infer<typeof envSchema>;

export const validateEnv = (): Environment => {
  try {
    // Force NODE_ENV to be 'test' when running tests
    if (process.env.JEST_WORKER_ID) {
      process.env.NODE_ENV = 'test';
    }

    return envSchema.parse(process.env);
  } catch (error) {
    // Use console.error here since logger may not be initialized yet
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
};

export const env = validateEnv();
