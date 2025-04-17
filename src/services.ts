import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const usersFile = path.join(__dirname, '../data/users.json');

interface User {
    username: string;
    passwordHash: string;
    email: string;
    data?: object;
}

const readUsers = (): User[] => {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
};

const writeUsers = (users: User[]) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
};

export const registerUser = (userData: { username: string; password: string; email: string }) => {
    const users = readUsers();
    if (users.find(user => user.username === userData.username)) {
        console.log('Username already exists');
        return { success: false, message: 'Username already exists' };
    }

    if (userData.username.length < 1) {
        console.log('UserName is empty');
        return { success: false, message: 'UserName is empty' };
    }

    if (userData.password.length < 1) {
        console.log('Password is empty');
        return { success: false, message: 'Password is empty' };
    }

    const password = bcrypt.hashSync(userData.password, 10);
    const user = { username: userData.username, passwordHash: password, email: userData.email };
    users.push(user);
    console.log(users);
    writeUsers(users);

    return { success: true, message: 'User registered successfully' };
};

export const loginUser = (loginData: { username: string; password: string }) => {
    const users = readUsers();
    const user = users.find(user => user.username === loginData.username);
    if (!user || !bcrypt.compareSync(loginData.password, user.passwordHash)) {
        return { success: false, message: 'Invalid username or password' };
    }

    return { success: true, message: 'Login successful' };
};

export const getAccount = (username: string) => {
    const users = readUsers();
    return users.find(user => user.username === username);
};

export const updateAccount = (username: string, newData: object) => {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    users[userIndex].data = newData;
    writeUsers(users);
    return { success: true, message: 'Account updated successfully' };
};
