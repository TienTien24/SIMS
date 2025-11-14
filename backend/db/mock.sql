-- mock.sql: Chèn dữ liệu giả (dữ liệu mẫu) vào database student_management_db
-- Dữ liệu mẫu dựa trên schema từ init.sql
-- Thứ tự INSERT được sắp xếp để tránh lỗi foreign key
-- Chạy file init.sql trước khi chạy file này
-- Sử dụng database
USE student_management_db;

-- Bước 1: Chèn dữ liệu vào bảng Majors (Ngành học)
INSERT INTO Majors (major_code, major_name) VALUES
('CNTT', 'Công nghệ Thông tin'),
('KT', 'Kinh tế'),
('VL', 'Vật lý');

-- Bước 2: Chèn dữ liệu vào bảng Semesters (Học kỳ)
INSERT INTO Semesters (semester_name, year, start_date, end_date, is_active) VALUES
('HK1', 2025, '2025-01-01', '2025-06-30', TRUE),
('HK2', 2025, '2025-07-01', '2025-12-31', FALSE);

-- Bước 3: Chèn dữ liệu vào bảng Classes (Lớp học)
INSERT INTO Classes (class_code, class_name, course) VALUES
('CNTT01', 'Lớp CNTT 01', 'K25'),
('KT01', 'Lớp Kinh tế 01', 'K25'),
('VL01', 'Lớp Vật lý 01', 'K25');

-- Bước 4: Chèn dữ liệu vào bảng Users (Tài khoản chung)
-- Password hashed bằng SHA2 (sử dụng 'password123' cho tất cả làm ví dụ, thay bằng hash thực tế)
INSERT INTO Users (username, password, email, role, status) VALUES
-- Admin
('admin', SHA2('123456', 256), 'admin@school.edu.vn', 'admin', 'active'),
-- Teachers
('teacher1', SHA2('123456', 256), 'teacher1@school.edu.vn', 'teacher', 'active'),
('teacher2', SHA2('password123', 256), 'teacher2@school.edu.vn', 'teacher', 'active'),
-- Students
('student1', SHA2('password123', 256), 'student1@school.edu.vn', 'student', 'active'),
('student2', SHA2('password123', 256), 'student2@school.edu.vn', 'student', 'active'),
('student3', SHA2('password123', 256), 'student3@school.edu.vn', 'student', 'active');

-- Bước 5: Chèn dữ liệu vào bảng Teachers (Giảng viên)
INSERT INTO Teachers (user_id, teacher_code, full_name, email, phone, major_id) VALUES
(2, 'GV001', 'Nguyễn Văn A', 'teacher1@school.edu.vn', '0123456789', 1),  -- major_id=1 (CNTT)
(3, 'GV002', 'Trần Thị B', 'teacher2@school.edu.vn', '0987654321', 2);  -- major_id=2 (KT)

-- Bước 6: Chèn dữ liệu vào bảng Students (Sinh viên)
INSERT INTO Students (user_id, student_code, full_name, birth_date, gender, address, class_id, major_id, course) VALUES
(4, 'SV001', 'Lê Văn C', '2003-05-10', 'male', 'Hà Nội', 1, 1, 'K25'),  -- class_id=1 (CNTT01), major_id=1
(5, 'SV002', 'Phạm Thị D', '2003-07-15', 'female', 'TP.HCM', 2, 2, 'K25'),  -- class_id=2 (KT01), major_id=2
(6, 'SV003', 'Hoàng Văn E', '2003-03-20', 'male', 'Đà Nẵng', 3, 3, 'K25');  -- class_id=3 (VL01), major_id=3

-- Bước 7: Chèn dữ liệu vào bảng Subjects (Môn học)
INSERT INTO Subjects (subject_code, subject_name, credits, teacher_id) VALUES
('MON001', 'Lập trình C++', 3, 1),  -- teacher_id=1 (GV001)
('MON002', 'Kinh tế học', 3, 2),    -- teacher_id=2 (GV002)
('MON003', 'Vật lý Đại cương', 4, NULL);  -- Không gán giảng viên

-- Bước 8: Chèn dữ liệu vào bảng Enrollments (Đăng ký môn học)
INSERT INTO Enrollments (student_id, class_id, subject_id, semester_id, status) VALUES
(1, 1, 1, 1, 'registered'),  -- SV001 đăng ký MON001, HK1 2025
(1, 1, 3, 1, 'registered'),  -- SV001 đăng ký MON003, HK1 2025
(2, 2, 2, 1, 'completed'),   -- SV002 đăng ký MON002, HK1 2025 (đã hoàn thành)
(3, 3, 3, 1, 'registered');  -- SV003 đăng ký MON003, HK1 2025

-- Bước 9: Chèn dữ liệu vào bảng Schedules (Thời khóa biểu)
INSERT INTO Schedules (class_id, subject_id, day_of_week, period, room, teacher_id, semester_id) VALUES
(1, 1, 'Monday', '1-3', 'A101', 1, 1),  -- Lớp CNTT01, MON001, Thứ 2 tiết 1-3
(2, 2, 'Wednesday', '4-6', 'B202', 2, 1),  -- Lớp KT01, MON002, Thứ 4 tiết 4-6
(3, 3, 'Friday', '1-4', 'C303', NULL, 1);  -- Lớp VL01, MON003, Thứ 6 tiết 1-4

-- Bước 10: Chèn dữ liệu vào bảng Grades (Điểm số)
INSERT INTO Grades (student_id, subject_id, semester_id, process_score, midterm_score, final_score, is_finalized, entered_by) VALUES
(1, 1, 1, 8.5, 7.0, 9.0, TRUE, 2),   -- SV001, MON001: average tự tính = (8.5*0.4) + (7*0.3) + (9*0.3) = 8.25
(1, 3, 1, 6.0, 5.5, 7.0, FALSE, 2),  -- SV001, MON003: chưa chốt
(2, 2, 1, 9.0, 8.5, 9.5, TRUE, 3),   -- SV002, MON002: average = 9.1
(3, 3, 1, 7.5, 8.0, 6.5, TRUE, 2);   -- SV003, MON003: average = 7.35
