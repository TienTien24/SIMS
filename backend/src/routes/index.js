import express from "express";
import authRoutes from "./authRoutes.js";
import studentRoutes from "./studentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import adminRoutes from "./adminRoutes.js";
import { pool } from "../config/db.config.js";
import classesRoutes from "./classesRoutes.js";
import subjectsRoutes from "./subjectsRoutes.js";
import { getAllSubjects } from "../controllers/subjectsController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/admin", adminRoutes);

// Danh sách học kỳ
router.get("/semesters", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, semester_name, year, start_date, end_date, is_active FROM Semesters ORDER BY year DESC, semester_name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải danh sách học kỳ" });
  }
});

// Resource routes
router.use("/classes", classesRoutes);
router.use("/subjects", subjectsRoutes);

router.get("/", (req, res) => {
  res.json({ message: "API Root - SIMS Backend working!" });
});

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: "TiDB Connected",
    timestamp: new Date().toISOString(),
  });
});

// Courses endpoint (dùng cho trang đăng ký môn học của sinh viên)
router.get("/courses", authenticateToken, getAllSubjects);

export default router;
