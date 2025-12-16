// src/pages/student/StudentSchedule.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentSchedule = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [year, setYear] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState("");
  const [viewMode, setViewMode] = useState("course");

  useEffect(() => {
    if (!user) return;
    loadSchedule();
  }, [user]);

  const loadSemesters = async () => {
    try {
      const data = await apiCallJson("/semesters");
      setSemesters(data.data || []);
      const uniqYears = Array.from(new Set((data.data || []).map((s) => s.year))).sort((a,b)=>b-a);
      setYears(uniqYears);
      if (!year && uniqYears[0]) setYear(String(uniqYears[0]));
    } catch (err) {
      console.error("Load semesters error:", err);
    }
  };

  useEffect(()=>{ loadSemesters(); },[]);

  useEffect(()=>{
    if (!year) return;
    const sems = semesters.filter((s)=>String(s.year)===String(year));
    // chọn học kỳ đầu tiên
    if (sems.length>0 && !semesterName) setSemesterName(sems[0].semester_name);
    // tính danh sách tuần
    const picked = sems.find((s)=>s.semester_name===semesterName) || sems[0];
    if (picked?.start_date) {
      const start = new Date(picked.start_date);
      const end = picked.end_date ? new Date(picked.end_date) : new Date(start);
      const weeksArr = [];
      let i=1; let cur = new Date(start);
      while (cur <= end) {
        const wStart = new Date(cur);
        const wEnd = new Date(cur); wEnd.setDate(wEnd.getDate()+6);
        weeksArr.push({ n:i, label: `${i} (${wStart.toLocaleDateString()})`, start: wStart, end: wEnd });
        cur.setDate(cur.getDate()+7); i++;
      }
      setWeeks(weeksArr);
      if (!week && weeksArr[0]) setWeek(String(weeksArr[0].n));
    } else {
      setWeeks([]); setWeek("");
    }
  },[year, semesterName, semesters]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (semesterName) params.append("semester_name", semesterName);
      if (week) params.append("week", week);
      if (viewMode) params.append("view", viewMode);
      const data = await apiCallJson(`/student/schedule?${params.toString()}`);
      setSchedule(data.data.schedule || []);
    } catch (err) {
      console.error("Load schedule error:", err);
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
        <h1>Lịch học và thời khóa biểu</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="info-card" style={{ marginBottom: "1rem" }}>
            <div className="form-row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
              <div>
                <label>Năm học</label>
                <select value={year} onChange={(e)=>setYear(e.target.value)}>
                  {years.map((y)=>(<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div>
                <label>Học kỳ</label>
                <select value={semesterName} onChange={(e)=>setSemesterName(e.target.value)}>
                  {semesters.filter(s=>String(s.year)===String(year)).map(s=>(
                    <option key={s.id} value={s.semester_name}>{s.semester_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tuần</label>
                <select value={week} onChange={(e)=>setWeek(e.target.value)}>
                  {weeks.map(w=>(<option key={w.n} value={w.n}>{w.label}</option>))}
                </select>
              </div>
              <div>
                <label>Chế độ</label>
                <select value={viewMode} onChange={(e)=>setViewMode(e.target.value)}>
                  <option value="week">Tuần</option>
                  <option value="course">Học phần</option>
                </select>
              </div>
              <button className="btn btn-secondary" onClick={loadSchedule}>Áp dụng</button>
            </div>
          </div>
          {loading ? (
            <p>Đang tải lịch học...</p>
          ) : schedule.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  {viewMode === "week" ? (
                    <>
                      <th>STT</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Tiết</th>
                      <th>Phòng</th>
                      <th>Giảng viên</th>
                    </>
                  ) : (
                    <>
                      <th>STT</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Số tiết</th>
                      <th>Thông tin</th>
                      <th>Giảng viên</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, idx) => (
                  <tr key={item.id || `${item.subject_id}-${idx}`}>
                    {viewMode === "week" ? (
                      <>
                        <td>{idx + 1}</td>
                        <td>{item.class_code || item.class_id || "-"}</td>
                        <td>{item.subject_name || item.subject_id || "-"}</td>
                        <td>{item.period || "-"}</td>
                        <td>{item.room || "-"}</td>
                        <td>{item.teacher_name || item.teacher_id || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td>{idx + 1}</td>
                        <td>{item.class_code || "-"}</td>
                        <td>{item.subject_name || "-"}</td>
                        <td>{item.periods || 0}</td>
                        <td>{item.room || "-"}</td>
                        <td>{item.teacher_name || "-"}</td>
                        <td>{(() => { const w = weeks.find(x=>String(x.n)===String(week)); return w?.start ? w.start.toLocaleDateString() : "-"; })()}</td>
                        <td>{(() => { const w = weeks.find(x=>String(x.n)===String(week)); return w?.end ? w.end.toLocaleDateString() : "-"; })()}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có lịch học.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentSchedule;
