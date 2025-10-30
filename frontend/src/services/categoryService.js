import api from './api';

// Get all categories
export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

// Add category
export const addCategory = async (categoryName) => {
    const response = await api.post('/categories', { category_name: categoryName });
    return response.data;
};
