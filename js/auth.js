// Handle login and registration functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Login handler
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Here you would typically make an API call to your backend
    // For demo purposes, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful!');
        window.location.href = 'index.html';
    } else {
        alert('Invalid email or password');
    }
}

// Registration handler
function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered');
        return;
    }

    // Add new user
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password // In a real application, this should be hashed
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

// Check authentication status
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}