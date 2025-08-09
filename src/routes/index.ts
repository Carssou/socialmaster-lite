import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import socialAccountRoutes from "./social-accounts.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Social Master Lite API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount route modules
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/social-accounts", socialAccountRoutes);
router.use("/analytics", analyticsRoutes);

// Catch-all for undefined API routes (must be last)
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

export default router;
