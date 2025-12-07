import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminReports() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalSubjects: 0, averageGpa: null });
  const [params, setParams] = useState({ class_id: "", subject_id: "", semester_id: "" });
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadStats = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/admin/stats"); setStats(r.data || r); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { loadStats(); }, []);

  const fetchReport = async () => {
    setMsg(""); setErr("");
    try { const q = new URLSearchParams({ ...params, format: "json" }).toString(); const r = await apiCallJson(`/teacher/reports/grades?${q}`); setRows(r.data || []); setMsg(`Đã lấy ${r.data?.length || 0} dòng báo cáo`); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Báo cáo và thống kê</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}

        <section className="stats-grid">
          <div className="stat-card"><h3>Sinh viên</h3><div className="stat-number">{stats.totalStudents}</div></div>
          <div className="stat-card"><h3>Giảng viên</h3><div className="stat-number">{stats.totalTeachers}</div></div>
          <div className="stat-card"><h3>Lớp học</h3><div className="stat-number">{stats.totalClasses}</div></div>
          <div className="stat-card"><h3>Môn học</h3><div className="stat-number">{stats.totalSubjects}</div></div>
        </section>

        {stats.averageGpa !== null && (
          <section className="info-card"><h3>Điểm trung bình toàn hệ thống</h3><div style={{fontSize:"2rem",fontWeight:"bold",color:"var(--color-primary)"}}>{Number(stats.averageGpa).toFixed(2)}</div></section>
        )}

        <section className="info-card">
          <h3>Báo cáo điểm theo lớp/môn/kỳ</h3>
          <div className="form-row">
            <input placeholder="Class ID" value={params.class_id} onChange={(e)=>setParams({...params, class_id:e.target.value})} />
            <input placeholder="Subject ID" value={params.subject_id} onChange={(e)=>setParams({...params, subject_id:e.target.value})} />
            <input placeholder="Semester ID" value={params.semester_id} onChange={(e)=>setParams({...params, semester_id:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={fetchReport}>Xem báo cáo</button>
          {rows.length>0 ? (
            <table className="data-table"><thead><tr><th>MSSV</th><th>Họ tên</th><th>Quá trình</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>TB</th></tr></thead><tbody>
              {rows.map((r,i)=>(<tr key={i}><td>{r.student_code}</td><td>{r.full_name}</td><td>{r.process_score}</td><td>{r.midterm_score}</td><td>{r.final_score}</td><td><strong>{r.average_score}</strong></td></tr>))}
            </tbody></table>
          ) : (<p>Chưa có dữ liệu.</p>)}
        </section>
      </main>
    </div>
  );
}
