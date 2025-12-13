// src/pages/student/StudentProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";

// --- COMPONENT THÔNG BÁO ---
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
        <i className={`fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`} style={{ marginRight: "12px", fontSize: "1.3rem" }}></i>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", fontSize: "1.2rem", marginLeft: "15px" }}>&times;</button>
    </div>
  );
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const user = getUser();
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [dateInputType, setDateInputType] = useState("text");

  const [formData, setFormData] = useState({
    student_code: "",
    email: "",
    class_name: "",
    major_name: "",
    full_name: "",
    phone_number: "",
    birth_date: "",
    gender: "other",
    address: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      if (isMounted.current) setToast({ message: "", type: "" });
    }, 3000);
  };

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    isMounted.current = true;
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiCallJson("/student/profile");
        if (isMounted.current && data.data) {
          const profileData = data.data;
          setFormData({
            student_code: profileData.student_code || "",
            email: profileData.email || "",
            class_name: profileData.class_name || "Chưa phân lớp",
            major_name: profileData.major_name || "Chưa phân ngành",
            full_name: profileData.full_name || "",
            phone_number: profileData.phone_number || "",
            birth_date: formatDateForInput(profileData.birth_date),
            gender: profileData.gender || "other",
            address: profileData.address || ""
          });
        }
      } catch (err) {
        console.error("Lỗi tải thông tin:", err);
        if (isMounted.current) showToast("Không thể tải thông tin cá nhân.", "error");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted.current = false; };
  }, [user?.id]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const dataToSend = {};
    const allowedFields = ['full_name', 'birth_date', 'gender', 'address', 'phone_number'];

    allowedFields.forEach(field => {
        const val = formData[field];
        if (val !== undefined && val !== null) {
             const cleanVal = typeof val === 'string' ? val.trim() : val;
             if (cleanVal !== "") {
                 dataToSend[field] = cleanVal;
             }
        }
    });

    if (Object.keys(dataToSend).length === 0) {
        showToast("Bạn chưa thay đổi thông tin nào hợp lệ.", "error");
        setUpdating(false);
        return;
    }

    try {
      const response = await apiCallJson("/student/profile", {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      });

      if (isMounted.current) {
        const updatedData = response.data;
        setFormData(prev => ({
            ...prev,
            full_name: updatedData.full_name || prev.full_name,
            birth_date: formatDateForInput(updatedData.birth_date),
            gender: updatedData.gender || prev.gender,
            address: updatedData.address || prev.address,
            phone_number: updatedData.phone_number || prev.phone_number
        }));
        setDateInputType("text");
        showToast("Cập nhật hồ sơ thành công!", "success");
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      if (isMounted.current) {
          const errorMsg = err.message || "Cập nhật thất bại.";
          showToast(errorMsg, "error");
      }
    } finally {
      if (isMounted.current) setUpdating(false);
    }
  };

  if (!user) return <div className="dashboard-container"><main className="dashboard-main">Vui lòng đăng nhập lại.</main></div>;
  
  if (loading) {
      return (
        <div className="dashboard-container">
            <header className="dashboard-header"><h1>Hồ sơ cá nhân</h1></header>
            <main className="dashboard-main">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3182ce' }}></i>
                    <p style={{ marginTop: '1rem', color: '#718096' }}>Đang tải dữ liệu...</p>
                </div>
            </main>
        </div>
      );
  }

  return (
    <div className="dashboard-container">
      <style>{`
        .modern-profile-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 2rem; margin-top: 1rem; }
        .section-title { font-size: 1.1rem; font-weight: 600; color: #4a5568; margin-bottom: 1.2rem; padding-bottom: 0.5rem; border-bottom: 2px solid #edf2f7; display: flex; align-items: center; }
        .section-title i { margin-right: 8px; color: #a0aec0; }
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        @media (min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } .form-full-width { grid-column: 1 / -1; } }
        .modern-form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748; font-size: 0.95rem; }
        .modern-input, .modern-select, .modern-textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fff; transition: all 0.2s; font-size: 1rem; color: #1a202c; box-sizing: border-box; }
        .modern-input:focus, .modern-select:focus, .modern-textarea:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }
        .modern-textarea { resize: vertical; min-height: 100px; }
        .modern-input.read-only { background-color: #f7fafc; color: #718096; cursor: not-allowed; border-color: #edf2f7; }
        .input-icon-wrapper { position: relative; }
        .input-icon-wrapper i { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #cbd5e0; }
        .btn-modern-primary { background-color: #3182ce; color: white; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; }
        .btn-modern-primary:hover:not(:disabled) { background-color: #2c5282; }
        .btn-modern-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }
      `}</style>
      
      <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />

      <header className="dashboard-header">
        <h1>Hồ sơ cá nhân</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/student")}>Quay lại</button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="modern-profile-card">
            <form onSubmit={handleUpdateProfile}>
              
              <h3 className="section-title"><i className="fas fa-id-card"></i> Thông tin hệ thống (Cố định)</h3>
              <div className="form-grid">
                <div className="modern-form-group">
                  <label>Mã sinh viên</label>
                  <div className="input-icon-wrapper">
                    <input type="text" className="modern-input read-only" value={formData.student_code} readOnly />
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Email đăng nhập</label>
                  <div className="input-icon-wrapper">
                    <input type="text" className="modern-input read-only" value={formData.email} readOnly />
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Lớp sinh hoạt</label>
                  <div className="input-icon-wrapper">
                     <input type="text" className="modern-input read-only" value={formData.class_name} readOnly />
                     <i className="fas fa-lock"></i>
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Chuyên ngành</label>
                  <div className="input-icon-wrapper">
                    <input type="text" className="modern-input read-only" value={formData.major_name} readOnly />
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
              </div>

              <h3 className="section-title" style={{ marginTop: '2rem' }}><i className="fas fa-user-edit"></i> Thông tin cá nhân (Có thể chỉnh sửa)</h3>
              <div className="form-grid">
                <div className="modern-form-group">
                  <label htmlFor="full_name">Họ và tên</label>
                  <input id="full_name" type="text" name="full_name" className="modern-input" value={formData.full_name} onChange={handleInputChange} placeholder="Nhập họ và tên" />
                </div>
                 <div className="modern-form-group">
                  <label htmlFor="phone_number">Số điện thoại</label>
                  <input id="phone_number" type="tel" name="phone_number" className="modern-input" value={formData.phone_number} onChange={handleInputChange} placeholder="Ví dụ: 0901234567" />
                </div>

                <div className="modern-form-group">
                  <label htmlFor="birth_date">Ngày sinh</label>
                  <input 
                    id="birth_date" 

                    type={dateInputType}
                    
                    name="birth_date" 
                    className="modern-input" 

                    value={dateInputType === 'text' 
                        ? formatDateDisplay(formData.birth_date)
                        : formData.birth_date
                    } 
                    
                    onChange={handleInputChange} 

                    onFocus={() => setDateInputType("date")}

                    onBlur={() => {
                        if (formData.birth_date) setDateInputType("text");
                    }}
                    
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <div className="modern-form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select id="gender" name="gender" className="modern-select" value={formData.gender} onChange={handleInputChange}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="modern-form-group form-full-width">
                  <label htmlFor="address">Địa chỉ liên hệ</label>
                  <textarea id="address" name="address" className="modern-textarea" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ chi tiết..." />
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: "1.5rem", borderTop: "1px solid #edf2f7", paddingTop: "1.5rem" }}>
                <button type="submit" className="btn-modern-primary" disabled={updating}>
                  {updating ? (<><i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> Đang lưu...</>) : (<><i className="fas fa-save" style={{ marginRight: "8px" }}></i> Lưu thay đổi</>)}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;