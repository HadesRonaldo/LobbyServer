import { Request, Response } from 'express';
import * as userService from './services';

//
// res.status(code) → Sets the HTTP response status.
//  If result.success is true, send status 200 (OK).
//  If result.success is false, send status 400 (Bad Request).
// .json(result) → Sends result back to the client as a JSON response.
export const register = (req: Request, res: Response) => {
    const result = userService.registerUser(req.body);
    // res.status(result.success ? 200 : 400).json(result);
    res.status(200).json(result);
};

export const login = (req: Request, res: Response) => {
    const result = userService.loginUser(req.body);
    res.status(result.success ? 200 : 400).json(result);
};

export const getAccountData = (req: Request, res: Response) => {
    const data = userService.getAccount(req.body.username);
    res.status(data ? 200 : 404).json(data || { error: 'User not found' });
};

export const updateAccountData = (req: Request, res: Response) => {
    const result = userService.updateAccount(req.body.username, req.body.data);
    res.status(result.success ? 200 : 400).json(result);
};
