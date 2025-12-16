import express from "express";
import { authenticateToken, requireStudentOrAdmin } from "../middlewares/auth.js";
import {
  getProfile,
  updateProfile,
  getGrades,
  getEnrollments,
  enrollCourse,
  cancelEnrollment,
  getSchedule,
  getNotifications,
} from "../controllers/studentController.js";
import {
  validateUpdateProfile,
  validateEnrollment,
} from "../middlewares/studentValidation.js";

const router = express.Router();

// Tất cả routes trong file này yêu cầu authentication và role student (hoặc admin)
router.use(authenticateToken);
router.use(requireStudentOrAdmin);

/**
 * 1. Thông tin cá nhân
 */
router.get("/profile", getProfile);
router.put("/profile", validateUpdateProfile, updateProfile);

/**
 * 2. Điểm số và kết quả học tập
 */
router.get("/grades", getGrades);

/**
 * 3. Đăng ký môn học
 */
router.get("/enrollments", getEnrollments);
router.post("/enrollments", validateEnrollment, enrollCourse);
router.delete("/enrollments/:id", cancelEnrollment);

/**
 * 4. Lịch học và thời khóa biểu
 */
router.get("/schedule", getSchedule);

/**
 * 5. Thông báo
 */
router.get("/notifications", getNotifications);

export default router;

