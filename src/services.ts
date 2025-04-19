import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { z } from 'zod';
import crypto from 'crypto';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h';
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

const usersFile = path.join(__dirname, '../data/users.json');
const tokenCache = new NodeCache();
const resetTokens = new NodeCache({ stdTTL: 3600 }); // 1 hour expiry for reset tokens

// Input validation schemas
const UserSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
    email: z.string().email()
});

const LoginSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(8)
});

const ForgotPasswordSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email()
});

const ResetPasswordSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    newPassword: z.string(),
    // newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    //     message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
    // })
});

interface User {
    username: string;
    passwordHash: string;
    email: string;
    data?: object;
}

const readUsers = async (): Promise<User[]> => {
    try {
        if (!fs.existsSync(usersFile)) return [];
        const data = await fs.promises.readFile(usersFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        throw new Error('Failed to read users data');
    }
};

const writeUsers = async (users: User[]): Promise<void> => {
    try {
        await fs.promises.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing users file:', error);
        throw new Error('Failed to write users data');
    }
};

export const registerUser = async (userData: { username: string; password: string; email: string }) => {
    try {
        // Validate input
        const validatedData = UserSchema.parse(userData);
        
        const users = await readUsers();
        if (users.find(user => user.username === validatedData.username)) {
            return { success: false, message: 'Username already exists' };
        }

        if (users.find(user => user.email === validatedData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const password = await bcrypt.hash(validatedData.password, 10);
        const user = { 
            username: validatedData.username, 
            passwordHash: password, 
            email: validatedData.email 
        };
        
        users.push(user);
        await writeUsers(users);

        return { success: true, message: 'User registered successfully' };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { 
                success: false, 
                message: 'Validation failed', 
                errors: error.errors 
            };
        }
        console.error('Registration error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

export const loginUser = async (loginData: { username: string; password: string }) => {
    try {
        // Validate input
        const validatedData = LoginSchema.parse(loginData);
        
        const users = await readUsers();
        const user = users.find(user => user.username === validatedData.username);
        
        if (!user || !(await bcrypt.compare(validatedData.password, user.passwordHash))) {
            return { success: false, message: 'Invalid username or password' };
        }

        const { token, refreshToken } = generateToken(user.username);
        return { success: true, message: 'Login successful', token, refreshToken };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { 
                success: false, 
                message: 'Validation failed', 
                errors: error.errors 
            };
        }
        console.error('Login error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

export const getAccount = async (username: string) => {
    try {
        const users = await readUsers();
        return users.find(user => user.username === username);
    } catch (error) {
        console.error('Get account error:', error);
        throw new Error('Failed to get account data');
    }
};

export const updateAccount = async (username: string, newData: object) => {
    try {
        const users = await readUsers();
        const userIndex = users.findIndex(user => user.username === username);
        if (userIndex === -1) return { success: false, message: 'User not found' };

        users[userIndex].data = newData;
        await writeUsers(users);
        return { success: true, message: 'Account updated successfully' };
    } catch (error) {
        console.error('Update account error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

export const generateToken = (username: string) => {
    try {
        const token = jwt.sign(
            { username },
            JWT_SECRET as jwt.Secret,
            { expiresIn: JWT_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        );
        const refreshToken = jwt.sign(
            { username },
            JWT_SECRET as jwt.Secret,
            { expiresIn: JWT_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        );
        tokenCache.set(token, username);
        tokenCache.set(refreshToken, username);
        return { token, refreshToken };
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate tokens');
    }
};

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as { username: string; exp: number };
        const isExpired = Date.now() >= decoded.exp * 1000;
        return { ...decoded, expired: isExpired };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log('Token has expired');
            return { expired: true };
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.log('Invalid token:', error.message);
            return null;
        }
        console.error('Token verification error:', error);
        return null;
    }
};

export const refreshToken = (refreshToken: string) => {
    const decoded = verifyToken(refreshToken);
    if (decoded && !decoded.expired && 'username' in decoded) {
        const { token, refreshToken: newRefreshToken } = generateToken(decoded.username);
        return { token, refreshToken: newRefreshToken };
    }
    return null;
};

export const forgotPassword = async (userData: { username: string; email: string }) => {
    try {
        // Validate input
        const validatedData = ForgotPasswordSchema.parse(userData);
        
        const users = await readUsers();
        const user = users.find(u => u.username === validatedData.username && u.email === validatedData.email);
        
        if (!user) {
            return { success: false, message: 'No account found with the provided username and email' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        resetTokens.set(resetToken, user.username);

        // In a real application, you would send an email with the reset token
        // For now, we'll just return the token (in production, this should be sent via email)
        return { 
            success: true, 
            message: 'Password reset instructions sent to your email',
            resetToken // In production, this should not be returned
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { 
                success: false, 
                message: 'Validation failed', 
                errors: error.errors 
            };
        }
        console.error('Forgot password error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

//wrong here
export async function resetPassword(input: z.infer<typeof ResetPasswordSchema>) {
    try {
        // Validate input
        const validatedInput = ResetPasswordSchema.parse(input);

        // Find user by username and email
        const users = await readUsers();
        const user = users.find(u => 
            u.username === validatedInput.username && 
            u.email === validatedInput.email
        );

        if (!user) {
            throw new Error('Invalid username or email');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(validatedInput.newPassword, 10);

        // Update user's password
        user.passwordHash = hashedPassword;

        // Save updated users data
        await writeUsers(users);

        return {
            success: true,
            message: 'Password has been reset successfully'
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(error.errors[0].message);
        }
        throw error;
    }
}
