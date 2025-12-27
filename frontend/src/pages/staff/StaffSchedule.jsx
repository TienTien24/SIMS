import React, { useEffect, useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Lists for dropdowns
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Form state
  const [form, setForm] = useState({
    class_id: "",
    subject_id: "",
    semester_id: "",
    day_of_week: "Monday",
    period: "1-3",
    room: "Online"
  });

  const loadSchedule = async () => {
    try {
      const r = await apiCallJson("/teacher/schedule");
      setSchedule(r.data || []);
    } catch (e) {
      setErr(e.message);
    }
  };

  const loadLists = async () => {
    try {
      const [cRes, subRes, semRes] = await Promise.all([
        apiCallJson("/classes"),
        apiCallJson("/subjects"),
        apiCallJson("/semesters")
      ]);
      setClasses(cRes.data || []);
      setSubjects(subRes.data || []);
      setSemesters(semRes.data || []);
      
      // Set default semester if active
      const activeSem = semRes.data?.find(s => s.is_active);
      if (activeSem) {
        setForm(prev => ({ ...prev, semester_id: activeSem.id }));
      }
    } catch (e) {
      console.error("Failed to load lists", e);
    }
  };

  useEffect(() => {
    loadSchedule();
    loadLists();
  }, []);

  const handleRegister = async () => {
    setMsg(""); setErr("");
    if (!form.class_id || !form.subject_id || !form.semester_id) {
      setErr("Vui lòng chọn đầy đủ Lớp, Môn và Học kỳ");
      return;
    }

    try {
      const res = await apiCallJson("/teacher/schedule", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMsg(res.message);
      loadSchedule(); // Refresh schedule
      // Optional: Reset form? Keep it for multiple entries?
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Thời khóa biểu giảng dạy</h1>
        <div className="user-info">
           <button className="btn btn-secondary" onClick={() => window.history.back()}>Quay lại</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err ? "alert-error" : "alert-success"}`}>{err || msg}</div>)}
        
        <section className="info-card">
          <h3>Đăng ký lịch dạy (Phân công chuyên môn)</h3>
          <div className="form-stack">
            <div className="form-row three-columns">
              <div className="form-group">
                <label className="form-label">Lớp học</label>
                <select 
                  className="form-control"
                  value={form.class_id} 
                  onChange={(e) => setForm({...form, class_id: e.target.value})}
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_code} - {c.class_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select 
                  className="form-control"
                  value={form.subject_id} 
                  onChange={(e) => setForm({...form, subject_id: e.target.value})}
                >
                  <option value="">-- Chọn môn --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Học kỳ</label>
                <select 
                  className="form-control"
                  value={form.semester_id} 
                  onChange={(e) => setForm({...form, semester_id: e.target.value})}
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.semester_name} ({s.year})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row three-columns">
              <div className="form-group">
                <label className="form-label">Thứ</label>
                <select 
                  className="form-control"
                  value={form.day_of_week} 
                  onChange={(e) => setForm({...form, day_of_week: e.target.value})}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tiết</label>
                <input 
                  className="form-control" 
                  placeholder="VD: 1-3" 
                  value={form.period} 
                  onChange={(e) => setForm({...form, period: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phòng</label>
                <input 
                  className="form-control" 
                  placeholder="VD: A101" 
                  value={form.room} 
                  onChange={(e) => setForm({...form, room: e.target.value})} 
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleRegister}>Đăng ký giảng dạy</button>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>Lịch dạy đã đăng ký</h3>
          {schedule.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thứ</th>
                  <th>Tiết</th>
                  <th>Phòng</th>
                  <th>Lớp</th>
                  <th>Môn</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={i}>
                    <td>{s.day_of_week}</td>
                    <td>{s.period}</td>
                    <td>{s.room}</td>
                    <td>{s.class_name}</td>
                    <td>{s.subject_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có lịch dạy.</p>
          )}
        </section>
      </main>
    </div>
  );
}
