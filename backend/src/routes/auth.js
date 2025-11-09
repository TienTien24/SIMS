import express from 'express';
import User from '../models/User.js';
import MockUser from '../models/MockUser.js';

const router = express.Router();

// Kiểm tra kết nối MongoDB
let isMongoConnected = false;

// Hàm kiểm tra kết nối MongoDB
async function checkMongoConnection() {
  try {
    // Thử kết nối đơn giản
    const mongoose = await import('mongoose');
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
    } else {
      isMongoConnected = false;
    }
  } catch (error) {
    isMongoConnected = false;
  }
}

// Model sẽ sử dụng - MongoDB hoặc Mock
const UserModel = isMongoConnected ? User : MockUser;

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email này đã được sử dụng.' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Mật khẩu phải có ít nhất 6 ký tự.' 
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email không hợp lệ.' 
      });
    }

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'student'
    });

    await newUser.save();

    // Return success response
    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Email này đã được sử dụng.' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      error: 'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.' 
    });
  }
});

// Login endpoint (bonus)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Vui lòng nhập email và mật khẩu.' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Email hoặc mật khẩu không đúng.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Tài khoản của bạn đã bị vô hiệu hóa.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email hoặc mật khẩu không đúng.' 
      });
    }

    // Return user info (without password)
    res.json({
      message: 'Đăng nhập thành công!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.' 
    });
  }
});

export default router;