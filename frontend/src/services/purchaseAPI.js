import api from './api';

// Purchase API functions
export const purchaseAPI = {
  // Get user's purchased prompts
  getPurchasedPrompts: async () => {
    const response = await api.get('/purchases/purchased');
    return response.data;
  },

  // Purchase a prompt
  purchasePrompt: async (promptId, paymentMethod = 'stripe') => {
    const response = await api.post(`/purchases/${promptId}`, {
      paymentMethod
    });
    return response.data;
  },

  // Download a purchased prompt
  downloadPrompt: async (purchaseId) => {
    const response = await api.get(`/purchases/download/${purchaseId}`);
    return response.data;
  },

  // Check if user has purchased a specific prompt
  checkPurchaseStatus: async (promptId) => {
    const response = await api.get(`/purchases/status/${promptId}`);
    return response.data;
  }
};

export default purchaseAPI;
