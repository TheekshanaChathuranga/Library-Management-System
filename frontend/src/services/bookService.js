import api from './api';

// Get all books
export const getAllBooks = async () => {
    const response = await api.get('/books');
    return response.data;
};

// Search books
export const searchBooks = async (query) => {
    const response = await api.get(`/books/search?q=${query}`);
    return response.data;
};

// Get book by ID
export const getBookById = async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
};

// Add book
export const addBook = async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
};

// Update book
export const updateBook = async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
};

// Delete book
export const deleteBook = async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
};

// Get popular books
export const getPopularBooks = async (limit = 10) => {
    const response = await api.get(`/books/popular?limit=${limit}`);
    return response.data;
};
