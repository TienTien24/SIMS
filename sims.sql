-- Tạo database
CREATE DATABASE IF NOT EXISTS sims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sims;

-- Bảng Users
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin','teacher','student') NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Majors
CREATE TABLE IF NOT EXISTS Majors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  major_code VARCHAR(20) UNIQUE NOT NULL,
  major_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Classes
CREATE TABLE IF NOT EXISTS Classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_code VARCHAR(20) UNIQUE NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  course VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Students
CREATE TABLE IF NOT EXISTS Students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  student_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  gender ENUM('male','female','other'),
  address TEXT,
  class_id INT,
  major_id INT,
  course VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE SET NULL,
  FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bảng Teachers
CREATE TABLE IF NOT EXISTS Teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  teacher_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  major_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bảng Subjects
CREATE TABLE IF NOT EXISTS Subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  credits INT NOT NULL DEFAULT 3,
  teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bảng Semesters
CREATE TABLE IF NOT EXISTS Semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_name VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Enrollments
CREATE TABLE IF NOT EXISTS Enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  semester_id INT NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered','completed','dropped') DEFAULT 'registered',
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, subject_id, semester_id)
) ENGINE=InnoDB;

-- Bảng Schedules
CREATE TABLE IF NOT EXISTS Schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
  period VARCHAR(20),
  room VARCHAR(50),
  teacher_id INT,
  semester_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL,
  FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng Grades
CREATE TABLE IF NOT EXISTS Grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  semester_id INT NOT NULL,
  process_score DECIMAL(4,2) DEFAULT 0.00,
  midterm_score DECIMAL(4,2) DEFAULT 0.00,
  final_score DECIMAL(4,2) DEFAULT 0.00,
  average_score DECIMAL(4,2) AS ((process_score*0.4)+(midterm_score*0.3)+(final_score*0.3)) STORED,
  is_finalized BOOLEAN DEFAULT FALSE,
  entered_by INT,
  entered_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES Users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_grade (student_id, subject_id, semester_id)
) ENGINE=InnoDB;

-- Bảng Notifications
CREATE TABLE IF NOT EXISTS Notifications (
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
) ENGINE=InnoDB;

-- Bảng RegistrationLogs (admin theo dõi đăng ký)
CREATE TABLE IF NOT EXISTS RegistrationLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role ENUM('teacher','student') NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','reviewed') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed dữ liệu mẫu
INSERT INTO Majors (major_code, major_name) VALUES
 ('CNTT','Công nghệ Thông tin'), ('KT','Kinh tế'), ('VL','Vật lý')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Semesters (semester_name, year, start_date, end_date, is_active) VALUES
 ('HK1', 2025, '2025-01-01', '2025-06-30', TRUE),
 ('HK2', 2025, '2025-07-01', '2025-12-31', FALSE)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Classes (class_code, class_name, course) VALUES
 ('CNTT01','Lớp CNTT 01','K25'), ('KT01','Lớp Kinh tế 01','K25'), ('VL01','Lớp Vật lý 01','K25')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Users (username,password,email,full_name,role,status) VALUES
 ('admin', SHA2('123456',256), 'admin@qnu.edu.vn', 'Quản trị', 'admin','active'),
 ('teacher1', SHA2('123456',256), 'teacher1@qnu.edu.vn', 'Nguyễn Văn A', 'teacher','active'),
 ('teacher2', SHA2('password123',256), 'teacher2@qnu.edu.vn', 'Trần Thị B', 'teacher','active'),
 ('student1', SHA2('password123',256), 'student1@qnu.edu.vn', 'Lê Văn C', 'student','active'),
 ('student2', SHA2('password123',256), 'student2@qnu.edu.vn', 'Phạm Thị D', 'student','active'),
 ('student3', SHA2('password123',256), 'student3@qnu.edu.vn', 'Hoàng Văn E', 'student','active')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Teachers (user_id, teacher_code, full_name, email, phone, major_id) VALUES
 (2,'GV001','Nguyễn Văn A','teacher1@qnu.edu.vn','0123456789',1),
 (3,'GV002','Trần Thị B','teacher2@qnu.edu.vn','0987654321',2)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Students (user_id, student_code, full_name, birth_date, gender, address, class_id, major_id, course) VALUES
 (4,'SV001','Lê Văn C','2003-05-10','male','Hà Nội',1,1,'K25'),
 (5,'SV002','Phạm Thị D','2003-07-15','female','TP.HCM',2,2,'K25'),
 (6,'SV003','Hoàng Văn E','2003-03-20','male','Đà Nẵng',3,3,'K25')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Subjects (subject_code, subject_name, credits, teacher_id) VALUES
 ('MON001','Lập trình C++',3,1), ('MON002','Kinh tế học',3,2), ('MON003','Vật lý Đại cương',4,NULL)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Enrollments (student_id, class_id, subject_id, semester_id, status) VALUES
 (1,1,1,1,'registered'),
 (1,1,3,1,'registered'),
 (2,2,2,1,'completed'),
 (3,3,3,1,'registered')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Schedules (class_id, subject_id, day_of_week, period, room, teacher_id, semester_id) VALUES
 (1,1,'Monday','1-3','A101',1,1),
 (2,2,'Wednesday','4-6','B202',2,1),
 (3,3,'Friday','1-4','C303',NULL,1)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

INSERT INTO Grades (student_id, subject_id, semester_id, process_score, midterm_score, final_score, is_finalized, entered_by) VALUES
 (1,1,1,8.5,7.0,9.0,TRUE,2),
 (1,3,1,6.0,5.5,7.0,FALSE,2),
 (2,2,1,9.0,8.5,9.5,TRUE,3),
 (3,3,1,7.5,8.0,6.5,TRUE,2)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);