import React, { useState } from 'react';
import { X, Upload, Tag, DollarSign, Eye, EyeOff, Sparkles } from 'lucide-react';
import { promptAPI } from '../services/promptAPI';
import { uploadAPI } from '../services/uploadAPI';

const CreatePromptModal = ({ isOpen, onClose, onPromptCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    category: '',
    tags: '',
    price: '',
    isPublic: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Art & Design',
    'Photography',
    'Writing',
    'Marketing',
    'Business',
    'Education',
    'Entertainment',
    'Technology',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log('Image file selected:', file);
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        isFile: file instanceof File
      });
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImagePreview(dataUrl);
        console.log('Image preview created:', dataUrl.substring(0, 100) + '...');
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.prompt || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      let imageUrl = null;
      
      // Upload image if provided
      console.log('Form data image:', formData.image);
      console.log('Image type:', typeof formData.image);
      console.log('Is File instance:', formData.image instanceof File);
      
      if (formData.image && formData.image instanceof File) {
        console.log('Processing image file:', formData.image);
        setUploading(true);
        try {
          // Compress the image to reduce payload size
          imageUrl = await compressImage(formData.image, 800, 0.7);
          console.log('Using compressed data URL for image (first 100 chars):', imageUrl.substring(0, 100) + '...');
        } catch (uploadError) {
          console.error('Image processing failed:', uploadError);
          // Use a unique placeholder based on file name and timestamp
          const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
          imageUrl = `https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?v=${uniqueId}`;
          console.log('Using unique placeholder:', imageUrl);
        } finally {
          setUploading(false);
        }
      } else if (formData.image && typeof formData.image === 'string') {
        // If image is already a URL string, use it directly
        console.log('Using existing image URL:', formData.image);
        imageUrl = formData.image;
      } else {
        console.log('No image provided or invalid image format');
      }

      // Create prompt data
      const promptData = {
        title: formData.title,
        description: formData.description,
        prompt: formData.prompt,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: formData.price ? parseFloat(formData.price) : 0,
        isPublic: formData.isPublic,
        image: imageUrl
      };

      console.log('Sending prompt data:', promptData);
      console.log('Image URL type:', typeof imageUrl, 'Value:', imageUrl);

      // Call the API to create the prompt
      const createdPrompt = await promptAPI.createPrompt(promptData);

      setSuccess('Prompt created successfully! It will be reviewed before going live.');
      
      // Call the callback to update the parent component
      if (onPromptCreated) {
        onPromptCreated(createdPrompt);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        prompt: '',
        category: '',
        tags: '',
        price: '',
        isPublic: true,
        image: null
      });
      setImagePreview(null);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating prompt:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Clear local storage and redirect to login
        localStorage.removeItem('promptverse_token');
        localStorage.removeItem('promptverse_user');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(error.message || 'Failed to create prompt. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create New Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-300">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a compelling title for your prompt"
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your prompt does and what users can expect"
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              required
            />
          </div>

          {/* Prompt Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Prompt Content *
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Enter your AI prompt here. Be specific and detailed for best results."
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
              required
            />
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas (e.g., art, digital, creative)"
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Preview Image
            </label>
            {uploading ? (
              <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-purple-300">Uploading image...</p>
                <p className="text-gray-400 text-sm">This should only take a few seconds</p>
              </div>
            ) : imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }));
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">Upload a preview image (optional)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {formData.isPublic ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-white font-medium">
                  {formData.isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-sm text-gray-400">
                  {formData.isPublic 
                    ? 'Anyone can discover and purchase this prompt'
                    : 'Only you can see this prompt'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('isPublic', !formData.isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublic ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading Image...' : loading ? 'Creating...' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromptModal;
