// Load environment variables first, before any other imports
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./logger";
import { pgPool, redisClient, initializeDatabase } from "./database";

const PORT = process.env.PORT || 3001;

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close database connections
  pgPool.end().then(() => {
    logger.info("PostgreSQL pool closed");
  }).catch(err => {
    logger.error("Error closing PostgreSQL pool:", err);
  });

  redisClient.quit().then(() => {
    logger.info("Redis connection closed");
  }).catch(err => {
    logger.error("Error closing Redis connection:", err);
  });

  process.exit(0);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start the server
const startServer = async () => {
  try {
    // Initialize database connections
    await initializeDatabase();

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Social Master Lite API server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error("Server error:", error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();

// Configuration exports (for other modules that might need them)
export * from './database';
export * from './logger';
export * from './env';
