import { pool } from "../config/db.config.js";

// Tạo bảng Schedules
const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    period VARCHAR(20),
    room VARCHAR(50),
    teacher_id INT,
    semester_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Schedules table ready.");
};

// Create schedule (function 'create' đã định nghĩa)
const create = async (
  classId,
  subjectId,
  dayOfWeek,
  period,
  room,
  teacherId,
  semesterId
) => {
  const query = `INSERT INTO Schedules (class_id, subject_id, day_of_week, period, room, teacher_id, semester_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.execute(query, [
      classId,
      subjectId,
      dayOfWeek,
      period,
      room,
      teacherId,
      semesterId,
    ]);
    return { id: result.insertId };
  } catch (error) {
    throw new Error(`Create schedule failed: ${error.message}`);
  }
};

// Get by ID
const getById = async (id) => {
  const query = `SELECT sch.*, c.class_name, sub.subject_name, t.full_name AS teacher_name, sem.semester_name 
    FROM Schedules sch 
    JOIN Classes c ON sch.class_id = c.id 
    JOIN Subjects sub ON sch.subject_id = sub.id 
    LEFT JOIN Teachers t ON sch.teacher_id = t.id 
    JOIN Semesters sem ON sch.semester_id = sem.id 
    WHERE sch.id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// Get all
const getAll = async () => {
  const query = `SELECT sch.*, c.class_name, sub.subject_name, t.full_name AS teacher_name, sem.semester_name 
    FROM Schedules sch 
    JOIN Classes c ON sch.class_id = c.id 
    JOIN Subjects sub ON sch.subject_id = sub.id 
    LEFT JOIN Teachers t ON sch.teacher_id = t.id 
    JOIN Semesters sem ON sch.semester_id = sem.id 
    ORDER BY sch.day_of_week, sch.period`;
  const [rows] = await pool.execute(query);
  return rows;
};

// Get by class and semester
const getByClassAndSemester = async (classId, semesterId) => {
  const query = `SELECT * FROM Schedules WHERE class_id = ? AND semester_id = ? ORDER BY day_of_week, period`;
  const [rows] = await pool.execute(query, [classId, semesterId]);
  return rows;
};

// Update
const update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const query = `UPDATE Schedules SET ${fields} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  if (result.affectedRows === 0) throw new Error("Schedule not found");
  return await getById(id);
};

// Delete
const deleteById = async (id) => {
  const query = "DELETE FROM Schedules WHERE id = ?";
  const [result] = await pool.execute(query, [id]);
  if (result.affectedRows === 0) throw new Error("Schedule not found");
  return { message: "Schedule deleted" };
};

// Export tất cả (bao gồm 'create' đã defined)
export {
  createTable,
  create,
  getById,
  getAll,
  getByClassAndSemester,
  update,
  deleteById,
};
