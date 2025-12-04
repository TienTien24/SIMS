import { pool } from "../config/db.config.js";

// Tạo bảng Classes
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) UNIQUE NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    course VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Classes table ready.");
};

// Create class
const create = async (classCode, className, course) => {
  const query =
    "INSERT INTO Classes (class_code, class_name, course) VALUES (?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [classCode, className, course]);
    return { id: result.insertId, classCode, className, course };
  } catch (error) {
    throw new Error(`Create class failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = "SELECT * FROM Classes WHERE id = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async (filters = {}) => {
  const { keyword, course } = filters;

  let query = "SELECT * FROM Classes";
  const params = [];
  const conditions = [];

  if (keyword) {
    conditions.push("(class_name LIKE ? OR class_code LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (course) {
    conditions.push("course LIKE ?");
    params.push(`%${course}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY class_name`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Update
const update = async (id, classCode, className, course) => {
  const query =
    "UPDATE Classes SET class_code = ?, class_name = ?, course = ? WHERE id = ?";
  const [result] = await pool.execute(query, [
    classCode,
    className,
    course,
    id,
  ]);
  if (result.affectedRows === 0) throw new Error("Class not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Classes WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Class not found");
  return { message: "Class deleted" };
};

// Export
export { createTable, create, getById, getAll, update, deleteById };
