import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectsController.js";
import {
  authenticateToken,
  requireAdmin,
  requireTeacherOrAdmin,
} from "../middlewares/auth.js";
import {
  validateCreateSubject,
  validateUpdateSubject,
} from "../middlewares/validation.js";

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// GET /api/subjects
router.get("/", getAllSubjects);

// GET /api/subjects/:id
router.get("/:id", getSubjectById);

// POST /api/subjects
router.post("/", requireTeacherOrAdmin, validateCreateSubject, createSubject);

// PUT /api/subjects/:id
router.put("/:id", requireTeacherOrAdmin, validateUpdateSubject, updateSubject);

// DELETE /api/subjects/:id
router.delete("/:id", requireAdmin, deleteSubject);

export default router;
