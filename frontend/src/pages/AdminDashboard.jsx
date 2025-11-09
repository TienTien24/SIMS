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
        <h1>Trang Quản Trị</h1>
        <div className="user-info">
          <span>Xin chào, {user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Chào mừng bạn đến với hệ thống quản trị!</h2>
          <p>Đây là trang dành cho quản trị viên. Bạn có thể:</p>
          <ul>
            <li>Quản lý người dùng và phân quyền</li>
            <li>Quản lý khóa học và học phần</li>
            <li>Xem thống kê và báo cáo</li>
            <li>Cấu hình hệ thống</li>
            <li>Giám sát hoạt động hệ thống</li>
          </ul>
        </div>

        {/* Thống kê */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Sinh viên</h3>
            <div className="stat-number">{stats.totalStudents}</div>
            <p>Tổng số sinh viên</p>
          </div>
          <div className="stat-card">
            <h3>Giảng viên</h3>
            <div className="stat-number">{stats.totalStaff}</div>
            <p>Tổng số giảng viên</p>
          </div>
          <div className="stat-card">
            <h3>Khóa học</h3>
            <div className="stat-number">{stats.totalCourses}</div>
            <p>Tổng số khóa học</p>
          </div>
        </div>
        
        <div className="info-card">
          <h3>Thông tin cá nhân</h3>
          <div className="info-item">
            <strong>Họ tên:</strong> {user.fullName}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="info-item">
            <strong>Vai trò:</strong> Quản trị viên
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="info-card">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            {stats.recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-action">{activity.action}</div>
                <div className="activity-user">{activity.user}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chức năng quản trị */}
        <div className="info-card">
          <h3>Chức năng quản trị</h3>
          <div className="admin-actions">
            <button className="action-btn admin-btn">Quản lý người dùng</button>
            <button className="action-btn admin-btn">Quản lý khóa học</button>
            <button className="action-btn admin-btn">Thống kê báo cáo</button>
            <button className="action-btn admin-btn">Cấu hình hệ thống</button>
            <button className="action-btn admin-btn">Quản lý phân quyền</button>
            <button className="action-btn admin-btn">Giám sát hệ thống</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;