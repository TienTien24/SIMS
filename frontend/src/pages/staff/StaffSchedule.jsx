import React, { useEffect, useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try { const r = await apiCallJson("/teacher/schedule"); setSchedule(r.data || []); }
      catch(e){ setErr(e.message); }
    };
    load();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header"><h1>Thời khóa biểu giảng dạy</h1></header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          {schedule.length>0 ? (
            <table className="data-table"><thead><tr><th>Thứ</th><th>Tiết</th><th>Phòng</th><th>Lớp</th><th>Môn</th></tr></thead><tbody>
              {schedule.map((s,i)=>(<tr key={i}><td>{s.day_of_week}</td><td>{s.period}</td><td>{s.room}</td><td>{s.class_name}</td><td>{s.subject_name}</td></tr>))}
            </tbody></table>
          ) : (<p>Chưa có lịch dạy.</p>)}
        </section>
      </main>
    </div>
  );
}
