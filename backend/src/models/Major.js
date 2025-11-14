import { pool } from "../config/db.config.js";

// Tạo bảng Majors
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Majors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    major_code VARCHAR(20) UNIQUE NOT NULL,
    major_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Majors table ready.");
};

// Create major (function 'create' đã định nghĩa)
const create = async (majorCode, majorName) => {
  const query = "INSERT INTO Majors (major_code, major_name) VALUES (?, ?)";
  try {
    const [result] = await pool.execute(query, [majorCode, majorName]);
    return { id: result.insertId, majorCode, majorName };
  } catch (error) {
    throw new Error(`Create major failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = "SELECT * FROM Majors WHERE id = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = "SELECT * FROM Majors ORDER BY major_name";
  const [rows] = await pool.execute(query);
  return rows;
};

// Update
const update = async (id, majorCode, majorName) => {
  const query = "UPDATE Majors SET major_code = ?, major_name = ? WHERE id = ?";
  const [result] = await pool.execute(query, [majorCode, majorName, id]);
  if (result.affectedRows === 0) throw new Error("Major not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Majors WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Major not found");
  return { message: "Major deleted" };
};

// Export tất cả (bao gồm 'create' đã defined)
export { createTable, create, getById, getAll, update, deleteById };
