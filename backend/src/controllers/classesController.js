// src/controllers/classesController.js
import * as ClassModel from "../models/Class.js";

// GET /api/classes - Lấy danh sách tất cả lớp học HOẶC Tìm kiếm
export const getAllClasses = async (req, res) => {
  try {
    const keyword = req.query.q || req.query.search;
    const course = req.query.course; 
    
    const hasFilters = keyword || course;
    let classes;
    let message;

    if (hasFilters) {
        classes = await ClassModel.search({ keyword, course });
        message = `Tìm thấy ${classes.length} kết quả phù hợp với bộ lọc.`;
    } else {
        classes = await ClassModel.listAll();
        message = "Lấy danh sách tất cả lớp học thành công";
    }

    res.json({
      success: true,
      message: message,
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

    const existingCode = await ClassModel.getByCode(class_code);
    if (existingCode) {
        return res.status(400).json({
            success: false,
            message: `Mã lớp học "${class_code}" đã tồn tại.`,
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

    const updates = {};
    if (class_code !== undefined) updates.class_code = class_code;
    if (class_name !== undefined) updates.class_name = class_name;
    if (course !== undefined) updates.course = course;

    if (class_code) {
        const existingCode = await ClassModel.getByCode(class_code);
        if (existingCode && existingCode.id != id) {
            return res.status(400).json({
                success: false,
                message: `Mã lớp học "${class_code}" đã được sử dụng bởi lớp khác.`,
            });
        }
    }

    const updatedClass = await ClassModel.update(id, updates);

    if (!updatedClass) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy lớp học để cập nhật",
        });
    }

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

