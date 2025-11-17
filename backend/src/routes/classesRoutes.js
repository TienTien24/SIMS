import express from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classesController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// GET /api/classes - Lấy danh sách (tất cả role đều xem được)
router.get("/", getAllClasses);

// GET /api/classes/:id - Lấy thông tin chi tiết (tất cả role đều xem được)
router.get("/:id", getClassById);

// POST /api/classes - Tạo mới (chỉ admin)
router.post("/", requireAdmin, createClass);

// PUT /api/classes/:id - Cập nhật (chỉ admin)
router.put("/:id", requireAdmin, updateClass);

// DELETE /api/classes/:id - Xóa (chỉ admin)
router.delete("/:id", requireAdmin, deleteClass);

export default router;

