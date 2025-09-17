import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class CommentsAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/comments`,
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

  // Add a comment to a prompt
  async addComment(promptId, content) {
    try {
      const response = await this.api.post(`/${promptId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw new Error(error.response?.data?.error || 'Failed to add comment');
    }
  }

  // Get comments for a prompt
  async getComments(promptId, page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/${promptId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get comments error:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const response = await this.api.delete(`/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete comment');
    }
  }
}

export const commentsAPI = new CommentsAPI();
