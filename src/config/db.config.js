import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : null,
  timezone: "+07:00",
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to TiDB Cloud!");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ TiDB connection failed:", error.message);
    return false;
  }
};

export { pool, testConnection };
