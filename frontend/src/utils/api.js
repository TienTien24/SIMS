// src/utils/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

const mock = async (endpoint, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const getLS = (key, def) => {
    try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v ?? def; } catch { return def; }
  };
  const setLS = (key, val) => { localStorage.setItem(key, JSON.stringify(val)); };
  if (endpoint === "/auth/login" && method === "POST") {
    const role = body.email?.includes("admin") ? "admin" : body.email?.includes("teacher") ? "teacher" : "student";
    return {
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token: "mock-token",
        user: {
          id: 1,
          username: body.email?.split("@")[0] || "user",
          email: body.email || "user@qnu.edu.vn",
          role,
          fullName: body.email?.split("@")[0] || "user",
        },
      },
    };
  }
  if (endpoint === "/auth/register" && method === "POST") {
    return {
      success: true,
      message: "Đăng ký thành công",
      data: {
        token: "mock-token",
        user: {
          id: 2,
          username: body.username || "user",
          email: body.email || "user@qnu.edu.vn",
          role: body.role || "student",
          fullName: body.full_name || "Người dùng mô phỏng",
        },
      },
    };
  }
  if (endpoint === "/student/profile" && method === "GET") {
    const user = getLS("user", null) || { username: "student", email: "student@qnu.edu.vn" };
    const profile = getLS("mock_student_profile", null) ?? {
      user_id: 1,
      student_code: "SV0001",
      full_name: user.fullName || user.username || "Sinh viên",
      email: user.email,
      birth_date: "2003-01-01",
      gender: "male",
      address: "Quy Nhơn",
      class_id: 101,
      class_name: "CNTT01",
      major_id: 10,
      major_name: "Công nghệ Thông tin",
    };
    setLS("mock_student_profile", profile);
    return { success: true, data: profile };
  }
  if (endpoint === "/student/profile" && method === "PUT") {
    const cur = getLS("mock_student_profile", {});
    const next = { ...cur, ...body };
    setLS("mock_student_profile", next);
    return { success: true, message: "Cập nhật thông tin thành công", data: next };
  }
  if (endpoint === "/courses" && method === "GET") {
    return {
      success: true,
      data: [
        { id: 1, subject_code: "MON001", subject_name: "Lập trình C++" },
        { id: 2, subject_code: "MON002", subject_name: "Kinh tế học" },
      ],
    };
  }
  if (endpoint === "/student/enrollments" && method === "GET") {
    return {
      success: true,
      data: [
        { id: 10, subject_code: "MON001", subject_name: "Lập trình C++", class_name: "CNTT01", semester_name: "HK1", status: "registered" },
      ],
    };
  }
  if (endpoint === "/student/enrollments" && method === "POST") {
    return { success: true, message: "Đăng ký thành công", data: { id: 99 } };
  }
  if (endpoint.startsWith("/student/enrollments/") && method === "DELETE") {
    return { success: true, message: "Hủy đăng ký thành công" };
  }
  if (endpoint === "/student/grades" && method === "GET") {
    return {
      success: true,
      data: {
        grades: [
          { subject_code: "MON001", subject_name: "Lập trình C++", semester_name: "Học kỳ 1", process_score: 8.5, midterm_score: 7.0, final_score: 9.0, average_score: 8.2 },
        ],
        gpa: 8.2,
      },
    };
  }
  if (endpoint === "/student/schedule" && method === "GET") {
    return {
      success: true,
      data: {
        schedule: [
          { day_of_week: "Monday", period: "1-3", room: "A101", subject_id: 1 },
        ],
        class_name: "CNTT01",
        semester_id: 1,
      },
    };
  }
  if (endpoint === "/semesters" && method === "GET") {
    return {
      success: true,
      data: [
        { id: 1, semester_name: "Học kỳ 1", year: 2025, start_date: "2025-09-01", end_date: "2026-01-15", is_active: true },
        { id: 2, semester_name: "Học kỳ 2", year: 2025, start_date: "2026-02-01", end_date: "2026-06-01", is_active: false },
      ],
    };
  }

  if (endpoint === "/student/notifications" && method === "GET") {
    return { success: true, data: [{ title: "Thông báo mô phỏng", content: "Nội dung" }] };
  }
  // Teacher endpoints (mock)
  if (endpoint === "/teacher/profile" && method === "GET") {
    const d = getLS("mock_teacher_profile", { id: 1, full_name: "Nguyễn Văn A", email: "teacher@qnu.edu.vn", phone: "0123456789", major_name: "Công nghệ Thông tin", teacher_code: "GV001" });
    return { success: true, data: d };
  }
  if (endpoint === "/teacher/profile" && method === "PUT") {
    const cur = getLS("mock_teacher_profile", {});
    const d = { ...cur, ...body };
    setLS("mock_teacher_profile", d);
    return { success: true, message: "Cập nhật thông tin giảng viên thành công", data: d };
  }
  if (endpoint === "/teacher/profile" && method === "DELETE") {
    setLS("mock_teacher_profile", {});
    return { success: true, message: "Xóa thông tin giảng viên thành công" };
  }
  if (endpoint === "/teacher/classes" && method === "GET") {
    const list = getLS("mock_teacher_classes", null) ?? [{ id: 1, class_code: "CNTT01", class_name: "Lớp CNTT 01", course: "K25" }];
    setLS("mock_teacher_classes", list);
    return { success: true, data: list };
  }
  if (endpoint === "/teacher/classes" && method === "POST") {
    const list = getLS("mock_teacher_classes", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body };
    list.push(item);
    setLS("mock_teacher_classes", list);
    return { success: true, message: "Tạo lớp học thành công", data: item };
  }
  if (endpoint.startsWith("/teacher/classes/") && method === "PUT") {
    const list = getLS("mock_teacher_classes", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_teacher_classes", list); return { success: true, message: "Cập nhật lớp học thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy lớp" };
  }
  if (endpoint.startsWith("/teacher/classes/") && method === "DELETE") {
    const list = getLS("mock_teacher_classes", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id);
    setLS("mock_teacher_classes", next);
    return { success: true, message: "Xóa lớp học thành công" };
  }
  if (endpoint.startsWith("/teacher/reports/grades") && method === "GET") {
    return { success: true, data: [{ student_code: "SV001", full_name: "Lê Văn C", process_score: 8, midterm_score: 7, final_score: 9, average_score: 8.2 }] };
  }
  if (endpoint === "/teacher/grades/bulk" && method === "POST") {
    return { success: true, message: "Nhập điểm hàng loạt thành công", data: { created: 3, updated: 2 } };
  }
  if (endpoint === "/teacher/schedule" && method === "GET") {
    return { success: true, data: [{ day_of_week: "Monday", period: "1-3", room: "A101", class_name: "CNTT01", subject_name: "Lập trình C++" }] };
  }
  if (endpoint === "/teacher/notifications" && method === "GET") {
    const list = getLS("mock_teacher_notifications", null) ?? [{ id: 1, title: "Nhắc lịch thi", content: "Tuần sau thi giữa kỳ", created_at: new Date().toISOString() }];
    setLS("mock_teacher_notifications", list);
    return { success: true, data: list };
  }
  if (endpoint === "/teacher/notifications" && method === "POST") {
    const list = getLS("mock_teacher_notifications", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body, created_at: new Date().toISOString() };
    list.push(item);
    setLS("mock_teacher_notifications", list);
    return { success: true, message: "Gửi thông báo thành công", data: item };
  }
  if (endpoint.startsWith("/teacher/notifications/") && method === "DELETE") {
    const list = getLS("mock_teacher_notifications", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id);
    setLS("mock_teacher_notifications", next);
    return { success: true, message: "Xóa thông báo thành công" };
  }
  // Classes (mock for admin pages)
  if (endpoint === "/classes" && method === "GET") {
    const list = getLS("mock_classes", null) ?? [{ id: 1, class_code: "CNTT01", class_name: "Lớp CNTT 01", course: "K25" }];
    setLS("mock_classes", list);
    return { success: true, data: list };
  }
  if (endpoint === "/classes" && method === "POST") {
    const list = getLS("mock_classes", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body };
    list.push(item); setLS("mock_classes", list);
    return { success: true, message: "Tạo lớp học thành công", data: item };
  }
  if (endpoint.startsWith("/classes/") && method === "PUT") {
    const list = getLS("mock_classes", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_classes", list); return { success: true, message: "Cập nhật lớp học thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy lớp" };
  }
  if (endpoint.startsWith("/classes/") && method === "DELETE") {
    const list = getLS("mock_classes", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id); setLS("mock_classes", next);
    return { success: true, message: "Xóa lớp học thành công" };
  }
  // Subjects (mock for admin pages)
  if (endpoint === "/subjects" && method === "GET") {
    const list = getLS("mock_subjects", null) ?? [{ id: 1, subject_code: "MON001", subject_name: "Lập trình C++", credits: 3, teacher_id: 1 }];
    setLS("mock_subjects", list);
    return { success: true, data: list };
  }
  if (endpoint === "/subjects" && method === "POST") {
    const list = getLS("mock_subjects", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body };
    list.push(item); setLS("mock_subjects", list);
    return { success: true, message: "Tạo môn học thành công", data: item };
  }
  if (endpoint.startsWith("/subjects/") && method === "PUT") {
    const list = getLS("mock_subjects", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_subjects", list); return { success: true, message: "Cập nhật môn học thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy môn học" };
  }
  if (endpoint.startsWith("/subjects/") && method === "DELETE") {
    const list = getLS("mock_subjects", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id); setLS("mock_subjects", next);
    return { success: true, message: "Xóa môn học thành công" };
  }
  // Admin endpoints (mock)
  if (endpoint === "/admin/users" && method === "GET") {
    const list = getLS("mock_admin_users", null) ?? [
      { id: 1, username: "admin", email: "admin@qnu.edu.vn", role: "admin", status: "active" },
      { id: 2, username: "teacher1", email: "teacher1@qnu.edu.vn", role: "teacher", status: "active" },
      { id: 3, username: "student1", email: "student1@qnu.edu.vn", role: "student", status: "active" },
    ];
    setLS("mock_admin_users", list);
    return { success: true, data: { users: list } };
  }
  if (endpoint === "/admin/users" && method === "POST") {
    const list = getLS("mock_admin_users", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, username: body.username, email: body.email, role: body.role, status: "active" };
    list.push(item); setLS("mock_admin_users", list);
    return { success: true, message: "Tạo người dùng thành công", data: item };
  }
  if (endpoint.startsWith("/admin/users/") && method === "PUT") {
    const list = getLS("mock_admin_users", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_admin_users", list); return { success: true, message: "Cập nhật người dùng thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy người dùng" };
  }
  if (endpoint.startsWith("/admin/users/") && method === "DELETE") {
    const list = getLS("mock_admin_users", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id); setLS("mock_admin_users", next);
    return { success: true, message: "Xóa người dùng thành công" };
  }
  if (endpoint === "/admin/students" && method === "GET") {
    const list = getLS("mock_admin_students", null) ?? [
      { id: 1, student_code: "SV001", full_name: "Trần Văn B", class_id: 1, class_name: "CNTT01", major_id: 1, major_name: "CNTT", course: "K25" },
    ]; setLS("mock_admin_students", list);
    return { success: true, data: list };
  }
  if (endpoint === "/admin/students" && method === "POST") {
    const list = getLS("mock_admin_students", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body.student }; list.push(item); setLS("mock_admin_students", list);
    return { success: true, message: "Thêm sinh viên thành công", data: item };
  }
  if (endpoint.startsWith("/admin/students/") && method === "PUT") {
    const list = getLS("mock_admin_students", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_admin_students", list); return { success: true, message: "Cập nhật thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy sinh viên" };
  }
  if (endpoint.startsWith("/admin/students/") && method === "DELETE") {
    const list = getLS("mock_admin_students", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id); setLS("mock_admin_students", next);
    return { success: true, message: "Xóa sinh viên thành công" };
  }
  if (endpoint === "/admin/teachers" && method === "GET") {
    const list = getLS("mock_admin_teachers", null) ?? [
      { id: 1, teacher_code: "GV001", full_name: "Nguyễn Văn A", email: "teacher@qnu.edu.vn", phone: "0123456789", major_id: 1, major_name: "CNTT" },
    ]; setLS("mock_admin_teachers", list);
    return { success: true, data: list };
  }
  if (endpoint === "/admin/teachers" && method === "POST") {
    const list = getLS("mock_admin_teachers", []);
    const id = Math.max(0, ...list.map(x=>x.id||0)) + 1;
    const item = { id, ...body.teacher }; list.push(item); setLS("mock_admin_teachers", list);
    return { success: true, message: "Thêm giảng viên thành công", data: item };
  }
  if (endpoint.startsWith("/admin/teachers/") && method === "PUT") {
    const list = getLS("mock_admin_teachers", []);
    const id = Number(endpoint.split("/").pop());
    const idx = list.findIndex(x=>x.id===id);
    if (idx>=0) { list[idx] = { ...list[idx], ...body }; setLS("mock_admin_teachers", list); return { success: true, message: "Cập nhật thành công", data: list[idx] }; }
    return { success: false, message: "Không tìm thấy giảng viên" };
  }
  if (endpoint.startsWith("/admin/teachers/") && method === "DELETE") {
    const list = getLS("mock_admin_teachers", []);
    const id = Number(endpoint.split("/").pop());
    const next = list.filter(x=>x.id!==id); setLS("mock_admin_teachers", next);
    return { success: true, message: "Xóa giảng viên thành công" };
  }
  if (endpoint === "/admin/stats" && method === "GET") {
    const students = getLS("mock_admin_students", []).length;
    const teachers = getLS("mock_admin_teachers", []).length;
    const classes = getLS("mock_teacher_classes", []).length;
    const subjects = getLS("mock_subjects", []).length;
    return { success: true, data: { totalStudents: students, totalTeachers: teachers, totalClasses: classes, totalSubjects: subjects, averageGpa: 7.85 } };
  }
  return { success: true, data: {} };
};

export const apiCallJson = async (endpoint, options = {}) => {
  const useMockEnv = (import.meta.env.VITE_USE_MOCK || "false").toLowerCase() === "true";
  const token = localStorage.getItem("token");
  const shouldMock = useMockEnv || token === "mock-token";
  if (shouldMock) {
    return await mock(endpoint, options);
  }
  try {
    const response = await apiCall(endpoint, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      const msg = error.message || error.error || "API call failed";
      if (endpoint === "/auth/login") {
        return await mock(endpoint, options);
      }
      throw new Error(msg);
    }
    return await response.json();
  } catch (e) {
    if (endpoint === "/auth/login") {
      return await mock(endpoint, options);
    }
    throw e;
  }
};
