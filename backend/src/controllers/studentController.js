// src/controllers/studentController.js
import * as StudentModel from "../models/Student.js";
import * as GradeModel from "../models/Grade.js";
import * as EnrollmentModel from "../models/Enrollment.js";
import * as SemesterModel from "../models/Semester.js";
import { getStudentIdByUserId } from "../utils/studentUtils.js";
import { calculateGPA } from "../utils/studentCalculations.js";
import { pool } from "../config/db.config.js";
/**
 * 1. Xem và cập nhật thông tin cá nhân
 */

// GET /api/student/profile - Lấy thông tin cá nhân
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);

    if (!studentId) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const student = await StudentModel.getById(studentId);

    res.json({
      success: true,
      message: "Lấy thông tin cá nhân thành công",
      data: student,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

// PUT /api/student/profile - Cập nhật thông tin cá nhân
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);

    if (!studentId) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    // Lấy các trường đã được validation cho phép
    const allowedFields = ["full_name", "birth_date", "gender", "address"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (updates.birth_date && /^\d{2}\/\d{2}\/\d{4}$/.test(updates.birth_date)) {
      const [d, m, y] = updates.birth_date.split("/");
      updates.birth_date = `${y}-${m}-${d}`;
    }

    const updatedStudent = await StudentModel.update(studentId, updates);

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Cập nhật thông tin thất bại",
    });
  }
};

/**
 * 2. Xem điểm các môn học, kết quả học tập theo học kỳ
 */

// GET /api/student/grades - Lấy điểm số (có thể filter theo semester)
export const getGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    if (!studentId) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const { semester_id } = req.query;
    let grades;

    if (semester_id) {
      // Lấy điểm theo học kỳ cụ thể
      grades = await GradeModel.getByStudentAndSemester(studentId, semester_id);
    } else {
      // Lấy tất cả điểm
      const query = `SELECT g.*, sub.subject_name, sub.subject_code, sub.credits, sem.semester_name, sem.year 
        FROM Grades g 
        JOIN Subjects sub ON g.subject_id = sub.id 
        JOIN Semesters sem ON g.semester_id = sem.id 
        WHERE g.student_id = ? 
        ORDER BY sem.year DESC, sem.semester_name DESC`;
      const [rows] = await pool.execute(query, [studentId]);
      grades = rows;
    }

    // Tính GPA (Sử dụng helper đã import)
    const gpa = calculateGPA(grades); // 👈 SỬ DỤNG HÀM TỪ UTILS

    res.json({
      success: true,
      message: "Lấy điểm số thành công",
      data: {
        grades,
        gpa: gpa,
        totalSubjects: grades.length,
      },
    });
  } catch (error) {
    console.error("Get grades error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

/**
 * 3. Đăng ký môn học
 */

// GET /api/student/enrollments - Xem danh sách môn đã đăng ký
export const getEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { semester_id } = req.query;

    if (!studentId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin sinh viên" });
    }

    let enrollments;

    if (semester_id) {
      enrollments = await EnrollmentModel.getByStudent(studentId, semester_id);
    } else {
      enrollments = await EnrollmentModel.getDetailedByStudent(studentId);
    }

    res.json({
      success: true,
      message: "Lấy danh sách môn đã đăng ký thành công",
      data: enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// POST /api/student/enrollments - Đăng ký môn học mới
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { class_id, subject_id, semester_id } = req.body;

    if (!studentId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin sinh viên" });
    }

    const currentCount = await EnrollmentModel.countByClass(class_id, subject_id, semester_id);

    const MAX_SLOTS = 50;
    if (currentCount >= MAX_SLOTS) {
      return res.status(400).json({
        success: false,
        message: "Lớp học đã đầy, không thể đăng ký thêm.",
      });
    }

    const enrollment = await EnrollmentModel.create(
      studentId,
      class_id,
      subject_id,
      semester_id
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký môn học thành công",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enroll course error:", error);

    if (error.message.includes("Duplicate entry") || error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký môn học này trong học kỳ này rồi.",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Đăng ký thất bại",
    });
  }
};

// DELETE /api/student/enrollments/:id - Hủy đăng ký môn học
export const cancelEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { id } = req.params;

    if (!studentId) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const enrollment = await EnrollmentModel.getById(id);
    if (!enrollment || enrollment.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền hủy đăng ký này",
      });
    }

    await EnrollmentModel.deleteById(id);

    res.json({
      success: true,
      message: "Hủy đăng ký môn học thành công",
    });
  } catch (error) {
    console.error("Cancel enrollment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Hủy đăng ký thất bại",
    });
  }
};

