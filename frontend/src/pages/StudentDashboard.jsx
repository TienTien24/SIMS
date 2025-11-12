import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const StudentDashboard = () => {
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

  // Kiểm tra quyền truy cập - chỉ cho phép student hoặc admin
  if (user.role !== 'student' && user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển sinh viên</h1>
        <div className="user-info">
          <span>{user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Xin chào, {user.fullName} 👋</h2>
          <p>
            Email: <strong>{user.email}</strong> · Vai trò hệ thống:{' '}
            <strong>{user.role === 'student' ? 'Sinh viên' : user.role}</strong>
          </p>
          <ul>
            <li>Theo dõi tiến độ học tập và điểm số theo thời gian thực.</li>
            <li>Đăng ký học phần, xem lịch học, lịch thi và thông báo quan trọng.</li>
            <li>Tra cứu công nợ học phí, cập nhật hồ sơ cá nhân nhanh chóng.</li>
          </ul>
        </section>

        <section className="dashboard-cards">
          <article className="info-card">
            <h3>Hồ sơ học tập</h3>
            <div className="info-item">
              <strong>Họ tên</strong>
              <span>{user.fullName}</span>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>MSSV</strong>
              <span>{user.studentId || 'Chưa cập nhật'}</span>
            </div>
          </article>

          <article className="info-card">
            <h3>Tác vụ nổi bật</h3>
            <ul>
              <li>Xem và tải thời khóa biểu cá nhân.</li>
              <li>Đăng ký / hủy học phần trong thời gian cho phép.</li>
              <li>Tra cứu kết quả học tập, điểm rèn luyện.</li>
              <li>Thanh toán học phí và xem lịch sử giao dịch.</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>Thông báo mới nhất</h3>
            <p>Chưa có thông báo nào. Vui lòng kiểm tra lại sau.</p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;