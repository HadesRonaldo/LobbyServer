import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './services';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
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