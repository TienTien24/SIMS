import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/coursesController.js";
import { authenticateToken, requireAdmin, requireTeacherOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// GET /api/courses - Lấy danh sách (tất cả role đều xem được)
router.get("/", getAllCourses);

// GET /api/courses/:id - Lấy thông tin chi tiết (tất cả role đều xem được)
router.get("/:id", getCourseById);

// POST /api/courses - Tạo mới (admin hoặc teacher)
router.post("/", requireTeacherOrAdmin, createCourse);

// PUT /api/courses/:id - Cập nhật (admin hoặc teacher)
router.put("/:id", requireTeacherOrAdmin, updateCourse);

// DELETE /api/courses/:id - Xóa (chỉ admin)
router.delete("/:id", requireAdmin, deleteCourse);

export default router;

