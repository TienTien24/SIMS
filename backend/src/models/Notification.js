import { pool } from "../config/db.config.js";

const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT,
    subject_id INT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;`;
  await pool.execute(query);
  console.log("✅ Notifications table ready.");
};

const create = async (teacherId, { class_id, subject_id, title, content }) => {
  const query = `INSERT INTO Notifications (teacher_id, class_id, subject_id, title, content) VALUES (?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(query, [
    teacherId,
    class_id || null,
    subject_id || null,
    title,
    content,
  ]);
  return { id: result.insertId };
};

const listByTeacher = async (teacherId, limit = 50) => {
  const query = `SELECT n.*, c.class_name, s.subject_name FROM Notifications n 
    LEFT JOIN Classes c ON n.class_id = c.id 
    LEFT JOIN Subjects s ON n.subject_id = s.id 
    WHERE n.teacher_id = ? ORDER BY n.created_at DESC LIMIT ?`;
  const [rows] = await pool.execute(query, [teacherId, limit]);
  return rows;
};

export { createTable, create, listByTeacher };
