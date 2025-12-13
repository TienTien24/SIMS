import Joi from "joi";

// Schema validation cho classes
const classSchema = Joi.object({
  class_code: Joi.string().alphanum().min(3).max(20).messages({
    "string.alphanum": "Mã lớp học chỉ được chứa chữ cái và số.",
    "string.empty": "Mã lớp học không được để trống.",
    "any.required": "Mã lớp học là bắt buộc.",
  }),
  class_name: Joi.string().min(2).max(100).messages({
    "string.empty": "Tên lớp học không được để trống.",
    "any.required": "Tên lớp học là bắt buộc.",
  }),
  course: Joi.string().max(50).optional().allow(null).messages({
    "string.max": "Khóa học không được vượt quá 50 ký tự.",
  }),
});

// Validate CREATE Class (Yêu cầu các trường chính)
export const validateCreateClass = (req, res, next) => {
  const createSchema = classSchema.fork(
    ["class_code", "class_name"],
    (schema) =>
      schema.required().messages({
        "any.required": "Trường này là bắt buộc.",
      })
  );

  const { error } = createSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }
  next();
};

// Validate UPDATE Class (Yêu cầu ít nhất một trường)
export const validateUpdateClass = (req, res, next) => {
  const updateSchema = classSchema
    .fork(["class_code", "class_name", "course"], (schema) => schema.optional())
    .min(1) // Yêu cầu ít nhất một trường để cập nhật
    .messages({
      "object.min": "Vui lòng cung cấp ít nhất một thông tin để cập nhật.",
    });

  const { error } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }
  next();
};
