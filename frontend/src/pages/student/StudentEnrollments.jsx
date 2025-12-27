// src/pages/student/StudentEnrollments.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;
  const style = {
    position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, minWidth: "350px",
    backgroundColor: type === "success" ? "#d4edda" : "#f8d7da",
    color: type === "success" ? "#155724" : "#721c24",
    border: `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
    borderRadius: "50px", padding: "12px 24px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    animation: "fadeInUp 0.3s ease-in-out",
  };
  return (
    <div style={style}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <i className={`fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`} style={{ marginRight: "12px" }}></i>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", marginLeft: "15px" }}>&times;</button>
    </div>
  );
};

const StudentEnrollments = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [enrollments, setEnrollments] = useState([]); 
  const [searchResult, setSearchResult] = useState([]); 
  const [semesterInfo, setSemesterInfo] = useState("Đang tải thông tin..."); 

  const [searchCriteria, setSearchCriteria] = useState({ subject_code: "", subject_name: "" });

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000); // Tăng thời gian hiển thị lên 5s để sinh viên kịp đọc lỗi dài
  };

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await apiCallJson("/student/enrollments");
      setEnrollments(data.data || data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đăng ký:", err);
    }
  }, []);

  const fetchAvailableClasses = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setNotification({ message: "", type: "" });

    try {
      const params = new URLSearchParams();
      const keyword = searchCriteria.subject_code || searchCriteria.subject_name;
      if (keyword) params.append('keyword', keyword);

      const response = await apiCallJson(`/student/classes?${params.toString()}`);
      
      if (response.success === false) {
          setSearchResult([]);
          setSemesterInfo("Cổng đăng ký đang đóng");
          if(e) showNotification(response.message, "error");
          return;
      }

      setSearchResult(response.data || []);

      if (response.message) {
        setSemesterInfo(response.message);
      }

      if (e) {
        if (!response.data || response.data.length === 0) showNotification("Không tìm thấy môn học nào.", "warning");
        else showNotification(`Tìm thấy ${response.data.length} lớp học.`, "success");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Lỗi kết nối server.";
      showNotification(msg, "error");
      setSemesterInfo("Mất kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEnrollments();
      fetchAvailableClasses(); 
    }
  }, []);

  const handleEnroll = async (item) => {
    const isAlreadyEnrolled = enrollments.some(
      (e) => e.subject_code === item.subject_code && e.semester_id === item.semester_id
    );

    if (isAlreadyEnrolled) {
      showNotification(`Bạn đã đăng ký môn ${item.subject_name} rồi!`, "error");
      return;
    }

    if (!window.confirm(`Xác nhận đăng ký môn: ${item.subject_name}?`)) return;

    setLoading(true);
    try {
      const response = await apiCallJson("/student/enrollments", {
        method: "POST",
        body: JSON.stringify({ 
          class_id: item.class_id 
        })
      });
      
      if (response && (response.success || response.id)) {
        showNotification("Đăng ký thành công!", "success");
        await loadEnrollments();
        await fetchAvailableClasses(); 
      } else {
        showNotification(response.message || "Đăng ký thất bại.", "error");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const defaultMsg = err.message || "Lỗi hệ thống.";
      
      showNotification(serverMsg || defaultMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký?")) return;
    setLoading(true);
    try {
      const response = await apiCallJson(`/student/enrollments/${id}`, { method: "DELETE" });

      if (response && (response.success || response.message)) {
          showNotification("Đã hủy đăng ký.", "success");
          loadEnrollments();
          fetchAvailableClasses();
      } else {
          showNotification("Không thể hủy đăng ký.", "error");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      showNotification(serverMsg || "Hủy thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (subjectCode) => enrollments.some((e) => e.subject_code === subjectCode);

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="dashboard-container">
      <ToastNotification message={notification.message} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />

      <header className="dashboard-header">
        <h1>Đăng ký Tín chỉ</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/student")}>Quay lại</button>
      </header>

      <main className="dashboard-main">
        {/* KHỐI 1: DANH SÁCH LỚP MỞ */}
        <section className="dashboard-section">
          <div className="info-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-search"></i> Lớp học đang mở</h3>
              <span className="badge badge-primary" style={{ padding: "8px 15px", backgroundColor: "#007bff", color: "white", borderRadius: "20px" }}>
                <i className="fas fa-calendar-alt"></i> {semesterInfo}
              </span>
            </div>

            <form onSubmit={fetchAvailableClasses} className="form-stack" style={{ marginBottom: "1.5rem" }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã môn học</label>
                  <input type="text" placeholder="VD: IT001" value={searchCriteria.subject_code} onChange={(e) => setSearchCriteria({...searchCriteria, subject_code: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tên môn học</label>
                  <input type="text" placeholder="VD: Lập trình C++" value={searchCriteria.subject_name} onChange={(e) => setSearchCriteria({...searchCriteria, subject_name: e.target.value})} />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                   <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>{loading ? "Đang tìm..." : "Tìm kiếm"}</button>
                </div>
              </div>
            </form>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ width: '100px' }}>Lớp HP</th>
                    <th>Môn học</th>
                    <th style={{ width: '150px' }}>Lịch học</th>
                    <th style={{ textAlign: "center", width: '50px' }}>TC</th>
                    <th>Giảng viên</th>
                    <th style={{ textAlign: "center", width: '80px' }}>Sĩ số</th>
                    <th style={{ width: '100px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.length > 0 ? (
                    searchResult.map((item) => {
                      const enrolled = isEnrolled(item.subject_code);
                      const isFull = item.current_slots >= item.max_slots;
                      return (
                        <tr key={`${item.class_id}-${item.subject_id}`} style={{ backgroundColor: enrolled ? "#f0fff4" : "inherit" }}>
                          <td><strong>{item.class_code}</strong><br /><small>{item.class_name}</small></td>
                          <td>{item.subject_name}<br /><small className="text-muted">({item.subject_code})</small></td>
                          <td>
                              <div><i className="fas fa-clock" style={{color: '#666'}}></i> {item.day_of_week === 'Monday' ? 'Thứ 2' : item.day_of_week === 'Tuesday' ? 'Thứ 3' : item.day_of_week === 'Wednesday' ? 'Thứ 4' : item.day_of_week === 'Thursday' ? 'Thứ 5' : item.day_of_week === 'Friday' ? 'Thứ 6' : item.day_of_week === 'Saturday' ? 'Thứ 7' : 'CN'}</div>
                              <small>Tiết: {item.period} | Phòng: {item.room}</small>
                          </td>
                          <td style={{ textAlign: "center" }}>{item.credits}</td>
                          <td>{item.teacher_name || <span style={{ fontStyle: "italic", color: "#999" }}>Chưa xếp</span>}</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ color: isFull ? "red" : "#28a745", fontWeight: isFull ? "bold" : "normal" }}>
                              {item.current_slots}/{item.max_slots}
                            </span>
                          </td>
                          <td>
                            <button className={`btn btn-sm ${enrolled ? "btn-secondary" : "btn-success"}`} onClick={() => handleEnroll(item)} disabled={loading || (isFull && !enrolled) || enrolled} style={{ width: "100%" }}>
                              {enrolled ? "Đã ĐK" : isFull ? "Đầy" : "Đăng ký"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                         <i className="fas fa-inbox" style={{ fontSize: "2rem", marginBottom: "10px", color: "#ccc" }}></i><br/>
                         {semesterInfo.includes("đóng cổng") ? "Hệ thống đang đóng cổng đăng ký." : "Chưa tìm thấy lớp học phần nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* KHỐI 2: DANH SÁCH ĐÃ ĐĂNG KÝ */}
        <section className="dashboard-section" style={{ marginTop: "2rem" }}>
          <div className="info-card" style={{ borderTop: "4px solid #28a745" }}>
            <h3><i className="fas fa-check-circle"></i> Đã đăng ký</h3>
            {enrollments.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th>Lớp HP</th>
                      <th>Môn học</th>
                      <th style={{ textAlign: "center" }}>TC</th>
                      <th>Học kỳ</th>
                      <th style={{ textAlign: "right" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td><strong>{enrollment.class_name}</strong><br/><small>{enrollment.class_code}</small></td>
                        <td>{enrollment.subject_name}<br /><small>({enrollment.subject_code})</small></td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{enrollment.credits}</td>
                        <td>{enrollment.semester_name} <br /><small>Năm: {enrollment.year}</small></td>
                        <td style={{ textAlign: "right" }}>
                          {enrollment.status === "registered" && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleCancel(enrollment.id)} disabled={loading}><i className="fas fa-times"></i> Hủy</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (<div style={{ padding: "2rem", textAlign: "center", color: "#666" }}><p>Chưa đăng ký môn nào.</p></div>)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentEnrollments;