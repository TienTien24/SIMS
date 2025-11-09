import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:4000/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // Nếu token hết hạn hoặc không hợp lệ
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-container">Đang tải...</div>;
  }

  if (!user) {
    return <div className="dashboard-container">Không thể tải thông tin người dùng.</div>;
  }

  // Kiểm tra quyền truy cập - chỉ cho phép lecturer hoặc admin
  if (user.role !== 'lecturer' && user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <div className="user-info">
          <span>Xin chào, {user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Chào mừng bạn đến với trang giảng viên!</h2>
          <p>Email: {user.email}</p>
          <p>Vai trò: {user.role}</p>
        </div>

        <div className="dashboard-cards">
          <div className="info-card">
            <h3>Thông tin cá nhân</h3>
            <p>Họ tên: {user.fullName}</p>
            <p>Email: {user.email}</p>
            <p>Mã giảng viên: {user.staffId || 'Chưa cập nhật'}</p>
          </div>

          <div className="info-card">
            <h3>Quản lý lớp học</h3>
            <ul>
              <li>📋 Xem danh sách lớp</li>
              <li>✅ Điểm danh sinh viên</li>
              <li>📊 Nhập điểm</li>
              <li>📈 Thống kê điểm</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Thời khóa biểu</h3>
            <p>Lịch giảng dạy của bạn sẽ hiển thị ở đây.</p>
          </div>

          <div className="info-card">
            <h3>Thông báo</h3>
            <p>Chưa có thông báo mới.</p>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Chức năng nhanh</h3>
          <div className="action-buttons">
            <button className="action-btn">Tạo lớp học mới</button>
            <button className="action-btn">Nhập điểm hàng loạt</button>
            <button className="action-btn">Xuất báo cáo</button>
            <button className="action-btn">Gửi thông báo</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;