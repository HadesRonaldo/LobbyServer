import { getToken } from './auth.js';
import utils from './utils.js';

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket) return;

        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.connected = true;
            this.joinLobby();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.connected = false;
        });

        this.setupEventHandlers();
        this.startHeartbeat();
    }

    joinLobby() {
        const username = utils.getUsername();
        if (username) {
            this.socket.emit('joinLobby', { username });
        }
    }

    setupEventHandlers() {
        // Player count updates
        this.socket.on('playerCountUpdate', (data) => {
            document.getElementById('quickMatchPlayers').textContent = `${data.quickMatch} players`;
            document.getElementById('customGamePlayers').textContent = `${data.customGame} players`;
            document.getElementById('tournamentPlayers').textContent = `${data.tournament} players`;
        });

        // Chat messages
        this.socket.on('chatMessage', (data) => {
            const chatMessages = document.getElementById('chatMessages');
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // Setup chat input handlers
        const sendButton = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');

        if (sendButton && chatInput) {
            sendButton.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message && this.connected) {
            const username = utils.getUsername();
            this.socket.emit('chatMessage', {
                username,
                message
            });
            input.value = '';
        }
    }

    startHeartbeat() {
        setInterval(() => {
            if (this.connected) {
                this.socket.emit('heartbeat', { time: Date.now() });
            }
        }, 10000);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }
}

// Create and export a singleton instance
const websocketManager = new WebSocketManager();
export default websocketManager; 