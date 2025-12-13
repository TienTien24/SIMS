import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

/**
 * Middleware phân quyền - chỉ cho phép các role được chỉ định
 * @param {string[]} allowedRoles - Mảng các role được phép truy cập
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Phải có authenticateToken trước
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Authentication required" 
      });
    }

    const userRole = req.user.role;

    // Kiểm tra role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You don't have permission to access this resource",
        requiredRoles: allowedRoles,
        yourRole: userRole,
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = requireRole("admin");

/**
 * Middleware kiểm tra quyền giảng viên hoặc admin
 */
export const requireTeacherOrAdmin = requireRole("teacher", "admin");

/**
 * Middleware kiểm tra quyền sinh viên hoặc admin
 */
export const requireStudentOrAdmin = requireRole("student", "admin");