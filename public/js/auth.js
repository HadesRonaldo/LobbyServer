// Token management
function getToken() {
    return sessionStorage.getItem('token');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function saveToken(token, refreshToken) {
    sessionStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
}

function isLoggedIn() {
    return !!getToken();
}

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
}

// Token refresh and monitoring
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
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
        if (response.ok && data.success) {
            saveToken(data.token, data.refreshToken);
            return data.token;
        } else {
            clearTokens();
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens();
        return null;
    }
}

function startTokenMonitor() {
    setInterval(() => {
        const token = getToken();
        if (token && isTokenExpired(token)) {
            console.log('Token expired, attempting refresh...');
            refreshAccessToken().catch(error => {
                console.error('Token refresh failed:', error);
                if (!window.location.pathname.includes('index.html') && 
                    window.location.pathname !== '/') {
                    alert('Your session has expired. Please log in again.');
                    window.location.href = 'index.html';
                }
            });
        }
    }, 60000); // Check every minute
}

// Auto login
async function checkAutoLogin() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const newToken = await refreshAccessToken();
        if (newToken) {
            window.location.href = '/lobby.html';
            return true;
        }
    } catch (error) {
        console.error('Auto login error:', error);
        clearTokens();
    }
    return false;
}

// Logout
function logout() {
    clearTokens();
    window.location.href = 'index.html';
}

export {
    getToken,
    getRefreshToken,
    saveToken,
    clearTokens,
    isLoggedIn,
    isTokenExpired,
    refreshAccessToken,
    startTokenMonitor,
    checkAutoLogin,
    logout
}; 