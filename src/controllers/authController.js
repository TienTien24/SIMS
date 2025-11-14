import {
  getByEmail,
  verifyPassword,
  generateToken,
  createWithRole,
  requestPasswordReset,
  verifyResetToken,
  resetPassword as resetPasswordModel,
} from "../models/User.js"; // Import model functions (alias resetPasswordModel để tránh conflict)

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await getByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    if (!username || !email || !password || !full_name || !role) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: username, email, password, full_name, role",
        });
    }

    const newUser = await createWithRole(
      username,
      password,
      email,
      full_name,
      role
    );
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Registration successful!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await requestPasswordReset(email);

    res.json({
      message: "Reset link generated (check console for fake email link)",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Reset password controller (không conflict với model function nhờ alias)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const user = await verifyResetToken(token);
    await resetPasswordModel(user.email, newPassword); // Sử dụng alias từ model

    res.json({
      message: "Password reset successful! Please login with new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ error: error.message });
  }
};
