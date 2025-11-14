// src/pages/StaffDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "../styles/dashboard.css";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Bảo vệ route
React.useEffect(() => {
  if (
    !user ||
    (user.role !== "teacher" &&
      user.role !== "lecturer" &&
      user.role !== "admin")
  ) {
    logout();
    navigate("/login");
  }
}, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển giảng viên</h1>
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
            <strong>Giảng viên</strong>
          </p>
          <ul>
            <li>
              Quản lý lớp học, soạn thảo tài liệu và giao bài tập trực tuyến.
            </li>
            <li>
              Trao đổi với sinh viên, gửi thông báo và nhắc nhở quan trọng.
            </li>
          </ul>
        </section>

        <section className="dashboard-cards">
          <article className="info-card">
            <h3>Thông tin giảng viên</h3>
            <div className="info-item">
              <strong>Họ tên</strong>
              <span>{user.fullName || user.username}</span>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>Mã GV</strong>
              <span>{user.staffId || "Chưa cập nhật"}</span>
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
            <p>
              Lịch giảng dạy sẽ hiển thị ngay khi được phòng đào tạo xác nhận.
            </p>
          </article>

          <article className="info-card">
            <h3>Thông báo</h3>
            <p>Hiện chưa có thông báo mới. Hãy kiểm tra lại sau.</p>
          </article>
        </section>

        <section className="quick-actions">
          <h3>Tác vụ nhanh</h3>
          <div className="action-buttons">
            <button className="action-btn">Tạoao lớp học mới</button>
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
