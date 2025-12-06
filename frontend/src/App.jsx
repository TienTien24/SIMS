import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentGrades from './pages/student/StudentGrades';
import StudentEnrollments from './pages/student/StudentEnrollments';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentNotifications from './pages/student/StudentNotifications';
import StaffDashboard from './pages/StaffDashboard';
import StaffProfile from './pages/staff/StaffProfile';
import StaffClasses from './pages/staff/StaffClasses';
import StaffSchedule from './pages/staff/StaffSchedule';
import StaffNotifications from './pages/staff/StaffNotifications';
import StaffBulkGrades from './pages/staff/StaffBulkGrades';
import StaffReports from './pages/staff/StaffReports';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes với phân quyền - Student */}
            <Route 
                path="/student" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/student/profile" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentProfile />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/student/grades" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentGrades />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/student/enrollments" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentEnrollments />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/student/schedule" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentSchedule />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/student/notifications" 
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentNotifications />
                    </ProtectedRoute>
                } 
            />
            
            {/* Protected routes với phân quyền - Staff & Admin */}
            <Route 
                path="/staff" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/profile" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffProfile />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/classes" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffClasses />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/schedule" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffSchedule />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/notifications" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffNotifications />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/grades-bulk" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffBulkGrades />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff/reports" 
                element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                        <StaffReports />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

