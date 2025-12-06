import mysql from "mysql2/promise";
import "dotenv/config";

const shouldUseSSL = (process.env.DB_SSL || "").toLowerCase() === "true";
const rejectUnauthorized =
  (process.env.DB_SSL_REJECT_UNAUTHORIZED || "").toLowerCase() !== "false";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: shouldUseSSL ? { rejectUnauthorized } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  keepAliveInitialDelay: 0,
  enableKeepAlive: true,
});

export { pool };

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to database");
    connection.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to DB:", error.message);
    return false;
  }
};
