import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Tag, DollarSign, Eye, EyeOff } from 'lucide-react';

const EditPromptModal = ({ isOpen, onClose, prompt, onPromptUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    category: 'Art & Design',
    tags: [],
    price: 0,
    isPublic: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Art & Design',
    'Photography',
    'Writing',
    'Marketing',
    'Education',
    'Technology',
    'Business',
    'Lifestyle',
    'Entertainment',
    'Health & Fitness'
  ];

  useEffect(() => {
    if (prompt && isOpen) {
      setFormData({
        title: prompt.title || '',
        description: prompt.description || '',
        prompt: prompt.prompt || '',
        category: prompt.category || 'Art & Design',
        tags: prompt.tags || [],
        price: prompt.price || 0,
        isPublic: prompt.isPublic !== undefined ? prompt.isPublic : true,
        image: prompt.image || null
      });
      setImagePreview(prompt.image || null);
      setError('');
      setSuccess('');
    }
  }, [prompt, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log('Image file selected for edit:', file);
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        isFile: file instanceof File
      });
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL immediately with compression
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImagePreview(dataUrl);
        console.log('Image preview created for edit:', dataUrl.substring(0, 100) + '...');
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = null;

      // Process image if provided
      if (formData.image && formData.image instanceof File) {
        console.log('Processing image file for edit:', formData.image);
        setUploading(true);
        try {
          // Compress the image to reduce payload size
          imageUrl = await compressImage(formData.image, 800, 0.7);
          console.log('Using compressed data URL for edit image (first 100 chars):', imageUrl.substring(0, 100) + '...');
        } catch (uploadError) {
          console.error('Image processing failed for edit:', uploadError);
          // Use a unique placeholder based on file name and timestamp
          const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
          imageUrl = `https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?v=${uniqueId}`;
          console.log('Using unique placeholder for edit:', imageUrl);
        } finally {
          setUploading(false);
        }
      } else if (formData.image && typeof formData.image === 'string') {
        // If image is already a URL string, use it directly
        console.log('Using existing image URL for edit:', formData.image);
        imageUrl = formData.image;
      } else {
        console.log('No image provided or invalid image format for edit');
      }

      // Create prompt data
      const promptData = {
        title: formData.title,
        description: formData.description,
        prompt: formData.prompt,
        category: formData.category,
        tags: formData.tags,
        price: parseFloat(formData.price),
        isPublic: formData.isPublic,
        image: imageUrl
      };

      console.log('Sending edit prompt data:', promptData);

      // Import promptAPI dynamically to avoid circular imports
      const { promptAPI } = await import('../services/promptAPI');
      const updatedPrompt = await promptAPI.updatePrompt(prompt._id, promptData);
      
      console.log('Prompt updated successfully:', updatedPrompt);
      
      setSuccess('Prompt updated successfully!');
      onPromptUpdated(updatedPrompt);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        prompt: '',
        category: 'Art & Design',
        tags: [],
        price: 0,
        isPublic: true,
        image: null
      });
      setImagePreview(null);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating prompt:', error);
      
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
        setError(error.message || 'Failed to update prompt. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Edit Prompt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter a compelling title for your prompt"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Describe what this prompt does and how to use it"
              rows={3}
              required
            />
          </div>

          {/* Prompt Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Content *
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Enter your AI prompt here..."
              rows={4}
              required
            />
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-purple-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preview Image
            </label>
            {uploading ? (
              <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-purple-300">Processing image...</p>
                <p className="text-gray-400 text-sm">This should only take a few seconds</p>
              </div>
            ) : imagePreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="block w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-center text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Change Image
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="block w-full border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 mb-1">Click to upload an image</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
            )}
          </div>

          {/* Public/Private Toggle */}
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
                <p className="text-gray-400 text-sm">
                  {formData.isPublic 
                    ? 'Visible to everyone in the marketplace' 
                    : 'Only visible to you'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('isPublic', !formData.isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublic ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
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
              {uploading ? 'Processing Image...' : loading ? 'Updating...' : 'Update Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromptModal;
