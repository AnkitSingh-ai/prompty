import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Trash2, Star, Filter, Grid, List, Eye, Copy, CheckCircle, Edit, MoreVertical } from 'lucide-react';
import { purchaseAPI } from '../../services/purchaseAPI';
import { promptAPI } from '../../services/promptAPI';
import { favoritesAPI } from '../../services/favoritesAPI';
import PromptDetailModal from '../PromptDetailModal';

const Library = () => {
  const [activeTab, setActiveTab] = useState('purchased');
  const [viewMode, setViewMode] = useState('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [purchasedPrompts, setPurchasedPrompts] = useState([]);
  const [myPrompts, setMyPrompts] = useState([]);
  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [downloadingPrompt, setDownloadingPrompt] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const tabs = [
    { id: 'purchased', label: 'Purchased', count: purchasedPrompts.length },
    { id: 'created', label: 'My Prompts', count: myPrompts.length },
    { id: 'favorites', label: 'Favorites', count: favoritePrompts.length },
    { id: 'generated', label: 'Generated', count: 0 },
  ];

  // Load prompts based on active tab
  useEffect(() => {
    if (activeTab === 'purchased') {
      loadPurchasedPrompts();
    } else if (activeTab === 'created') {
      loadMyPrompts();
    } else if (activeTab === 'favorites') {
      loadFavorites();
    }
  }, [activeTab]);

  const loadPurchasedPrompts = async () => {
    setLoading(true);
    try {
      const prompts = await purchaseAPI.getPurchasedPrompts();
      setPurchasedPrompts(prompts);
    } catch (error) {
      console.error('Failed to load purchased prompts:', error);
      setPurchasedPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyPrompts = async () => {
    setLoading(true);
    try {
      const prompts = await promptAPI.getMyPrompts();
      setMyPrompts(prompts);
    } catch (error) {
      console.error('Failed to load my prompts:', error);
      setMyPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getFavorites();
      setFavoritePrompts(response.favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavoritePrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (prompt) => {
    setDownloadingPrompt(prompt._id || prompt.id);
    try {
      // For favorites, we don't have a purchaseId, so just download the prompt content
      let result;
      if (prompt.purchaseId) {
        result = await purchaseAPI.downloadPrompt(prompt.purchaseId);
      } else {
        // Create download content from the prompt data
        result = {
          prompt: {
            title: prompt.prompt?.title || prompt.title,
            description: prompt.prompt?.description || prompt.description,
            prompt: prompt.prompt?.prompt || prompt.content || 'Prompt content not available',
            category: prompt.prompt?.category || prompt.category,
            tags: prompt.prompt?.tags || prompt.tags || [],
            author: prompt.prompt?.author || prompt.author
          }
        };
      }
      
      // Create a downloadable text file
      const content = `Title: ${result.prompt.title}\n\nDescription: ${result.prompt.description}\n\nPrompt:\n${result.prompt.prompt}\n\nCategory: ${result.prompt.category}\nTags: ${result.prompt.tags.join(', ')}\nAuthor: ${result.prompt.author?.name || 'Unknown'}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Prompt downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingPrompt(null);
    }
  };

  const handleCopyPrompt = async (prompt) => {
    try {
      const promptText = prompt.prompt?.prompt || prompt.content || prompt.prompt;
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(prompt._id || prompt.id);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      alert('Failed to copy prompt. Please try again.');
    }
  };

  const handleViewPrompt = (prompt) => {
    setViewingPrompt(prompt);
    setShowDetailModal(true);
  };

  const handleEditPrompt = (prompt) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/dashboard/profile?edit=${prompt._id || prompt.id}`;
  };

  const handleDeletePrompt = async (prompt) => {
    if (window.confirm(`Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`)) {
      try {
        await promptAPI.deletePrompt(prompt._id || prompt.id);
        // Reload prompts after deletion
        if (activeTab === 'created') {
          loadMyPrompts();
        }
        alert('Prompt deleted successfully!');
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };


  const GridView = () => {
    const prompts = activeTab === 'purchased' ? purchasedPrompts : 
                   activeTab === 'created' ? myPrompts : 
                   activeTab === 'favorites' ? favoritePrompts : [];
    
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {prompts.map((prompt) => (
          <div
            key={prompt._id || prompt.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all group cursor-pointer"
            onClick={() => handleViewPrompt(prompt)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
                alt={prompt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2 flex space-x-1">
                {activeTab === 'purchased' ? (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(prompt);
                      }}
                      disabled={downloadingPrompt === (prompt._id || prompt.id)}
                      className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                      title="Download prompt"
                    >
                      {downloadingPrompt === (prompt._id || prompt.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(prompt);
                      }}
                      className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500 transition-colors"
                      title="Copy prompt"
                    >
                      {copiedPrompt === (prompt._id || prompt.id) ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrompt(prompt);
                      }}
                      className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500 transition-colors"
                      title="Edit prompt"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(prompt);
                      }}
                      className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                {prompt.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-400">
                <p>{prompt.category}</p>
                {activeTab === 'purchased' ? (
                  <>
                    <p>By {prompt.author?.name || 'Unknown'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {prompt.rating || 0}
                      </div>
                      <span className="text-purple-300">${prompt.price || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Purchased: {new Date(prompt.purchaseDate).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p>Created by you</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {prompt.rating || 0}
                      </div>
                      <span className="text-green-300">${prompt.price || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(prompt.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sales: {prompt.sales || 0} | Earnings: ${((prompt.sales || 0) * (prompt.price || 0)).toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ListView = () => {
    const prompts = activeTab === 'purchased' ? purchasedPrompts : 
                   activeTab === 'created' ? myPrompts : 
                   activeTab === 'favorites' ? favoritePrompts : [];
    
    return (
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div
            key={prompt._id || prompt.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all cursor-pointer"
            onClick={() => handleViewPrompt(prompt)}
          >
            <div className="flex items-center space-x-4">
              <img
                src={prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
                alt={prompt.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">{prompt.title}</h3>
                <p className="text-sm text-gray-400">{prompt.category}</p>
                {activeTab === 'purchased' ? (
                  <>
                    <p className="text-sm text-gray-400">By {prompt.author?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      Purchased: {new Date(prompt.purchaseDate).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">Created by you</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(prompt.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-white">${prompt.price || 0}</p>
                <div className="flex items-center text-sm text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  {prompt.rating || 0}
                </div>
                {activeTab === 'purchased' ? (
                  <p className="text-xs text-gray-500">
                    Downloads: {prompt.downloadCount || 0}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Sales: {prompt.sales || 0}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                {activeTab === 'purchased' ? (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(prompt);
                      }}
                      disabled={downloadingPrompt === (prompt._id || prompt.id)}
                      className="p-2 bg-white/10 hover:bg-green-500 rounded-lg text-white transition-colors disabled:opacity-50"
                      title="Download prompt"
                    >
                      {downloadingPrompt === (prompt._id || prompt.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(prompt);
                      }}
                      className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg text-white transition-colors"
                      title="Copy prompt"
                    >
                      {copiedPrompt === (prompt._id || prompt.id) ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrompt(prompt);
                      }}
                      className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg text-white transition-colors"
                      title="Edit prompt"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(prompt);
                      }}
                      className="p-2 bg-white/10 hover:bg-red-500 rounded-lg text-white transition-colors"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPrompt(prompt);
                  }}
                  className="p-2 bg-white/10 hover:bg-purple-500 rounded-lg text-white transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-purple-400" />
            My Library
          </h1>
          <p className="text-gray-400">
            Manage your purchased prompts, creations, and favorites
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="pl-10 pr-8 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Photography">Photography</option>
                <option value="Abstract">Abstract</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (activeTab === 'purchased' && purchasedPrompts.length > 0) || (activeTab === 'created' && myPrompts.length > 0) ? (
          viewMode === 'grid' ? <GridView /> : <ListView />
        ) : (activeTab === 'favorites' && favoritePrompts.length > 0) ? (
          viewMode === 'grid' ? <GridView /> : <ListView />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-gray-400">
              {activeTab === 'purchased' && "You haven't purchased any prompts yet. Visit the marketplace to find amazing prompts!"}
              {activeTab === 'created' && "You haven't created any prompts yet. Start creating amazing prompts!"}
              {activeTab === 'favorites' && "You haven't favorited any prompts yet."}
              {activeTab === 'generated' && "You haven't generated any content yet. Visit the AI Playground to start creating!"}
            </p>
            {activeTab === 'purchased' && (
              <button 
                onClick={() => window.location.href = '/dashboard/marketplace'}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Browse Marketplace
              </button>
            )}
            {activeTab === 'created' && (
              <button 
                onClick={() => window.location.href = '/dashboard/profile'}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create New Prompt
              </button>
            )}
          </div>
        )}

        {/* Prompt Detail Modal */}
        <PromptDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setViewingPrompt(null);
          }}
          prompt={viewingPrompt}
        />
      </div>
    </div>
  );
};

export default Library;