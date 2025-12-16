# 🏫 SIMS - Student Information Management System

Hệ thống quản lý thông tin sinh viên toàn diện cho Trường Đại học Quy Nhơn.

## 📁 Cấu trúc dự án

```
SIMS/
├── frontend/          # React application (Vite)
│   ├── src/
│   │   ├── pages/     # Các trang (Login, Register, Dashboard, ...)
│   │   ├── components/ # Components tái sử dụng
│   │   ├── utils/     # Utility functions (API, Auth)
│   │   └── styles/    # CSS files
│   └── package.json
├── backend/           # Node.js API server (Express)
│   ├── db/            # Database migrations & seeds
│   ├── src/
│   │   ├── config/    # Configuration (DB, JWT)
│   │   ├── controllers/ # Request/response logic
│   │   ├── middlewares/ # Auth, Validation
│   │   ├── models/    # Database models
│   │   ├── routes/  # API routes
│   │   └── app.js    # Main Express app
│   └── package.json
└── README.md
```

## 🛠️ Hướng dẫn cài đặt

### 1. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sims
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

# Server Configuration
PORT=4000
FE_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Migration & Seeding
MIGRATE_ON_START=true
SEED_ON_START=true
```

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api

# Use Mock Data (set to false to use real backend)
VITE_USE_MOCK=false
```

### 3. Chạy ứng dụng

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Truy cập ứng dụng tại: `http://localhost:5173`

## 🔐 Tài khoản mặc định (sau khi seed)

- **Admin:** `admin@qnu.edu.vn` / `123456`
- **Giảng viên:** `teacher1@qnu.edu.vn` / `123456`
- **Sinh viên:** `student1@qnu.edu.vn` / `password123`

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `PATCH /api/auth/reset-password` - Đặt lại mật khẩu

### Student
- `GET /api/student/profile` - Xem hồ sơ
- `PUT /api/student/profile` - Cập nhật hồ sơ
- `GET /api/student/grades` - Xem điểm
- `GET /api/student/enrollments` - Danh sách đăng ký
- `POST /api/student/enrollments` - Đăng ký môn học
- `DELETE /api/student/enrollments/:id` - Hủy đăng ký
- `GET /api/student/schedule` - Lịch học
- `GET /api/student/notifications` - Thông báo

### Teacher
- `GET /api/teacher/profile` - Hồ sơ giảng viên
- `PUT /api/teacher/profile` - Cập nhật hồ sơ
- `GET /api/teacher/classes` - Danh sách lớp
- `POST /api/teacher/classes` - Tạo lớp
- `POST /api/teacher/grades/bulk` - Nhập điểm hàng loạt
- `GET /api/teacher/reports/grades` - Báo cáo điểm
- `GET /api/teacher/schedule` - Lịch giảng dạy
- `GET /api/teacher/notifications` - Thông báo
- `POST /api/teacher/notifications` - Gửi thông báo

### Admin
- `GET /api/admin/users` - Danh sách người dùng
- `POST /api/admin/users` - Tạo người dùng
- `PUT /api/admin/users/:userId` - Cập nhật người dùng
- `DELETE /api/admin/users/:userId` - Xóa người dùng
- `GET /api/admin/students` - Danh sách sinh viên
- `POST /api/admin/students` - Tạo sinh viên
- `PUT /api/admin/students/:id` - Cập nhật sinh viên
- `DELETE /api/admin/students/:id` - Xóa sinh viên
- `GET /api/admin/teachers` - Danh sách giảng viên
- `POST /api/admin/teachers` - Tạo giảng viên
- `PUT /api/admin/teachers/:id` - Cập nhật giảng viên
- `DELETE /api/admin/teachers/:id` - Xóa giảng viên
- `GET /api/admin/stats` - Thống kê

### Resources
- `GET /api/classes` - Danh sách lớp
- `GET /api/subjects` - Danh sách môn học
- `GET /api/semesters` - Danh sách học kỳ
- `GET /api/courses` - Danh sách khóa học (cho đăng ký)

## ✨ Tính năng

### Sinh viên
- ✅ Xem và cập nhật hồ sơ cá nhân
- ✅ Xem điểm số và GPA
- ✅ Đăng ký/hủy đăng ký môn học
- ✅ Xem lịch học
- ✅ Xem thông báo

### Giảng viên
- ✅ Quản lý lớp học
- ✅ Nhập điểm hàng loạt
- ✅ Xem báo cáo điểm
- ✅ Xem lịch giảng dạy
- ✅ Gửi thông báo

### Quản trị viên
- ✅ Quản lý người dùng (CRUD)
- ✅ Quản lý sinh viên (CRUD)
- ✅ Quản lý giảng viên (CRUD)
- ✅ Quản lý lớp học
- ✅ Quản lý môn học
- ✅ Xem thống kê

## 🎨 Giao diện

- ✅ Responsive design
- ✅ Modern UI với animations
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## 🔒 Bảo mật

- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (SHA256)
- ✅ CORS configuration
- ✅ Helmet security headers

## 🗄️ Database

- MySQL/TiDB
- Auto migration on startup
- Seed data available

## 📝 Lưu ý

1. Đảm bảo MySQL/TiDB đang chạy trước khi khởi động backend
2. File `.env` cần được tạo cho cả backend và frontend
3. Mock data được tắt mặc định (`VITE_USE_MOCK=false`)
4. Database sẽ tự động migrate và seed khi khởi động (nếu được bật)

## 🚀 Deployment

1. Cập nhật `FE_URL` trong backend `.env` với URL production
2. Cập nhật `VITE_API_BASE_URL` trong frontend `.env` với URL API production
3. Build frontend: `cd frontend && npm run build`
4. Deploy backend và serve frontend build

## 📧 Liên hệ

- Email: hotro@qnu.edu.vn
- Website: https://hotro.qnu.edu.vn
