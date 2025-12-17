import React, { useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffBulkGrades() {
  const [bulk, setBulk] = useState(`[
    { "student_id": 1, "subject_id": 1, "semester_id": 1, "process_score": 8, "midterm_score": 7, "final_score": 9 },
    { "student_id": 2, "subject_id": 2, "semester_id": 1, "process_score": 7, "midterm_score": 6, "final_score": 8 }
  ]`);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/teacher/grades/bulk", { method: "POST", body: JSON.stringify({ records: JSON.parse(bulk) }) }); setMsg(`${r.message} (Tạo: ${r.data.created}, Cập nhật: ${r.data.updated})`); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header"><h1>Nhập điểm hàng loạt</h1></header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <textarea rows={10} value={bulk} onChange={(e)=>setBulk(e.target.value)} />
          <button className="btn btn-primary" onClick={submit}>Nhập điểm</button>
        </section>
      </main>
    </div>
  );
}
