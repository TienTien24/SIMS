// src/controllers/studentController.js
import * as StudentModel from "../models/Student.js";
import * as GradeModel from "../models/Grade.js";
import * as EnrollmentModel from "../models/Enrollment.js";
import * as ScheduleModel from "../models/Schedule.js";
import * as SemesterModel from "../models/Semester.js";
import * as ClassModel from "../models/Class.js";
import { getStudentIdByUserId } from "../utils/studentUtils.js";
import { calculateGPA } from "../utils/studentCalculations.js";
import { checkTimeOverlap, translateDay } from "../utils/scheduleUtils.js";

/* ==========================================================================
   SECTION 1: QUẢN LÝ HỒ SƠ (PROFILE)
   ========================================================================== */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    if (!studentId)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sinh viên" });
    const student = await StudentModel.getById(studentId);
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    if (!studentId)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sinh viên" });

    const allowedFields = ["full_name", "birth_date", "gender", "address"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.birth_date && /^\d{2}\/\d{2}\/\d{4}$/.test(updates.birth_date)) {
      const [d, m, y] = updates.birth_date.split("/");
      updates.birth_date = `${y}-${m}-${d}`;
    }

    const updatedStudent = await StudentModel.update(studentId, updates);
    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   SECTION 2: DỮ LIỆU HỌC VỤ (SEMESTERS)
   ========================================================================== */
export const getAllSemesters = async (req, res) => {
  try {
    const semesters = await SemesterModel.getAll();
    res.json({
      success: true,
      data: semesters,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy danh sách học kỳ" });
  }
};

/* ==========================================================================
   SECTION 3: ĐĂNG KÝ TÍN CHỈ (ENROLLMENT)
   ========================================================================== */
export const getAvailableClasses = async (req, res) => {
  try {
    const { keyword } = req.query;

    const currentSemester = await SemesterModel.getCurrentByDate();

    if (!currentSemester) {
      return res.json({
        success: true,
        message:
          "Hệ thống đang đóng cổng đăng ký (Không trong thời gian học kỳ).",
        data: [],
      });
    }

    const classes = await ScheduleModel.getAvailableClasses({
      keyword,
      semester_id: currentSemester.id,
    });

    res.json({
      success: true,
      message: `Danh sách môn mở cho ${currentSemester.semester_name} - Năm ${currentSemester.year}`,
      data: classes,
    });
  } catch (error) {
    console.error("Get available classes error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { class_id } = req.body;

    const studentId = await getStudentIdByUserId(userId);
    if (!studentId)
      return res
        .status(404)
        .json({ success: false, message: "Lỗi xác thực sinh viên" });

    const currentSemester = await SemesterModel.getCurrentByDate();
    if (!currentSemester) {
      return res
        .status(400)
        .json({ success: false, message: "Cổng đăng ký đang đóng." });
    }

    const capacityInfo = await ClassModel.getCapacityInfo(class_id);

    // Kiểm tra nếu lớp không tồn tại
    if (!capacityInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Lớp học không tồn tại." });
    }

    // So sánh sĩ số
    if (capacityInfo.current_count >= capacityInfo.max_size) {
      return res.status(400).json({
        success: false,
        message: `Lớp đã đầy (${capacityInfo.current_count}/${capacityInfo.max_size}).`,
      });
    }

    const targetSchedules = await ScheduleModel.getByClassAndSemester(
      class_id,
      currentSemester.id
    );
    if (!targetSchedules || targetSchedules.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Lớp này không mở hoặc chưa có lịch học.",
        });
    }

    const existingEnrollment = await EnrollmentModel.checkEnrollment(
      studentId,
      class_id
    );
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã đăng ký lớp này rồi." });
    }

    const currentStudentSchedules =
      await ScheduleModel.getStudentPersonalSchedule(
        studentId,
        currentSemester.id
      );

    for (const newSlot of targetSchedules) {
      for (const existingSlot of currentStudentSchedules) {
        if (newSlot.day_of_week === existingSlot.day_of_week) {
          if (checkTimeOverlap(newSlot.period, existingSlot.period)) {
            return res.status(400).json({
              success: false,
              message: `Trùng lịch! Bạn đã có môn ${existingSlot.subject_name} vào ${translateDay(existingSlot.day_of_week)} tiết ${existingSlot.period}.`,
            });
          }
        }
      }
    }

    const subjectId = targetSchedules[0].subject_id;
    await EnrollmentModel.create(
      studentId,
      class_id,
      subjectId,
      currentSemester.id
    );

    res.status(201).json({ success: true, message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ success: false, message: "Đăng ký thất bại " + error.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { semester_id } = req.query;

    if (!studentId)
      return res
        .status(404)
        .json({ success: false, message: "Sinh viên không tồn tại" });

    let enrollments;
    if (semester_id) {
      enrollments = await EnrollmentModel.getByStudent(studentId, semester_id);
    } else {
      enrollments = await EnrollmentModel.getDetailedByStudent(studentId);
    }

    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const cancelEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);
    const { id } = req.params;

    const enrollment = await EnrollmentModel.getById(id);
    
    if (!enrollment || enrollment.student_id !== studentId) {
      return res.status(403).json({ success: false, message: "Không có quyền hủy môn này" });
    }

    const currentSemester = await SemesterModel.getCurrentByDate();
    if (!currentSemester || enrollment.semester_id !== currentSemester.id) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể hủy môn học của học kỳ đã kết thúc hoặc chưa bắt đầu." 
      });
    }

    await EnrollmentModel.deleteById(id);
    res.json({ success: true, message: "Hủy đăng ký thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Hủy thất bại" });
  }
};

