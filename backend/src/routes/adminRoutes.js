import express from "express";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStats,
  listRegistrations,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/profile", (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Danh sách đăng ký mới để admin xem
router.get("/registrations", listRegistrations);

router.get("/students", listStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/teachers", listTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

router.get("/stats", getStats);

export default router;

