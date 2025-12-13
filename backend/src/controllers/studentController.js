// src/controllers/studentController.js
import * as StudentModel from "../models/Student.js";
import * as GradeModel from "../models/Grade.js";
import * as EnrollmentModel from "../models/Enrollment.js";
import * as ScheduleModel from "../models/Schedule.js";
import * as SemesterModel from "../models/Semester.js";
import { getStudentIdByUserId } from "../utils/studentUtils.js";
import { calculateGPA } from "../utils/studentCalculations.js";
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
    const studentId = await checkStudentId(req, res);
    if (!studentId) return; // Đã gửi response 404

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
    const { semester_id } = req.query;

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

    const schedule = await ScheduleModel.getByClassAndSemester(
      student.class_id,
      activeSemesterId
    );

    res.json({
      success: true,
      message: "Lấy lịch học thành công",
      data: {
        schedule,
        class_name: student.class_name,
        semester_id: activeSemesterId,
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
    // TODO: Implement notifications table và logic
    res.json({
      success: true,
      message: "Lấy thông báo thành công",
      data: {
        notifications: [],
        note: "Chức năng thông báo sẽ được triển khai sau",
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};
