import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './services';
import rateLimit from 'express-rate-limit';

// Rate limiting for login and register endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for API endpoints
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'No token provided',
            error: 'UNAUTHORIZED'
        });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid token',
                error: 'FORBIDDEN'
            });
        }

        if (decoded.expired) {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired',
                error: 'TOKEN_EXPIRED'
            });
        }

        // Add user information to request
        req.body.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
};