import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminSubjects() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState({ subject_code: "", subject_name: "", credits: "", teacher_id: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/subjects"); setList(r.data || []); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/subjects", { method: "POST", body: JSON.stringify(creating) }); setMsg(r.message || "Tạo môn học thành công"); setCreating({ subject_code: "", subject_name: "", credits: "", teacher_id: "" }); await load(); }
    catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message || "Cập nhật thành công"); setEditing(null); await load(); }
    catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/subjects/${id}`, { method: "DELETE" }); setMsg(r.message || "Xóa thành công"); await load(); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Quản lý môn học</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Thêm môn học</h3>
          <div className="form-row">
            <input placeholder="Mã môn" value={creating.subject_code} onChange={(e)=>setCreating({...creating, subject_code:e.target.value})} />
            <input placeholder="Tên môn" value={creating.subject_name} onChange={(e)=>setCreating({...creating, subject_name:e.target.value})} />
            <input placeholder="Số tín chỉ" value={creating.credits} onChange={(e)=>setCreating({...creating, credits:e.target.value})} />
            <input placeholder="Giảng viên ID" value={creating.teacher_id} onChange={(e)=>setCreating({...creating, teacher_id:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={create}>Thêm</button>
        </section>

        <section className="info-card">
          <h3>Danh sách môn học</h3>
          {list.length>0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th><th>GV</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.subject_code} onChange={(e)=>setEditing({...editing, subject_code:e.target.value})} />) : s.subject_code}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.subject_name} onChange={(e)=>setEditing({...editing, subject_name:e.target.value})} />) : s.subject_name}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.credits||""} onChange={(e)=>setEditing({...editing, credits:e.target.value})} />) : (s.credits || "")}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.teacher_id||""} onChange={(e)=>setEditing({...editing, teacher_id:e.target.value})} />) : (s.teacher_id || "")}</td>
                    <td>
                      {editing?.id===s.id ? (
                        <>
                          <button className="btn btn-primary" onClick={()=>update(s.id)}>Lưu</button>
                          <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary" onClick={()=>setEditing({ id: s.id, subject_code: s.subject_code, subject_name: s.subject_name, credits: s.credits, teacher_id: s.teacher_id })}>Sửa</button>
                          <button className="btn btn-danger" onClick={()=>remove(s.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Chưa có môn học.</p>)}
        </section>
      </main>
    </div>
  );
}
