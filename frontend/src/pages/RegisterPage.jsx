// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
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
    if (!username.trim()) {
      setError("Vui lòng nhập username.");
      return;
    }
    if (!/^[a-z0-9]{3,}$/i.test(username)) {
      setError("Username phải có ít nhất 3 ký tự chữ cái hoặc số.");
      return;
    }
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

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          email,
          password,
          fullName: fullName.trim(),
          role: role === "student" ? "student" : "teacher",
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 201) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      // === THÀNH CÔNG ===
      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
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
          {/* USERNAME – BẮT BUỘC */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username (bắt buộc)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="testuser (chữ cái/số, min 3 ký tự)"
              minLength="3"
              required
            />
            <small className="form-note">
              Username chỉ chữ cái và số, ít nhất 3 ký tự.
            </small>
          </div>

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
              Nhập: <strong>eb.com</strong> (không phân biệt hoa/thường)
            </small>
          </div>

          {/* NÚT ĐĂNG KÝ */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        {/* FOOTER*/}
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
