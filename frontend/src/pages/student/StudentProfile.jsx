// src/pages/student/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentProfile = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState({});

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await apiCallJson("/student/profile");
      setProfile(data.data);
      setEditProfile(data.data || {});
    } catch (err) {
      console.error("Load profile error:", err);
      setError("Không thể tải thông tin cá nhân");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiCallJson("/student/profile", {
        method: "PUT",
        body: JSON.stringify(editProfile),
      });
      setProfile(data.data);
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
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
        <h1>Thông tin cá nhân</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <main className="dashboard-main">
        <section className="dashboard-section">
          {profile ? (
            <form onSubmit={handleUpdateProfile} className="form-stack">
              <div className="form-group">
                <label>Mã sinh viên</label>
                <input type="text" value={profile.student_code || ""} disabled />
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={editProfile.full_name || ""}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, full_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile.email || ""} disabled />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={editProfile.birth_date || ""}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, birth_date: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <select
                  value={editProfile.gender || ""}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, gender: e.target.value })
                  }
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  value={editProfile.address || ""}
                  onChange={(e) =>
                    setEditProfile({ ...editProfile, address: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Lớp</label>
                <input type="text" value={profile.class_name || ""} disabled />
              </div>
              <div className="form-group">
                <label>Ngành</label>
                <input type="text" value={profile.major_name || ""} disabled />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/student")}
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <p>Đang tải thông tin...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;

