import { authAPI } from './api';

// Google OAuth service
export const googleAuth = {
  // Get Google OAuth URL from backend
  getAuthUrl: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/google/url`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get Google authentication URL');
      }
      
      return data.authUrl;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw new Error(error.message || 'Failed to get Google authentication URL');
    }
  },

  // Initiate Google OAuth flow
  signInWithGoogle: async () => {
    try {
      const authUrl = await googleAuth.getAuthUrl();
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Show user-friendly error message
      alert('Google sign-in is not available. Please use email and password to create an account or sign in.');
      throw error;
    }
  },

  // Handle OAuth callback (called from callback page)
  handleCallback: (token, userData) => {
    try {
      // Store token and user data
      localStorage.setItem('promptverse_token', token);
      localStorage.setItem('promptverse_user', JSON.stringify(userData));
      
      return {
        success: true,
        user: userData,
        token: token
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: 'Failed to process authentication'
      };
    }
  }
};

export default googleAuth;
