import api from './api';

// Get all transactions
export const getAllTransactions = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/transactions${params ? `?${params}` : ''}`);
    return response.data;
};

// Get transaction by ID
export const getTransactionById = async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
};

// Issue book
export const issueBook = async (issueData) => {
    const response = await api.post('/transactions/issue', issueData);
    return response.data;
};

// Return book
export const returnBook = async (transactionId) => {
    const response = await api.put(`/transactions/${transactionId}/return`);
    return response.data;
};

// Get overdue books
export const getOverdueBooks = async () => {
    const response = await api.get('/transactions/overdue');
    return response.data;
};

// Get member transactions
export const getMemberTransactions = async (memberId) => {
    const response = await api.get(`/transactions/member/${memberId}`);
    return response.data;
};
