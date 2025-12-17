// src/pages/StaffDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import { apiCallJson } from "../utils/api";
import "../styles/dashboard.css";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Forms
  const [newClass, setNewClass] = useState({ class_code: "", class_name: "", course: "" });
  const [bulkGrades, setBulkGrades] = useState(`[
    { "student_id": 1, "subject_id": 1, "semester_id": 1, "process_score": 8, "midterm_score": 7, "final_score": 9 },
    { "student_id": 2, "subject_id": 2, "semester_id": 1, "process_score": 7, "midterm_score": 6, "final_score": 8 }
  ]`);
  const [reportParams, setReportParams] = useState({ class_id: "", subject_id: "", semester_id: "" });
  const [notifyForm, setNotifyForm] = useState({ class_id: "", subject_id: "", title: "", content: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const p = await apiCallJson("/teacher/profile");
        setProfile(p.data || {});
        const c = await apiCallJson("/teacher/classes");
        setClasses(c.data || []);
        const s = await apiCallJson("/teacher/schedule");
        setSchedule(s.data || []);
        const n = await apiCallJson("/teacher/notifications");
        setNotifications(n.data || []);
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
  };

  // ProtectedRoute đã xử lý authentication và authorization
  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bảng điều khiển giảng viên</h1>
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
            <strong>Giảng viên</strong>
          </p>
          <ul>
            <li>
              Quản lý lớp học, soạn thảo tài liệu và giao bài tập trực tuyến.
            </li>
            <li>
              Trao đổi với sinh viên, gửi thông báo và nhắc nhở quan trọng.
            </li>
          </ul>
        </section>

        <section className="dashboard-cards">
          <article className="info-card">
            <h3>Thông tin giảng viên</h3>
            <div className="info-item"><strong>Họ tên</strong><span>{profile?.full_name || user.fullName || user.username}</span></div>
            <div className="info-item"><strong>Email</strong><span>{profile?.email || user.email}</span></div>
            <div className="info-item"><strong>Mã GV</strong><span>{profile?.teacher_code || "Chưa cập nhật"}</span></div>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Cập nhật số điện thoại</label>
              <input type="text" defaultValue={profile?.phone || ""} onBlur={async (e) => {
                try {
                  const r = await apiCallJson("/teacher/profile", { method: "PUT", body: JSON.stringify({ phone: e.target.value }) });
                  setProfile(r.data);
                  setMessage("Cập nhật thành công");
                } catch(err){ setError(err.message); }
              }} />
            </div>
            <button className="btn btn-secondary" onClick={()=>navigate("/staff/profile")}>Quản lý</button>
          </article>

          <article className="info-card">
            <h3>Quản lý lớp học</h3>
            <ul>{classes.map(c => (<li key={c.id}>{c.class_code} - {c.class_name} ({c.course})</li>))}</ul>
            <div className="form-row">
              <input placeholder="Mã lớp" value={newClass.class_code} onChange={(e)=>setNewClass({...newClass, class_code: e.target.value})} />
              <input placeholder="Tên lớp" value={newClass.class_name} onChange={(e)=>setNewClass({...newClass, class_name: e.target.value})} />
              <input placeholder="Khóa" value={newClass.course} onChange={(e)=>setNewClass({...newClass, course: e.target.value})} />
              <button className="btn btn-primary" onClick={async ()=>{
                setMessage(""); setError("");
                try { const r = await apiCallJson("/teacher/classes", { method: "POST", body: JSON.stringify(newClass) }); setMessage(r.message); const c = await apiCallJson("/teacher/classes"); setClasses(c.data||[]); }
                catch(err){ setError(err.message); }
              }}>Tạo lớp</button>
            </div>
            <button className="btn btn-secondary" onClick={()=>navigate("/staff/classes")}>Quản lý</button>
          </article>

          <article className="info-card">
            <h3>Thời khóa biểu cá nhân</h3>
            {schedule.length>0 ? (
              <table className="data-table"><thead><tr><th>Thứ</th><th>Tiết</th><th>Phòng</th><th>Lớp</th><th>Môn</th></tr></thead><tbody>
                {schedule.map((s,i)=>(<tr key={i}><td>{s.day_of_week}</td><td>{s.period}</td><td>{s.room}</td><td>{s.class_name}</td><td>{s.subject_name}</td></tr>))}
              </tbody></table>
            ) : <p>Chưa có lịch dạy.</p>}
            <button className="btn btn-secondary" onClick={()=>navigate("/staff/schedule")}>Xem chi tiết</button>
          </article>

          <article className="info-card">
            <h3>Thông báo</h3>
            <ul>{notifications.map((n,i)=>(<li key={i}><strong>{n.title}</strong> – {n.content}</li>))}</ul>
            <div className="form-row">
              <input placeholder="Lớp ID" value={notifyForm.class_id} onChange={(e)=>setNotifyForm({...notifyForm, class_id: e.target.value})} />
              <input placeholder="Môn ID" value={notifyForm.subject_id} onChange={(e)=>setNotifyForm({...notifyForm, subject_id: e.target.value})} />
              <input placeholder="Tiêu đề" value={notifyForm.title} onChange={(e)=>setNotifyForm({...notifyForm, title: e.target.value})} />
              <input placeholder="Nội dung" value={notifyForm.content} onChange={(e)=>setNotifyForm({...notifyForm, content: e.target.value})} />
              <button className="btn btn-primary" onClick={async ()=>{
                setMessage(""); setError("");
                try { const r = await apiCallJson("/teacher/notifications", { method: "POST", body: JSON.stringify(notifyForm) }); setMessage(r.message); const n = await apiCallJson("/teacher/notifications"); setNotifications(n.data||[]); }
                catch(err){ setError(err.message); }
              }}>Gửi thông báo</button>
            </div>
            <button className="btn btn-secondary" onClick={()=>navigate("/staff/notifications")}>Quản lý</button>
          </article>
        </section>

        <section className="quick-actions">
          <h3>Tác vụ nhanh</h3>
          <div className="action-buttons">
            <div className="info-card" style={{width:"100%"}}>
              <h3>Nhập điểm hàng loạt</h3>
              <textarea rows={6} value={bulkGrades} onChange={(e)=>setBulkGrades(e.target.value)} />
              <button className="btn btn-primary" onClick={async ()=>{
                setMessage(""); setError("");
                try { const r = await apiCallJson("/teacher/grades/bulk", { method: "POST", body: JSON.stringify({ records: JSON.parse(bulkGrades) }) }); setMessage(`${r.message} (Tạo: ${r.data.created}, Cập nhật: ${r.data.updated})`); }
                catch(err){ setError(err.message); }
              }}>Nhập điểm</button>
              <button className="btn btn-secondary" onClick={()=>navigate("/staff/grades-bulk")}>Mở trang</button>
            </div>
            <div className="info-card" style={{width:"100%"}}>
              <h3>Xuất báo cáo điểm</h3>
              <div className="form-row">
                <input placeholder="Class ID" value={reportParams.class_id} onChange={(e)=>setReportParams({...reportParams, class_id: e.target.value})} />
                <input placeholder="Subject ID" value={reportParams.subject_id} onChange={(e)=>setReportParams({...reportParams, subject_id: e.target.value})} />
                <input placeholder="Semester ID" value={reportParams.semester_id} onChange={(e)=>setReportParams({...reportParams, semester_id: e.target.value})} />
                <button className="btn btn-secondary" onClick={async ()=>{
                  setMessage(""); setError("");
                  try { const q = new URLSearchParams({ ...reportParams, format: "json" }).toString(); const r = await apiCallJson(`/teacher/reports/grades?${q}`); setMessage(`Đã lấy ${r.data.length} dòng báo cáo`); }
                  catch(err){ setError(err.message); }
                }}>Xem báo cáo</button>
              </div>
              <button className="btn btn-secondary" onClick={()=>navigate("/staff/reports")}>Mở trang</button>
            </div>
          </div>
          {(message || error) && (<div className={`alert ${error?"alert-error":"alert-success"}`}>{error || message}</div>)}
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
