"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccount = exports.getAccount = exports.loginUser = exports.registerUser = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const usersFile = path_1.default.join(__dirname, '../data/users.json');
const readUsers = () => {
    if (!fs_1.default.existsSync(usersFile))
        return [];
    return JSON.parse(fs_1.default.readFileSync(usersFile, 'utf-8'));
};
const writeUsers = (users) => {
    fs_1.default.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
};
const registerUser = (userData) => {
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
    const password = bcrypt_1.default.hashSync(userData.password, 10);
    const user = { username: userData.username, passwordHash: password, email: userData.email };
    users.push(user);
    console.log(users);
    writeUsers(users);
    return { success: true, message: 'User registered successfully' };
};
exports.registerUser = registerUser;
const loginUser = (loginData) => {
    const users = readUsers();
    const user = users.find(user => user.username === loginData.username);
    if (!user || !bcrypt_1.default.compareSync(loginData.password, user.passwordHash)) {
        return { success: false, message: 'Invalid username or password' };
    }
    return { success: true, message: 'Login successful' };
};
exports.loginUser = loginUser;
const getAccount = (username) => {
    const users = readUsers();
    return users.find(user => user.username === username);
};
exports.getAccount = getAccount;
const updateAccount = (username, newData) => {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1)
        return { success: false, message: 'User not found' };
    users[userIndex].data = newData;
    writeUsers(users);
    return { success: true, message: 'Account updated successfully' };
};
exports.updateAccount = updateAccount;
