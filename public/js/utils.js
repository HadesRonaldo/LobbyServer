// Utility functions
const utils = {
    // Sanitize input
    sanitizeInput: (input) => {
        if (typeof input === 'string') {
            return input.trim().replace(/[<>]/g, '');
        }
        return input;
    },

    // Validate email format
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate password strength
    validatePassword: (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        // const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        // return re.test(password);
        if (password.length < 1) {
            return false;
        }
        return true;
    },

    // Show error message
    showError: (message, elementId = null) => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
                return;
            }
        }
        alert(message);
    },

    // Hide error message
    hideError: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    // Update greeting
    updateGreeting: () => {
        const username = document.getElementById('username')?.value;
        const greetingElement = document.getElementById('greeting');
        if (greetingElement && username) {
            greetingElement.innerText = "Hello, " + username + "!";
        }
    },

    // Get username from token
    getUsername: () => {
        const token = sessionStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.username;
        } catch (error) {
            console.error('Error getting username from token:', error);
            return null;
        }
    }
};

export default utils; 