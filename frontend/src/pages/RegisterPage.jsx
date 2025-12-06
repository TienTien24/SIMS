// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../utils/api";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // === VALIDATION ===
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!email.endsWith("@qnu.edu.vn")) {
      setError("Email phải thuộc domain @qnu.edu.vn");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (captcha.toLowerCase() !== "eb.com") {
      setError("Mã bảo vệ không đúng. Vui lòng nhập: eb.com");
      return;
    }

    // === TẠO USERNAME TỪ EMAIL ===
    const username = email.split("@")[0].toLowerCase();
    if (!/^[a-z0-9]+$/.test(username)) {
      setError("Email không hợp lệ để tạo username (chỉ chữ cái và số)");
      return;
    }

    setLoading(true);

    try {
      const data = await apiCallJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          full_name: fullName.trim(),
          role: role === "student" ? "student" : "teacher",
        }),
      });

      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { successMessage: "Đăng ký thành công! Vui lòng đăng nhập." },
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* HEADER – GIỐNG HỆT CŨ */}
        <div className="section-header">
          <span className="badge">Tạo tài khoản truy cập</span>
          <h2 className="auth-title">Đăng ký hệ thống SIMS</h2>
          <p className="auth-subtitle">
            Hoàn thành thông tin bên dưới để kích hoạt tài khoản của bạn.
          </p>
        </div>

        {/* THÔNG BÁO */}
        {error && <div className="error-alert">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* FORM */}
        <form className="form-stack" onSubmit={handleSubmit}>
          {/* HỌ VÀ TÊN */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email trường cấp
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="ten@qnu.edu.vn"
              required
            />
            <small className="form-note">
              Username sẽ là:{" "}
              <strong>{email ? email.split("@")[0] : "ten"}</strong>
            </small>
          </div>

          {/* MẬT KHẨU */}
          <div className="form-row two-columns">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Nhập mật khẩu"
                minLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>

          {/* VAI TRÒ */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Vai trò sử dụng
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
            </select>
          </div>

          {/* CAPTCHA */}
          <div className="form-group">
            <label htmlFor="captcha" className="form-label">
              Mã bảo vệ
            </label>
            <div className="captcha-group">
              <input
                id="captcha"
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="form-control"
                placeholder="Nhập mã bảo vệ"
                required
              />
              <div className="captcha-badge">Eb.com</div>
            </div>
            <small className="form-note">
              Nhập: <strong>eb.com</strong>
            </small>
          </div>

          {/* NÚT ĐĂNG KÝ */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        {/* FOOTER – GIỐNG HỆT CŨ */}
        <div className="register-footer">
          <span>Bạn đã có tài khoản?</span>
          <button type="button" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>

        <p className="footer-note">
          Khi đăng ký, bạn đồng ý tuân thủ các quy định sử dụng hệ thống và bảo
          mật dữ liệu của nhà trường.
        </p>
      </div>
    </div>
  );
}
