import Joi from "joi";

// Schema validation cho auth
export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().min(2).required(),
    role: Joi.string().valid("student", "teacher").required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateForgot = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateReset = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Schema validation cho subjects
const subjectSchema = Joi.object({
  subject_code: Joi.string().alphanum().min(3).max(20).messages({
    "string.alphanum": "Mã môn học chỉ được chứa chữ cái và số.",
    "string.empty": "Mã môn học không được để trống.",
  }),
  subject_name: Joi.string().min(2).max(100).messages({
    "string.empty": "Tên môn học không được để trống.",
  }),
  // Rule: Số nguyên, từ 1 đến 10
  credits: Joi.number().integer().min(1).max(10).messages({
    "number.base": "Số tín chỉ phải là một số.",
    "number.min": "Số tín chỉ không hợp lệ (tối thiểu là 1).",
    "number.max": "Số tín chỉ không hợp lệ (tối đa là 10).",
    "number.integer": "Số tín chỉ phải là số nguyên.",
  }),
  teacher_id: Joi.number().integer().positive().allow(null).optional(),
});

// Validate CREATE Subject
export const validateCreateSubject = (req, res, next) => {
  const createSchema = subjectSchema.fork(
    ["subject_code", "subject_name", "credits"], // Các trường bắt buộc
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

// Validate UPDATE Subject
export const validateUpdateSubject = (req, res, next) => {
  const updateSchema = subjectSchema
    .fork(["subject_code", "subject_name", "credits"], (schema) =>
      schema.optional()
    )
    .min(1)
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