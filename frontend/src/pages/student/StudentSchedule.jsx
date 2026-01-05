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
  const [viewMode, setViewMode] = useState("week");

  /* ================= LOAD SEMESTERS ================= */
  useEffect(() => {
    if (user) loadSemesters();
  }, [user]);

  const loadSemesters = async () => {
    try {
      const res = await apiCallJson("/semesters");
      const list = res.data || [];

      setSemesters(list);

      const uniqYears = [...new Set(list.map(s => s.year))].sort((a, b) => b - a);
      setYears(uniqYears);

      if (!year && uniqYears.length > 0) {
        setYear(String(uniqYears[0]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HANDLE WEEKS ================= */
  useEffect(() => {
    if (!year) return;

    const sems = semesters.filter(s => String(s.year) === String(year));
    if (!semesterName && sems.length > 0) {
      setSemesterName(sems[0].semester_name);
    }

    const picked = sems.find(s => s.semester_name === semesterName) || sems[0];
    if (!picked?.start_date) return;

    const start = new Date(picked.start_date);
    const end = new Date(picked.end_date || picked.start_date);

    const arr = [];
    let i = 1;
    let cur = new Date(start);

    while (cur <= end) {
      const wStart = new Date(cur);
      const wEnd = new Date(cur);
      wEnd.setDate(wEnd.getDate() + 6);

      arr.push({
        n: i,
        label: `Tuần ${i} (${wStart.toLocaleDateString()})`,
        start: wStart,
        end: wEnd
      });

      cur.setDate(cur.getDate() + 7);
      i++;
    }

    setWeeks(arr);
    if (!week && arr.length > 0) setWeek(String(arr[0].n));
  }, [year, semesterName, semesters]);

  /* ================= LOAD SCHEDULE ================= */
  useEffect(() => {
    if (year && semesterName && week) loadSchedule();
  }, [year, semesterName, week, viewMode]);

  const loadSchedule = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        student_id: user.id,
        year,
        semester_name: semesterName,
        week,
        view: viewMode
      });

      const res = await apiCallJson(`/student/schedule?${params}`);
      setSchedule(res.data?.schedule || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Lịch học & Thời khóa biểu</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/student")}>
          Quay lại
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
          
          {/* ===== FILTER (GIỐNG ĐĂNG KÝ MÔN) ===== */}
          <div className="info-card">
            <h3>Tra cứu thời khóa biểu</h3>

            <form className="form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label>Năm học</label>
                  <select value={year} onChange={e => setYear(e.target.value)}>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Học kỳ</label>
                  <select value={semesterName} onChange={e => setSemesterName(e.target.value)}>
                    {semesters
                      .filter(s => String(s.year) === String(year))
                      .map(s => (
                        <option key={s.id} value={s.semester_name}>
                          {s.semester_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tuần</label>
                  <select value={week} onChange={e => setWeek(e.target.value)}>
                    {weeks.map(w => (
                      <option key={w.n} value={w.n}>{w.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Chế độ hiển thị</label>
                  <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
                    <option value="week">Theo tuần</option>
                    <option value="course">Theo học phần</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* ===== TABLE ===== */}
          <div className="info-card" style={{ marginTop: "1.5rem" }}>
            {loading ? (
              <p>Đang tải thời khóa biểu...</p>
            ) : schedule.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Thứ</th>
                      <th>Lớp</th>
                      <th>Môn học</th>
                      <th>Tiết</th>
                      <th>Phòng</th>
                      <th>Giảng viên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.day_of_week || "-"}</td>
                        <td>{item.class_code}</td>
                        <td>{item.subject_name}</td>
                        <td>{item.period}</td>
                        <td>{item.room}</td>
                        <td>{item.teacher_name || "Chưa phân công"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                Chưa có lịch học cho lựa chọn này.
              </p>
            )}
          </div>

        </section>
      </main>
    </div>
  );
};

export default StudentSchedule;
