import express from "express";
import authRoutes from "./authRoutes.js";
import studentRoutes from "./studentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import adminRoutes from "./adminRoutes.js";
import classesRoutes from "./classesRoutes.js";
import coursesRoutes from "./coursesRoutes.js";

const router = express.Router();

// Public routes - không cần authentication
router.use("/auth", authRoutes);

// Protected routes - yêu cầu authentication và phân quyền
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/admin", adminRoutes);

// Resource routes - Classes và Courses API
router.use("/classes", classesRoutes);
router.use("/courses", coursesRoutes);

// Root test
router.get("/", (req, res) => {
  res.json({ message: "API Root - SIMS Backend working!" });
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: "TiDB Connected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
