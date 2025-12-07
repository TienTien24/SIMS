// src/controllers/authController.js
import {
  getByEmail,
  verifyPassword,
  generateToken,
  createWithRole,
  requestPasswordReset,
  verifyResetToken,
  resetPassword as resetPasswordModel,
} from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // 2. Tìm user
    const user = await getByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // 3. Kiểm tra mật khẩu
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // 4. Tạo token
    const token = generateToken(user);

    // 5. Trả về chuẩn REST
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name || user.fullName,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Xử lý lỗi database connection
    if (error.message && (error.message.includes("Access denied") || error.message.includes("Database connection"))) {
      return res.status(500).json({
        success: false,
        message: "Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra cấu hình database trong file .env",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // 1. Validation
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // 2. Tạo user
    const newUser = await createWithRole(
      username,
      password,
      email,
      full_name,
      role
    );
    const token = generateToken(newUser);

    // 3. Trả về chuẩn REST
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.full_name || newUser.fullName,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Xử lý lỗi database connection
    if (error.message && error.message.includes("Access denied")) {
      return res.status(500).json({
        success: false,
        message: "Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra cấu hình database trong file .env",
      });
    }
    
    // Xử lý lỗi duplicate entry
    if (error.message && error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã tồn tại. Vui lòng sử dụng thông tin khác.",
      });
    }
    
    // Xử lý các lỗi khác
    res.status(400).json({
      success: false,
      message: error.message || "Đăng ký thất bại. Vui lòng thử lại sau.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    await requestPasswordReset(email);

    res.json({
      success: true,
      message: "Link đặt lại mật khẩu đã được gửi (xem console)",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Gửi yêu cầu thất bại",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token và mật khẩu mới là bắt buộc",
      });
    }

    const user = await verifyResetToken(token);
    await resetPasswordModel(user.email, newPassword);

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Đặt lại mật khẩu thất bại",
    });
  }
};
