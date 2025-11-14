import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  validateLogin,
  validateRegister,
  validateForgot,
  validateReset,
} from "../middlewares/validation.js";

const router = express.Router();

// Auth routes với middleware validation
router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.post("/forgot-password", validateForgot, forgotPassword);
router.patch("/reset-password", validateReset, resetPassword);

export default router;
