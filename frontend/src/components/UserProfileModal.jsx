import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Heart, MessageCircle, Share2, Bookmark, Download, Copy, Eye, Calendar, DollarSign, TrendingUp, Users, UserCheck } from 'lucide-react';
import { userProfileAPI } from '../services/userProfileAPI';
import { followAPI } from '../services/followAPI';
import { favoritesAPI } from '../services/favoritesAPI';
import { likesAPI } from '../services/likesAPI';
import { commentsAPI } from '../services/commentsAPI';
import { purchaseAPI } from '../services/purchaseAPI';
import { useAuth } from '../contexts/AuthContext';

const UserProfileModal = ({ isOpen, onClose, userId }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prompts');
  const [followLoading, setFollowLoading] = useState(false);
  const [favoritePrompts, setFavoritePrompts] = useState(new Set());
  const [likedPrompts, setLikedPrompts] = useState(new Set());
  const [showComments, setShowComments] = useState(new Set());
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [commentLoading, setCommentLoading] = useState(new Set());
  const [likeLoading, setLikeLoading] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(new Set());

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userProfileAPI.getUserProfile(userId);
      setProfile(response.profile);
      
      // Load favorite and like statuses for user's prompts
      if (response.profile.prompts.length > 0) {
        await loadFavoriteStatuses(response.profile.prompts.map(p => p.id));
        await loadLikeStatuses(response.profile.prompts.map(p => p.id));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      alert('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatuses = async (promptIds) => {
    try {
      const response = await favoritesAPI.getFavoriteStatuses(promptIds);
      const favoriteSet = new Set();
      Object.entries(response.favoriteStatuses).forEach(([promptId, isFavorite]) => {
        if (isFavorite) {
          favoriteSet.add(promptId);
        }
      });
      setFavoritePrompts(favoriteSet);
    } catch (error) {
      console.error('Failed to load favorite statuses:', error);
    }
  };

  const loadLikeStatuses = async (promptIds) => {
    try {
      const response = await likesAPI.getLikeStatuses(promptIds);
      const likedSet = new Set();
      Object.entries(response.likeStatuses).forEach(([promptId, isLiked]) => {
        if (isLiked) {
          likedSet.add(promptId);
        }
      });
      setLikedPrompts(likedSet);
    } catch (error) {
      console.error('Failed to load like statuses:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await followAPI.unfollowUser(userId);
        setProfile(prev => ({
          ...prev,
          isFollowing: false,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount - 1
          }
        }));
      } else {
        await followAPI.followUser(userId);
        setProfile(prev => ({
          ...prev,
          isFollowing: true,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount + 1
          }
        }));
        alert(`You are now following ${profile.user.name}!`);
      }
    } catch (error) {
      console.error('Follow/unfollow failed:', error);
      alert(error.message || 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (promptId) => {
    if (likedPrompts.has(promptId)) {
      setLikeLoading(prev => new Set([...prev, promptId]));
      try {
        await likesAPI.unlikePrompt(promptId);
        setLikedPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
        // Update the prompt's like count
        setProfile(prev => ({
          ...prev,
          prompts: prev.prompts.map(prompt => 
            prompt.id === promptId 
              ? { ...prompt, likesCount: Math.max(0, prompt.likesCount - 1) }
              : prompt
          )
        }));
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
      setLikeLoading(prev => new Set([...prev, promptId]));
      try {
        await likesAPI.likePrompt(promptId);
        setLikedPrompts(prev => new Set([...prev, promptId]));
        // Update the prompt's like count
        setProfile(prev => ({
          ...prev,
          prompts: prev.prompts.map(prompt => 
            prompt.id === promptId 
              ? { ...prompt, likesCount: prompt.likesCount + 1 }
              : prompt
          )
        }));
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

  const handleBookmark = async (promptId) => {
    if (favoritePrompts.has(promptId)) {
      setBookmarkLoading(prev => new Set([...prev, promptId]));
      try {
        await favoritesAPI.removeFromFavorites(promptId);
        setFavoritePrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
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
      setBookmarkLoading(prev => new Set([...prev, promptId]));
      try {
        await favoritesAPI.addToFavorites(promptId);
        setFavoritePrompts(prev => new Set([...prev, promptId]));
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
      // Update the prompt's comment count
      setProfile(prev => ({
        ...prev,
        prompts: prev.prompts.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, commentsCount: prompt.commentsCount + 1 }
            : prompt
        )
      }));
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

  const handleDownload = async (prompt) => {
    try {
      const element = document.createElement('a');
      const file = new Blob([`Title: ${prompt.title}\n\nDescription: ${prompt.description}\n\nPrompt: ${prompt.prompt}\n\nCategory: ${prompt.category}\n\nCreated: ${new Date(prompt.createdAt).toLocaleDateString()}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download prompt');
    }
  };

  const handleCopyPrompt = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      alert('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy prompt');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : profile ? (
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="relative">
                  {profile.user.profileImage ? (
                    <img
                      src={profile.user.profileImage}
                      alt={profile.user.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white border-2 border-purple-500">
                      {profile.user.avatar || profile.user.name?.charAt(0) || '👤'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{profile.user.name}</h3>
                      <p className="text-gray-400">@{profile.user.name?.toLowerCase().replace(/\s+/g, '')}</p>
                      {profile.user.bio && (
                        <p className="text-gray-300 mt-2 max-w-md">{profile.user.bio}</p>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.stats.followersCount}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.stats.followingCount}</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.stats.totalPrompts}</div>
                      <div className="text-sm text-gray-400">Prompts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.stats.totalSales}</div>
                      <div className="text-sm text-gray-400">Sales</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'prompts'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Uploaded Prompts ({profile.prompts.length})
                </button>
                <button
                  onClick={() => setActiveTab('purchased')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'purchased'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Purchased ({profile.purchasedPrompts.length})
                </button>
              </div>

              {/* Content */}
              {activeTab === 'prompts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.prompts.map((prompt) => (
                    <div key={prompt.id} className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all">
                      {/* Prompt Image */}
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img
                          src={prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
                          alt={prompt.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {prompt.category}
                          </span>
                        </div>
                      </div>

                      {/* Prompt Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2">{prompt.title}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{prompt.description}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{prompt.likesCount}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{prompt.commentsCount}</span>
                            </span>
                          </div>
                          <span className="text-xs">{formatTimeAgo(prompt.createdAt)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLike(prompt.id)}
                              disabled={likeLoading.has(prompt.id)}
                              className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                likedPrompts.has(prompt.id)
                                  ? 'text-red-400'
                                  : 'text-gray-400 hover:text-red-400'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPrompts.has(prompt.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleShowComments(prompt.id)}
                              disabled={commentLoading.has(prompt.id)}
                              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBookmark(prompt.id)}
                              disabled={bookmarkLoading.has(prompt.id)}
                              className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                favoritePrompts.has(prompt.id)
                                  ? 'text-yellow-400'
                                  : 'text-gray-400 hover:text-yellow-400'
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 ${favoritePrompts.has(prompt.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyPrompt(prompt)}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              title="Copy prompt"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(prompt)}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              title="Download prompt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {showComments.has(prompt.id) && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="space-y-3">
                              {/* Add Comment */}
                              <div className="flex space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">
                                  {user?.name?.charAt(0) || '👤'}
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={newComment[prompt.id] || ''}
                                    onChange={(e) => setNewComment(prev => ({
                                      ...prev,
                                      [prompt.id]: e.target.value
                                    }))}
                                    placeholder="Write a comment..."
                                    className="w-full p-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none text-sm"
                                    rows="2"
                                  />
                                  <button
                                    onClick={() => handleAddComment(prompt.id)}
                                    disabled={commentLoading.has(prompt.id) || !newComment[prompt.id]?.trim()}
                                    className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {commentLoading.has(prompt.id) ? 'Posting...' : 'Post'}
                                  </button>
                                </div>
                              </div>

                              {/* Comments List */}
                              {comments[prompt.id] && comments[prompt.id].length > 0 && (
                                <div className="space-y-2">
                                  {comments[prompt.id].map((comment) => (
                                    <div key={comment.id} className="flex space-x-2">
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">
                                        {comment.user.name?.charAt(0) || '👤'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="bg-slate-700/50 rounded-lg p-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <h5 className="text-white font-medium text-xs">{comment.user.name}</h5>
                                            <span className="text-xs text-gray-400">
                                              {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-gray-300 text-xs">{comment.content}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'purchased' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.purchasedPrompts.map((prompt) => (
                    <div key={prompt.id} className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all">
                      {/* Prompt Image */}
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img
                          src={prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
                          alt={prompt.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                            Purchased
                          </span>
                        </div>
                      </div>

                      {/* Prompt Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2">{prompt.title}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{prompt.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <span>Purchased {formatTimeAgo(prompt.purchasedAt)}</span>
                          <span className="text-green-400">${prompt.price}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopyPrompt(prompt)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Copy prompt"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(prompt)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Download prompt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'prompts' && profile.prompts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No prompts yet</h3>
                  <p className="text-gray-400">This user hasn't uploaded any prompts yet.</p>
                </div>
              )}

              {activeTab === 'purchased' && profile.purchasedPrompts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No purchases yet</h3>
                  <p className="text-gray-400">This user hasn't purchased any prompts yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">Profile not found</h3>
              <p className="text-gray-400">The user profile could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
