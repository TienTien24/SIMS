import { pool } from "../config/db.config.js";

// Tạo bảng Students
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    class_id INT,
    major_id INT,
    course VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE SET NULL,
    FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Students table ready.");
};

// Create student (function 'create' đã định nghĩa)
const create = async (
  userId,
  studentCode,
  fullName,
  birthDate,
  gender,
  address,
  classId,
  majorId,
  course
) => {
  const query = `INSERT INTO Students (user_id, student_code, full_name, birth_date, gender, address, class_id, major_id, course) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.execute(query, [
      userId,
      studentCode,
      fullName,
      birthDate,
      gender,
      address,
      classId,
      majorId,
      course,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create student failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT s.*, u.email, c.class_name, m.major_name FROM Students s 
    JOIN Users u ON s.user_id = u.id 
    LEFT JOIN Classes c ON s.class_id = c.id 
    LEFT JOIN Majors m ON s.major_id = m.id 
    WHERE s.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = `SELECT s.*, u.email, c.class_name, m.major_name FROM Students s 
    JOIN Users u ON s.user_id = u.id 
    LEFT JOIN Classes c ON s.class_id = c.id 
    LEFT JOIN Majors m ON s.major_id = m.id 
    ORDER BY s.full_name`;
  const [rows] = await pool.execute(query);
  return rows;
};

// Get by class
const getByClass = async (classId) => {
  const query = `SELECT s.* FROM Students s WHERE s.class_id = ?`;
  const [rows] = await pool.execute(query, [classId]);
  return rows;
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Students SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Student not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Students WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Student not found");
  return { message: "Student deleted" };
};

// Export tất cả (bao gồm 'create' đã defined)
export { createTable, create, getById, getAll, getByClass, update, deleteById };
