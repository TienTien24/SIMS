import React, { useEffect, useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffClasses() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ class_code: "", class_name: "", course: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try { const r = await apiCallJson("/teacher/classes"); setClasses(r.data || []); } catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/teacher/classes", { method: "POST", body: JSON.stringify(form) }); setMsg(r.message); setForm({ class_code:"", class_name:"", course:"" }); await load(); } catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/teacher/classes/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message); setEditing(null); await load(); } catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/teacher/classes/${id}`, { method: "DELETE" }); setMsg(r.message); await load(); } catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header"><h1>Quản lý lớp học</h1></header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Danh sách lớp</h3>
          {classes.length>0 ? (
            <table className="data-table"><thead><tr><th>Mã lớp</th><th>Tên lớp</th><th>Khóa</th><th>Thao tác</th></tr></thead><tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td>{c.class_code}</td>
                  <td>{c.class_name}</td>
                  <td>{c.course}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setEditing({ ...c })}>Sửa</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={()=>remove(c.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody></table>
          ) : (<p>Chưa có lớp.</p>)}
        </section>
        <section className="info-card">
          <h3>Thêm lớp</h3>
          <div className="form-row">
            <input placeholder="Mã lớp" value={form.class_code} onChange={(e)=>setForm({...form, class_code:e.target.value})} />
            <input placeholder="Tên lớp" value={form.class_name} onChange={(e)=>setForm({...form, class_name:e.target.value})} />
            <input placeholder="Khóa" value={form.course} onChange={(e)=>setForm({...form, course:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={create}>Thêm</button>
        </section>
        {editing && (
          <section className="info-card">
            <h3>Cập nhật lớp</h3>
            <div className="form-row">
              <input placeholder="Mã lớp" value={editing.class_code} onChange={(e)=>setEditing({...editing, class_code:e.target.value})} />
              <input placeholder="Tên lớp" value={editing.class_name} onChange={(e)=>setEditing({...editing, class_name:e.target.value})} />
              <input placeholder="Khóa" value={editing.course} onChange={(e)=>setEditing({...editing, course:e.target.value})} />
            </div>
            <div className="action-buttons" style={{gap:"0.75rem"}}>
              <button className="btn btn-primary" onClick={()=>update(editing.id)}>Cập nhật</button>
              <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Hủy</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
