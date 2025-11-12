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
        <h1>Bảng điều khiển giảng viên</h1>
        <div className="user-info">
          <span>{user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Xin chào, {user.fullName}!</h2>
          <p>
            Email: <strong>{user.email}</strong> · Vai trò:{' '}
            <strong>{user.role === 'lecturer' ? 'Giảng viên' : user.role}</strong>
          </p>
          <ul>
            <li>Quản lý danh sách lớp, điểm danh và cập nhật kết quả học tập.</li>
            <li>Lên lịch giảng dạy, soạn thảo tài liệu và giao bài tập trực tuyến.</li>
            <li>Trao đổi với sinh viên, gửi thông báo và nhắc nhở quan trọng.</li>
          </ul>
        </section>

        <section className="dashboard-cards">
          <article className="info-card">
            <h3>Thông tin giảng viên</h3>
            <div className="info-item">
              <strong>Họ tên</strong>
              <span>{user.fullName}</span>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>Mã GV</strong>
              <span>{user.staffId || 'Chưa cập nhật'}</span>
            </div>
          </article>

          <article className="info-card">
            <h3>Quản lý lớp học</h3>
            <ul>
              <li>Danh sách lớp theo kỳ học và chương trình đào tạo.</li>
              <li>Điểm danh tự động, đồng bộ thời gian thực.</li>
              <li>Nhập điểm, theo dõi tiến độ học tập của lớp.</li>
              <li>Thống kê kết quả cuối kỳ và phân tích dữ liệu.</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>Thời khóa biểu cá nhân</h3>
            <p>Lịch giảng dạy sẽ hiển thị ngay khi được phòng đào tạo xác nhận.</p>
          </article>

          <article className="info-card">
            <h3>Thông báo</h3>
            <p>Hiện chưa có thông báo mới. Hãy kiểm tra lại sau.</p>
          </article>
        </section>

        <section className="quick-actions">
          <h3>Tác vụ nhanh</h3>
          <div className="action-buttons">
            <button className="action-btn">Tạo lớp học mới</button>
            <button className="action-btn">Nhập điểm hàng loạt</button>
            <button className="action-btn">Xuất báo cáo</button>
            <button className="action-btn">Gửi thông báo</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;