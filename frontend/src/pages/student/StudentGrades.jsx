// src/pages/student/StudentGrades.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentGrades = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadGrades();
  }, [user]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await apiCallJson("/student/grades");
      setGrades(data.data.grades || []);
      setGpa(data.data.gpa);
    } catch (err) {
      console.error("Load grades error:", err);
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
        <h1>Điểm số và kết quả học tập</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          {gpa !== null && (
            <div className="info-card" style={{ marginBottom: "2rem" }}>
              <h3>Điểm trung bình (GPA)</h3>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--color-primary)" }}>
                {gpa.toFixed(2)}
              </div>
            </div>
          )}

          {loading ? (
            <p>Đang tải điểm số...</p>
          ) : grades.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Tên môn học</th>
                  <th>Học kỳ</th>
                  <th>Điểm quá trình</th>
                  <th>Điểm giữa kỳ</th>
                  <th>Điểm cuối kỳ</th>
                  <th>Điểm TB</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>{grade.subject_code || "-"}</td>
                    <td>{grade.subject_name || "-"}</td>
                    <td>{grade.semester_name || "-"}</td>
                    <td>{grade.process_score || "0.00"}</td>
                    <td>{grade.midterm_score || "0.00"}</td>
                    <td>{grade.final_score || "0.00"}</td>
                    <td>
                      <strong>{grade.average_score || "0.00"}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có điểm số nào.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentGrades;

