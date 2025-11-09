// API endpoint để lấy thông tin user hiện tại
import express from 'express';
import jwt from 'jsonwebtoken';
import MockUser from '../models/MockUser.js';

const router = express.Router();

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Không có token xác thực.' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc đã hết hạn.' 
      });
    }
    req.user = user;
    next();
  });
};

// Lấy thông tin user hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await MockUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại.' 
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi lấy thông tin người dùng.' 
    });
  }
});

// Cập nhật thông tin user
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.userId;

    // Tìm user
    const user = await MockUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại.' 
      });
    }

    // Cập nhật thông tin
    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      // Kiểm tra email mới có trùng không
      const existingUser = await MockUser.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email này đã được sử dụng.' 
        });
      }
      user.email = email;
    }

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi cập nhật thông tin.' 
    });
  }
});

export default router;