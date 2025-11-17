// src/pages/student/StudentSchedule.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentSchedule = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadSchedule();
  }, [user]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await apiCallJson("/student/schedule");
      setSchedule(data.data.schedule || []);
    } catch (err) {
      console.error("Load schedule error:", err);
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
        <h1>Lịch học và thời khóa biểu</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          {loading ? (
            <p>Đang tải lịch học...</p>
          ) : schedule.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thứ</th>
                  <th>Tiết</th>
                  <th>Môn học</th>
                  <th>Phòng</th>
                  <th>Giảng viên</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item) => (
                  <tr key={item.id}>
                    <td>{item.day_of_week || "-"}</td>
                    <td>{item.period || "-"}</td>
                    <td>{item.subject_name || "-"}</td>
                    <td>{item.room || "-"}</td>
                    <td>{item.teacher_name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có lịch học.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentSchedule;

