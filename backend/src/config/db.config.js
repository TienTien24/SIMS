import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
  },
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
    console.log("Successfully connected to TiDB Cloud!");
    connection.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to TiDB:", error.message);
    return false;
  }
};
