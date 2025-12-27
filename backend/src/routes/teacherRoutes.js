import express from "express";
import { authenticateToken, requireTeacherOrAdmin } from "../middlewares/auth.js";
import {
  getProfile,
  updateProfile,
  getSchedule,
  getClasses,
  createClass,
  registerSchedule,
  bulkEnterGrades,
  exportGradesReport,
  sendNotification,
  listNotifications,
} from "../controllers/teacherController.js";

const router = express.Router();

// Tất cả routes trong file này yêu cầu authentication và role teacher (hoặc admin)
router.use(authenticateToken);
router.use(requireTeacherOrAdmin);

// Lấy thông tin profile của giảng viên
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Xem danh sách lớp học của giảng viên
router.get("/classes", getClasses);
router.post("/classes", createClass);

// Đăng ký lịch dạy
router.post("/schedule", registerSchedule);

// Nhập điểm cho sinh viên
router.post("/grades/bulk", bulkEnterGrades);
router.get("/reports/grades", exportGradesReport);

// Xem danh sách sinh viên trong lớp
router.get("/schedule", getSchedule);
router.post("/notifications", sendNotification);
router.get("/notifications", listNotifications);

export default router;

