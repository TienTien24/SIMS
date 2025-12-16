// src/models/Student.js
import { pool } from "../config/db.config.js";

// Lệnh SQL cơ bản để lấy thông tin sinh viên đầy đủ (có JOIN)
const BASE_QUERY = `
  SELECT 
    s.*, 
    u.email, 
    c.class_name, 
    m.major_name 
  FROM Students s 
  JOIN Users u ON s.user_id = u.id 
  LEFT JOIN Classes c ON s.class_id = c.id 
  LEFT JOIN Majors m ON s.major_id = m.id
`;

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

// Create student
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
    return await getById(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error(`Mã sinh viên ${studentCode} hoặc User ID đã tồn tại.`);
    }
    throw new Error(`Tạo sinh viên thất bại: ${error.message}`);
  }
};

const getById = async (id) => {
  const query = `${BASE_QUERY} WHERE s.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

const getByStudentCode = async (studentCode) => {
  const query = `${BASE_QUERY} WHERE s.student_code = ?`;
  const [rows] = await pool.execute(query, [studentCode]);
  return rows[0];
};

/**
 * Tìm kiếm hoặc lấy tất cả sinh viên
 * @param {object} filters - Chứa { keyword, classId, majorId }
 */
const search = async (filters = {}) => {
  const { keyword, classId, majorId } = filters;

  let query = BASE_QUERY;
  const params = [];
  const conditions = [];

  if (keyword) {
    conditions.push("(s.full_name LIKE ? OR s.student_code LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (classId) {
    conditions.push("s.class_id = ?");
    params.push(classId);
  }

  if (majorId) {
    conditions.push("s.major_id = ?");
    params.push(majorId);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY s.full_name`;

  const [rows] = await pool.execute(query, params);
  return rows;
};


const getByClass = async (classId) => {
  return search({ classId });
};

const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Students SET ${fields} WHERE id = ?`;

  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) return null;
  return await getById(id);
};

const deleteById = async (id) => {
  const query = "DELETE FROM Students WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0)
    throw new Error("Không tìm thấy sinh viên để xóa.");
  return { message: "Student deleted", id };
};

export {
  createTable,
  create,
  getById,
  getByStudentCode,
  search,
  getByClass,
  update,
  deleteById,
};
