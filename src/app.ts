import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { logger } from "./logger";
import { ApiError } from "./utils/errors";
import apiRoutes from "./routes";

// Create Express application
const app: Express = express();

// Security middleware (relaxed for SPA)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting moved to auth routes only - no global rate limiting

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    next();
  });
}

// Mount API routes
app.use("/api", apiRoutes);

// Serve static files from React build with proper path
const frontendBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendBuildPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Catch-all handler for React SPA routing
app.use((req: Request, res: Response) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found",
      path: req.originalUrl,
    });
  }
  
  // Serve React app for all other routes (static files are handled above)
  return res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// Global error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Global error handler:", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: error.details || error.message,
    });
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;