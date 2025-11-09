import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        try {
            // Sử dụng React Router để điều hướng đến trang đăng nhập nội bộ
            navigate('/login');
        } catch (error) {
            console.error('Login redirect failed:', error);
            setIsLoading(false);
            alert('Không thể chuyển đến trang đăng nhập. Vui lòng thử lại.');
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="title-card">
                    <h1>SIMS - QNU</h1>
                </div>

                <p className="description">
                    Hệ thống quản lý thông tin sinh viên của Trường Đại học Quy Nhơn.
                    <br/>Quý Thầy/Cô, CBNV, Sinh viên vui lòng sử dụng tài khoản để đăng nhập hệ thống.
                </p>

                <button 
                    type="button" 
                    className="login-btn" 
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập vào hệ thống'}
                </button>

                <div className="contact">
                    <p>Quên tài khoản / Mật khẩu? vui lòng liên hệ Trung tâm QLHTTT</p>
                </div>
            </div>
        </div>
    );
}