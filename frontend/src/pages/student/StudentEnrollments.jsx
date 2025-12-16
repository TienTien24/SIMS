// src/pages/student/StudentEnrollments.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const style = {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    minWidth: "350px",
    backgroundColor: type === "success" ? "#d4edda" : "#f8d7da",
    color: type === "success" ? "#155724" : "#721c24",
    border: `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
    borderRadius: "50px",
    padding: "12px 24px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    animation: "fadeInUp 0.3s ease-in-out",
  };

  return (
    <div style={style}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <i className={`fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`} 
           style={{ marginRight: "12px", fontSize: "1.3rem" }}></i>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", fontSize: "1.2rem", marginLeft: "15px" }}
      >
        &times;
      </button>
    </div>
  );
};

const StudentEnrollments = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  // State quản lý dữ liệu
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const [enrollments, setEnrollments] = useState([]); // Danh sách đã đăng ký
  const [searchResult, setSearchResult] = useState([]); // Danh sách lớp mở
  
  // State form tìm kiếm
  const [searchCriteria, setSearchCriteria] = useState({
    subject_code: "",
    subject_name: "",
    semester_id: "",
  });

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await apiCallJson("/student/enrollments");
      setEnrollments(data.data || []);
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
      params.append('type', 'register'); 
      
      const keyword = searchCriteria.subject_code || searchCriteria.subject_name;
      if (keyword) params.append('q', keyword);
      if (searchCriteria.semester_id) params.append('semester_id', searchCriteria.semester_id);

      const response = await apiCallJson(`/classes?${params.toString()}`);
      setSearchResult(response.data || []);

      if (e) {
        if (!response.data || response.data.length === 0) {
          showNotification("Không tìm thấy lớp học phần nào phù hợp.", "error");
        } else {
          showNotification(`Tìm thấy ${response.data.length} lớp học.`, "success");
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("Lỗi kết nối khi tải danh sách lớp.", "error");
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
      await apiCallJson("/student/enrollments", {
        method: "POST",
        body: JSON.stringify({ 
          class_id: item.class_id,
          subject_id: item.subject_id,
          semester_id: item.semester_id
        }),
      });
      
      showNotification("Đăng ký thành công!", "success");

      await loadEnrollments(); 

      setSearchResult(prevResult => 
        prevResult.map(resItem => {
            if (resItem.id === item.id) {
                return {
                    ...resItem,
                    current_slots: resItem.current_slots + 1
                };
            }
            return resItem;
        })
      );
      
    } catch (err) {
      showNotification(err.message || "Đăng ký thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const enrollmentToRemove = enrollments.find(e => e.id === id);

    if (!window.confirm("Bạn có chắc muốn hủy đăng ký?")) return;
    setLoading(true);
    try {
      await apiCallJson(`/student/enrollments/${id}`, { method: "DELETE" });
      showNotification("Đã hủy đăng ký.", "success");

      loadEnrollments();

      if (enrollmentToRemove) {
        setSearchResult(prevResult => 
          prevResult.map(item => {

            if (item.class_id === enrollmentToRemove.class_id && 
                item.subject_id === enrollmentToRemove.subject_id) {
                return {
                    ...item,
                    current_slots: Math.max(0, item.current_slots - 1)
                };
            }
            return item;
          })
        );
      }
    } catch (err) {
      showNotification("Hủy đăng ký thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (subjectCode) => {
      return enrollments.some(e => e.subject_code === subjectCode);
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="dashboard-container">

      <ToastNotification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: "", type: "" })} 
      />

      <header className="dashboard-header">
        <h1>Hệ thống Đăng ký Môn học</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/student")}>
          Quay lại
        </button>
      </header>

      <main className="dashboard-main">
        
        {/* KHỐI 1: TÌM KIẾM & DANH SÁCH LỚP MỞ */}
        <section className="dashboard-section">
          <div className="info-card">
            <h3><i className="fas fa-search"></i> Tìm kiếm & Đăng ký lớp học</h3>
            
            <form onSubmit={fetchAvailableClasses} className="form-stack" style={{ marginBottom: "1.5rem" }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã môn học</label>
                  <input 
                    type="text" 
                    placeholder="VD: IT001"
                    value={searchCriteria.subject_code}
                    onChange={(e) => setSearchCriteria({...searchCriteria, subject_code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Tên môn học</label>
                  <input 
                    type="text" 
                    placeholder="VD: Lập trình C++"
                    value={searchCriteria.subject_name}
                    onChange={(e) => setSearchCriteria({...searchCriteria, subject_name: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Học kỳ <small style={{ fontWeight: 'normal', color: '#666' }}>(1-3)</small></label>
                  <input 
                    type="number" 
                    min="1"
                    max="3"
                    placeholder="Nhập 1, 2 hoặc 3"
                    value={searchCriteria.semester_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 3)) {
                        setSearchCriteria({...searchCriteria, semester_id: val});
                      }
                    }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Đang tìm..." : "Tìm kiếm lớp mở"}
              </button>
            </form>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th>Lớp học phần</th>
                    <th>Môn học</th>
                    <th style={{ textAlign: "center" }}>TC</th>
                    <th>Giảng viên</th>
                    <th style={{ textAlign: "center" }}>Sĩ số</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.length > 0 ? (
                    searchResult.map((item) => {
                      const enrolled = isEnrolled(item.subject_code);
                      const isFull = item.current_slots >= item.max_slots;

                      return (
                        <tr key={item.id} style={{ backgroundColor: enrolled ? "#f0fff4" : "inherit" }}>
                          <td>
                              <strong>{item.class_code}</strong><br/>
                              <small>{item.class_name}</small>
                          </td>
                          <td>
                              {item.subject_name}<br/>
                              <small className="text-muted">({item.subject_code})</small>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.credits}</td>
                          <td>{item.teacher_name || <span style={{ fontStyle: "italic", color: "#999" }}>Chưa xếp GV</span>}</td>
                          <td style={{ textAlign: 'center' }}>
                             <span style={{ 
                                 color: isFull ? 'red' : 'inherit',
                                 fontWeight: isFull ? 'bold' : 'normal'
                             }}>
                                {item.current_slots}/{item.max_slots}
                             </span>
                          </td>
                          <td>
                            <button 
                              className={`btn btn-sm ${enrolled ? 'btn-secondary' : 'btn-success'}`}
                              onClick={() => handleEnroll(item)}
                              disabled={loading || (isFull && !enrolled)}
                            >
                              {enrolled ? 'Đã đăng ký' : (isFull ? 'Lớp đầy' : 'Đăng ký')}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan="6" style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
                       {!loading && "Chưa có dữ liệu lớp học phù hợp."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* KHỐI 2: DANH SÁCH ĐÃ ĐĂNG KÝ */}
        <section className="dashboard-section" style={{ marginTop: "2rem" }}>
          <div className="info-card" style={{ borderTop: "4px solid #28a745" }}>
            <h3><i className="fas fa-check-circle"></i> Danh sách môn học bạn đã đăng ký</h3>
            
            {enrollments.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th>Lớp học phần</th>
                      <th>Môn học</th>
                      <th style={{ textAlign: "center" }}>TC</th>
                      <th>Học kỳ</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: "right" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <strong>{enrollment.class_name}</strong>
                        </td>
                        <td>
                          {enrollment.subject_name} <br/>
                          <small className="text-muted" style={{ color: "#666" }}>
                            ({enrollment.subject_code})
                          </small>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                          {enrollment.credits}
                        </td>
                        <td>
                          {enrollment.semester_name} <br/>
                          <small style={{ color: "#888" }}>Năm: {enrollment.year}</small>
                        </td>
                        <td>
                          <span className={`badge badge-${enrollment.status === 'registered' ? 'success' : 'secondary'}`} 
                                style={{ padding: "5px 10px", borderRadius: "12px", fontSize: "0.85rem" }}>
                            {enrollment.status === 'registered' ? 'Đang học' : 'Hoàn thành'}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {enrollment.status === 'registered' && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancel(enrollment.id)}
                              disabled={loading}
                              title="Hủy đăng ký môn này"
                            >
                              <i className="fas fa-times"></i> Hủy
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#666", fontStyle: "italic" }}>
                 <p>Bạn chưa đăng ký môn học nào trong hệ thống.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default StudentEnrollments;