// src/pages/StaffDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import { apiCallJson } from "../utils/api";
import "../styles/dashboard.css";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  
  // Dashboard stats (optional - can be added later)
  const [stats, setStats] = useState({
    classes: 0,
    students: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const p = await apiCallJson("/teacher/profile");
        setProfile(p.data || {});
        
        // Load basic stats if available
        const c = await apiCallJson("/teacher/classes");
        setStats(prev => ({ ...prev, classes: c.data?.length || 0 }));
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    };
    if (user) load();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  const displayName = profile?.full_name || user.fullName || user.username;
  const displayEmail = profile?.email || user.email;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển giảng viên</h1>
        <div className="user-info">
          <span>{displayName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Xin chào, {displayName}!</h2>
          <p>
            Email: <strong>{displayEmail}</strong> · Vai trò:{" "}
            <strong>Giảng viên</strong>
          </p>
          <ul>
            <li>Quản lý lớp học, lịch giảng dạy và nhập điểm sinh viên.</li>
            <li>Gửi thông báo và xuất báo cáo thống kê.</li>
          </ul>
        </section>

        <section className="dashboard-cards">
          {/* 1. Hồ sơ giảng viên */}
          <article className="feature-card feature-card-profile">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-profile">👤</div>
              <h3>Thông tin cá nhân</h3>
            </div>
            <div className="feature-card-content">
              <div className="info-item">
                <strong>Họ tên</strong>
                <span>{displayName}</span>
              </div>
              <div className="info-item">
                <strong>Mã GV</strong>
                <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>
                  {profile?.teacher_code || "Chưa cập nhật"}
                </span>
              </div>
            </div>
            <button
              className="feature-card-btn feature-btn-profile"
              onClick={() => navigate("/staff/profile")}
            >
              <span>Xem và cập nhật</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          {/* 2. Quản lý lớp học */}
          <article className="feature-card feature-card-enrollments">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-enrollments">🏫</div>
              <h3>Quản lý lớp học</h3>
            </div>
            <div className="feature-card-content">
              <p>Đang phụ trách <strong>{stats.classes}</strong> lớp học.</p>
              <ul className="feature-list">
                <li>Tạo lớp học mới</li>
                <li>Quản lý danh sách sinh viên</li>
              </ul>
            </div>
            <button
              className="feature-card-btn feature-btn-enrollments"
              onClick={() => navigate("/staff/classes")}
            >
              <span>Quản lý lớp học</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          {/* 3. Lịch giảng dạy */}
          <article className="feature-card feature-card-schedule">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-schedule">📅</div>
              <h3>Lịch giảng dạy</h3>
            </div>
            <div className="feature-card-content">
              <p>Xem thời khóa biểu giảng dạy theo học kỳ và tuần.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-schedule"
              onClick={() => navigate("/staff/schedule")}
            >
              <span>Xem lịch dạy</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          {/* 4. Nhập điểm */}
          <article className="feature-card feature-card-grades">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-grades">📊</div>
              <h3>Quản lý điểm số</h3>
            </div>
            <div className="feature-card-content">
              <p>Nhập điểm quá trình, giữa kỳ và cuối kỳ cho sinh viên.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-grades"
              onClick={() => navigate("/staff/grades-bulk")}
            >
              <span>Nhập điểm</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          {/* 5. Thông báo */}
          <article className="feature-card feature-card-notifications">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-notifications">🔔</div>
              <h3>Thông báo</h3>
            </div>
            <div className="feature-card-content">
              <p>Gửi thông báo đến sinh viên các lớp học phần.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-notifications"
              onClick={() => navigate("/staff/notifications")}
            >
              <span>Quản lý thông báo</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          {/* 6. Báo cáo */}
          <article className="feature-card" style={{ borderColor: '#718096' }}>
            <div className="feature-card-header">
              <div className="feature-card-icon" style={{ backgroundColor: '#edf2f7', color: '#2d3748' }}>📈</div>
              <h3>Báo cáo & Thống kê</h3>
            </div>
            <div className="feature-card-content">
              <p>Xuất báo cáo điểm và tình hình học tập của sinh viên.</p>
            </div>
            <button
              className="feature-card-btn"
              style={{ backgroundColor: '#4a5568', color: 'white' }}
              onClick={() => navigate("/staff/reports")}
            >
              <span>Xem báo cáo</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
