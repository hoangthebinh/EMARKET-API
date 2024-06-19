const jwt = require('jsonwebtoken');

// Middleware xác thực
const authMiddleware = (req, res, next) => {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Nếu không có token, trả về lỗi
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        if (token === provess.env.JWT_SECRET) {
            next(); // Chuyển tiếp yêu cầu đến middleware tiếp theo
        }
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;