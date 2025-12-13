import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { testConnection } from "./config/db.config.js";
import { migrateAll } from "../db/migration.js";
import { seedAll } from "../db/seed.js";


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FE_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount routes
const routesModule = await import("./routes/index.js");
app.use("/api", routesModule.default);

// Error handler
app.use((err, req, res, next) => {
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
    console.log("🔄 Checking TiDB connection...");
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ DB connection failed. Exiting server.");
      process.exit(1);
    }

    await migrateAll();
    await seedAll();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Connected to DB: ${process.env.DB_NAME} (TiDB Cloud)`);
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
