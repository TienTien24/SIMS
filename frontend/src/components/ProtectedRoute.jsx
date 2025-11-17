import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

/**
 * ProtectedRoute - Component bảo vệ route theo role
 * @param {React.Component} children - Component con cần render
 * @param {string[]} allowedRoles - Mảng các role được phép truy cập
 * @param {string} redirectTo - Route redirect nếu không có quyền (mặc định: /login)
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  // Kiểm tra authentication
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect về trang chủ nếu không có quyền
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

