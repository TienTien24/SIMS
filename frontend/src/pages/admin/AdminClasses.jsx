import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminClasses() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState({ class_code: "", class_name: "", course: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/classes"); setList(r.data || []); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/classes", { method: "POST", body: JSON.stringify(creating) }); setMsg(r.message || "Tạo lớp học thành công"); setCreating({ class_code: "", class_name: "", course: "" }); await load(); }
    catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/classes/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message || "Cập nhật thành công"); setEditing(null); await load(); }
    catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/classes/${id}`, { method: "DELETE" }); setMsg(r.message || "Xóa thành công"); await load(); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Quản lý lớp học</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Thêm lớp học</h3>
          <div className="form-row">
            <input placeholder="Mã lớp" value={creating.class_code} onChange={(e)=>setCreating({...creating, class_code:e.target.value})} />
            <input placeholder="Tên lớp" value={creating.class_name} onChange={(e)=>setCreating({...creating, class_name:e.target.value})} />
            <input placeholder="Khóa" value={creating.course} onChange={(e)=>setCreating({...creating, course:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={create}>Thêm</button>
        </section>

        <section className="info-card">
          <h3>Danh sách lớp học</h3>
          {list.length>0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Mã lớp</th><th>Tên lớp</th><th>Khóa</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{editing?.id===c.id ? (<input value={editing.class_code} onChange={(e)=>setEditing({...editing, class_code:e.target.value})} />) : c.class_code}</td>
                    <td>{editing?.id===c.id ? (<input value={editing.class_name} onChange={(e)=>setEditing({...editing, class_name:e.target.value})} />) : c.class_name}</td>
                    <td>{editing?.id===c.id ? (<input value={editing.course||""} onChange={(e)=>setEditing({...editing, course:e.target.value})} />) : (c.course || "")}</td>
                    <td>
                      {editing?.id===c.id ? (
                        <>
                          <button className="btn btn-primary" onClick={()=>update(c.id)}>Lưu</button>
                          <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary" onClick={()=>setEditing({ id: c.id, class_code: c.class_code, class_name: c.class_name, course: c.course })}>Sửa</button>
                          <button className="btn btn-danger" onClick={()=>remove(c.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Chưa có lớp học.</p>)}
        </section>
      </main>
    </div>
  );
}
