import * as SubjectModel from "../models/Subject.js";

// GET /api/subjects - Lấy danh sách môn học
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await SubjectModel.getAll();
    res.json({
      success: true,
      message: "Lấy danh sách môn học thành công",
      data: subjects,
    });
  } catch (error) {
    console.error("Get all subjects error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// GET /api/subjects/:id - Lấy thông tin chi tiết
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await SubjectModel.getById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học với ID này",
      });
    }

    res.json({
      success: true,
      message: "Lấy thông tin môn học thành công",
      data: subject,
    });
  } catch (error) {
    console.error("Get subject by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subjects - Tạo môn học mới
export const createSubject = async (req, res) => {
  try {
    const { subject_code, subject_name, credits, teacher_id } = req.body;

    // Kiểm tra tên môn học đã tồn tại
    const existingName = await SubjectModel.getByName(subject_name);
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `Tên môn học "${subject_name}" đã tồn tại.`,
      });
    }

    const newSubject = await SubjectModel.create(
      subject_code,
      subject_name,
      credits,
      teacher_id
    );

    res.status(201).json({
      success: true,
      message: "Tạo môn học thành công",
      data: newSubject,
    });
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Tạo môn học thất bại",
    });
  }
};

// PUT /api/subjects/:id - Cập nhật môn học
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, subject_name, credits, teacher_id } = req.body;

    const updates = {};
    if (subject_code !== undefined) updates.subject_code = subject_code;
    if (subject_name !== undefined) updates.subject_name = subject_name;
    if (credits !== undefined) updates.credits = credits;
    if (teacher_id !== undefined) updates.teacher_id = teacher_id;

    // Kiểm tra tên trùng khi update
    if (subject_name) {
      const existingName = await SubjectModel.getByName(subject_name);
      if (existingName && existingName.id != id) {
        return res.status(400).json({
          success: false,
          message: `Tên môn học "${subject_name}" đã được sử dụng bởi môn khác.`,
        });
      }
    }

    const updatedSubject = await SubjectModel.update(id, updates);

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học để cập nhật",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật môn học thành công",
      data: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Cập nhật thất bại",
    });
  }
};

// DELETE /api/subjects/:id - Xóa môn học
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await SubjectModel.deleteById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học để xóa",
      });
    }

    res.json({
      success: true,
      message: "Xóa môn học thành công",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Xóa thất bại",
    });
  }
};
