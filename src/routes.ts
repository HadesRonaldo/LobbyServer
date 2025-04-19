import { Router } from 'express';
import { register, login, getAccountData, updateAccountData, refreshAccessToken, forgotPassword, resetPassword } from './controllers';
import { authenticateToken, authLimiter, apiLimiter } from './middleware';

const router = Router();

// Apply rate limiting to authentication endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', authLimiter, refreshAccessToken);

// Apply rate limiting to protected endpoints
router.get('/account', apiLimiter, authenticateToken, getAccountData);
router.put('/account', apiLimiter, authenticateToken, updateAccountData);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;