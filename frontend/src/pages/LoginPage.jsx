// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import { login } from "../utils/auth";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.successMessage) {
      setError(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Kiểm tra captcha
      if (captcha.toLowerCase() !== "eb.com") {
        setError("Mã bảo vệ không đúng. Vui lòng nhập: eb.com");
        setLoading(false);
        return;
      }

      // 2. Gọi API đăng nhập
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginInput: email, password }),
      });

      const data = await response.json();

      // 3. Xử lý lỗi từ server
      if (!response.ok) {
        throw new Error(
          data.message || "Đăng nhập thất bại. Vui lòng thử lại."
        );
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      // 4. Lưu thông tin đăng nhập
      login(data.data.accessToken, data.data.user);

      // 5. Điều hướng theo role
      const role = data.data.user.role;
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "teacher") {
        navigate("/staff", { replace: true });
      } else if (role === "student") {
        navigate("/student", { replace: true });
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="Logo Đại học Quy Nhơn" className="logo-img" />
          <h2 className="auth-title">Trường Đại học Quy Nhơn</h2>
          <p className="auth-subtitle">Đăng nhập hệ thống SIMS</p>
        </div>

        {/* Thông báo (thành công hoặc lỗi) */}
        {error && (
          <div
            className={`alert ${
              error.includes("thành công") ? "alert-success" : "alert-error"
            }`}
          >
            {error}
          </div>
        )}

        <form className="form-stack" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email hoặc Username (Tài khoản)
            </label>
            <input
              id="email"
              type="text"
              placeholder="Nhập email hoặc username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="captcha" className="form-label">
              Mã bảo vệ
            </label>
            <div className="captcha-group">
              <input
                id="captcha"
                type="text"
                placeholder="Nhập mã bảo vệ"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="form-control"
                required
              />
              <div className="captcha-badge">Eb.com</div>
            </div>
            <small className="form-note">
              Nhập: <strong>eb.com</strong> (không phân biệt hoa/thường)
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/" className="auth-link">
            Quay lại trang chủ
          </Link>
          <Link to="/register" className="auth-link">
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>

        <div className="support-card">
          <p>
            <strong>Quên mật khẩu?</strong>
          </p>
          <ul>
            <li>
              Sinh viên: Mang thẻ sinh viên đến <strong>phòng 101</strong>
            </li>
            <li>Giảng viên: Liên hệ Trung tâm QLHTTT</li>
          </ul>
          <p className="mt-2">
            Gửi email: <a href="mailto:hotro@qnu.edu.vn">hotro@qnu.edu.vn</a>
            <br />
            hoặc truy cập{" "}
            <a href="https://hotro.qnu.edu.vn" target="_blank" rel="noreferrer">
              https://hotro.qnu.edu.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
