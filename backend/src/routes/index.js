import express from "express";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// Mount sub-routes
router.use("/auth", authRoutes);

// Root test
router.get("/", (req, res) => {
  res.json({ message: "API Root - SIMS Backend working!" });
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: "TiDB Connected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
