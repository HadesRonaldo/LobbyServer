import express, { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket, ServerOptions } from 'socket.io';
import routes from './routes';

const app = express();
const PORT: number = 443;

// Load SSL certificate & private key safely
let options: https.ServerOptions;
try {
    options = {
        key: fs.readFileSync('certificates/private-key.pem'),
        cert: fs.readFileSync('certificates/certificate.pem')
    };
} catch (error) {
    console.error("⚠️ SSL Certificate Error:", error);
    process.exit(1); // Exit if SSL files are missing
}

// Middleware for JSON request parsing
app.use(express.json());

// Serve static web files
app.use(express.static(path.join(__dirname, './../public')));

// API routes
app.use('/api', routes);

// Create HTTPS server
const server: https.Server = https.createServer(options, app);

// Initialize WebSocket server
const io: Server = new Server(server);

// **Track WebSocket sessions**
const activeSessions: Map<string, { lastHeartbeat: number }> = new Map();

io.on("connection", (socket: Socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

    // Register session on connection
    activeSessions.set(socket.id, { lastHeartbeat: Date.now() });

    // Handle heartbeat updates
    socket.on("heartbeat", (data: { time: number }) => {
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
    const now: number = Date.now();
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
