import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, ListFilter as Filter, TrendingUp, Clock, Star, Trash2, CreditCard, CircleCheck as CheckCircle2, UserPlus, UserMinus, Copy, Search, X } from 'lucide-react';
import { promptAPI } from '../../services/promptAPI';
import { purchaseAPI } from '../../services/purchaseAPI';
import { followAPI } from '../../services/followAPI';
import { favoritesAPI } from '../../services/favoritesAPI';
import { likesAPI } from '../../services/likesAPI';
import { commentsAPI } from '../../services/commentsAPI';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileModal from '../UserProfileModal';
import PaymentModal from '../PaymentModal';
import PromptDetailModal from '../PromptDetailModal';

const Feed = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPrompt, setDeletingPrompt] = useState(null);
  const [purchasedPrompts, setPurchasedPrompts] = useState(new Set());
  const [purchasingPrompt, setPurchasingPrompt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromptForDetail, setSelectedPromptForDetail] = useState(null);
  
  // Follow and favorites state
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [favoritePrompts, setFavoritePrompts] = useState(new Set());
  const [followLoading, setFollowLoading] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(new Set());
  
  // Comments and likes state
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(new Set());
  const [commentLoading, setCommentLoading] = useState(new Set());
  const [newComment, setNewComment] = useState({});
  const [likeLoading, setLikeLoading] = useState(new Set());
  
  // User profile modal state
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPromptForPurchase, setSelectedPromptForPurchase] = useState(null);

  const filters = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'following', label: 'Following', icon: UserPlus },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'featured', label: 'Featured', icon: Star },
  ];

  // Load prompts from database
  useEffect(() => {
    loadPrompts();
    checkPurchasedPrompts();
    
    // Listen for refresh events
    const handleRefresh = () => {
      loadPrompts();
    };
    
    window.addEventListener('refreshFeed', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshFeed', handleRefresh);
    };
  }, []);

  // Load statuses after posts are loaded
  useEffect(() => {
    if (posts.length > 0) {
      loadFollowStatus();
      loadFavoriteStatus();
      loadLikeStatuses();
    }
  }, [posts]);

  const checkPurchasedPrompts = async () => {
    try {
      const purchased = await purchaseAPI.getPurchasedPrompts();
      const purchasedIds = new Set(purchased.map(p => p._id || p.id));
      setPurchasedPrompts(purchasedIds);
    } catch (error) {
      console.error('Failed to check purchased prompts:', error);
    }
  };

  const loadFollowStatus = async () => {
    try {
      // Get all unique author IDs from posts
      const authorIds = [...new Set(posts.map(post => post.author?.id).filter(Boolean))];
      console.log('Loading follow status for authors:', authorIds);
      
      if (authorIds.length === 0) {
        console.log('No author IDs found for follow status check');
        return;
      }
      
      // CheckCircle2 follow status for each author
      const followPromises = authorIds.map(async (authorId) => {
        try {
          const response = await followAPI.checkFollowStatus(authorId);
          console.log(`Follow status for ${authorId}:`, response);
          return { authorId, isFollowing: response.isFollowing };
        } catch (error) {
          console.error(`Failed to check follow status for ${authorId}:`, error);
          return { authorId, isFollowing: false };
        }
      });
      
      const followResults = await Promise.all(followPromises);
      const followingSet = new Set();
      
      followResults.forEach(({ authorId, isFollowing }) => {
        if (isFollowing) {
          followingSet.add(authorId);
        }
      });
      
      console.log('Setting following users:', followingSet);
      setFollowingUsers(followingSet);
    } catch (error) {
      console.error('Failed to load follow status:', error);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      // Get all prompt IDs from posts
      const promptIds = posts.map(post => post.id).filter(Boolean);
      
      if (promptIds.length === 0) {
        console.log('No prompt IDs found for favorite status check');
        return;
      }
      
      console.log('Loading favorite status for prompts:', promptIds);
      const response = await favoritesAPI.getFavoriteStatuses(promptIds);
      console.log('Favorite status response:', response);
      
      const favoriteSet = new Set();
      
      Object.entries(response.favoriteStatuses).forEach(([promptId, isFavorite]) => {
        if (isFavorite) {
          favoriteSet.add(promptId);
        }
      });
      
      console.log('Setting favorite prompts:', favoriteSet);
      setFavoritePrompts(favoriteSet);
    } catch (error) {
      console.error('Failed to load favorite status:', error);
    }
  };

  const loadLikeStatuses = async () => {
    try {
      // Get all prompt IDs from posts
      const promptIds = posts.map(post => post.id).filter(Boolean);
      
      if (promptIds.length === 0) return;
      
      const response = await likesAPI.getLikeStatuses(promptIds);
      const likedSet = new Set();
      
      Object.entries(response.likeStatuses).forEach(([promptId, isLiked]) => {
        if (isLiked) {
          likedSet.add(promptId);
        }
      });
      
      setLikedPosts(likedSet);
    } catch (error) {
      console.error('Failed to load like status:', error);
    }
  };

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const response = await promptAPI.getPublicPrompts();
      // Extract prompts array from response
      const prompts = response.prompts || response;
      // Transform database prompts to feed format
      const transformedPosts = prompts.map(prompt => {
        console.log('Feed: Processing prompt:', {
          id: prompt._id,
          title: prompt.title,
          image: prompt.image,
          imageType: typeof prompt.image
        });
        
        return {
          id: prompt._id,
          user: { 
            _id: prompt.author?._id,
            name: prompt.author?.name || 'Anonymous', 
            avatar: '👤', 
            verified: prompt.author?.role === 'admin' 
          },
          author: {
            id: prompt.author?._id,
            name: prompt.author?.name || 'Anonymous'
          },
          prompt: prompt.prompt,
          image: prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
          likes: prompt.likesCount || 0,
          comments: prompt.commentsCount || 0,
          aiTool: prompt.aiModel || (prompt.category === 'Art & Design' ? 'DALL-E 3' : 
                  prompt.category === 'Photography' ? 'Midjourney' :
                  prompt.category === 'Writing' ? 'GPT-4o' :
                  prompt.category === 'Marketing' ? 'Claude 3.5' :
                  prompt.category === 'Business' ? 'Gemini Pro' :
                  prompt.category === 'Education' ? 'Perplexity' :
                  prompt.category === 'Entertainment' ? 'RunwayML' :
                  prompt.category === 'Technology' ? 'Mistral Large' : 'AI Generator'),
          category: prompt.category,
          timeAgo: formatTimeAgo(prompt.createdAt),
          price: prompt.price || 0,
          title: prompt.title,
          description: prompt.description,
        };
      });
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      // Fallback to empty array if API fails
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };


  const handleSave = (postId) => {
    setSavedPosts(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return newSaved;
    });
  };

  const handlePurchase = async (post) => {
    if (purchasedPrompts.has(post.id)) {
      alert('You have already purchased this prompt!');
      return;
    }

    if (post.price <= 0) {
      alert('This prompt is free and cannot be purchased!');
      return;
    }

    // Open payment modal
    setSelectedPromptForPurchase(post);
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

  // Follow/Unfollow functions
  const handleFollow = async (authorId, authorName) => {
    console.log('Follow button clicked:', { authorId, authorName });
    console.log('Current following users:', followingUsers);
    console.log('Is following?', followingUsers.has(authorId));
    
    if (followingUsers.has(authorId)) {
      // Unfollow
      console.log('Unfollowing user...');
      setFollowLoading(prev => new Set([...prev, authorId]));
      try {
        await followAPI.unfollowUser(authorId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(authorId);
          return newSet;
        });
        console.log('Successfully unfollowed user');
      } catch (error) {
        console.error('Unfollow failed:', error);
        alert(error.message || 'Failed to unfollow user');
      } finally {
        setFollowLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(authorId);
          return newSet;
        });
      }
    } else {
      // Follow
      console.log('Following user...');
      setFollowLoading(prev => new Set([...prev, authorId]));
      try {
        await followAPI.followUser(authorId);
        setFollowingUsers(prev => new Set([...prev, authorId]));
        console.log('Successfully followed user');
        alert(`You are now following ${authorName}!`);
      } catch (error) {
        console.error('Follow failed:', error);
        alert(error.message || 'Failed to follow user');
      } finally {
        setFollowLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(authorId);
          return newSet;
        });
      }
    }
  };

  // Bookmark functions
  const handleBookmark = async (promptId) => {
    console.log('Bookmark clicked for prompt:', promptId);
    console.log('Current favorite prompts:', favoritePrompts);
    console.log('Is prompt favorited?', favoritePrompts.has(promptId));
    
    if (favoritePrompts.has(promptId)) {
      // Remove from favorites
      console.log('Removing from favorites...');
      setBookmarkLoading(prev => new Set([...prev, promptId]));
      try {
        await favoritesAPI.removeFromFavorites(promptId);
        setFavoritePrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
        console.log('Successfully removed from favorites');
      } catch (error) {
        console.error('Remove from favorites failed:', error);
        alert(error.message || 'Failed to remove from favorites');
      } finally {
        setBookmarkLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }
    } else {
      // Add to favorites
      console.log('Adding to favorites...');
      setBookmarkLoading(prev => new Set([...prev, promptId]));
      try {
        await favoritesAPI.addToFavorites(promptId);
        setFavoritePrompts(prev => new Set([...prev, promptId]));
        console.log('Successfully added to favorites');
        alert('Prompt added to favorites!');
      } catch (error) {
        console.error('Add to favorites failed:', error);
        alert(error.message || 'Failed to add to favorites');
      } finally {
        setBookmarkLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    setDeletingPrompt(postId);
    try {
      await promptAPI.deletePrompt(postId);
      // Remove the deleted prompt from the posts array
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    } finally {
      setDeletingPrompt(null);
    }
  };

  // Like/Unlike functions
  const handleLike = async (promptId) => {
    if (likedPosts.has(promptId)) {
      // Unlike
      setLikeLoading(prev => new Set([...prev, promptId]));
      try {
        await likesAPI.unlikePrompt(promptId);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
        // Update the post's like count
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === promptId 
            ? { ...post, likes: Math.max(0, post.likes - 1) }
            : post
        ));
      } catch (error) {
        console.error('Unlike failed:', error);
        alert(error.message || 'Failed to unlike prompt');
      } finally {
        setLikeLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }
    } else {
      // Like
      setLikeLoading(prev => new Set([...prev, promptId]));
      try {
        await likesAPI.likePrompt(promptId);
        setLikedPosts(prev => new Set([...prev, promptId]));
        // Update the post's like count
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === promptId 
            ? { ...post, likes: post.likes + 1 }
            : post
        ));
      } catch (error) {
        console.error('Like failed:', error);
        alert(error.message || 'Failed to like prompt');
      } finally {
        setLikeLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }
    }
  };

  // Comment functions
  const handleShowComments = async (promptId) => {
    if (showComments.has(promptId)) {
      setShowComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    } else {
      setCommentLoading(prev => new Set([...prev, promptId]));
      try {
        const response = await commentsAPI.getComments(promptId);
        setComments(prev => ({
          ...prev,
          [promptId]: response.comments
        }));
        setShowComments(prev => new Set([...prev, promptId]));
      } catch (error) {
        console.error('Failed to load comments:', error);
        alert('Failed to load comments');
      } finally {
        setCommentLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }
    }
  };

  const handleAddComment = async (promptId) => {
    const content = newComment[promptId]?.trim();
    if (!content) return;

    setCommentLoading(prev => new Set([...prev, promptId]));
    try {
      const response = await commentsAPI.addComment(promptId, content);
      setComments(prev => ({
        ...prev,
        [promptId]: [response.comment, ...(prev[promptId] || [])]
      }));
      setNewComment(prev => ({
        ...prev,
        [promptId]: ''
      }));
      // Update the post's comment count
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === promptId 
          ? { ...post, comments: post.comments + 1 }
          : post
      ));
    } catch (error) {
      console.error('Add comment failed:', error);
      alert(error.message || 'Failed to add comment');
    } finally {
      setCommentLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    }
  };

  const handleDeleteComment = async (commentId, promptId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments(prev => ({
        ...prev,
        [promptId]: (prev[promptId] || []).filter(comment => comment.id !== commentId)
      }));
      // Update the post's comment count
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === promptId 
          ? { ...post, comments: Math.max(0, post.comments - 1) }
          : post
      ));
    } catch (error) {
      console.error('Delete comment failed:', error);
      alert(error.message || 'Failed to delete comment');
    }
  };

  // Share function
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to clipboard
        handleCopyLink(post);
      }
    } else {
      // Fallback to clipboard
      handleCopyLink(post);
    }
  };

  const handleCopyLink = async (post) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy link');
    }
  };

  const handleCopyPrompt = async (promptText) => {
    try {
      await navigator.clipboard.writeText(promptText);
      alert('Prompt copied to clipboard! 📋');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy prompt');
    }
  };

  // User profile functions
  const handleProfileClick = (userId) => {
    console.log('Profile clicked:', userId);
    console.log('Current user:', user?._id);
    if (userId) {
      setSelectedUserId(userId);
      setShowUserProfile(true);
    }
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserId(null);
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.prompt?.toLowerCase().includes(query) ||
      post.category?.toLowerCase().includes(query) ||
      post.user?.name?.toLowerCase().includes(query) ||
      post.aiTool?.toLowerCase().includes(query)
    );
  }).filter((post) => {
    if (activeFilter === 'following') {
      return followingUsers.has(post.author?.id);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Discover Amazing Prompts
          </h1>
          <p className="text-gray-400">
            Explore trending AI-generated content from our community
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts, users, categories, or AI tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-400">
              Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeFilter === filter.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading prompts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  <p className="text-gray-400 mb-4">No prompts found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">No prompts found. Be the first to create one!</p>
                  <button
                    onClick={loadPrompts}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Refresh
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer"
              onClick={() => {
                if (post.price > 0 && !purchasedPrompts.has(post.id)) {
                  handlePurchase(post);
                } else {
                  setSelectedPromptForDetail({
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    prompt: post.prompt,
                    category: post.category,
                    tags: post.tags || [],
                    price: post.price,
                    image: post.image,
                    author: { _id: post.author?.id, name: post.user?.name },
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    likes: post.likes,
                    views: post.views,
                    reviews: [],
                    rating: post.rating || 0,
                    aiModel: post.aiTool || null,
                    isPublic: true,
                  });
                  setShowDetailModal(true);
                }
              }}
            >
              {/* Post Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleProfileClick(post.author?.id)}
                      className="flex items-center hover:opacity-80 transition-opacity"
                      disabled={!post.author?.id}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg mr-3">
                      {post.user.avatar}
                    </div>
                    <div>
                      <div className="flex items-center">
                          <h3 className="font-medium text-white text-sm mr-2 hover:text-purple-300 transition-colors">
                          {post.user.name}
                        </h3>
                        {post.user.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                        <p className="text-xs text-gray-400">
                        {post.timeAgo} • {post.aiTool}
                      </p>
                    </div>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {post.category}
                  </span>
                    {/* Follow Button */}
                    {user && post.author && user._id !== post.author.id && (
                      <button
                        onClick={() => handleFollow(post.author.id, post.author.name)}
                        disabled={followLoading.has(post.author.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          followingUsers.has(post.author.id)
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        }`}
                      >
                        {followLoading.has(post.author.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : followingUsers.has(post.author.id) ? (
                          <>
                            <UserMinus className="w-3 h-3" />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={post.image}
                  alt="Generated content"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Prompt Text */}
              <div className="p-4 border-b border-white/10">
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                  <span className="text-purple-300 font-medium">Prompt:</span>{' '}
                  {post.prompt}
                </p>
              </div>

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={likeLoading.has(post.id)}
                      className={`flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        likedPosts.has(post.id)
                          ? 'text-red-400'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleShowComments(post.id)}
                      disabled={commentLoading.has(post.id)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(post)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Purchase Button */}
                    {post.price > 0 && (
                      <>
                        {purchasedPrompts.has(post.id) ? (
                          <button className="flex items-center px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium border border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Purchased
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(post)}
                            disabled={purchasingPrompt === post.id}
                            className="flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {purchasingPrompt === post.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Buying...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3 mr-1" />
                                ${post.price}
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                    {/* Free Prompt Button */}
                    {post.price === 0 && (
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Free
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(post.prompt)}
                          className="flex items-center px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium border border-green-500/30 hover:bg-green-500/30 transition-colors"
                          title="Copy prompt"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    )}
                    
                    {/* Bookmark Button */}
                  <button
                      onClick={() => handleBookmark(post.id)}
                      disabled={bookmarkLoading.has(post.id)}
                      className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        favoritePrompts.has(post.id)
                        ? 'text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                      <Bookmark className={`w-4 h-4 ${favoritePrompts.has(post.id) ? 'fill-current' : ''}`} />
                    </button>
                    {/* Show delete button only for the prompt owner */}
                    {user && post.user && user._id === post.user._id && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingPrompt === post.id}
                        className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete prompt"
                      >
                        <Trash2 className={`w-4 h-4 ${deletingPrompt === post.id ? 'animate-pulse' : ''}`} />
                  </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {showComments.has(post.id) && (
                <div className="border-t border-white/10 p-4 bg-slate-700/30">
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                        {user?.name?.charAt(0) || '👤'}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          placeholder="Write a comment..."
                          className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          rows="2"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={commentLoading.has(post.id) || !newComment[post.id]?.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {commentLoading.has(post.id) ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments[post.id] && comments[post.id].length > 0 ? (
                      <div className="space-y-3">
                        {comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                              {comment.user.profileImage ? (
                                <img 
                                  src={comment.user.profileImage} 
                                  alt={comment.user.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                comment.user.name?.charAt(0) || '👤'
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-white font-medium text-sm">{comment.user.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                    {user && user._id === comment.user.id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete comment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
            Load More Posts
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={handleCloseUserProfile}
        userId={selectedUserId}
      />

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

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        prompt={selectedPromptForDetail}
      />
    </div>
  );
};

export default Feed;