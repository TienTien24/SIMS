import express from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classesController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";
// 👈 Thêm import validation
import {
  validateCreateClass,
  validateUpdateClass,
} from "../middlewares/classValidation.js";

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// GET /api/classes - Lấy danh sách (tất cả role đều xem được)
router.get("/", getAllClasses);

// GET /api/classes/:id - Lấy thông tin chi tiết (tất cả role đều xem được)
router.get("/:id", getClassById);

// POST /api/classes - Tạo mới (chỉ admin)
// 👈 Thêm validateCreateClass
router.post("/", requireAdmin, validateCreateClass, createClass);

// PUT /api/classes/:id - Cập nhật (chỉ admin)
// 👈 Thêm validateUpdateClass
router.put("/:id", requireAdmin, validateUpdateClass, updateClass);

// DELETE /api/classes/:id - Xóa (chỉ admin)
router.delete("/:id", requireAdmin, deleteClass);

export default router;
