import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalStaff: 85,
    totalCourses: 156,
    recentActivities: [
      { id: 1, action: 'Người dùng mới đăng ký', user: 'Nguyen Van A', time: '2 phút trước' },
      { id: 2, action: 'Cập nhật thông tin', user: 'Tran Thi B', time: '5 phút trước' },
      { id: 3, action: 'Đăng ký học phần', user: 'Le Van C', time: '10 phút trước' }
    ]
  });

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

  // Kiểm tra quyền truy cập - chỉ cho phép admin
  if (user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển quản trị</h1>
        <div className="user-info">
          <span>{user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Xin chào, {user.fullName}</h2>
          <p>
            Đây là khu vực dành cho quản trị viên SIMS. Bạn có thể theo dõi hoạt động hệ thống, vận hành
            nghiệp vụ và hỗ trợ người dùng chỉ với vài thao tác.
          </p>
          <ul>
            <li>Giám sát tình hình đào tạo, tuyển sinh và hoạt động lớp học theo thời gian thực.</li>
            <li>Quản lý tài khoản người dùng và phân quyền cho từng đơn vị.</li>
            <li>Tiếp nhận và xử lý yêu cầu hỗ trợ, cấu hình chính sách hệ thống.</li>
          </ul>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>Sinh viên</h3>
            <div className="stat-number">{stats.totalStudents}</div>
            <p>Tổng số hồ sơ sinh viên đang hoạt động</p>
          </div>
          <div className="stat-card">
            <h3>Giảng viên</h3>
            <div className="stat-number">{stats.totalStaff}</div>
            <p>Giảng viên và CBNV sử dụng hệ thống</p>
          </div>
          <div className="stat-card">
            <h3>Khóa học</h3>
            <div className="stat-number">{stats.totalCourses}</div>
            <p>Chương trình đào tạo được số hóa</p>
          </div>
        </section>

        <section className="info-card">
          <h3>Thông tin quản trị viên</h3>
          <div className="info-item">
            <strong>Họ tên</strong>
            <span>{user.fullName}</span>
          </div>
          <div className="info-item">
            <strong>Email</strong>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <strong>Vai trò</strong>
            <span>Quản trị viên</span>
          </div>
        </section>

        <section className="info-card">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-action">{activity.action}</div>
                <div className="activity-user">{activity.user}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-card">
          <h3>Tác vụ quản trị nhanh</h3>
          <div className="admin-actions">
            <button className="action-btn admin-btn">Quản lý người dùng</button>
            <button className="action-btn admin-btn">Quản lý khóa học</button>
            <button className="action-btn admin-btn">Thống kê báo cáo</button>
            <button className="action-btn admin-btn">Cấu hình hệ thống</button>
            <button className="action-btn admin-btn">Quản lý phân quyền</button>
            <button className="action-btn admin-btn">Giám sát hệ thống</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;