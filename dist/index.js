"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = 443;
// Load SSL certificate & private key safely
let options;
try {
    options = {
        key: fs_1.default.readFileSync('certificates/private-key.pem'),
        cert: fs_1.default.readFileSync('certificates/certificate.pem')
    };
}
catch (error) {
    console.error("⚠️ SSL Certificate Error:", error);
    process.exit(1); // Exit if SSL files are missing
}
// Middleware for JSON request parsing
app.use(express_1.default.json());
// Serve static web files
app.use(express_1.default.static(path_1.default.join(__dirname, './../public')));
// API routes
app.use('/api', routes_1.default);
// Create HTTPS server
const server = https_1.default.createServer(options, app);
// Initialize WebSocket server
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
// **Track WebSocket sessions**
const activeSessions = new Map();
io.on("connection", (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
    // Register session on connection
    activeSessions.set(socket.id, { lastHeartbeat: Date.now() });
    // Handle heartbeat updates
    socket.on("heartbeat", (data) => {
        activeSessions.set(socket.id, { lastHeartbeat: Date.now() });
        console.log(`[${new Date().toISOString()}] Heartbeat received from ${socket.id}`);
    });
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);
        activeSessions.delete(socket.id);
    });
});
// **Periodic check for inactive clients**
setInterval(() => {
    const now = Date.now();
    for (const [socketId, session] of activeSessions) {
        if (now - session.lastHeartbeat > 30000) { // 30 seconds timeout
            console.log(`[${new Date().toISOString()}] Client ${socketId} timed out.`);
            activeSessions.delete(socketId);
        }
    }
}, 5000); // Check every 5 seconds
// Start server
server.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Secure lobby server running on https://localhost:${PORT}`);
});
