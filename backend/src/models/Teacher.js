import { pool } from "../config/db.config.js";

// Tạo bảng Teachers
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    teacher_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    major_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Teachers table ready.");
};

// Create teacher (function 'create' đã định nghĩa)
const create = async (userId, teacherCode, fullName, email, phone, majorId) => {
  const query = `INSERT INTO Teachers (user_id, teacher_code, full_name, email, phone, major_id) VALUES (?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.execute(query, [
      userId,
      teacherCode,
      fullName,
      email,
      phone,
      majorId,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create teacher failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT t.*, u.email, m.major_name FROM Teachers t 
    JOIN Users u ON t.user_id = u.id 
    LEFT JOIN Majors m ON t.major_id = m.id 
    WHERE t.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = `SELECT t.*, u.email, m.major_name FROM Teachers t 
    JOIN Users u ON t.user_id = u.id 
    LEFT JOIN Majors m ON t.major_id = m.id 
    ORDER BY t.full_name`;
  const [rows] = await pool.execute(query);
  return rows;
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Teachers SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Teacher not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Teachers WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Teacher not found");
  return { message: "Teacher deleted" };
};

// Export tất cả (bao gồm 'create' đã defined)
export { createTable, create, getById, getAll, update, deleteById };
