import { pool } from "../config/db.config.js";

// Tạo bảng Enrollments
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'completed', 'dropped') DEFAULT 'registered',
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, subject_id, semester_id)
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Enrollments table ready.");
};

// Create enrollment
const create = async (studentId, classId, subjectId, semesterId) => {
  const query =
    "INSERT INTO Enrollments (student_id, class_id, subject_id, semester_id) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [
      studentId,
      classId,
      subjectId,
      semesterId,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create enrollment failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT e.*, s.full_name AS student_name, c.class_name, sub.subject_name, sem.semester_name 
    FROM Enrollments e 
    JOIN Students s ON e.student_id = s.id 
    JOIN Classes c ON e.class_id = c.id 
    JOIN Subjects sub ON e.subject_id = sub.id 
    JOIN Semesters sem ON e.semester_id = sem.id 
    WHERE e.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = `SELECT e.*, s.full_name AS student_name, c.class_name, sub.subject_name, sem.semester_name 
    FROM Enrollments e 
    JOIN Students s ON e.student_id = s.id 
    JOIN Classes c ON e.class_id = c.id 
    JOIN Subjects sub ON e.subject_id = sub.id 
    JOIN Semesters sem ON e.semester_id = sem.id 
    ORDER BY e.enrollment_date DESC`;
  const [rows] = await pool.execute(query);
  return rows;
};

// Get by student
const getByStudent = async (studentId, semesterId) => {
  const query = `SELECT * FROM Enrollments WHERE student_id = ? AND semester_id = ?`;
  const [rows] = await pool.execute(query, [studentId, semesterId]);
  return rows;
};

//getDetailedByStudent
const getDetailedByStudent = async (studentId) => {
  const query = `
    SELECT 
      e.*, 
      c.class_name, 
      sub.subject_name, sub.subject_code, sub.credits, 
      sem.semester_name, sem.year 
    FROM Enrollments e 
    JOIN Classes c ON e.class_id = c.id 
    JOIN Subjects sub ON e.subject_id = sub.id 
    JOIN Semesters sem ON e.semester_id = sem.id 
    WHERE e.student_id = ? 
    ORDER BY sem.year DESC, sem.semester_name DESC, e.enrollment_date DESC
  `;
  const [rows] = await pool.execute(query, [studentId]);
  return rows;
};

// Count enrollments by class, subject, semester
const countByClass = async (classId, subjectId, semesterId) => {
  const query = `
    SELECT COUNT(*) as current_count 
    FROM Enrollments 
    WHERE class_id = ? AND subject_id = ? AND semester_id = ?
  `;
  const [rows] = await pool.execute(query, [classId, subjectId, semesterId]);
  return rows[0].current_count;
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Enrollments SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Enrollment not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Enrollments WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Enrollment not found");
  return { message: "Enrollment deleted" };
};

// Export (bao gồm createTable)
export {
  createTable,
  create,
  getById,
  getAll,
  getByStudent,
  getDetailedByStudent,
  countByClass,
  update,
  deleteById,
};
