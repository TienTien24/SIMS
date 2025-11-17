// src/controllers/classesController.js
import * as ClassModel from "../models/Class.js";

// GET /api/classes - Lấy danh sách tất cả lớp học
export const getAllClasses = async (req, res) => {
  try {
    const classes = await ClassModel.getAll();
    res.json({
      success: true,
      message: "Lấy danh sách lớp học thành công",
      data: classes,
    });
  } catch (error) {
    console.error("Get all classes error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

// GET /api/classes/:id - Lấy thông tin lớp học theo ID
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await ClassModel.getById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    res.json({
      success: true,
      message: "Lấy thông tin lớp học thành công",
      data: classData,
    });
  } catch (error) {
    console.error("Get class by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

// POST /api/classes - Tạo lớp học mới
export const createClass = async (req, res) => {
  try {
    const { class_code, class_name, course } = req.body;

    // Validation
    if (!class_code || !class_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin (class_code, class_name)",
      });
    }

    const newClass = await ClassModel.create(class_code, class_name, course);

    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Tạo lớp học thất bại",
    });
  }
};

// PUT /api/classes/:id - Cập nhật thông tin lớp học
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_code, class_name, course } = req.body;

    if (!class_code || !class_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    const updatedClass = await ClassModel.update(id, class_code, class_name, course);

    res.json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Cập nhật lớp học thất bại",
    });
  }
};

// DELETE /api/classes/:id - Xóa lớp học
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await ClassModel.deleteById(id);

    res.json({
      success: true,
      message: "Xóa lớp học thành công",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Xóa lớp học thất bại",
    });
  }
};

