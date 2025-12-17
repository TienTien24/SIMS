import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [creatingUser, setCreatingUser] = useState({ username: "", email: "", password: "", full_name: "" });
  const [creatingTeacher, setCreatingTeacher] = useState({ teacher_code: "", full_name: "", email: "", phone: "", major_id: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/admin/teachers"); setList(r.data || []); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try {
      const body = { user: { ...creatingUser }, teacher: { ...creatingTeacher } };
      const r = await apiCallJson("/admin/teachers", { method: "POST", body: JSON.stringify(body) });
      setMsg(r.message || "Thêm giảng viên thành công");
      setCreatingUser({ username: "", email: "", password: "", full_name: "" });
      setCreatingTeacher({ teacher_code: "", full_name: "", email: "", phone: "", major_id: "" });
      await load();
    } catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/teachers/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message || "Cập nhật thành công"); setEditing(null); await load(); }
    catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/teachers/${id}`, { method: "DELETE" }); setMsg(r.message || "Xóa thành công"); await load(); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Quản lý giảng viên</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Thêm giảng viên mới</h3>
          <div className="form-row">
            <input placeholder="Tên đăng nhập" value={creatingUser.username} onChange={(e)=>setCreatingUser({...creatingUser, username:e.target.value})} />
            <input placeholder="Email user" value={creatingUser.email} onChange={(e)=>setCreatingUser({...creatingUser, email:e.target.value})} />
          </div>
          <div className="form-row">
            <input placeholder="Họ tên user" value={creatingUser.full_name} onChange={(e)=>setCreatingUser({...creatingUser, full_name:e.target.value})} />
            <input type="password" placeholder="Mật khẩu" value={creatingUser.password} onChange={(e)=>setCreatingUser({...creatingUser, password:e.target.value})} />
          </div>
          <div className="form-row">
            <input placeholder="Mã GV" value={creatingTeacher.teacher_code} onChange={(e)=>setCreatingTeacher({...creatingTeacher, teacher_code:e.target.value})} />
            <input placeholder="Họ tên" value={creatingTeacher.full_name} onChange={(e)=>setCreatingTeacher({...creatingTeacher, full_name:e.target.value})} />
            <input placeholder="Email GV" value={creatingTeacher.email} onChange={(e)=>setCreatingTeacher({...creatingTeacher, email:e.target.value})} />
            <input placeholder="SĐT" value={creatingTeacher.phone} onChange={(e)=>setCreatingTeacher({...creatingTeacher, phone:e.target.value})} />
            <input placeholder="Ngành ID" value={creatingTeacher.major_id} onChange={(e)=>setCreatingTeacher({...creatingTeacher, major_id:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={create}>Thêm</button>
        </section>

        <section className="info-card">
          <h3>Danh sách giảng viên</h3>
          {list.length>0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Mã GV</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Ngành</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{editing?.id===t.id ? (<input value={editing.teacher_code} onChange={(e)=>setEditing({...editing, teacher_code:e.target.value})} />) : t.teacher_code}</td>
                    <td>{editing?.id===t.id ? (<input value={editing.full_name} onChange={(e)=>setEditing({...editing, full_name:e.target.value})} />) : t.full_name}</td>
                    <td>{editing?.id===t.id ? (<input value={editing.email||""} onChange={(e)=>setEditing({...editing, email:e.target.value})} />) : (t.email || "")}</td>
                    <td>{editing?.id===t.id ? (<input value={editing.phone||""} onChange={(e)=>setEditing({...editing, phone:e.target.value})} />) : (t.phone || "")}</td>
                    <td>{editing?.id===t.id ? (<input value={editing.major_id||""} onChange={(e)=>setEditing({...editing, major_id:e.target.value})} />) : (t.major_name || t.major_id)}</td>
                    <td>
                      {editing?.id===t.id ? (
                        <>
                          <button className="btn btn-primary" onClick={()=>update(t.id)}>Lưu</button>
                          <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary" onClick={()=>setEditing({ id: t.id, teacher_code: t.teacher_code, full_name: t.full_name, email: t.email, phone: t.phone, major_id: t.major_id })}>Sửa</button>
                          <button className="btn btn-danger" onClick={()=>remove(t.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Chưa có giảng viên.</p>)}
        </section>
      </main>
    </div>
  );
}
