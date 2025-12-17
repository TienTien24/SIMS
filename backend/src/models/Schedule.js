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
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,

    UNIQUE KEY unique_schedule_slot (class_id, subject_id, semester_id, day_of_week, period)
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

const getAvailableClasses = async (filters = {}) => {
  const { keyword, semester_id } = filters;
  const params = [];
  const conditions = [];

  // Câu query này Join các bảng để lấy tên môn, tên lớp, tên giảng viên
  let query = `
    SELECT 
      sch.class_id, 
      sch.subject_id, 
      sch.semester_id,
      sch.day_of_week,
      sch.period,
      sch.room,
      c.class_code, 
      c.class_name, 
      sub.subject_name, 
      sub.subject_code, 
      sub.credits,
      sem.semester_name, 
      sem.year,
      t.full_name AS teacher_name,
      
      -- Tính số lượng sinh viên đã đăng ký vào lớp này
      (SELECT COUNT(*) FROM Enrollments e 
       WHERE e.class_id = sch.class_id 
       AND e.subject_id = sch.subject_id 
       AND e.semester_id = sch.semester_id) AS current_slots,
       
      -- Giả định Max slots là 50 (hoặc lấy từ bảng Classes nếu có cột max_slots)
      50 AS max_slots 

    FROM Schedules sch
    JOIN Classes c ON sch.class_id = c.id
    JOIN Subjects sub ON sch.subject_id = sub.id
    JOIN Semesters sem ON sch.semester_id = sem.id
    LEFT JOIN Teachers t ON sch.teacher_id = t.id
  `;
  // Bộ lọc theo kỳ học
  if (semester_id) {
    conditions.push("sch.semester_id = ?");
    params.push(semester_id);
  }
  
  if (keyword) {
    conditions.push(
      "(sub.subject_name LIKE ? OR sub.subject_code LIKE ? OR c.class_code LIKE ?)"
    );
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY sub.subject_name ASC, c.class_code ASC`;

  const [rows] = await pool.execute(query, params);

  return rows.map((row) => ({
    ...row,
    unique_id: `${row.class_id}-${row.subject_id}-${row.semester_id}`,
  }));
};

const getStudentPersonalSchedule = async (studentId, semesterId) => {
  const query = `
    SELECT 
      MIN(sch.id) as id,
      sch.day_of_week,
      sch.period,
      sch.room,
      sub.subject_name,
      sub.subject_code,
      sub.credits,
      c.class_code,
      MAX(t.full_name) AS teacher_name
    FROM Enrollments e
    JOIN Schedules sch ON e.class_id = sch.class_id 
        AND e.subject_id = sch.subject_id 
    JOIN Subjects sub ON sch.subject_id = sub.id
    JOIN Classes c ON sch.class_id = c.id
    LEFT JOIN Teachers t ON sch.teacher_id = t.id
    WHERE e.student_id = ? AND e.semester_id = ?
    GROUP BY 
      sch.day_of_week, sch.period, sch.room, 
      sub.subject_name, sub.subject_code, sub.credits, 
      c.class_code
    ORDER BY 
      CASE 
        WHEN sch.day_of_week = 'Monday' THEN 1
        WHEN sch.day_of_week = 'Tuesday' THEN 2
        WHEN sch.day_of_week = 'Wednesday' THEN 3
        WHEN sch.day_of_week = 'Thursday' THEN 4
        WHEN sch.day_of_week = 'Friday' THEN 5
        WHEN sch.day_of_week = 'Saturday' THEN 6
        WHEN sch.day_of_week = 'Sunday' THEN 7
      END,
      sch.period
  `;

  const [rows] = await pool.execute(query, [studentId, semesterId]);
  return rows;
};
 

// Export tất cả (bao gồm 'create' đã defined)
export {
  createTable,
  create,
  getById,
  getAll,
  getByClassAndSemester,
  getAvailableClasses,
  getStudentPersonalSchedule,
  update,
  deleteById, 
};
