// src/utils/api.js
export const API_BASE_URL = "http://localhost:4000/api";

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
          fullName: "Người dùng mô phỏng",
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
    return {
      success: true,
      data: {
        full_name: "Sinh viên Mô phỏng",
        email: "student@qnu.edu.vn",
        class_name: "CNTT01",
        major_name: "Công nghệ Thông tin",
      },
    };
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
      data: [
        { subject_name: "Lập trình C++", process_score: 8.5, midterm_score: 7.0, final_score: 9.0, average_score: 8.2 },
      ],
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
  return { success: true, data: {} };
};

export const apiCallJson = async (endpoint, options = {}) => {
  const useMock = (import.meta.env.VITE_USE_MOCK || "true").toLowerCase() === "true";
  if (useMock) {
    return await mock(endpoint, options);
  }
  const response = await apiCall(endpoint, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.message || error.error || "API call failed");
  }
  return await response.json();
};
