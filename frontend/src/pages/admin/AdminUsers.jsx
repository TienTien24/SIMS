import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState({ username: "", email: "", password: "", role: "student", full_name: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/admin/users"); setList(r.data?.users || r.data || []); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/admin/users", { method: "POST", body: JSON.stringify(creating) }); setMsg(r.message || "Tạo người dùng thành công"); setCreating({ username: "", email: "", password: "", role: "student", full_name: "" }); await load(); }
    catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message || "Cập nhật người dùng thành công"); setEditing(null); await load(); }
    catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/users/${id}`, { method: "DELETE" }); setMsg(r.message || "Xóa người dùng thành công"); await load(); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Quản lý người dùng</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Thêm người dùng</h3>
          <div className="form-stack">
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input className="form-control" placeholder="Tên đăng nhập" value={creating.username} onChange={(e)=>setCreating({...creating, username:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" placeholder="email@qnu.edu.vn" value={creating.email} onChange={(e)=>setCreating({...creating, email:e.target.value})} />
              </div>
            </div>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Họ tên</label>
                <input className="form-control" placeholder="Họ và tên đầy đủ" value={creating.full_name} onChange={(e)=>setCreating({...creating, full_name:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input className="form-control" type="password" placeholder="Mật khẩu" value={creating.password} onChange={(e)=>setCreating({...creating, password:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select className="form-control" value={creating.role} onChange={(e)=>setCreating({...creating, role:e.target.value})}>
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={create}>Thêm người dùng</button>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>Danh sách người dùng</h3>
          {list.length>0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username || u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{editing?.id===u.id ? (
                      <select value={editing.role} onChange={(e)=>setEditing({...editing, role:e.target.value})}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : u.role}</td>
                    <td>{editing?.id===u.id ? (
                      <select value={editing.status} onChange={(e)=>setEditing({...editing, status:e.target.value})}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    ) : (u.status || "active")}</td>
                    <td>
                      <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                        {editing?.id===u.id ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={()=>update(u.id)}>Lưu</button>
                            <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={()=>setEditing({ id: u.id, role: u.role, status: u.status||"active" })}>Sửa</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>remove(u.id)}>Xóa</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Chưa có người dùng.</p>)}
        </section>
      </main>
    </div>
  );
}
