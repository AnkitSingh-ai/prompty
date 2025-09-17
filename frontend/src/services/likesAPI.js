import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class LikesAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/likes`,
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

  // Like a prompt
  async likePrompt(promptId) {
    try {
      const response = await this.api.post(`/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Like prompt error:', error);
      throw new Error(error.response?.data?.error || 'Failed to like prompt');
    }
  }

  // Unlike a prompt
  async unlikePrompt(promptId) {
    try {
      const response = await this.api.delete(`/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Unlike prompt error:', error);
      throw new Error(error.response?.data?.error || 'Failed to unlike prompt');
    }
  }

  // Check if prompt is liked by user
  async checkLikeStatus(promptId) {
    try {
      const response = await this.api.get(`/${promptId}/status`);
      return response.data;
    } catch (error) {
      console.error('Check like status error:', error);
      throw new Error('Failed to check like status');
    }
  }

  // Get multiple like statuses
  async getLikeStatuses(promptIds) {
    try {
      const response = await this.api.post('/statuses', { promptIds });
      return response.data;
    } catch (error) {
      console.error('Get like statuses error:', error);
      throw new Error('Failed to fetch like statuses');
    }
  }
}

export const likesAPI = new LikesAPI();
