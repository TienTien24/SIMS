export const isAuthenticated = () => {
    // Logic để kiểm tra xem người dùng đã đăng nhập hay chưa
    // Ví dụ: kiểm tra sự tồn tại của token trong localStorage
    return localStorage.getItem('token') !== null;
};

export const login = (token) => {
    // Lưu token vào localStorage khi đăng nhập thành công
    localStorage.setItem('token', token);
};

export const logout = () => {
    // Xóa token khỏi localStorage khi đăng xuất
    localStorage.removeItem('token');
};