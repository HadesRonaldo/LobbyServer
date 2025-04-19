import { Request, Response } from 'express';
import * as userService from './services';
//
// res.status(code) → Sets the HTTP response status.
//  If result.success is true, send status 200 (OK).
//  If result.success is false, send status 400 (Bad Request).
// .json(result) → Sends result back to the client as a JSON response.

interface AuthenticatedRequest extends Request {
    body: {
        user?: {
            username: string;
            exp: number;
        };
        data?: object;
    };
}

export const register = async (req: Request, res: Response) => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: 'INTERNAL_ERROR'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await userService.loginUser(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: 'INTERNAL_ERROR'
        });
    }
};

export const getAccountData = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.body.user?.username) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: 'UNAUTHORIZED'
            });
        }

        const data = await userService.getAccount(req.body.user.username);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'User data not found',
                error: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get account data error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching account data',
            error: 'INTERNAL_ERROR'
        });
    }
};

export const updateAccountData = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.body.user?.username) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: 'UNAUTHORIZED'
            });
        }

        if (!req.body.data) {
            return res.status(400).json({
                success: false,
                message: 'No data provided for update',
                error: 'BAD_REQUEST'
            });
        }

        const result = await userService.updateAccount(req.body.user.username, req.body.data);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Update account data error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating account data',
            error: 'INTERNAL_ERROR'
        });
    }
};

// 刷新 access token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
                error: 'BAD_REQUEST'
            });
        }

        const result = await userService.refreshToken(refreshToken);
        if (!result) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                error: 'UNAUTHORIZED'
            });
        }

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while refreshing token',
            error: 'INTERNAL_ERROR'
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const result = await userService.forgotPassword(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset request',
            error: 'INTERNAL_ERROR'
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const result = await userService.resetPassword(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset',
            error: 'INTERNAL_ERROR'
        });
    }
};