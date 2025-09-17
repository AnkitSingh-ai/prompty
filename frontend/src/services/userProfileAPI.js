import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class UserProfileAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/user-profile`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get user profile data
  async getUserProfile(userId) {
    try {
      const response = await this.api.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
    }
  }

  // Get user's followers
  async getUserFollowers(userId, page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/${userId}/followers`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get user followers error:', error);
      throw new Error('Failed to fetch followers');
    }
  }

  // Get user's following
  async getUserFollowing(userId, page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/${userId}/following`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get user following error:', error);
      throw new Error('Failed to fetch following');
    }
  }
}

export const userProfileAPI = new UserProfileAPI();
