-- init.sql: Tạo database và các bảng cho hệ thống quản lý sinh viên
-- Dựa trên User Stories trong tài liệu [Travel]User-stories-v0.1.docx
-- Schema cơ bản bao gồm các bảng chính: Users, Majors, Students, Teachers, Classes, Subjects, Enrollments, Schedules, Grades
-- Thêm bảng Majors để phân loại sinh viên và giảng viên theo ngành học
-- Sử dụng InnoDB để hỗ trợ foreign keys và relationships
-- Thứ tự tạo bảng được sắp xếp để tránh lỗi foreign key

-- Bước 1: Tạo database
CREATE DATABASE IF NOT EXISTS student_management_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE student_management_db;

-- Bước 2: Tạo bảng Users (chung cho Admin, Teacher, Student)
-- Role: 'admin', 'teacher', 'student'
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Lưu hashed password
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bước 3: Tạo bảng Majors (Ngành học - để phân loại sinh viên và giảng viên)
CREATE TABLE Majors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    major_code VARCHAR(20) UNIQUE NOT NULL,  -- Mã ngành
    major_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bước 4: Tạo bảng Classes (Lớp học)
CREATE TABLE Classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) UNIQUE NOT NULL,  -- Mã lớp
    class_name VARCHAR(100) NOT NULL,
    course VARCHAR(50),  -- Khóa học
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bước 5: Tạo bảng Students (liên kết với Users qua user_id, Majors qua major_id)
CREATE TABLE Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_code VARCHAR(20) UNIQUE NOT NULL,  -- Mã sinh viên
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    class_id INT,  -- Liên kết với Classes
    major_id INT,  -- Liên kết với Majors (ngành học)
    course VARCHAR(50),  -- Khóa học
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE SET NULL,
    FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bước 6: Tạo bảng Teachers (liên kết với Users qua user_id, Majors qua major_id)
CREATE TABLE Teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    teacher_code VARCHAR(20) UNIQUE NOT NULL,  -- Mã giảng viên
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    major_id INT,  -- Liên kết với Majors (ngành học)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (major_id) REFERENCES Majors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bước 7: Tạo bảng Subjects (Môn học)
CREATE TABLE Subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,  -- Mã môn
    subject_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,  -- Số tín chỉ
    teacher_id INT,  -- Giảng viên phụ trách
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bước 8: Tạo bảng Semesters (Học kỳ - để quản lý theo kỳ)
CREATE TABLE Semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(20) NOT NULL,  -- Ví dụ: '2025-1', '2025-2'
    year INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bước 9: Tạo bảng Enrollments (Đăng ký môn học của sinh viên)
CREATE TABLE Enrollments (
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
) ENGINE=InnoDB;

-- Bước 10: Tạo bảng Schedules (Thời khóa biểu)
CREATE TABLE Schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    period VARCHAR(20),  -- Ví dụ: '1-3', '4-6'
    room VARCHAR(50),
    teacher_id INT,
    semester_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bước 11: Tạo bảng Grades (Điểm số)
CREATE TABLE Grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    process_score DECIMAL(4,2) DEFAULT 0.00,  -- Điểm quá trình/chuyên cần
    midterm_score DECIMAL(4,2) DEFAULT 0.00,   -- Điểm giữa kỳ
    final_score DECIMAL(4,2) DEFAULT 0.00,     -- Điểm cuối kỳ
    average_score DECIMAL(4,2) AS ( (process_score * 0.4) + (midterm_score * 0.3) + (final_score * 0.3) ) STORED,  -- Tính trung bình theo công thức ví dụ (có thể điều chỉnh)
    is_finalized BOOLEAN DEFAULT FALSE,  -- Chốt điểm
    entered_by INT,  -- ID giảng viên nhập điểm
    entered_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES Semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES Users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_grade (student_id, subject_id, semester_id)
) ENGINE=InnoDB;

-- Bước 12: Tạo index để tối ưu tìm kiếm (như tìm kiếm theo mã, tên, lớp)
CREATE INDEX idx_students_code ON Students(student_code);
CREATE INDEX idx_students_name ON Students(full_name);
CREATE INDEX idx_classes_code ON Classes(class_code);
CREATE INDEX idx_subjects_code ON Subjects(subject_code);
CREATE INDEX idx_enrollments_student_semester ON Enrollments(student_id, semester_id);
CREATE INDEX idx_grades_student_subject ON Grades(student_id, subject_id);
CREATE INDEX idx_majors_code ON Majors(major_code);
