// src/pages/StudentDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import "../styles/dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ProtectedRoute đã xử lý authentication và authorization
  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển sinh viên</h1>
        <div className="user-info">
          <span>{user.fullName || user.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Xin chào, {user.fullName || user.username}!</h2>
          <p>
            Email: <strong>{user.email}</strong> · Vai trò:{" "}
            <strong>Sinh viên</strong>
          </p>
          <ul>
            <li>Theo dõi tiến độ học tập và điểm số theo thời gian thực.</li>
            <li>
              Đăng ký học phần, xem lịch học, lịch thi và thông báo quan trọng.
            </li>
            <li>
              Tra cứu công nợ học phí, cập nhật hồ sơ cá nhân nhanh chóng.
            </li>
          </ul>
        </section>

        <section className="dashboard-cards">
          <article className="feature-card feature-card-profile">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-profile">👤</div>
            <h3>Hồ sơ học tập</h3>
            </div>
            <div className="feature-card-content">
            <div className="info-item">
              <strong>Họ tên</strong>
              <span>{user.fullName || user.username}</span>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>MSSV</strong>
              <span>{user.studentId || "Chưa cập nhật"}</span>
            </div>
            </div>
            <button
              className="feature-card-btn feature-btn-profile"
              onClick={() => navigate("/student/profile")}
            >
              <span>Xem và cập nhật thông tin</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          <article className="feature-card feature-card-grades">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-grades">📊</div>
              <h3>Điểm số và kết quả học tập</h3>
            </div>
            <div className="feature-card-content">
              <p>Xem điểm các môn học, kết quả học tập theo học kỳ và GPA.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-grades"
              onClick={() => navigate("/student/grades")}
            >
              <span>Xem điểm số</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          <article className="feature-card feature-card-enrollments">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-enrollments">📝</div>
              <h3>Đăng ký môn học</h3>
            </div>
            <div className="feature-card-content">
              <ul className="feature-list">
                <li>Đăng ký môn học mới</li>
                <li>Xem danh sách môn đã đăng ký</li>
                <li>Hủy đăng ký môn học</li>
            </ul>
            </div>
            <button
              className="feature-card-btn feature-btn-enrollments"
              onClick={() => navigate("/student/enrollments")}
            >
              <span>Quản lý đăng ký</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          <article className="feature-card feature-card-schedule">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-schedule">📅</div>
              <h3>Lịch học và thời khóa biểu</h3>
            </div>
            <div className="feature-card-content">
              <p>Xem lịch học theo học kỳ, thời khóa biểu cá nhân và phòng học.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-schedule"
              onClick={() => navigate("/student/schedule")}
            >
              <span>Xem lịch học</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>

          <article className="feature-card feature-card-notifications">
            <div className="feature-card-header">
              <div className="feature-card-icon feature-icon-notifications">🔔</div>
              <h3>Thông báo</h3>
            </div>
            <div className="feature-card-content">
              <p>Tra cứu thông báo, hướng dẫn từ giảng viên hoặc quản trị viên.</p>
            </div>
            <button
              className="feature-card-btn feature-btn-notifications"
              onClick={() => navigate("/student/notifications")}
            >
              <span>Xem thông báo</span>
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

export default StudentDashboard;
