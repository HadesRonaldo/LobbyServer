import { checkAutoLogin, startTokenMonitor, isLoggedIn } from './auth.js';
import { handleLogin, handleRegistration, handleForgotPassword } from './forms.js';
import utils from './utils.js';
import websocketManager from './websocket.js';

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Start token monitor
    startTokenMonitor();

    // Check auto login on index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        checkAutoLogin();
    }

    // Initialize form handlers based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/') {
        handleLogin();
    } else if (currentPage.includes('register.html')) {
        handleRegistration();
    } else if (currentPage.includes('forgot-password.html')) {
        handleForgotPassword();
    } else if (currentPage.includes('lobby.html')) {
        // Initialize lobby page
        if (!isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Update user info
        const username = utils.getUsername();
        if (username) {
            document.getElementById('username').textContent = username;
            document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
        }

        // Initialize WebSocket connection
        websocketManager.connect();
    }
}); 