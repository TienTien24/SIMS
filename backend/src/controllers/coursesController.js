// src/controllers/coursesController.js
// Courses = Subjects trong database
import * as SubjectModel from "../models/Subject.js";

// GET /api/courses - Lấy danh sách tất cả môn học
export const getAllCourses = async (req, res) => {
  try {
    const courses = await SubjectModel.getAll();
    res.json({
      success: true,
      message: "Lấy danh sách môn học thành công",
      data: courses,
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

// GET /api/courses/:id - Lấy thông tin môn học theo ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await SubjectModel.getById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học",
      });
    }

    res.json({
      success: true,
      message: "Lấy thông tin môn học thành công",
      data: course,
    });
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

// POST /api/courses - Tạo môn học mới
export const createCourse = async (req, res) => {
  try {
    const { subject_code, subject_name, credits, teacher_id } = req.body;

    // Validation
    if (!subject_code || !subject_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin (subject_code, subject_name)",
      });
    }

    const newCourse = await SubjectModel.create(
      subject_code,
      subject_name,
      credits || 3,
      teacher_id || null
    );

    res.status(201).json({
      success: true,
      message: "Tạo môn học thành công",
      data: newCourse,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Tạo môn học thất bại",
    });
  }
};

// PUT /api/courses/:id - Cập nhật thông tin môn học
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    // Chỉ cập nhật các field được gửi lên
    if (req.body.subject_code) updates.subject_code = req.body.subject_code;
    if (req.body.subject_name) updates.subject_name = req.body.subject_name;
    if (req.body.credits !== undefined) updates.credits = req.body.credits;
    if (req.body.teacher_id !== undefined) updates.teacher_id = req.body.teacher_id;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    const updatedCourse = await SubjectModel.update(id, updates);

    res.json({
      success: true,
      message: "Cập nhật môn học thành công",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Cập nhật môn học thất bại",
    });
  }
};

// DELETE /api/courses/:id - Xóa môn học
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await SubjectModel.deleteById(id);

    res.json({
      success: true,
      message: "Xóa môn học thành công",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Xóa môn học thất bại",
    });
  }
};

