import express from "express";
import authRoutes from "./authRoutes.js";
import studentRoutes from "./studentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import adminRoutes from "./adminRoutes.js";
import classesRoutes from "./classesRoutes.js";
import subjectsRoutes from "./subjectsRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/admin", adminRoutes);

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

export default router;
