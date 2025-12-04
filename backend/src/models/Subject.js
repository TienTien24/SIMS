import { pool } from "../config/db.config.js";

// Tạo bảng Subjects
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Subjects table ready.");
};

// Create subject
const create = async (subjectCode, subjectName, credits = 3, teacherId) => {
  const query =
    "INSERT INTO Subjects (subject_code, subject_name, credits, teacher_id) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [
      subjectCode,
      subjectName,
      credits,
      teacherId,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create subject failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT s.*, t.full_name AS teacher_name FROM Subjects s 
    LEFT JOIN Teachers t ON s.teacher_id = t.id 
    WHERE s.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

//Get by Name
const getByName = async (subjectName) => {
  const query = "SELECT * FROM Subjects WHERE subject_name = ?";
  const [rows] = await pool.execute(query, [subjectName]);
  return rows[0];
};

// Get all
const listAll = async () => {
  let query = `SELECT s.*, t.full_name AS teacher_name FROM Subjects s 
    LEFT JOIN Teachers t ON s.teacher_id = t.id ORDER BY s.subject_name`;
  const [rows] = await pool.execute(query);
  return rows;
};

//Chỉ tìm kiếm khi có filters (search)
const search = async (filters = {}) => {
  const { keyword, credits, teacherName } = filters;

  if (!keyword && !credits && !teacherName) {
    return [];
  }

  let query = `SELECT s.*, t.full_name AS teacher_name FROM Subjects s 
    LEFT JOIN Teachers t ON s.teacher_id = t.id`;

  const params = [];
  const conditions = [];

  if (keyword) {
    conditions.push("(s.subject_name LIKE ? OR s.subject_code LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (credits) {
    const numericCredits = parseInt(credits);

    if (!isNaN(numericCredits) && numericCredits > 0) {
      conditions.push("s.credits = ?");
      params.push(numericCredits);
    }
  }

  if (teacherName) {
    conditions.push("t.full_name LIKE ?");
    params.push(`%${teacherName}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY s.subject_name`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Subjects SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Subject not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Subjects WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Subject not found");
  return { message: "Subject deleted" };
};

export {
  createTable,
  create,
  getById,
  listAll,
  search,
  update,
  deleteById,
  getByName,
};
