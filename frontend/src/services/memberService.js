import api from './api';

// Get all members
export const getAllMembers = async (status = null) => {
    const url = status ? `/members?status=${status}` : '/members';
    const response = await api.get(url);
    return response.data;
};

// Search members
export const searchMembers = async (query) => {
    const response = await api.get(`/members/search?q=${query}`);
    return response.data;
};

// Get member by ID
export const getMemberById = async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
};

// Add member
export const addMember = async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
};

// Update member
export const updateMember = async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
};

// Delete member
export const deleteMember = async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
};
