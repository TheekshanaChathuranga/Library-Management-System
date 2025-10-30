import api from './api';

// Get dashboard statistics
export const getDashboardStats = async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
};

// Get popular books
export const getPopularBooks = async (limit = 5) => {
    const response = await api.get(`/stats/popular-books?limit=${limit}`);
    return response.data;
};

// Get category statistics
export const getCategoryStats = async () => {
    const response = await api.get('/stats/categories');
    return response.data;
};

// Get monthly report
export const getMonthlyReport = async (year = new Date().getFullYear()) => {
    const response = await api.get(`/stats/monthly-report?year=${year}`);
    return response.data;
};

// Get member statistics
export const getMemberStats = async () => {
    const response = await api.get('/stats/members');
    return response.data;
};
