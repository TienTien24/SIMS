// src/pages/student/StudentSchedule.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css";

const StudentSchedule = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  // --- STATE ---
  const [groupedSchedule, setGroupedSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allSemesters, setAllSemesters] = useState([]); 

  // --- STATE BỘ LỌC ---
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState(""); 
  const [displayTitle, setDisplayTitle] = useState("Thời khóa biểu");

  const hasInitialized = useRef(false);

  // --- HÀM TIỆN ÍCH ---
  const translateDay = (day) => {
    const map = {
      'Monday': 'Thứ 2', 'Tuesday': 'Thứ 3', 'Wednesday': 'Thứ 4',
      'Thursday': 'Thứ 5', 'Friday': 'Thứ 6', 'Saturday': 'Thứ 7', 'Sunday': 'Chủ Nhật'
    };
    return map[day] || day;
  };

  const groupScheduleByClass = (flatData) => {
    const groups = {};
    flatData.forEach((item) => {
      const key = item.class_code;
      if (!groups[key]) {
        groups[key] = {
          class_code: item.class_code,
          subject_name: item.subject_name,
          subject_code: item.subject_code,
          credits: item.credits,
          teacher_name: item.teacher_name,
          schedules: [] 
        };
      }
      groups[key].schedules.push({
        day_of_week: item.day_of_week,
        period: item.period,
        room: item.room
      });
    });
    return Object.values(groups);
  };

  // --- FETCH DANH SÁCH HỌC KỲ ---
  useEffect(() => {
    const fetchSemesters = async () => {
        if (!user) return;
        try {
            const res = await apiCallJson("/student/semesters");
            if (res.success && res.data) {
                setAllSemesters(res.data);
                
                // Logic tự động chọn kỳ hiện tại (Chạy 1 lần duy nhất)
                if (!hasInitialized.current) {
                    const activeSem = res.data.find(s => s.is_active) || res.data[0];
                    if (activeSem) {
                        setSelectedYear(activeSem.year);
                        setSelectedSemesterId(activeSem.id);
                    }
                    hasInitialized.current = true;
                }
            }
        } catch (err) {
            console.error("Lỗi tải danh sách kỳ:", err);
        }
    };
    fetchSemesters();
  }, [user]);

  // --- LOGIC BỘ LỌC ---
  const uniqueYears = useMemo(() => {
    const years = [...new Set(allSemesters.map(s => s.year))];
    return years.sort((a, b) => b - a);
  }, [allSemesters]);

  const filteredSemesters = useMemo(() => {
    if (!selectedYear) return [];
    return allSemesters
        .filter(s => s.year === parseInt(selectedYear))
        .sort((a, b) => a.semester_name.localeCompare(b.semester_name));
  }, [allSemesters, selectedYear]);

  // --- FETCH LỊCH HỌC ---
  useEffect(() => {
    const loadSchedule = async () => {
        if (!selectedSemesterId) return;

        setLoading(true);
        setGroupedSchedule([]); 

        try {
            const endpoint = `/student/schedule?semester_id=${selectedSemesterId}`;
            const response = await apiCallJson(endpoint);
            
            if (response && response.success) {
                const rawSchedule = response.data.schedule || [];
                const grouped = groupScheduleByClass(rawSchedule);
                setGroupedSchedule(grouped);

                if (response.data.semester_name) {
                    setDisplayTitle(response.data.semester_name);
                }
            }
        } catch (err) {
            console.error("Lỗi tải lịch:", err);
        } finally {
            setLoading(false);
        }
    };

    loadSchedule();
  }, [selectedSemesterId]);

  const handleYearChange = (e) => {
      const year = parseInt(e.target.value);
      setSelectedYear(year);
      
      const firstSem = allSemesters.find(s => s.year === year);
      if (firstSem) setSelectedSemesterId(firstSem.id);
      else setSelectedSemesterId("");
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="dashboard-container">
      
      {/* [ĐÃ SỬA] Header giống các màn hình khác: Tiêu đề trái - Nút quay lại phải */}
      <header className="dashboard-header">
        <h1>Thời khóa biểu cá nhân</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/student")}>
          Quay lại
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
            
            <div className="qnu-schedule-wrapper">
                {/* THANH BỘ LỌC */}
                <div className="qnu-filter-bar">
                    <div className="qnu-filter-item">
                        <label>Năm học:</label>
                        <select 
                            className="qnu-select"
                            value={selectedYear}
                            onChange={handleYearChange}
                        >
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="qnu-filter-item">
                        <label>Học kỳ:</label>
                        <select 
                            className="qnu-select"
                            value={selectedSemesterId}
                            onChange={(e) => setSelectedSemesterId(e.target.value)}
                            disabled={!selectedYear}
                        >
                            {filteredSemesters.map(sem => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.semester_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tiêu đề hiển thị kết quả */}
                    <div style={{marginLeft: 'auto', fontWeight: 'bold', color: '#2b6cb0'}}>
                         {displayTitle}
                    </div>
                </div>

                {/* BẢNG LỊCH HỌC */}
                {loading ? (
                    <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                        ⏳ Đang tải dữ liệu...
                    </div>
                ) : groupedSchedule.length > 0 ? (
                    <table className="qnu-table">
                        <thead>
                            <tr>
                            <th style={{width: '50px'}}>STT</th>
                            <th style={{width: '120px'}}>Mã lớp HP</th>
                            <th style={{textAlign: 'left'}}>Tên học phần</th>
                            <th style={{width: '60px'}}>STC</th>
                            <th style={{textAlign: 'left'}}>Thông tin lịch học</th>
                            <th style={{width: '180px'}}>Giảng viên</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedSchedule.map((item, index) => (
                            <tr key={index}>
                                <td className="col-center">{index + 1}</td>
                                <td className="col-center col-bold">{item.class_code}</td>
                                <td>
                                    <div className="col-bold">{item.subject_name}</div>
                                    <small style={{color: '#666'}}>Mã HP: {item.subject_code}</small>
                                </td>
                                <td className="col-center">{item.credits}</td>
                                <td>
                                    <ul className="schedule-lines">
                                        {item.schedules.map((sch, i) => (
                                            <li key={i} className="schedule-line">
                                                <span className="hl-day">{translateDay(sch.day_of_week)}</span>, 
                                                Tiết: <b>{sch.period}</b>, 
                                                Phòng: <span className="hl-room">{sch.room || "TBD"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>{item.teacher_name || "Chưa phân công"}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state text-center" style={{padding: '40px', border: '1px dashed #cbd5e1'}}>
                        <p style={{color: '#64748b', fontSize: '1.1rem'}}>Không có lịch học nào trong học kỳ này.</p>
                        <button 
                            className="btn btn-primary"
                            style={{marginTop: '10px', fontSize: '13px'}}
                            onClick={() => navigate("/student/enrollments")}
                        >
                            Đăng ký môn học mới
                        </button>
                    </div>
                )}
            </div>

        </section>
      </main>
    </div>
  );
};

export default StudentSchedule;
