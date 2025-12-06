import React, { useEffect, useState } from "react";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", teacher_code: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const r = await apiCallJson("/teacher/profile");
        setProfile(r.data || {});
        setForm({
          full_name: r.data?.full_name || "",
          email: r.data?.email || "",
          phone: r.data?.phone || "",
          teacher_code: r.data?.teacher_code || "",
        });
      } catch (e) {
        setErr(e.message);
      }
    };
    load();
  }, []);

  const update = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/teacher/profile", { method: "PUT", body: JSON.stringify(form) }); setProfile(r.data); setMsg(r.message || "Cập nhật thành công"); }
    catch(e){ setErr(e.message); }
  };

  const remove = async () => {
    setMsg(""); setErr("");
    try { const r = await apiCallJson("/teacher/profile", { method: "DELETE" }); setProfile({}); setForm({ full_name:"", email:"", phone:"", teacher_code:"" }); setMsg(r.message || "Đã xóa"); }
    catch(e){ setErr(e.message); }
  };

  const createDefault = async () => {
    setForm({ full_name: "Nguyễn Văn A", email: "teacher@qnu.edu.vn", phone: "0123456789", teacher_code: "GV001" });
    await update();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header"><h1>Thông tin giảng viên</h1></header>
      <main className="dashboard-main">
        {(msg || err) && (<div className={`alert ${err?"alert-error":"alert-success"}`}>{err || msg}</div>)}
        <section className="info-card">
          <div className="info-item"><strong>Họ tên</strong><span>{profile?.full_name || "-"}</span></div>
          <div className="info-item"><strong>Email</strong><span>{profile?.email || "-"}</span></div>
          <div className="info-item"><strong>Mã GV</strong><span>{profile?.teacher_code || "-"}</span></div>
          <div className="info-item"><strong>Điện thoại</strong><span>{profile?.phone || "-"}</span></div>
        </section>
        <section className="info-card">
          <h3>Thêm/Sửa/Xóa/Cập nhật</h3>
          <div className="form-row">
            <input placeholder="Họ tên" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} />
            <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
            <input placeholder="Số điện thoại" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
            <input placeholder="Mã GV" value={form.teacher_code} onChange={(e)=>setForm({...form, teacher_code:e.target.value})} />
          </div>
          <div className="action-buttons" style={{gap:"0.75rem"}}>
            <button className="btn btn-primary" onClick={update}>Cập nhật</button>
            <button className="btn btn-secondary" onClick={createDefault}>Thêm mẫu</button>
            <button className="btn btn-danger" onClick={remove}>Xóa</button>
          </div>
        </section>
      </main>
    </div>
  );
}
