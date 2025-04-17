// 从本地存储获取 token
function getToken() {
    return localStorage.getItem('token');
}

// 从本地存储获取刷新 token
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

// 保存 token 到本地存储
function saveToken(token, refreshToken) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
}

// 刷新 access token
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        alert('No refresh token available. Please log in again.');
        window.location.href = 'index.html';
        return null;
    }

    try {
        const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (response.ok) {
            saveToken(data.accessToken, refreshToken);
            return data.accessToken;
        } else {
            alert(data.message || 'Failed to refresh token. Please log in again.');
            window.location.href = 'index.html';
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        alert('An error occurred while refreshing the token. Please try again.');
        window.location.href = 'index.html';
        return null;
    }
}

// 带有 token 刷新机制的请求函数
async function fetchWithTokenRefresh(url, options = {}) {
    let token = getToken();
    if (!token) {
        alert('No token available. Please log in.');
        window.location.href = 'index.html';
        return;
    }

    // 添加 token 到请求头
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
        // token 过期，尝试刷新
        const newToken = await refreshAccessToken();
        if (newToken) {
            // 使用新的 token 重新发起请求
            options.headers['Authorization'] = `Bearer ${newToken}`;
            return fetch(url, options);
        }
    }

    return response;
}

function updateGreeting() {
    const username = document.getElementById('username').value;
    document.getElementById('greeting').innerText = "Hello, " + username + "!";
}

// Registration form handling
function handleRegistration() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            email: document.getElementById('email').value
        };

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        delete formData.confirmPassword;

        try {
            // Send data to server
            const response = await fetch('https://localhost/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Handle successful registration
            if (data.success) {
                alert('Registration successful!');
                window.location.href = 'index.html'; // Redirect to login page
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
}

// Login form handling
function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            // Send data to server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                saveToken(data.accessToken, data.refreshToken);
                window.location.href = '/lobby.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
}

// 获取账户数据
async function getAccountData() {
    try {
        const response = await fetchWithTokenRefresh('/api/account', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            // 处理账户数据
            console.log('Account data:', data);
        } else {
            alert(data.message || 'Failed to get account data.');
        }
    } catch (error) {
        console.error('Error getting account data:', error);
        alert('An error occurred while getting account data. Please try again.');
    }
}

// 更新账户数据
async function updateAccountData(newData) {
    try {
        const response = await fetchWithTokenRefresh('/api/account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: getUsername(), data: newData })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Account data updated successfully.');
        } else {
            alert(data.message || 'Failed to update account data.');
        }
    } catch (error) {
        console.error('Error updating account data:', error);
        alert('An error occurred while updating account data. Please try again.');
    }
}

// 从 token 中获取用户名
function getUsername() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Initialize handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    handleRegistration();
    handleLogin();
});

// Forgot password function
function forgotPassword() {
    alert('Please contact support to reset your password.');
}