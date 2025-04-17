import { Router } from 'express';
import { register, login, getAccountData, updateAccountData, refreshAccessToken } from './controllers';
import { authenticateToken } from './middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/account', authenticateToken, getAccountData);
router.put('/account', authenticateToken, updateAccountData);
router.post('/refresh-token', refreshAccessToken);

export default router;