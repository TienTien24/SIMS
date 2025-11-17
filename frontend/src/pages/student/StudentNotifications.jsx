// src/pages/student/StudentNotifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentNotifications = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiCallJson("/student/notifications");
      setNotifications(data.data.notifications || []);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Thông báo</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          {loading ? (
            <p>Đang tải thông báo...</p>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className="notification-item info-card">
                  <h4>{notif.title}</h4>
                  <p>{notif.content}</p>
                  <small>{notif.created_at}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="info-card">
              <p>Chưa có thông báo nào.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentNotifications;

