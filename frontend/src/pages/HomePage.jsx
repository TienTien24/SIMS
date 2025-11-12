import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    try {
      navigate('/login');
    } catch (error) {
      console.error('Login redirect failed:', error);
      setIsLoading(false);
      alert('Không thể chuyển đến trang đăng nhập. Vui lòng thử lại.');
    }
  };

  const handleScrollToFeatures = () => {
    const target = document.getElementById('features');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page home-page">
      <div className="container">
        <div className="home-hero">
          <div className="hero-content">
            <span className="hero-meta">SIMS - Smart Information Management System</span>
            <h1 className="hero-title">
              Nền tảng quản lý sinh viên hiện đại của Trường Đại học Quy Nhơn
            </h1>
            <p className="hero-description">
              Quản trị liền mạch từ nhập học, đào tạo đến tốt nghiệp. SIMS giúp Ban giám hiệu,
              giảng viên và sinh viên phối hợp hiệu quả hơn với giao diện trực quan và dữ liệu
              chính xác thời gian thực.
            </p>
            <div className="cta-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập hệ thống'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleScrollToFeatures}>
                Khám phá tính năng
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">35+</span>
                <span className="hero-stat-label">Ngành đào tạo được quản lý</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">24/7</span>
                <span className="hero-stat-label">Sẵn sàng cho giảng viên và sinh viên</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">99%</span>
                <span className="hero-stat-label">Dữ liệu đồng bộ với hệ thống QNU</span>
              </div>
            </div>
          </div>

          <div className="hero-illustration" aria-hidden="true">
            <div className="hero-widget">
              <strong>99.9%</strong>
              <span>Thời gian sẵn sàng hệ thống</span>
              <small>Giám sát liên tục bởi Trung tâm QLHTTT</small>
            </div>
          </div>
        </div>

        <div className="home-sections">
          <section id="features">
            <div className="section-header">
              <h2 className="section-title">Tính năng trọng yếu</h2>
              <p className="section-subtitle">
                Các module được thiết kế để hỗ trợ đầy đủ nghiệp vụ của nhà trường, đảm bảo trải nghiệm
                thống nhất và bảo mật cao cho mọi vai trò người dùng.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3 className="feature-title">Quản lý hồ sơ sinh viên</h3>
                <p className="feature-description">
                  Theo dõi tình trạng học tập, thông tin cá nhân và lộ trình rèn luyện của từng sinh viên
                  trong một giao diện tổng quan.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📅</div>
                <h3 className="feature-title">Lịch giảng dạy & học tập</h3>
                <p className="feature-description">
                  Tự động đồng bộ thời khóa biểu, giúp giảng viên và sinh viên cập nhật thông tin lớp học
                  nhanh chóng.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📈</div>
                <h3 className="feature-title">Báo cáo & thống kê</h3>
                <p className="feature-description">
                  Cung cấp dashboard trực quan theo thời gian thực cho Ban giám hiệu về tuyển sinh, đào
                  tạo và tốt nghiệp.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Bảo mật & phân quyền</h3>
                <p className="feature-description">
                  Quy trình xác thực nhiều lớp, phân quyền chi tiết cho từng vai trò đảm bảo dữ liệu luôn
                  an toàn.
                </p>
              </article>
            </div>
          </section>

          <section>
            <div className="section-header">
              <h2 className="section-title">Trải nghiệm dành cho từng vai trò</h2>
              <p className="section-subtitle">
                Mỗi nhóm người dùng được tối ưu hóa quy trình, giúp tiết kiệm thời gian và giảm thiểu sai
                sót khi thao tác.
              </p>
            </div>
            <div className="info-panels">
              <div className="info-panel">
                <h3>Ban giám hiệu</h3>
                <ul className="info-list">
                  <li>Giám sát tình hình đào tạo theo thời gian thực</li>
                  <li>Phê duyệt các quyết định học vụ trực tuyến</li>
                  <li>Nhận cảnh báo sớm về rủi ro và sai lệch dữ liệu</li>
                </ul>
              </div>
              <div className="info-panel">
                <h3>Giảng viên & CBNV</h3>
                <ul className="info-list">
                  <li>Quản lý lớp học, điểm danh và nhập điểm nhanh</li>
                  <li>Tra cứu hồ sơ sinh viên tức thời</li>
                  <li>Gửi thông báo tới sinh viên theo từng lớp</li>
                </ul>
              </div>
              <div className="info-panel">
                <h3>Sinh viên</h3>
                <ul className="info-list">
                  <li>Đăng ký học phần và theo dõi tiến độ tốt nghiệp</li>
                  <li>Nhận thông báo học vụ, lịch thi, lịch học</li>
                  <li>Tra cứu công nợ, học phí và kết quả học tập</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="testimonial-card">
              <p>
                “SIMS giúp công tác quản lý đào tạo của Trường Đại học Quy Nhơn minh bạch và chuẩn hóa
                hơn. Các thao tác phức tạp trước đây giờ chỉ còn vài cú click, hỗ trợ chúng tôi đưa ra
                quyết định nhanh chóng và chính xác.”
              </p>
            </div>
            <div className="contact">
              <p>Quên tài khoản / Mật khẩu? Vui lòng liên hệ Trung tâm QLHTTT.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}