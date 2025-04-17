function updateGreeting() {
    const username = document.getElementById('username').value;
    document.getElementById('greeting').innerText = "Hello, " + username + "!";
}

// Registration form handling
function handleRegistration() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        //e.target = formElement 
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
                localStorage.setItem('token', data.token);
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

// Initialize handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    handleRegistration();
    handleLogin();
});

// Forgot password function
function forgotPassword() {
    alert('Please contact support to reset your password.');
}