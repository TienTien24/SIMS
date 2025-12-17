import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [creatingUser, setCreatingUser] = useState({ username: "", email: "", password: "", full_name: "" });
  const [creatingStudent, setCreatingStudent] = useState({ student_code: "", full_name: "", class_id: "", major_id: "", course: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/admin/students"); setList(r.data || []); }
    catch(e){ setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(""); setErr("");
    try {
      const body = { user: creatingUser, student: creatingStudent };
      const r = await apiCallJson("/admin/students", { method: "POST", body: JSON.stringify(body) });
      setMsg(r.message || "Thêm sinh viên thành công");
      setCreatingUser({ username: "", email: "", password: "", full_name: "" });
      setCreatingStudent({ student_code: "", full_name: "", class_id: "", major_id: "", course: "" });
      await load();
    } catch(e){ setErr(e.message); }
  };

  const update = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/students/${id}`, { method: "PUT", body: JSON.stringify(editing) }); setMsg(r.message || "Cập nhật thành công"); setEditing(null); await load(); }
    catch(e){ setErr(e.message); }
  };

  const remove = async (id) => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson(`/admin/students/${id}`, { method: "DELETE" }); setMsg(r.message || "Xóa thành công"); await load(); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Quản lý sinh viên</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>
      </header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <h3>Thêm sinh viên mới</h3>
          <div className="form-stack">
            <h4 style={{margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--color-text-muted)"}}>Thông tin tài khoản</h4>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input className="form-control" placeholder="Tên đăng nhập" value={creatingUser.username} onChange={(e)=>setCreatingUser({...creatingUser, username:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" placeholder="email@qnu.edu.vn" value={creatingUser.email} onChange={(e)=>setCreatingUser({...creatingUser, email:e.target.value})} />
              </div>
            </div>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Họ tên</label>
                <input className="form-control" placeholder="Họ và tên đầy đủ" value={creatingUser.full_name} onChange={(e)=>setCreatingUser({...creatingUser, full_name:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input className="form-control" type="password" placeholder="Mật khẩu" value={creatingUser.password} onChange={(e)=>setCreatingUser({...creatingUser, password:e.target.value})} />
              </div>
            </div>
            <h4 style={{margin: "1.5rem 0 1rem 0", fontSize: "1rem", color: "var(--color-text-muted)"}}>Thông tin sinh viên</h4>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Mã số sinh viên</label>
                <input className="form-control" placeholder="SV001" value={creatingStudent.student_code} onChange={(e)=>setCreatingStudent({...creatingStudent, student_code:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Khóa học</label>
                <input className="form-control" placeholder="K25" value={creatingStudent.course} onChange={(e)=>setCreatingStudent({...creatingStudent, course:e.target.value})} />
              </div>
            </div>
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Lớp ID</label>
                <input className="form-control" type="number" placeholder="1" value={creatingStudent.class_id} onChange={(e)=>setCreatingStudent({...creatingStudent, class_id:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngành ID</label>
                <input className="form-control" type="number" placeholder="1" value={creatingStudent.major_id} onChange={(e)=>setCreatingStudent({...creatingStudent, major_id:e.target.value})} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={create}>Thêm sinh viên</button>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>Danh sách sinh viên</h3>
          {list.length>0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Ngành</th><th>Khóa</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.student_code} onChange={(e)=>setEditing({...editing, student_code:e.target.value})} />) : s.student_code}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.full_name} onChange={(e)=>setEditing({...editing, full_name:e.target.value})} />) : s.full_name}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.class_id||""} onChange={(e)=>setEditing({...editing, class_id:e.target.value})} />) : (s.class_name || s.class_id)}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.major_id||""} onChange={(e)=>setEditing({...editing, major_id:e.target.value})} />) : (s.major_name || s.major_id)}</td>
                    <td>{editing?.id===s.id ? (<input value={editing.course||""} onChange={(e)=>setEditing({...editing, course:e.target.value})} />) : (s.course || "")}</td>
                    <td>
                      {editing?.id===s.id ? (
                        <>
                          <button className="btn btn-primary" onClick={()=>update(s.id)}>Lưu</button>
                          <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary" onClick={()=>setEditing({ id: s.id, student_code: s.student_code, full_name: s.full_name, class_id: s.class_id, major_id: s.major_id, course: s.course })}>Sửa</button>
                          <button className="btn btn-danger" onClick={()=>remove(s.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Chưa có sinh viên.</p>)}
        </section>
      </main>
    </div>
  );
}
