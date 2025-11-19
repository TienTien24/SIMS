# SIMS - Student Information Management System

## Tổng quan
Hệ thống quản lý thông tin sinh viên với chức năng đăng ký và đăng nhập người dùng.

## Cấu trúc dự án
```
SIMS/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # Các trang (RegisterPage.jsx, LoginPage.jsx)
│   │   ├── utils/     # Utility functions
│   │   └── ...
│   └── package.json
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── models/    # Database models (User.js)
│   │   ├── routes/    # API routes (auth.js)
│   │   └── index.js   # Server chính
│   └── package.json
└── README.md
```

## Hướng dẫn cài đặt

### 1. Cài đặt Backend
```bash
cd backend
npm install
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
```

### 3. Cài đặt MongoDB
Xem hướng dẫn chi tiết trong `backend/DATABASE_SETUP.md`

## Cấu hình

### Backend (.env)
```
MONGODB_URI=mongodb://127.0.0.1:27017/sims
PORT=4000
```

### Frontend
Chỉnh sửa API endpoint trong RegisterPage.jsx nếu cần:
```javascript
const res = await fetch("http://localhost:4000/api/auth/register", {
```

## Chạy dự án

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/health` - Kiểm tra trạng thái server

### Đăng ký người dùng
**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}
```

**Roles:** admin, lecturer, student

## Tính năng
- Đăng ký tài khoản với email, họ tên, mật khẩu, vai trò
- Xác thực dữ liệu đầu vào
- Hash mật khẩu an toàn
- Kiểm tra email trùng lặp
- Giao diện responsive với Tailwind CSS

## Công nghệ sử dụng
- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** bcryptjs cho password hashing

## Lưu ý
- Đảm bảo MongoDB đang chạy trước khi khởi động backend
- Kiểm tra file `backend/DATABASE_SETUP.md` cho hướng dẫn cài đặt MongoDB


=======
# 🏫 SIMS - Student Information Management System

A Node.js API server for managing student, teacher, and admin data.

---

## 📁 Project Structure
```
SIMS/
├── backend/           # Node.js API server
│   ├── db/            # Database modules
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # Request/response logic
│   │   ├── middlewares/ # Custom middleware
│   │   ├── models/    # Database models (User.js)
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── utils/     # Utility functions
│   │   └── app.js     # Main Express app setup
│   ├── test/          # Test files
│   ├── .env           # Environment variables
│   ├── package.json
└── README.md
```
---

## 🛠️ Installation & Running

### 1. Install dependencies
```bash
npm install
npm install cors helmet
npm install --save-dev nodemon
npm install joi
```

### 2. Run server
```bash
npm run dev
```

---
>>>>>>> origin/feature/auth
