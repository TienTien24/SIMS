import { pool } from "../config/db.config.js";
import * as UserModel from "../models/User.js";
import * as StudentModel from "../models/Student.js";
import * as TeacherModel from "../models/Teacher.js";

export const listUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll(1000, 0);
    res.json({ success: true, message: "Lấy danh sách người dùng thành công", data: { users } });
  } catch (error) {
    console.error("Admin listUsers error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, full_name } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Thiếu trường bắt buộc" });
    }
    let created;
    if (role === "admin") {
      created = await UserModel.create(username, password, email, role);
    } else if (["student", "teacher"].includes(role)) {
      created = await UserModel.createWithRole(username, password, email, full_name || username, role);
    } else {
      return res.status(400).json({ success: false, message: "Role không hợp lệ" });
    }
    res.status(201).json({ success: true, message: "Tạo người dùng thành công", data: created });
  } catch (error) {
    console.error("Admin createUser error:", error);
    res.status(400).json({ success: false, message: error.message || "Tạo người dùng thất bại" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, status } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    const updated = await UserModel.update(userId, updates);
    res.json({ success: true, message: "Cập nhật người dùng thành công", data: updated });
  } catch (error) {
    console.error("Admin updateUser error:", error);
    res.status(400).json({ success: false, message: error.message || "Cập nhật thất bại" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await UserModel.deleteById(userId);
    res.json({ success: true, message: "Xóa người dùng thành công", data: result });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(400).json({ success: false, message: error.message || "Xóa thất bại" });
  }
};

export const listStudents = async (req, res) => {
  try {
    const rows = await StudentModel.getAll();
    res.json({ success: true, message: "Lấy danh sách sinh viên thành công", data: rows });
  } catch (error) {
    console.error("Admin listStudents error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const createStudent = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { user, student } = req.body;
    if (!user?.username || !user?.email || !user?.password) {
      throw new Error("Thiếu thông tin người dùng");
    }
    const createdUser = await UserModel.create(user.username, user.password, user.email, "student");
    const createdStudent = await StudentModel.create(
      createdUser.id,
      student?.student_code || `SV${Date.now()}`,
      student?.full_name || user?.full_name || user?.username,
      student?.birth_date || null,
      student?.gender || null,
      student?.address || null,
      student?.class_id || null,
      student?.major_id || null,
      student?.course || null
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Thêm sinh viên thành công", data: { user: createdUser, student: createdStudent } });
  } catch (error) {
    await connection.rollback();
    console.error("Admin createStudent error:", error);
    res.status(400).json({ success: false, message: error.message || "Thêm sinh viên thất bại" });
  } finally {
    connection.release();
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StudentModel.update(id, req.body);
    res.json({ success: true, message: "Cập nhật sinh viên thành công", data: updated });
  } catch (error) {
    console.error("Admin updateStudent error:", error);
    res.status(400).json({ success: false, message: error.message || "Cập nhật thất bại" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await StudentModel.deleteById(id);
    res.json({ success: true, message: "Xóa sinh viên thành công", data: result });
  } catch (error) {
    console.error("Admin deleteStudent error:", error);
    res.status(400).json({ success: false, message: error.message || "Xóa thất bại" });
  }
};

export const listTeachers = async (req, res) => {
  try {
    const rows = await TeacherModel.getAll();
    res.json({ success: true, message: "Lấy danh sách giảng viên thành công", data: rows });
  } catch (error) {
    console.error("Admin listTeachers error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const createTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { user, teacher } = req.body;
    if (!user?.username || !user?.email || !user?.password) {
      throw new Error("Thiếu thông tin người dùng");
    }
    const createdUser = await UserModel.create(user.username, user.password, user.email, "teacher");
    const createdTeacher = await TeacherModel.create(
      createdUser.id,
      teacher?.teacher_code || `GV${Date.now()}`,
      teacher?.full_name || user?.full_name || user?.username,
      teacher?.email || null,
      teacher?.phone || null,
      teacher?.major_id || null
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Thêm giảng viên thành công", data: { user: createdUser, teacher: createdTeacher } });
  } catch (error) {
    await connection.rollback();
    console.error("Admin createTeacher error:", error);
    res.status(400).json({ success: false, message: error.message || "Thêm giảng viên thất bại" });
  } finally {
    connection.release();
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await TeacherModel.update(id, req.body);
    res.json({ success: true, message: "Cập nhật giảng viên thành công", data: updated });
  } catch (error) {
    console.error("Admin updateTeacher error:", error);
    res.status(400).json({ success: false, message: error.message || "Cập nhật thất bại" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TeacherModel.deleteById(id);
    res.json({ success: true, message: "Xóa giảng viên thành công", data: result });
  } catch (error) {
    console.error("Admin deleteTeacher error:", error);
    res.status(400).json({ success: false, message: error.message || "Xóa thất bại" });
  }
};

export const getStats = async (req, res) => {
  try {
    const [[students]] = await pool.execute("SELECT COUNT(*) AS total FROM Students");
    const [[teachers]] = await pool.execute("SELECT COUNT(*) AS total FROM Teachers");
    const [[classes]] = await pool.execute("SELECT COUNT(*) AS total FROM Classes");
    const [[subjects]] = await pool.execute("SELECT COUNT(*) AS total FROM Subjects");
    const [[gpa]] = await pool.execute("SELECT AVG(average_score) AS averageGpa FROM Grades");
    res.json({ success: true, message: "Thống kê hệ thống", data: { totalStudents: students.total, totalTeachers: teachers.total, totalClasses: classes.total, totalSubjects: subjects.total, averageGpa: gpa.averageGpa } });
  } catch (error) {
    console.error("Admin getStats error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

