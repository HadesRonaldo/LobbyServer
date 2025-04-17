"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const services_1 = require("./services");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = (0, services_1.verifyToken)(token);
    if (!decoded) {
        return res.status(403).json({ message: 'Invalid token' });
    }
    if (decoded.expired) {
        return res.status(401).json({ message: 'Token has expired' });
    }
    // 将解码后的用户信息添加到请求对象中
    req.body.user = decoded;
    next();
};
exports.authenticateToken = authenticateToken;
