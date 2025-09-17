import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class DashboardAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/dashboard`,
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

  // Get user dashboard statistics
  async getDashboardStats() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  // Get prompt analytics
  async getPromptAnalytics(promptId) {
    try {
      const response = await this.api.get(`/analytics/prompt/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Prompt analytics error:', error);
      throw new Error('Failed to fetch prompt analytics');
    }
  }

  // Get marketplace statistics
  async getMarketplaceStats() {
    try {
      const response = await this.api.get('/marketplace-stats');
      return response.data;
    } catch (error) {
      console.error('Marketplace stats error:', error);
      throw new Error('Failed to fetch marketplace statistics');
    }
  }
}

export const dashboardAPI = new DashboardAPI();
