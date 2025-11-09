// Mock database cho testing khi chưa có MongoDB
const users = [];

// Mock User model
class MockUser {
  constructor(data) {
    this.id = Date.now().toString();
    this.fullName = data.fullName;
    this.email = data.email.toLowerCase();
    this.password = data.password; // Trong thực tế nên hash password
    this.role = data.role || 'student';
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async findOne(query) {
    return users.find(user => {
      if (query.email && user.email === query.email.toLowerCase()) {
        return true;
      }
      return false;
    }) || null;
  }

  static async findById(id) {
    return users.find(user => user.id === id) || null;
  }

  async save() {
    // Kiểm tra email trùng lặp
    const existingUser = await MockUser.findOne({ email: this.email });
    if (existingUser) {
      throw new Error('Email này đã được sử dụng.');
    }
    
    users.push(this);
    return this;
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Phương thức để lấy tất cả users (cho testing)
  static async findAll() {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Phương thức để xóa tất cả users (cho testing)
  static async clearAll() {
    users.length = 0;
  }
}

export default MockUser;