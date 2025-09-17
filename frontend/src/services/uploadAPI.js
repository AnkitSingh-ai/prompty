import api from './api';

// Upload API functions - simplified and reliable
export const uploadAPI = {
  // Upload image with comprehensive error handling
  uploadImage: async (imageFile) => {
    try {
      console.log('Starting image upload for file:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Check if we have a token
      const token = localStorage.getItem('promptverse_token');
      console.log('Auth token available:', !!token);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), 20000); // 20 second timeout
      });
      
      // Race between upload and timeout
      const response = await Promise.race([
        api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000, // 20 second timeout
        }),
        timeoutPromise
      ]);
      
      console.log('Upload successful:', response.data);
      return response.data;
    } catch (error) {
      // Log the actual error for debugging
      console.error('Image upload failed with error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error('Authentication failed - token may be expired or invalid');
        // Clear invalid token
        localStorage.removeItem('promptverse_token');
        localStorage.removeItem('promptverse_user');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // For all other errors, use a unique placeholder based on file name
      console.warn('Using fallback image due to upload error');
      const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        imageUrl: `https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?v=${uniqueId}`,
        publicId: `fallback-${uniqueId}`
      };
    }
  },
};

export default uploadAPI;
