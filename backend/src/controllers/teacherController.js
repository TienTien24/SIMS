import { pool } from "../config/db.config.js";
import * as TeacherModel from "../models/Teacher.js";
import * as ScheduleModel from "../models/Schedule.js";
import * as ClassModel from "../models/Class.js";
import * as SubjectModel from "../models/Subject.js";
import * as GradeModel from "../models/Grade.js";
import * as NotificationModel from "../models/Notification.js";

const getTeacherIdByUserId = async (userId) => {
  const [rows] = await pool.execute("SELECT id FROM Teachers WHERE user_id = ?", [userId]);
  return rows[0]?.id;
};

export const getProfile = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    if (!teacherId) return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên" });
    const teacher = await TeacherModel.getById(teacherId);
    res.json({ success: true, message: "Lấy thông tin giảng viên thành công", data: teacher });
  } catch (error) {
    console.error("Teacher getProfile error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    if (!teacherId) return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên" });
    const allowed = ["full_name", "email", "phone", "major_id"];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: "Không có thông tin để cập nhật" });
    const updated = await TeacherModel.update(teacherId, updates);
    res.json({ success: true, message: "Cập nhật thông tin giảng viên thành công", data: updated });
  } catch (error) {
    console.error("Teacher updateProfile error:", error);
    res.status(400).json({ success: false, message: error.message || "Cập nhật thất bại" });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    const { semester_id } = req.query;
    if (!teacherId) return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên" });
    let activeSemesterId = semester_id;
    if (!activeSemesterId) {
      const [rows] = await pool.execute("SELECT id FROM Semesters WHERE is_active = TRUE LIMIT 1");
      activeSemesterId = rows[0]?.id;
    }
    if (!activeSemesterId) return res.status(404).json({ success: false, message: "Không tìm thấy học kỳ" });
    const schedule = await pool.execute(
      `SELECT sch.*, c.class_name, sub.subject_name FROM Schedules sch 
       JOIN Classes c ON sch.class_id = c.id 
       JOIN Subjects sub ON sch.subject_id = sub.id 
       WHERE sch.teacher_id = ? AND sch.semester_id = ? ORDER BY sch.day_of_week, sch.period`,
      [teacherId, activeSemesterId]
    );
    const rows = schedule[0];
    res.json({ success: true, message: "Lấy thời khóa biểu thành công", data: rows });
  } catch (error) {
    console.error("Teacher getSchedule error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const getClasses = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    if (!teacherId) return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên" });
    const [rows] = await pool.execute(
      `SELECT DISTINCT c.* FROM Classes c 
       JOIN Schedules sch ON sch.class_id = c.id 
       WHERE sch.teacher_id = ? ORDER BY c.class_name`,
      [teacherId]
    );
    res.json({ success: true, message: "Lấy danh sách lớp giảng dạy thành công", data: rows });
  } catch (error) {
    console.error("Teacher getClasses error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const createClass = async (req, res) => {
  try {
    const { class_code, class_name, course } = req.body;
    const existing = await ClassModel.getByCode(class_code);
    if (existing) return res.status(400).json({ success: false, message: "Mã lớp đã tồn tại" });
    const newClass = await ClassModel.create(class_code, class_name, course);
    res.status(201).json({ success: true, message: "Tạo lớp học thành công", data: newClass });
  } catch (error) {
    console.error("Teacher createClass error:", error);
    res.status(400).json({ success: false, message: error.message || "Tạo lớp thất bại" });
  }
};

export const bulkEnterGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { records } = req.body; // [{student_id, subject_id, semester_id, process_score, midterm_score, final_score}]
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách điểm không hợp lệ" });
    }
    let created = 0, updated = 0;
    for (const r of records) {
      const existing = await pool.execute(
        `SELECT id FROM Grades WHERE student_id = ? AND subject_id = ? AND semester_id = ?`,
        [r.student_id, r.subject_id, r.semester_id]
      );
      const row = existing[0][0];
      if (!row) {
        const createdGrade = await GradeModel.create(r.student_id, r.subject_id, r.semester_id, userId);
        await GradeModel.update(createdGrade.id, {
          process_score: r.process_score ?? 0,
          midterm_score: r.midterm_score ?? 0,
          final_score: r.final_score ?? 0,
          is_finalized: !!r.is_finalized,
        });
        created++;
      } else {
        await GradeModel.update(row.id, {
          process_score: r.process_score ?? 0,
          midterm_score: r.midterm_score ?? 0,
          final_score: r.final_score ?? 0,
          is_finalized: !!r.is_finalized,
        });
        updated++;
      }
    }
    res.json({ success: true, message: "Nhập điểm hàng loạt thành công", data: { created, updated } });
  } catch (error) {
    console.error("Teacher bulkEnterGrades error:", error);
    res.status(400).json({ success: false, message: error.message || "Nhập điểm thất bại" });
  }
};

export const exportGradesReport = async (req, res) => {
  try {
    const { class_id, subject_id, semester_id, format = "csv" } = req.query;
    const [rows] = await pool.execute(
      `SELECT s.student_code, s.full_name, g.process_score, g.midterm_score, g.final_score, g.average_score 
       FROM Grades g 
       JOIN Students s ON g.student_id = s.id 
       JOIN Enrollments e ON e.student_id = s.id AND e.subject_id = g.subject_id AND e.semester_id = g.semester_id 
       WHERE e.class_id = ? AND g.subject_id = ? AND g.semester_id = ?`,
      [class_id, subject_id, semester_id]
    );
    if (format === "json") {
      return res.json({ success: true, data: rows });
    }
    const header = "MSSV,Họ tên,Quá trình,Giữa kỳ,Cuối kỳ,Trung bình";
    const csv = [header, ...rows.map(r => `${r.student_code},${r.full_name},${r.process_score},${r.midterm_score},${r.final_score},${r.average_score}`)].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=grades_report.csv");
    res.send(csv);
  } catch (error) {
    console.error("Teacher exportGradesReport error:", error);
    res.status(500).json({ success: false, message: "Xuất báo cáo thất bại" });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    const { class_id, subject_id, title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: "Thiếu tiêu đề hoặc nội dung" });
    const created = await NotificationModel.create(teacherId, { class_id, subject_id, title, content });
    res.status(201).json({ success: true, message: "Gửi thông báo thành công", data: created });
  } catch (error) {
    console.error("Teacher sendNotification error:", error);
    res.status(400).json({ success: false, message: error.message || "Gửi thông báo thất bại" });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const teacherId = await getTeacherIdByUserId(req.user.id);
    const list = await NotificationModel.listByTeacher(teacherId);
    res.json({ success: true, message: "Lấy thông báo thành công", data: list });
  } catch (error) {
    console.error("Teacher listNotifications error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

