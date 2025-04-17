"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountData = exports.getAccountData = exports.login = exports.register = void 0;
const userService = __importStar(require("./services"));
//
// res.status(code) → Sets the HTTP response status.
//  If result.success is true, send status 200 (OK).
//  If result.success is false, send status 400 (Bad Request).
// .json(result) → Sends result back to the client as a JSON response.
const register = (req, res) => {
    const result = userService.registerUser(req.body);
    res.status(result.success ? 200 : 400).json(result);
};
exports.register = register;
const login = (req, res) => {
    const result = userService.loginUser(req.body);
    res.status(result.success ? 200 : 400).json(result);
};
exports.login = login;
const getAccountData = (req, res) => {
    const data = userService.getAccount(req.body.username);
    res.status(data ? 200 : 404).json(data || { error: 'User not found' });
};
exports.getAccountData = getAccountData;
const updateAccountData = (req, res) => {
    const result = userService.updateAccount(req.body.username, req.body.data);
    res.status(result.success ? 200 : 400).json(result);
};
exports.updateAccountData = updateAccountData;
