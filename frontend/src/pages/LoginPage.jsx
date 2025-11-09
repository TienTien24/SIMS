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
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <img src={logo} alt="Logo" className="logo" />
          <h2>TRƯỜNG ĐẠI HỌC QUY NHƠN</h2>
          <h3>ĐĂNG NHẬP</h3>
        </div>
        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="student">Sinh viên</option>
              <option value="lecturer">Giảng viên</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Email (Tài khoản)"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group captcha-group">
            <input
              type="text"
              placeholder="Nhập mã bảo vệ"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
            />
            <div className="captcha-image">Eb.com</div>
          </div>
          <p className="captcha-note">* Mã bảo vệ phân biệt chữ HOA/chữ thường</p>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/" className="auth-link">Quay lại trang chủ</Link>
          <Link to="/register" className="auth-link">Chưa có tài khoản? Đăng kí</Link>
        </div>
        
        <div className="forgot-password">
          <p>Trường hợp quên mật khẩu:</p>
          <ul>
            <li>- Sinh viên Hệ chính quy: Mang theo thẻ sinh viên liên hệ trực tiếp phòng 101 (Trung tâm Quản lý Hệ thống thông tin)</li>
            <li>- CB-NV/GV: Quý thầy/cô vui lòng liên hệ trực tiếp phòng 101 (Trung tâm Quản lý Hệ thống thông tin)</li>
          </ul>
          <p className="or-separator">--- HOẶC ---</p>
          <p>Sử dụng email đã được Trường cấp gửi yêu cầu hỗ trợ đến địa chỉ email hotro.qnu.edu.vn hoặc truy cập https://hotro.qnu.edu.vn để gửi yêu cầu hỗ trợ.</p>
        </div>
      </div>
    </div>
  );
}