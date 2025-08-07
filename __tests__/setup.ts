import { logger } from "../src/logger";

// Setup for tests
beforeAll(async () => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = "test";

  // Set required environment variables for testing
  process.env.DB_HOST = "localhost";
  process.env.DB_PORT = "5432";
  process.env.DB_NAME = "social_media_manager";
  process.env.DB_USER = "postgres";
  process.env.DB_PASSWORD = "password";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
  process.env.JWT_EXPIRES_IN = "24h";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";

  // Suppress logs during testing
  logger.level = "error";
});

afterAll(async () => {
  // Cleanup after all tests
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Global test helpers
declare global {
  namespace NodeJS {
    interface Global {
      testUser: any;
    }
  }
}
