import React, { useState } from 'react';
import { X, Calendar, Eye, Heart, MessageCircle, Star, Tag, DollarSign, Globe, Lock, Image as ImageIcon, User, Clock, Copy, CheckCircle } from 'lucide-react';

const PromptDetailModal = ({ isOpen, onClose, prompt }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      alert('Failed to copy prompt. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-slate-800/90 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{prompt.title}</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{prompt.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {prompt.isPublic ? (
                  <div className="flex items-center bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    <Globe className="w-4 h-4 mr-1" />
                    Public
                  </div>
                ) : (
                  <div className="flex items-center bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                    <Lock className="w-4 h-4 mr-1" />
                    Private
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Created {formatTimeAgo(prompt.createdAt)}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {prompt.views || 0} views
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {prompt.likes || 0} likes
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {prompt.reviews?.length || 0} reviews
              </div>
            </div>
          </div>

          {/* Image */}
          {prompt.image && (
            <div className="mb-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-slate-700/50">
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-700/50">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Image not available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Prompt Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Text */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Prompt Content
                  </h3>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                    title="Copy prompt to clipboard"
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {prompt.prompt}
                  </pre>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Category</label>
                    <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                      {prompt.category}
                    </span>
                  </div>
                  
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-slate-600/50 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${prompt.price || 0}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {prompt.price > 0 ? 'Premium Prompt' : 'Free Prompt'}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Sales</span>
                    <span className="text-white font-semibold">{prompt.sales || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-white font-semibold">{prompt.rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Earnings</span>
                    <span className="text-green-400 font-semibold">${prompt.earnings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prompt.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : prompt.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {prompt.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Author
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{prompt.author?.name || 'You'}</p>
                    <p className="text-gray-400 text-sm">
                      {prompt.author?.role === 'admin' ? 'Admin' : 'Creator'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white">{formatDate(prompt.createdAt)}</p>
                  </div>
                  {prompt.updatedAt && prompt.updatedAt !== prompt.createdAt && (
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <p className="text-white">{formatDate(prompt.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;
