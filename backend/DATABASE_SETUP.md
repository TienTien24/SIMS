# Hướng dẫn cài đặt MongoDB cho dự án SIMS

## Tùy chọn 1: Cài đặt MongoDB Local

### Windows
1. Tải MongoDB Community Server từ: https://www.mongodb.com/try/download/community
2. Cài đặt với các tùy chọn mặc định
3. Sau khi cài đặt, chạy MongoDB services:
   ```
   net start MongoDB
   ```

### macOS (sử dụng Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Tùy chọn 2: Sử dụng MongoDB Atlas (Cloud - Miễn phí)

1. Đăng ký tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí (M0)
3. Tạo database user và password
4. Lấy connection string và thay đổi trong file `.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sims?retryWrites=true&w=majority
```

## Kiểm tra kết nối

Sau khi cài đặt, kiểm tra bằng cách:
1. Khởi động lại backend server
2. Test API registration như đã làm ở trên

## Cấu trúc Database

Database `sims` sẽ có collection `users` với các trường:
- `fullName`: Họ và tên người dùng
- `email`: Email (unique)
- `password`: Mật khẩu đã được hash
- `role`: Vai trò (admin/lecturer/student)
- `isActive`: Trạng thái hoạt động
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật