// src/pages/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import "../styles/dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getUser(); // Sử dụng helper function từ auth.js

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ProtectedRoute đã xử lý authentication và authorization
  if (!user) {
    return <div>Đang tải...</div>;
  }

  const stats = {
    totalStudents: 1250,
    totalStaff: 85,
    totalCourses: 156,
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển quản trị</h1>
        <div className="user-info">
          <span>{user.fullName || user.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="stats-grid">
          <div className="stat-card">
            <h3>Sinh viên</h3>
            <div className="stat-number">{stats.totalStudents}</div>
          </div>
          <div className="stat-card">
            <h3>Giảng viên</h3>
            <div className="stat-number">{stats.totalStaff}</div>
          </div>
          <div className="stat-card">
            <h3>Khóa học</h3>
            <div className="stat-number">{stats.totalCourses}</div>
          </div>
        </section>

        <section className="info-card">
          <h3>Thông tin quản trị viên</h3>
          <div className="info-item">
            <strong>Họ tên</strong>
            <span>{user.fullName || user.username}</span>
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
          <h3>Tác vụ quản trị</h3>
          <div className="admin-actions">
            <button className="action-btn admin-btn">Quản lý người dùng</button>
            <button className="action-btn admin-btn">Quản lý khóa học</button>
            <button className="action-btn admin-btn">Thống kê</button>
            <button className="action-btn admin-btn">Cấu hình</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
