import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class FavoritesAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/favorites`,
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

  // Add prompt to favorites
  async addToFavorites(promptId) {
    try {
      const response = await this.api.post(`/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Add to favorites error:', error);
      throw new Error(error.response?.data?.error || 'Failed to add to favorites');
    }
  }

  // Remove prompt from favorites
  async removeFromFavorites(promptId) {
    try {
      const response = await this.api.delete(`/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove from favorites');
    }
  }

  // Check if prompt is in favorites
  async checkFavoriteStatus(promptId) {
    try {
      const response = await this.api.get(`/${promptId}/status`);
      return response.data;
    } catch (error) {
      console.error('Check favorite status error:', error);
      throw new Error('Failed to check favorite status');
    }
  }

  // Get user's favorite prompts
  async getFavorites(page = 1, limit = 20) {
    try {
      const response = await this.api.get('/', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get favorites error:', error);
      throw new Error('Failed to fetch favorites');
    }
  }

  // Get multiple favorite statuses
  async getFavoriteStatuses(promptIds) {
    try {
      const response = await this.api.post('/statuses', { promptIds });
      return response.data;
    } catch (error) {
      console.error('Get favorite statuses error:', error);
      throw new Error('Failed to fetch favorite statuses');
    }
  }
}

export const favoritesAPI = new FavoritesAPI();