/* ==========================================================================
   SECTION 4: THỜI KHÓA BIỂU (SCHEDULE)
   ========================================================================== */
export const getSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);

    const { semester_id } = req.query;

    if (!studentId)
      return res
        .status(404)
        .json({ success: false, message: "Sinh viên không tồn tại" });

    let targetSemesterId = semester_id;
    let semesterName = "";

    if (!targetSemesterId) {
      const currentSem = await SemesterModel.getCurrentByDate();

      if (currentSem) {
        targetSemesterId = currentSem.id;
        semesterName = `${currentSem.semester_name} - Năm ${currentSem.year} (Hiện tại)`;
      } else {

      }
    } else {
      const sem = await SemesterModel.getById(targetSemesterId);
      if (sem) semesterName = `${sem.semester_name} - Năm ${sem.year}`;
    }

    if (!targetSemesterId) {
      return res.json({
        success: true,
        message: "Không xác định được học kỳ.",
        data: { schedule: [], semester_info: null },
      });
    }

    const schedule = await ScheduleModel.getStudentPersonalSchedule(
      studentId,
      targetSemesterId
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
      message: `Thời khóa biểu: ${semesterName}`,
      data: {
        schedule,
        semester_id: targetSemesterId,
        semester_name: semesterName,
      },
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

/* ==========================================================================
   SECTION 5: ĐIỂM SỐ (GRADES)
   ========================================================================== */
export const getGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentId = await getStudentIdByUserId(userId);

    if (!studentId) {
      return res
        .status(404)
        .json({ success: false, message: "Sinh viên không tồn tại" });
    }

    // Lấy tham số từ Query String
    const { semester_id, year } = req.query;

    // [GỌI MODEL] Không còn viết SQL loằng ngoằng ở đây nữa
    const grades = await GradeModel.getStudentGrades({
      studentId,
      semesterId: semester_id,
      year,
    });

    // Tính toán GPA (Logic nghiệp vụ vẫn để ở Controller hoặc Utils là hợp lý)
    const gpa = calculateGPA(grades);

    res.json({
      success: true,
      data: {
        grades,
        gpa,
        totalSubjects: grades.length,
      },
    });
  } catch (error) {
    console.error("Get grades error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

/* ==========================================================================
   SECTION 6: THÔNG BÁO (NOTIFICATIONS)
   ========================================================================== */

// GET /api/student/notifications - Lấy thông báo
export const getNotifications = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Lấy thông báo thành công",
      data: {
        notifications: [],
        note: "Chức năng đang phát triển",
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
