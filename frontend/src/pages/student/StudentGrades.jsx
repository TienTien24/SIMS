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
  const [semesterId, setSemesterId] = useState("");

  useEffect(() => {
    if (!user) return;
    loadGrades();
  }, [user]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const q = semesterId ? `?semester_id=${semesterId}` : "";
      const data = await apiCallJson(`/student/grades${q}`);
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
          <div className="info-card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{margin: "0 0 1rem 0", fontSize: "1.1rem"}}>Lọc và xuất dữ liệu</h3>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Lọc theo học kỳ (ID)</label>
                <input className="form-control" type="number" placeholder="Để trống để xem tất cả" value={semesterId} onChange={(e)=>setSemesterId(e.target.value)} />
              </div>
              <div className="form-group" style={{display: "flex", alignItems: "flex-end", gap: "0.5rem"}}>
                <button className="btn btn-secondary" onClick={loadGrades}>Lọc</button>
                {grades.length > 0 && (
                  <button className="btn btn-primary" onClick={() => {
                    const header = ["Mã môn","Tên môn","Học kỳ","Quá trình","Giữa kỳ","Cuối kỳ","Trung bình"];
                    const lines = grades.map(g => [g.subject_code||"", g.subject_name||"", g.semester_name||"", g.process_score||0, g.midterm_score||0, g.final_score||0, g.average_score||0].join(","));
                    const csv = [header.join(","), ...lines].join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "bang_diem.csv"; a.click(); URL.revokeObjectURL(url);
                  }}>Xuất CSV</button>
                )}
              </div>
            </div>
          </div>
          {typeof gpa === "number" && (
            <div className="info-card" style={{ marginBottom: "2rem", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(96, 165, 250, 0.05))", border: "2px solid rgba(37, 99, 235, 0.2)" }}>
              <h3 style={{margin: "0 0 1rem 0"}}>Điểm trung bình tích lũy (GPA)</h3>
              <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--color-primary)", textAlign: "center", padding: "1rem 0" }}>
                {gpa.toFixed(2)}
              </div>
              <p style={{textAlign: "center", color: "var(--color-text-muted)", margin: "0.5rem 0 0 0"}}>
                {gpa >= 8.0 ? "Xuất sắc" : gpa >= 7.0 ? "Giỏi" : gpa >= 6.0 ? "Khá" : gpa >= 5.0 ? "Trung bình" : "Yếu"}
              </p>
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
                {grades.map((grade, idx) => (
                  <tr key={grade.id || idx}>
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

