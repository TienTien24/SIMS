import express from "express";
import { authenticateToken, requireTeacherOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả routes trong file này yêu cầu authentication và role teacher (hoặc admin)
router.use(authenticateToken);
router.use(requireTeacherOrAdmin);

// Lấy thông tin profile của giảng viên
router.get("/profile", (req, res) => {
  res.json({
    success: true,
    message: "Teacher profile endpoint",
    data: {
      user: req.user,
      note: "Chỉ giảng viên và admin mới truy cập được endpoint này",
    },
  });
});

// Xem danh sách lớp học của giảng viên
router.get("/classes", (req, res) => {
  res.json({
    success: true,
    message: "Teacher classes endpoint",
    data: {
      classes: [],
      note: "Danh sách lớp học của giảng viên",
    },
  });
});

// Nhập điểm cho sinh viên
router.post("/grades", (req, res) => {
  res.json({
    success: true,
    message: "Enter grades endpoint",
    data: {
      note: "Nhập điểm cho sinh viên",
    },
  });
});

// Xem danh sách sinh viên trong lớp
router.get("/classes/:classId/students", (req, res) => {
  res.json({
    success: true,
    message: "Class students endpoint",
    data: {
      classId: req.params.classId,
      students: [],
      note: "Danh sách sinh viên trong lớp",
    },
  });
});

export default router;

