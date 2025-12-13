// src/middlewares/studentValidation.js
import Joi from "joi";

// Validation cho PUT /api/student/profile
export const validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    birth_date: Joi.date().optional().allow(null),
    gender: Joi.string()
      .valid("male", "female", "other")
      .optional()
      .allow(null),
    address: Joi.string().max(255).optional().allow(null),
  })
    .min(1)
    .messages({
      "object.min":
        "Vui lòng cung cấp ít nhất một thông tin để cập nhật hồ sơ.",
    });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }
  next();
};

// Validation cho POST /api/student/enrollments
export const validateEnrollment = (req, res, next) => {
  const schema = Joi.object({
    class_id: Joi.number().integer().positive().required(),
    subject_id: Joi.number().integer().positive().required(),
    semester_id: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }
  next();
};
