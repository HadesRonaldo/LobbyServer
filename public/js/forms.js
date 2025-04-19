import { fetchWithTokenRefresh } from './api.js';
import { isLoggedIn } from './auth.js';
import utils from './utils.js';

// Login form handling
function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Check if user is already logged in
    if (isLoggedIn()) {
        window.location.href = '/lobby.html';
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            username: utils.sanitizeInput(document.getElementById('username').value),
            password: document.getElementById('password').value
        };

        // Basic input validation
        if (!formData.username || !formData.password) {
            utils.showError('Please fill in all required fields');
            return;
        }

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;

            if (response.ok && data.success) {
                // Save tokens and redirect
                sessionStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                window.location.href = '/lobby.html';
            } else {
                utils.showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showError('An error occurred during login');
        }
    });
}

// Registration form handling
function handleRegistration() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            username: utils.sanitizeInput(document.getElementById('username').value),
            email: utils.sanitizeInput(document.getElementById('email').value),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Input validation
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            utils.showError('Please fill in all required fields');
            return;
        }

        if (!utils.validateEmail(formData.email)) {
            utils.showError('Please enter a valid email address');
            return;
        }

        if (!utils.validatePassword(formData.password)) {
            utils.showError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            utils.showError('Passwords do not match');
            return;
        }

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;

            if (response.ok && data.success) {
                alert('Registration successful! Please log in.');
                window.location.href = 'index.html';
            } else {
                utils.showError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            utils.showError('An error occurred during registration');
        }
    });
}

// Forgot password handling
function handleForgotPassword() {
    const form = document.getElementById('forgotPasswordForm');
    const passwordFields = document.getElementById('passwordFields');
    const submitButton = document.getElementById('submitButton');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    let isVerified = false;

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!isVerified) {
            // First step: Verify username and email
            const formData = {
                username: utils.sanitizeInput(document.getElementById('username').value),
                email: utils.sanitizeInput(document.getElementById('email').value)
            };

            // Input validation
            if (!formData.username || !formData.email) {
                utils.showError('Please fill in all required fields');
                return;
            }

            if (!utils.validateEmail(formData.email)) {
                utils.showError('Please enter a valid email address');
                return;
            }

            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.textContent = 'Verifying...';

                const response = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Show password fields and update button
                    passwordFields.classList.remove('hidden');
                    newPasswordInput.required = true;
                    confirmPasswordInput.required = true;
                    submitButton.textContent = 'Reset Password';
                    isVerified = true;
                } else {
                    utils.showError(data.message || 'Verification failed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                utils.showError('An error occurred during verification');
            } finally {
                submitButton.disabled = false;
            }
        } else {
            // Second step: Reset password
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!newPassword || !confirmPassword) {
                utils.showError('Please fill in all required fields');
                return;
            }

            if (!utils.validatePassword(newPassword)) {
                utils.showError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
                return;
            }

            if (newPassword !== confirmPassword) {
                utils.showError('Passwords do not match');
                return;
            }

            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.textContent = 'Resetting...';

                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: utils.sanitizeInput(document.getElementById('username').value),
                        email: utils.sanitizeInput(document.getElementById('email').value),
                        newPassword: newPassword
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert('Password has been reset successfully!');
                    window.location.href = 'index.html';
                } else {
                    utils.showError(data.message || 'Password reset failed');
                }
            } catch (error) {
                console.error('Password reset error:', error);
                utils.showError('An error occurred while resetting password');
            } finally {
                submitButton.disabled = false;
            }
        }
    });
}

export {
    handleLogin,
    handleRegistration,
    handleForgotPassword
}; 