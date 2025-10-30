import api from './api';

// Login
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

// Register (Admin only)
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Get profile
export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Get current user
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Check if user has role
export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};
