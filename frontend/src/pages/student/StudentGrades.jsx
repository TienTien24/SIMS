import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import { apiCallJson } from "../../utils/api";
import "../../styles/dashboard.css"; 

// --- ICON COMPONENTS ---
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconFail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconInfo = ({ onClick }) => (
  <svg 
    onClick={onClick}
    width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
    onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const StudentGrades = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [gradesData, setGradesData] = useState([]);
  const [gpaAccumulated, setGpaAccumulated] = useState(0); 
  const [selectedGrade, setSelectedGrade] = useState(null); 

  // --- FILTER STATE ---
  const [allSemesters, setAllSemesters] = useState([]);
  const [filterYear, setFilterYear] = useState("");
  const [filterSemesterId, setFilterSemesterId] = useState("");

  // --- HELPER ---
  const convertGrade = (score10) => {
      if (score10 === null || score10 === undefined || score10 === "") {
          return { score4: "", letter: "", isPass: false };
      }
      const s = parseFloat(score10);
      
      if (s < 4.0) return { score4: "0.00", letter: "F", isPass: false };

      if (s >= 8.5) return { score4: "4.00", letter: "A", isPass: true };
      if (s >= 8.0) return { score4: "3.50", letter: "B+", isPass: true };
      if (s >= 7.0) return { score4: "3.00", letter: "B", isPass: true };
      if (s >= 6.5) return { score4: "2.50", letter: "C+", isPass: true };
      if (s >= 5.5) return { score4: "2.00", letter: "C", isPass: true };
      if (s >= 5.0) return { score4: "1.50", letter: "D+", isPass: true };
      
      return { score4: "1.00", letter: "D", isPass: true };
  };

  // --- INIT DATA ---
  useEffect(() => {
    if (!user) return;
    const fetchSemesters = async () => {
      try {
        const res = await apiCallJson("/student/semesters");
        if (res.success && res.data) setAllSemesters(res.data);
      } catch (err) { console.error(err); }
    };
    fetchSemesters();
  }, [user]);

  const uniqueYears = useMemo(() => {
    return [...new Set(allSemesters.map(s => s.year))].sort((a, b) => b - a);
  }, [allSemesters]);

  const filteredSemesters = useMemo(() => {
    if (!filterYear) return [];
    return allSemesters.filter(s => s.year === parseInt(filterYear));
  }, [allSemesters, filterYear]);

  // --- LOAD GRADES ---
  const loadGrades = useCallback(async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if (filterSemesterId) params.append('semester_id', filterSemesterId);
        else if (filterYear) params.append('year', filterYear);

        const endpoint = `/student/grades?${params.toString()}`;
        const response = await apiCallJson(endpoint);
        
        if (response && response.success) {
            setGradesData(response.data.grades || []);
            setGpaAccumulated(response.data.gpa || 0);
        }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [filterSemesterId, filterYear]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  // --- GROUP DATA ---
  const groupedGrades = useMemo(() => {
    const groups = {};
    gradesData.forEach(item => {
        const groupKey = `Năm học : ${item.year} - Học kỳ : ${item.semester_name}`;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
    });
    return groups;
  }, [gradesData]);

  if (!user) return <div>Đang tải...</div>;

  // --- STYLES ---
  const styles = {
    toolbar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'
    },
    filterGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
    gpaText: { fontSize: '1.1rem', fontWeight: 'bold', color: '#2b6cb0' },
    
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'Arial, sans-serif' },
    th: { border: '1px solid #999', padding: '8px', background: '#eee', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' },
    td: { border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' },
    semesterHeader: { background: '#dce6f1', color: '#0033cc', fontWeight: 'bold', padding: '8px', border: '1px solid #999' },
    
    // Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modalContent: {
        background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative'
    },
    modalHeader: { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#2b6cb0' },
    detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' },
    closeBtn: {
        position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666'
    }
  };

  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header">
        <h1>Điểm số và kết quả học tập</h1>
        <div className="user-info">
          <button className="btn btn-secondary" onClick={() => navigate("/student")}>
            Quay lại
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-section">
            
            <div style={styles.toolbar}>
                <div style={styles.filterGroup}>
                    <div>
                        <strong>Năm học: </strong>
                        <select 
                            className="qnu-select"
                            style={{padding: '5px', borderRadius: '4px'}}
                            value={filterYear} 
                            onChange={(e) => {setFilterYear(e.target.value); setFilterSemesterId("");}}
                        >
                            <option value="">-- Tất cả --</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div>
                        <strong>Học kỳ: </strong>
                        <select 
                            className="qnu-select"
                            style={{padding: '5px', borderRadius: '4px'}}
                            value={filterSemesterId}
                            onChange={(e) => setFilterSemesterId(e.target.value)}
                        >
                            <option value="">-- Tất cả --</option>
                            {filteredSemesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={styles.gpaText}>
                    GPA Tích lũy: <span style={{color: '#d32f2f', fontSize: '1.3rem'}}>
                        {Number(gpaAccumulated).toFixed(2)}
                    </span>
                </div>
            </div>

            <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>STT</th>
                            <th style={styles.th}>Mã học phần</th>
                            <th style={styles.th}>Tên học phần</th>
                            <th style={styles.th}>Tín chỉ</th>
                            <th style={styles.th}>Điểm 10</th>
                            <th style={styles.th}>Điểm 4</th>
                            <th style={styles.th}>Điểm chữ</th>
                            <th style={styles.th}>Kết quả</th>
                            <th style={styles.th}>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>Đang tải dữ liệu...</td></tr>
                        ) : Object.keys(groupedGrades).length > 0 ? (
                            Object.keys(groupedGrades).map((groupKey) => (
                                <React.Fragment key={groupKey}>
                                    <tr>
                                        <td colSpan="9" style={styles.semesterHeader}>{groupKey}</td>
                                    </tr>
                                    {groupedGrades[groupKey].map((item, idx) => {
                                        const gradeInfo = convertGrade(item.average_score); 
                                        const displayScore4 = item.total_score_4 || gradeInfo.score4;
                                        const displayLetter = item.letter_grade || gradeInfo.letter;
                                        
                                        return (
                                            <tr key={idx} style={{background: '#fff'}}>
                                                <td style={{...styles.td, textAlign: 'center'}}>{idx + 1}</td>
                                                <td style={{...styles.td, textAlign: 'center'}}>{item.subject_code}</td>
                                                <td style={{...styles.td}}>{item.subject_name}</td>
                                                <td style={{...styles.td, textAlign: 'center'}}>{item.credits}</td>
                                                <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{item.average_score}</td>
                                                <td style={{...styles.td, textAlign: 'center'}}>{displayScore4}</td>
                                                <td style={{...styles.td, textAlign: 'center'}}>{displayLetter}</td>
                                                
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    {gradeInfo.isPass ? <IconCheck /> : <IconFail />}
                                                </td>

                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <IconInfo onClick={() => setSelectedGrade(item)} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>Không có dữ liệu điểm.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
      </main>

      {/* MODAL CHI TIẾT */}
      {selectedGrade && (
          <div style={styles.modalOverlay} onClick={() => setSelectedGrade(null)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <button style={styles.closeBtn} onClick={() => setSelectedGrade(null)}>&times;</button>
                  <div style={styles.modalHeader}>Chi tiết điểm học phần</div>
                  
                  <div style={{marginBottom: '15px'}}>
                      <strong>Môn học:</strong> {selectedGrade.subject_name}<br/>
                      <small style={{color: '#666'}}>Mã HP: {selectedGrade.subject_code}</small>
                  </div>

                  <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '6px'}}>
                      <div style={styles.detailRow}>
                          <span>Điểm chuyên cần / Quá trình:</span>
                          <strong>{selectedGrade.process_score ?? '-'}</strong>
                      </div>
                      <div style={styles.detailRow}>
                          <span>Điểm giữa kỳ:</span>
                          <strong>{selectedGrade.midterm_score ?? '-'}</strong>
                      </div>
                      <div style={styles.detailRow}>
                          <span>Điểm cuối kỳ:</span>
                          <strong>{selectedGrade.final_score ?? '-'}</strong>
                      </div>
                      <div style={{borderTop: '1px solid #ddd', margin: '10px 0'}}></div>
                      <div style={styles.detailRow}>
                          <span style={{color: '#2b6cb0', fontWeight: 'bold'}}>Điểm tổng kết (10):</span>
                          <span style={{color: '#2b6cb0', fontWeight: 'bold', fontSize: '1.2rem'}}>
                              {selectedGrade.average_score ?? '-'}
                          </span>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentGrades;