import api from './api';

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Get admin stats error:', error);
    throw error.response?.data || { message: 'Failed to fetch admin statistics' };
  }
};

// Get recent users
export const getRecentUsers = async (limit = 10) => {
  try {
    const response = await api.get(`/admin/users/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get recent users error:', error);
    throw error.response?.data || { message: 'Failed to fetch recent users' };
  }
};

// Get pending prompts
export const getPendingPrompts = async (limit = 10) => {
  try {
    const response = await api.get(`/admin/prompts/pending?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get pending prompts error:', error);
    throw error.response?.data || { message: 'Failed to fetch pending prompts' };
  }
};

// Approve a prompt
export const approvePrompt = async (promptId) => {
  try {
    const response = await api.put(`/admin/prompts/${promptId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Approve prompt error:', error);
    throw error.response?.data || { message: 'Failed to approve prompt' };
  }
};

// Reject a prompt
export const rejectPrompt = async (promptId, reason) => {
  try {
    const response = await api.put(`/admin/prompts/${promptId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Reject prompt error:', error);
    throw error.response?.data || { message: 'Failed to reject prompt' };
  }
};

// Get all users with pagination
export const getAllUsers = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async () => {
  try {
    const response = await api.get('/admin/revenue');
    return response.data;
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    throw error.response?.data || { message: 'Failed to fetch revenue analytics' };
  }
};

export const adminAPI = {
  getAdminStats,
  getRecentUsers,
  getPendingPrompts,
  approvePrompt,
  rejectPrompt,
  getAllUsers,
  getRevenueAnalytics
};

export default adminAPI;
