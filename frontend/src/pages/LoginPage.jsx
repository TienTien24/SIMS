import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const [userType, setUserType] = useState('student');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate captcha (mã bảo vệ đơn giản)
      if (captcha.toLowerCase() !== 'eb.com') {
        setError('Mã bảo vệ không đúng.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Chuyển hướng theo role
        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.data.user.role === 'lecturer') {
          navigate('/staff');
        } else {
          navigate('/student');
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="Logo Quy Nhơn University" />
          <h2 className="auth-title">Trường Đại học Quy Nhơn</h2>
          <p className="auth-subtitle">Đăng nhập hệ thống SIMS</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form className="form-stack" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="userType" className="form-label">
              Loại tài khoản
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="form-control"
            >
              <option value="student">Sinh viên</option>
              <option value="lecturer">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="loginEmail" className="form-label">
              Email (Tài khoản)
            </label>
            <input
              id="loginEmail"
              type="email"
              placeholder="name@example.com"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword" className="form-label">
              Mật khẩu
            </label>
            <input
              id="loginPassword"
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
            <p className="form-note">* Mã bảo vệ có phân biệt chữ hoa/thường.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
          <p>Trường hợp quên mật khẩu:</p>
          <ul>
            <li>Sinh viên hệ chính quy: Mang theo thẻ sinh viên liên hệ phòng 101 (Trung tâm QLHTTT).</li>
            <li>CB-NV/GV: Liên hệ trực tiếp phòng 101 (Trung tâm QLHTTT).</li>
          </ul>
          <div className="support-divider">Hoặc</div>
          <p>
            Gửi yêu cầu hỗ trợ qua email hotro@qnu.edu.vn hoặc truy cập{' '}
            <a href="https://hotro.qnu.edu.vn" target="_blank" rel="noreferrer">
              https://hotro.qnu.edu.vn
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}