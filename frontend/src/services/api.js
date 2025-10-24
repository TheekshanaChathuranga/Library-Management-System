import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

// Book APIs
export const bookAPI = {
    getAll: (params) => api.get('/books', { params }),
    getById: (id) => api.get(`/books/${id}`),
    search: (query) => api.get('/books/search', { params: { q: query } }),
    create: (bookData) => api.post('/books', bookData),
    update: (id, bookData) => api.put(`/books/${id}`, bookData),
    delete: (id) => api.delete(`/books/${id}`)
};

// Member APIs
export const memberAPI = {
    getAll: (params) => api.get('/members', { params }),
    getById: (id) => api.get(`/members/${id}`),
    getHistory: (id) => api.get(`/members/${id}/history`),
    create: (memberData) => api.post('/members', memberData),
    update: (id, memberData) => api.put(`/members/${id}`, memberData),
    delete: (id) => api.delete(`/members/${id}`)
};

// Transaction APIs
export const transactionAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    issueBook: (data) => api.post('/transactions/issue', data),
    returnBook: (data) => api.post('/transactions/return', data),
    reserveBook: (data) => api.post('/transactions/reserve', data)
};

// Report APIs
export const reportAPI = {
    getOverdue: () => api.get('/reports/overdue'),
    getPopular: (limit) => api.get('/reports/popular', { params: { limit } }),
    getStatistics: () => api.get('/reports/statistics'),
    getRevenue: (params) => api.get('/reports/revenue', { params })
};

export default api;