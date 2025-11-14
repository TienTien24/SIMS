// src/pages/StudentDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "../styles/dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Bảo vệ route
  React.useEffect(() => {
    if (!user || (user.role !== "student" && user.role !== "admin")) {
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
          <article className="info-card">
            <h3>Hồ sơ học tập</h3>
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
