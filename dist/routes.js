"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("./controllers");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
router.post('/register', controllers_1.register);
router.post('/login', controllers_1.login);
router.get('/account', middleware_1.authenticateToken, controllers_1.getAccountData);
router.put('/account', middleware_1.authenticateToken, controllers_1.updateAccountData);
router.post('/refresh-token', controllers_1.refreshAccessToken);
exports.default = router;
