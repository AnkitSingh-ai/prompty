import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class FollowAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/follow`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('promptverse_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Follow a user
  async followUser(userId) {
    try {
      const response = await this.api.post(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Follow user error:', error);
      throw new Error(error.response?.data?.error || 'Failed to follow user');
    }
  }

  // Unfollow a user
  async unfollowUser(userId) {
    try {
      const response = await this.api.delete(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Unfollow user error:', error);
      throw new Error(error.response?.data?.error || 'Failed to unfollow user');
    }
  }

  // Check if current user is following a specific user
  async checkFollowStatus(userId) {
    try {
      const response = await this.api.get(`/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Check follow status error:', error);
      throw new Error('Failed to check follow status');
    }
  }

  // Get followers of a user
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/${userId}/followers`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get followers error:', error);
      throw new Error('Failed to fetch followers');
    }
  }

  // Get users that a user is following
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/${userId}/following`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get following error:', error);
      throw new Error('Failed to fetch following');
    }
  }

  // Get follow suggestions
  async getFollowSuggestions(limit = 10) {
    try {
      const response = await this.api.get('/suggestions', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get follow suggestions error:', error);
      throw new Error('Failed to fetch follow suggestions');
    }
  }
}

export const followAPI = new FollowAPI();
