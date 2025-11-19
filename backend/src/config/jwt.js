// src/config/jwt.js
import "dotenv/config";

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "fallback-sims-2025-secret-please-change",
  expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
};

export const JWT_SECRET = jwtConfig.secret;
export const JWT_EXPIRES_IN = jwtConfig.expiresIn;
