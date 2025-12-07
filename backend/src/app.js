import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { testConnection } from "./config/db.config.js";
import { migrateAll } from "../db/migration.js";
import { seedAll } from "../db/seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
const allowedOrigins = [
  process.env.FE_URL || "http://localhost:5173",
  "http://localhost:5174",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount routes
const routesModule = await import("./routes/index.js");
app.use("/api", routesModule.default);

// Error handler
app.use((err, req, res, _next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error!" });
});

// 404 handler
app.use("/:catchAll(.*)", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
async function startServer() {
  try {
    console.log("🔄 Checking DB connection...");
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn("⚠️ DB connection failed. Starting server without DB.");
    } else {
      await migrateAll();
      await seedAll();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      if (dbConnected) {
        console.log(`📊 Connected to DB: ${process.env.DB_NAME}`);
      } else {
        console.log("📄 Running in no-DB mode");
      }
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
