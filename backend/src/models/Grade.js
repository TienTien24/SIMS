import { pool } from "../config/db.config.js";

// Tạo bảng Grades
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    process_score DECIMAL(4,2) DEFAULT 0.00,
    midterm_score DECIMAL(4,2) DEFAULT 0.00,
    final_score DECIMAL(4,2) DEFAULT 0.00,
    average_score DECIMAL(4,2) AS ((process_score * 0.4) + (midterm_score * 0.3) + (final_score * 0.3)) STORED,
    is_finalized BOOLEAN DEFAULT FALSE,
    entered_by INT,
    entered_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES Users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_grade (student_id, subject_id, semester_id)
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Grades table ready.");
};

// Create grade (function 'create' đã định nghĩa)
const create = async (studentId, subjectId, semesterId, enteredBy) => {
  const query =
    "INSERT INTO Grades (student_id, subject_id, semester_id, entered_by, entered_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
  try {
    const [result] = await pool.execute(query, [
      studentId,
      subjectId,
      semesterId,
      enteredBy,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create grade failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT g.*, s.full_name AS student_name, sub.subject_name, sem.semester_name, u.username AS entered_by_name 
    FROM Grades g 
    JOIN Students s ON g.student_id = s.id 
    JOIN Subjects sub ON g.subject_id = sub.id 
    JOIN Semesters sem ON g.semester_id = sem.id 
    LEFT JOIN Users u ON g.entered_by = u.id 
    WHERE g.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = `SELECT g.*, s.full_name AS student_name, sub.subject_name, sem.semester_name 
    FROM Grades g 
    JOIN Students s ON g.student_id = s.id 
    JOIN Subjects sub ON g.subject_id = sub.id 
    JOIN Semesters sem ON g.semester_id = sem.id 
    ORDER BY g.average_score DESC`;
  const [rows] = await pool.execute(query);
  return rows;
};

// Get by student and semester
const getByStudentAndSemester = async (studentId, semesterId) => {
  const query = `SELECT g.*, sub.subject_name FROM Grades g 
    JOIN Subjects sub ON g.subject_id = sub.id 
    WHERE g.student_id = ? AND g.semester_id = ?`;
  const [rows] = await pool.execute(query, [studentId, semesterId]);
  return rows;
};

// Update (e.g., update scores)
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Grades SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Grade not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Grades WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Grade not found");
  return { message: "Grade deleted" };
};

export const getStudentGrades = async ({ studentId, semesterId, year }) => {
  // 1. Câu truy vấn gốc (Base Query)
  let query = `
    SELECT g.*, 
           sub.subject_name, sub.subject_code, sub.credits, 
           sem.semester_name, sem.year 
    FROM Grades g 
    JOIN Subjects sub ON g.subject_id = sub.id 
    JOIN Semesters sem ON g.semester_id = sem.id 
    WHERE g.student_id = ?`;

  const params = [studentId];

  // 2. Nối chuỗi điều kiện động (Dynamic Filtering)
  if (semesterId) {
    query += ` AND g.semester_id = ?`;
    params.push(semesterId);
  } else if (year) {
    // Nếu chỉ chọn năm (mà không chọn kỳ cụ thể)
    query += ` AND sem.year = ?`;
    params.push(year);
  }

  // 3. Sắp xếp mặc định
  query += ` ORDER BY sem.year DESC, sem.semester_name DESC`;

  // 4. Thực thi
  const [rows] = await pool.execute(query, params);
  return rows;
};

export {
  createTable,
  create,
  getById,
  getAll,
  getByStudentAndSemester,
  update,
  deleteById,
};