/**
 * 4. Xem lịch học và thời khóa biểu
 */

// GET /api/student/schedule - Lấy lịch học của sinh viên
export const getSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { semester_id, week, view } = req.query;

    if (!studentId) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy thông tin sinh viên",
        });
    }

    const student = await StudentModel.getById(studentId);
    if (!student || !student.class_id) {
      return res
        .status(404)
        .json({ success: false, message: "Sinh viên chưa được phân lớp" });
    }

    // Logic: Tìm học kỳ active
    let activeSemesterId = semester_id;

    if (!activeSemesterId) {
      // Thay thế câu query SQL SELECT id FROM Semesters... bằng gọi Model
      const activeSem = await SemesterModel.getActive();
      activeSemesterId = activeSem?.id;
    }

    if (!activeSemesterId) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy học kỳ hiện tại" });
    }

    const [rows] = await pool.execute(
      `SELECT sch.*, c.class_name, c.class_code, sub.subject_name, sub.subject_code, t.full_name AS teacher_name 
       FROM Schedules sch 
       JOIN Classes c ON sch.class_id = c.id 
       JOIN Subjects sub ON sch.subject_id = sub.id 
       LEFT JOIN Teachers t ON sch.teacher_id = t.id 
       WHERE sch.class_id = ? AND sch.semester_id = ? 
       ORDER BY sch.day_of_week, sch.period`,
      [student.class_id, activeSemesterId]
    );

    // Tính toán tuần nếu có yêu cầu
    let weekInfo = null;
    if (week) {
      const [semRows] = await pool.execute(
        "SELECT start_date, end_date FROM Semesters WHERE id = ?",
        [activeSemesterId]
      );
      const sem = semRows[0];
      if (sem?.start_date) {
        const start = new Date(sem.start_date);
        const weekIdx = parseInt(week, 10) - 1;
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + weekIdx * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekInfo = {
          week_start: weekStart.toISOString().slice(0, 10),
          week_end: weekEnd.toISOString().slice(0, 10),
        };
      }
    }

    // Chế độ xem theo tuần hoặc theo học phần
    let payload = rows;
    if (view === "course") {
      const map = new Map();
      rows.forEach((r) => {
        const key = r.subject_id;
        const cur = map.get(key) || {
          subject_id: r.subject_id,
          subject_code: r.subject_code,
          subject_name: r.subject_name,
          class_code: r.class_code,
          class_name: r.class_name,
          teacher_name: r.teacher_name,
          periods: 0,
        };
        // Ước lượng số tiết từ field 'period' nếu là phạm vi "1-3"
        let count = 1;
        if (typeof r.period === "string") {
          const m = r.period.match(/(\d+)-(\d+)/);
          if (m) count = Math.abs(parseInt(m[2]) - parseInt(m[1])) + 1;
        }
        cur.periods += count;
        map.set(key, cur);
      });
      payload = Array.from(map.values());
    }

    res.json({
      success: true,
      message: "Lấy lịch học thành công",
      data: {
        schedule: payload,
        class_name: student.class_name,
        semester_id: activeSemesterId,
        ...(weekInfo || {}),
      },
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

/**
 * 5. Tra cứu thông báo (tạm thời trả về empty, sẽ implement sau)
 */

// GET /api/student/notifications - Lấy thông báo
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    if (!studentId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin sinh viên" });
    }
    const student = await StudentModel.getById(studentId);
    const [notifRows] = await pool.execute(
      `SELECT n.*, c.class_name, s.subject_name, t.full_name AS teacher_name 
       FROM Notifications n 
       LEFT JOIN Classes c ON n.class_id = c.id 
       LEFT JOIN Subjects s ON n.subject_id = s.id 
       LEFT JOIN Teachers t ON n.teacher_id = t.id 
       WHERE (n.class_id IS NULL OR n.class_id = ?) 
          OR n.subject_id IN (SELECT subject_id FROM Enrollments WHERE student_id = ?) 
       ORDER BY n.created_at DESC LIMIT 50`,
      [student.class_id || null, studentId]
    );
    res.json({ success: true, message: "Lấy thông báo thành công", data: { notifications: notifRows } });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};
