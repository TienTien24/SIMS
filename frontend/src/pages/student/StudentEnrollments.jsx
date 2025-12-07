// src/pages/student/StudentEnrollments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentEnrollments = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrollForm, setEnrollForm] = useState({
    class_id: "",
    subject_id: "",
    semester_id: "",
  });

  useEffect(() => {
    if (!user) return;
    loadEnrollments();
    loadAvailableCourses();
  }, [user]);

  const loadEnrollments = async () => {
    try {
      const data = await apiCallJson("/student/enrollments");
      setEnrollments(data.data || []);
    } catch (err) {
      console.error("Load enrollments error:", err);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      const data = await apiCallJson("/courses");
      setAvailableCourses(data.data || []);
    } catch (err) {
      console.error("Load courses error:", err);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiCallJson("/student/enrollments", {
        method: "POST",
        body: JSON.stringify(enrollForm),
      });
      setSuccess("Đăng ký môn học thành công!");
      setEnrollForm({ class_id: "", subject_id: "", semester_id: "" });
      loadEnrollments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký môn học này?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiCallJson(`/student/enrollments/${id}`, {
        method: "DELETE",
      });
      setSuccess("Hủy đăng ký thành công!");
      loadEnrollments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Hủy đăng ký thất bại");
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
        <h1>Đăng ký môn học</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {(error || success) && (
          <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
            {error || success}
          </div>
        )}

        <section className="dashboard-section">
          {/* Form đăng ký */}
          <div className="info-card" style={{ marginBottom: "2rem" }}>
            <h3>Đăng ký môn học mới</h3>
            <form onSubmit={handleEnroll} className="form-stack">
              <div className="form-row two-columns">
                <div className="form-group">
                  <label className="form-label">Mã lớp</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="1"
                    value={enrollForm.class_id}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, class_id: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Học kỳ ID</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="1"
                    value={enrollForm.semester_id}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, semester_id: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select
                  className="form-control"
                  value={enrollForm.subject_id}
                  onChange={(e) =>
                    setEnrollForm({ ...enrollForm, subject_id: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn môn học</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.subject_code} - {course.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang đăng ký..." : "Đăng ký môn học"}
                </button>
              </div>
            </form>
          </div>

          {/* Danh sách đã đăng ký */}
          <div className="info-card">
            <h3>Môn học đã đăng ký</h3>
            {enrollments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã môn</th>
                    <th>Tên môn học</th>
                    <th>Lớp</th>
                    <th>Học kỳ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.subject_code || "-"}</td>
                      <td>{enrollment.subject_name || "-"}</td>
                      <td>{enrollment.class_name || "-"}</td>
                      <td>{enrollment.semester_name || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            enrollment.status === "registered"
                              ? "badge-success"
                              : enrollment.status === "completed"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {enrollment.status === "registered"
                            ? "Đã đăng ký"
                            : enrollment.status === "completed"
                            ? "Hoàn thành"
                            : "Đã hủy"}
                        </span>
                      </td>
                      <td>
                        <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                          {enrollment.status === "registered" && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancelEnrollment(enrollment.id)}
                              disabled={loading}
                            >
                              Hủy
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => navigate("/student/grades")}
                          >
                            Xem điểm
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => navigate("/student/schedule")}
                          >
                            Xem lịch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Chưa đăng ký môn học nào.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentEnrollments;

