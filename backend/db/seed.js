import { pool } from "../src/config/db.config.js";


const seedQueries = [
  // Bước 1: Majors
  `INSERT INTO Majors (major_code, major_name) VALUES 
    ('CNTT', 'Công nghệ Thông tin'),
    ('KT', 'Kinh tế'),
    ('VL', 'Vật lý')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 2: Semesters
  `INSERT INTO Semesters (semester_name, year, start_date, end_date, is_active) VALUES 
    ('HK1', 2025, '2025-01-01', '2025-06-30', TRUE),
    ('HK2', 2025, '2025-07-01', '2025-12-31', FALSE)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 3: Classes
  `INSERT INTO Classes (class_code, class_name, course) VALUES 
    ('CNTT01', 'Lớp CNTT 01', 'K25'),
    ('KT01', 'Lớp Kinh tế 01', 'K25'),
    ('VL01', 'Lớp Vật lý 01', 'K25')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 4: Users (sử dụng SHA2 hash như mock.sql)
  `INSERT INTO Users (username, password, email, role, status) VALUES 
    ('admin', SHA2('123456', 256), 'admin@qnu.edu.vn', 'admin', 'active'),
    ('teacher1', SHA2('123456', 256), 'teacher1@qnu.edu.vn', 'teacher', 'active'),
    ('teacher2', SHA2('password123', 256), 'teacher2@qnu.edu.vn', 'teacher', 'active'),
    ('student1', SHA2('password123', 256), 'student1@qnu.edu.vn', 'student', 'active'),
    ('student2', SHA2('password123', 256), 'student2@qnu.edu.vn', 'student', 'active'),
    ('student3', SHA2('password123', 256), 'student3@qnu.edu.vn', 'student', 'active')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 5: Teachers
  `INSERT INTO Teachers (user_id, teacher_code, full_name, email, phone, major_id) VALUES 
    (2, 'GV001', 'Nguyễn Văn A', 'teacher1@qnu.edu.vn', '0123456789', 1),
    (3, 'GV002', 'Trần Thị B', 'teacher2@qnu.edu.vn', '0987654321', 2)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 6: Students
  `INSERT INTO Students (user_id, student_code, full_name, birth_date, gender, address, class_id, major_id, course) VALUES 
    (4, 'SV001', 'Lê Văn C', '2003-05-10', 'male', 'Hà Nội', 1, 1, 'K25'),
    (5, 'SV002', 'Phạm Thị D', '2003-07-15', 'female', 'TP.HCM', 2, 2, 'K25'),
    (6, 'SV003', 'Hoàng Văn E', '2003-03-20', 'male', 'Đà Nẵng', 3, 3, 'K25')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 7: Subjects
  `INSERT INTO Subjects (subject_code, subject_name, credits, teacher_id) VALUES 
    ('MON001', 'Lập trình C++', 3, 1),
    ('MON002', 'Kinh tế học', 3, 2),
    ('MON003', 'Vật lý Đại cương', 4, NULL)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 8: Enrollments
  `INSERT INTO Enrollments (student_id, class_id, subject_id, semester_id, status) VALUES 
    (1, 1, 1, 1, 'registered'),
    (1, 1, 3, 1, 'registered'),
    (2, 2, 2, 1, 'completed'),
    (3, 3, 3, 1, 'registered')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 9: Schedules
  `INSERT INTO Schedules (class_id, subject_id, day_of_week, period, room, teacher_id, semester_id) VALUES 
    (1, 1, 'Monday', '1-3', 'A101', 1, 1),
    (2, 2, 'Wednesday', '4-6', 'B202', 2, 1),
    (3, 3, 'Friday', '1-4', 'C303', NULL, 1)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,

  // Bước 10: Grades
  `INSERT INTO Grades (student_id, subject_id, semester_id, process_score, midterm_score, final_score, is_finalized, entered_by) VALUES 
    (1, 1, 1, 8.5, 7.0, 9.0, TRUE, 2),
    (1, 3, 1, 6.0, 5.5, 7.0, FALSE, 2),
    (2, 2, 1, 9.0, 8.5, 9.5, TRUE, 3),
    (3, 3, 1, 7.5, 8.0, 6.5, TRUE, 2)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);`,
];

export const seedAll = async () => {
  if (process.env.SEED_ON_START !== "true") {
    console.log("⏭️  Seeding skipped (SEED_ON_START=false).");
    return;
  }

  try {
    console.log("🌱 Starting seeding...");
    await pool.execute("SET FOREIGN_KEY_CHECKS = 0;");
    for (const [index, query] of seedQueries.entries()) {
      await pool.execute(query);
      console.log(`✅ Seeded data set ${index + 1}/${seedQueries.length}.`);
    }
    await pool.execute("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🌱 Seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    throw error;
  }
};
