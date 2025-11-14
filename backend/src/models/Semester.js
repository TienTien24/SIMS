import { pool } from "../config/db.config.js";

// Tạo bảng Semesters
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Semesters table ready.");
};

// Create semester (function 'create' đã định nghĩa)
const create = async (
  semesterName,
  year,
  startDate,
  endDate,
  isActive = false
) => {
  const query =
    "INSERT INTO Semesters (semester_name, year, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [
      semesterName,
      year,
      startDate,
      endDate,
      isActive,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create semester failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = "SELECT * FROM Semesters WHERE id = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = "SELECT * FROM Semesters ORDER BY year DESC, semester_name";
  const [rows] = await pool.execute(query);
  return rows;
};

// Get active semester
const getActive = async () => {
  const query = "SELECT * FROM Semesters WHERE is_active = TRUE LIMIT 1";
  const [rows] = await pool.execute(query);
  return rows[0];
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Semesters SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Semester not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Semesters WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Semester not found");
  return { message: "Semester deleted" };
};

// Export tất cả (bao gồm 'create' đã defined)
export { createTable, create, getById, getAll, getActive, update, deleteById };
