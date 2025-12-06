import React, { useEffect, useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffNotifications() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ class_id: "", subject_id: "", title: "", content: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try { const r = await apiCallJson("/teacher/notifications"); setList(r.data || []); } catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/teacher/notifications", { method: "POST", body: JSON.stringify(form) }); setMsg(r.message); setForm({ class_id:"", subject_id:"", title:"", content:"" }); await load(); } catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/teacher/notifications/${id}`, { method: "DELETE" }); setMsg(r.message); await load(); } catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header"><h1>Thông báo</h1></header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Danh sách</h3>
          {list.length>0 ? (
            <table className="data-table"><thead><tr><th>Tiêu đề</th><th>Nội dung</th><th>Thời gian</th><th>Thao tác</th></tr></thead><tbody>
              {list.map(n => (
                <tr key={n.id}>
                  <td>{n.title}</td>
                  <td>{n.content}</td>
                  <td>{new Date(n.created_at).toLocaleString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>remove(n.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody></table>
          ) : (<p>Chưa có thông báo.</p>)}
        </section>
        <section className="info-card">
          <h3>Gửi thông báo</h3>
          <div className="form-row">
            <input placeholder="Lớp ID" value={form.class_id} onChange={(e)=>setForm({...form, class_id:e.target.value})} />
            <input placeholder="Môn ID" value={form.subject_id} onChange={(e)=>setForm({...form, subject_id:e.target.value})} />
            <input placeholder="Tiêu đề" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />
            <input placeholder="Nội dung" value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={send}>Gửi</button>
        </section>
      </main>
    </div>
  );
}
