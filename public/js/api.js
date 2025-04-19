import { getToken, isTokenExpired, refreshAccessToken } from './auth.js';

// API request with token refresh mechanism
async function fetchWithTokenRefresh(url, options = {}) {
    let token = getToken();
    
    // If token is missing or expired, try to refresh
    if (!token || isTokenExpired(token)) {
        token = await refreshAccessToken();
        if (!token) {
            if (!window.location.pathname.includes('index.html') && 
                window.location.pathname !== '/') {
                alert('Your session has expired. Please log in again.');
                window.location.href = 'index.html';
            }
            return null;
        }
    }

    // Add token to request headers
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            // Token expired, try to refresh
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Retry request with new token
                options.headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(url, options);
            } else {
                if (!window.location.pathname.includes('index.html') && 
                    window.location.pathname !== '/') {
                    alert('Your session has expired. Please log in again.');
                    window.location.href = 'index.html';
                }
                return null;
            }
        }

        return response;
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error occurred. Please try again.');
        return null;
    }
}

// Account data functions
async function getAccountData() {
    try {
        const response = await fetchWithTokenRefresh('/api/account');
        if (!response) return null;
        
        const data = await response.json();
        if (response.ok && data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching account data:', error);
        return null;
    }
}

async function updateAccountData(newData) {
    try {
        const response = await fetchWithTokenRefresh('/api/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

        if (!response) return false;
        
        const data = await response.json();
        return response.ok && data.success;
    } catch (error) {
        console.error('Error updating account data:', error);
        return false;
    }
}

export {
    fetchWithTokenRefresh,
    getAccountData,
    updateAccountData
}; 