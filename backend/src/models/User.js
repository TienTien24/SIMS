import { pool } from "../config/db.config.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

// Tạo bảng Users
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Users table ready.");
};

// Tạo bảng log đăng ký để admin theo dõi
const createRegistrationLogsTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS RegistrationLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('teacher','student') NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','reviewed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ RegistrationLogs table ready.");
};

// Create user cơ bản (không role-specific)
const create = async (username, password, email, role = "student") => {
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex"); // SHA2 tạm
  const query =
    "INSERT INTO Users (username, password, email, role) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [
      username,
      hashedPassword,
      email,
      role,
    ]);
    return { id: result.insertId, username, email, role };
  } catch (error) {
    throw new Error(`Create user failed: ${error.message}`);
  }
};

// Create user with role (cho register: insert Users + Student/Teacher)
const createWithRole = async (username, password, email, full_name, role) => {
  if (!["student", "teacher"].includes(role)) {
    throw new Error('Invalid role: Must be "student" or "teacher"');
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert Users
    const [userResult] = await connection.execute(
      "INSERT INTO Users (username, password, email, role, full_name) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email, role, full_name]
    );
    const userId = userResult.insertId;

    let additionalId;
    if (role === "student") {
      const studentCode = `SV${Date.now()}`;
      const [studentResult] = await connection.execute(
        "INSERT INTO Students (user_id, student_code, full_name) VALUES (?, ?, ?)",
        [userId, studentCode, full_name]
      );
      additionalId = studentResult.insertId;
    } else if (role === "teacher") {
      const teacherCode = `GV${Date.now()}`;
      const [teacherResult] = await connection.execute(
        "INSERT INTO Teachers (user_id, teacher_code, full_name) VALUES (?, ?, ?)",
        [userId, teacherCode, full_name]
      );
      additionalId = teacherResult.insertId;
    }

    // Ghi log đăng ký để admin nhận được thông tin
    await connection.execute(
      "INSERT INTO RegistrationLogs (user_id, role, full_name, email) VALUES (?, ?, ?, ?)",
      [userId, role, full_name, email]
    );

    await connection.commit();
    connection.release();

    const newUser = {
      id: userId,
      username,
      email,
      role,
      [`${role}_id`]: additionalId,
    };
    return newUser;
  } catch (error) {
    // Rollback transaction if connection exists
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Username or email already exists");
    }
    
    // Xử lý lỗi database connection
    if (error.message && error.message.includes("Access denied")) {
      throw new Error("Database connection failed: Access denied. Please check your database credentials in .env file");
    }
    
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query =
    'SELECT id, username, email, role, status, created_at FROM Users WHERE id = ? AND status = "active"';
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async (limit = 10, offset = 0) => {
  const query =
    "SELECT id, username, email, role, status, created_at FROM Users ORDER BY created_at DESC LIMIT ? OFFSET ?";
  const [rows] = await pool.execute(query, [limit, offset]);
  return rows;
};

// Update user
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("User not found");
  return await getById(id);
};

// Delete by ID (soft delete)
const deleteById = async (id) => {
  const query = 'UPDATE Users SET status = "inactive" WHERE id = ?';
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("User not found");
  return { message: "User deactivated" };
};

// Get by email (cho login)
const getByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM Users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Database query error (getByEmail):", error.message);
    throw new Error("Database connection failed. Please try again later.");
  }
};

// Verify password (SHA2 cho seed test)
const verifyPassword = async (password, hashedPassword) => {
  const hashedInput = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  return hashedInput === hashedPassword;
};

// Generate JWT token (dùng JWT_SECRET từ config)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const requestPasswordReset = async (email) => {
  // Kiểm tra email tồn tại và active
  const user = await getByEmail(email);
  if (!user) {
    throw new Error("Email not found or inactive user");
  }

  // Tạo reset token (short-lived)
  const resetToken = jwt.sign(
    { email: user.email, type: "reset" },
    JWT_SECRET,
    { expiresIn: "15m" } // 15 phút
  );

  // Giả lập gửi email: Log link vào console (copy để test)
  const resetLink = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;
  console.log(
    `🔄 [FAKE EMAIL SENT TO ${email}] Reset your password: ${resetLink}`
  );

  return {
    message: "Reset link generated (check console for fake email link)",
  };
};

// Verify reset token (dùng JWT_SECRET)
const verifyResetToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "reset") {
      throw new Error("Invalid token type");
    }
    const user = await getByEmail(decoded.email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Reset password (không thay đổi, dùng crypto cho hash)
const resetPassword = async (email, newPassword) => {
  const hashedPassword = crypto
    .createHash("sha256")
    .update(newPassword)
    .digest("hex");
  const query =
    'UPDATE Users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? AND status = "active"';
  const [result] = await pool.execute(query, [hashedPassword, email]);
  if (result.affectedRows === 0) {
    throw new Error("User not found or inactive");
  }
  return { message: "Password reset successful" };
};

export {
  createTable,
  create,
  createWithRole,
  getById,
  getAll,
  update,
  deleteById,
  getByEmail,
  verifyPassword,
  generateToken,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  createRegistrationLogsTable,
};
