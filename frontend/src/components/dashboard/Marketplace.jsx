import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, ShoppingCart, Eye, Heart, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import { promptAPI } from '../../services/promptAPI';
import { purchaseAPI } from '../../services/purchaseAPI';
import PaymentModal from '../PaymentModal';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedPrompts, setLikedPrompts] = useState(new Set());
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedPrompts, setPurchasedPrompts] = useState(new Set());
  const [purchasingPrompt, setPurchasingPrompt] = useState(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPromptForPurchase, setSelectedPromptForPurchase] = useState(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Art & Design', label: 'Art & Design' },
    { id: 'Photography', label: 'Photography' },
    { id: 'Writing', label: 'Writing' },
    { id: 'Marketing', label: 'Marketing' },
    { id: 'Business', label: 'Business' },
    { id: 'Education', label: 'Education' },
    { id: 'Entertainment', label: 'Entertainment' },
    { id: 'Technology', label: 'Technology' },
    { id: 'Other', label: 'Other' },
  ];

  // Load prompts from database
  useEffect(() => {
    loadPrompts();
    checkPurchasedPrompts();
  }, []);

  const checkPurchasedPrompts = async () => {
    try {
      const purchased = await purchaseAPI.getPurchasedPrompts();
      const purchasedIds = new Set(purchased.map(p => p._id || p.id));
      setPurchasedPrompts(purchasedIds);
    } catch (error) {
      console.error('Failed to check purchased prompts:', error);
    }
  };

  const loadPrompts = async () => {
    console.log('Marketplace: Loading prompts...');
    setLoading(true);
    try {
      const response = await promptAPI.getPublicPrompts();
      console.log('Marketplace: API response:', response);
      // Extract prompts array from response
      const promptsData = response.prompts || response;
      console.log('Marketplace: Prompts data:', promptsData);
      // Transform database prompts to marketplace format
      const transformedPrompts = promptsData.map(prompt => {
        console.log('Marketplace: Processing prompt:', {
          id: prompt._id,
          title: prompt.title,
          image: prompt.image,
          imageType: typeof prompt.image
        });
        
        return {
          id: prompt._id,
          title: prompt.title,
          description: prompt.description,
          price: prompt.price || 0,
          rating: prompt.rating || 0,
          reviews: prompt.reviews?.length || 0,
          author: prompt.author?.name || 'Anonymous',
          authorAvatar: '👤',
          category: prompt.category,
          tags: prompt.tags || [],
          preview: prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
          sales: prompt.sales || 0,
          isFeatured: prompt.rating >= 4.5, // Mark high-rated prompts as featured
        };
      });
      console.log('Marketplace: Transformed prompts:', transformedPrompts);
      setPrompts(transformedPrompts);
    } catch (error) {
      console.error('Marketplace: Failed to load prompts:', error);
      setPrompts([]); // Fallback to empty array if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (promptId) => {
    setLikedPrompts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(promptId)) {
        newLiked.delete(promptId);
      } else {
        newLiked.add(promptId);
      }
      return newLiked;
    });
  };

  const handlePurchase = async (prompt) => {
    if (purchasedPrompts.has(prompt.id)) {
      alert('You have already purchased this prompt!');
      return;
    }

    if (prompt.price <= 0) {
      alert('This prompt is free and cannot be purchased!');
      return;
    }

    // Open payment modal
    setSelectedPromptForPurchase(prompt);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Process the purchase with the backend
      const result = await purchaseAPI.purchasePrompt(selectedPromptForPurchase.id);
      
      // Update purchased prompts set
      setPurchasedPrompts(prev => new Set([...prev, selectedPromptForPurchase.id]));
      
      // Close payment modal
      setShowPaymentModal(false);
      setSelectedPromptForPurchase(null);
      
      // Show success message
      alert('🎉 Purchase successful! The prompt has been added to your library.');
      
      // Refresh prompts to update sales count
      loadPrompts();
    } catch (error) {
      console.error('Purchase processing failed:', error);
      alert(error.response?.data?.message || 'Purchase processing failed. Please contact support.');
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Prompt Marketplace
              </h1>
              <p className="text-gray-400">
                Discover and purchase high-quality prompts from top creators
              </p>
            </div>
            <button 
              onClick={loadPrompts}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-11 pr-8 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-slate-800">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
            Featured Prompts
          </h2>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded mb-4"></div>
                    <div className="h-8 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : prompts.filter(p => p.isFeatured).length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {prompts.filter(p => p.isFeatured).map((prompt) => (
              <div
                key={prompt.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={prompt.preview}
                    alt={prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {prompt.title}
                    </h3>
                    <button
                      onClick={() => handleLike(prompt.id)}
                      className={`transition-colors ${
                        likedPrompts.has(prompt.id)
                          ? 'text-red-400'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedPrompts.has(prompt.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {prompt.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{prompt.authorAvatar}</span>
                      <div>
                        <p className="text-white font-medium">{prompt.author}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {prompt.rating} ({prompt.reviews})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${prompt.price}</p>
                      <p className="text-sm text-gray-400">{prompt.sales} sales</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    {purchasedPrompts.has(prompt.id) ? (
                      <button className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500/20 text-green-300 rounded-lg font-medium border border-green-500/30">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Purchased
                      </button>
                    ) : prompt.price > 0 ? (
                      <button 
                        onClick={() => handlePurchase(prompt)}
                        disabled={purchasingPrompt === prompt.id}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasingPrompt === prompt.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Buy Now ${prompt.price}
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium border border-blue-500/30">
                        <Eye className="w-4 h-4 mr-2" />
                        Free
                      </button>
                    )}
                    <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Featured Prompts</h3>
              <p className="text-gray-400">Check back later for featured content!</p>
            </div>
          )}
        </div>

        {/* All Prompts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">All Prompts</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded mb-3"></div>
                    <div className="h-8 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrompts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={prompt.preview}
                    alt={prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                    {prompt.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      {prompt.rating}
                    </div>
                    <p className="text-lg font-bold text-white">${prompt.price}</p>
                  </div>
                  
                  {purchasedPrompts.has(prompt.id) ? (
                    <button className="w-full flex items-center justify-center px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/30">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Purchased
                    </button>
                  ) : prompt.price > 0 ? (
                    <button 
                      onClick={() => handlePurchase(prompt)}
                      disabled={purchasingPrompt === prompt.id}
                      className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasingPrompt === prompt.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Buying...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy ${prompt.price}
                        </>
                      )}
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-center px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium border border-blue-500/30">
                      <Eye className="w-4 h-4 mr-2" />
                      Free
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Prompts Found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Be the first to create a prompt!'}
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <button 
                  onClick={loadPrompts}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPromptForPurchase(null);
        }}
        prompt={selectedPromptForPurchase}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Marketplace;