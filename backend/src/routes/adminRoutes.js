import express from "express";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả routes trong file này yêu cầu authentication và role admin
router.use(authenticateToken);
router.use(requireAdmin);

// Lấy thông tin profile của admin
router.get("/profile", (req, res) => {
  res.json({
    success: true,
    message: "Admin profile endpoint",
    data: {
      user: req.user,
      note: "Chỉ admin mới truy cập được endpoint này",
    },
  });
});

// Quản lý người dùng - Xem danh sách
router.get("/users", (req, res) => {
  res.json({
    success: true,
    message: "Admin users management endpoint",
    data: {
      users: [],
      note: "Danh sách tất cả người dùng (chỉ admin)",
    },
  });
});

// Quản lý người dùng - Tạo mới
router.post("/users", (req, res) => {
  res.json({
    success: true,
    message: "Create user endpoint",
    data: {
      note: "Tạo người dùng mới (chỉ admin)",
    },
  });
});

// Quản lý người dùng - Cập nhật
router.put("/users/:userId", (req, res) => {
  res.json({
    success: true,
    message: "Update user endpoint",
    data: {
      userId: req.params.userId,
      note: "Cập nhật thông tin người dùng (chỉ admin)",
    },
  });
});

// Quản lý người dùng - Xóa
router.delete("/users/:userId", (req, res) => {
  res.json({
    success: true,
    message: "Delete user endpoint",
    data: {
      userId: req.params.userId,
      note: "Xóa người dùng (chỉ admin)",
    },
  });
});

// Thống kê hệ thống
router.get("/stats", (req, res) => {
  res.json({
    success: true,
    message: "System statistics endpoint",
    data: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      note: "Thống kê hệ thống (chỉ admin)",
    },
  });
});

export default router;

