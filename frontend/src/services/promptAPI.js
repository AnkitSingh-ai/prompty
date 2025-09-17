import api from './api';

// Prompt API functions
export const promptAPI = {
  // Create a new prompt
  createPrompt: async (promptData) => {
    const response = await api.post('/prompts', promptData);
    return response.data;
  },

  // Get user's own prompts
  getMyPrompts: async () => {
    const response = await api.get('/prompts/my-prompts');
    return response.data;
  },

  // Get all public prompts
  getPublicPrompts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/prompts?${queryParams}`);
    return response.data;
  },

  // Get a single prompt by ID
  getPromptById: async (id) => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  },

  // Update a prompt
  updatePrompt: async (id, promptData) => {
    const response = await api.put(`/prompts/${id}`, promptData);
    return response.data;
  },

  // Delete a prompt
  deletePrompt: async (id) => {
    const response = await api.delete(`/prompts/${id}`);
    return response.data;
  },
};

export default promptAPI;

