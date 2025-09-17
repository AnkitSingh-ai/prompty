import React, { useState, useEffect } from 'react';
import { User, Settings, Camera, MapPin, Calendar, Star, TrendingUp, DollarSign, Award, Sparkles, Trash2, Edit3, Eye, Save, X, Mail, Phone, Globe, Briefcase, UserPlus, UserMinus, Users } from 'lucide-react';
import CreatePromptModal from '../CreatePromptModal';
import EditPromptModal from '../EditPromptModal';
import PromptDetailModal from '../PromptDetailModal';
import { promptAPI } from '../../services/promptAPI';
import { authAPI } from '../../services/api';
import { uploadAPI } from '../../services/uploadAPI';
import { dashboardAPI } from '../../services/dashboardAPI';
import { followAPI } from '../../services/followAPI';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prompts', label: 'My Prompts' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  const [stats, setStats] = useState([
    { label: 'Total Earnings', value: '$0', icon: DollarSign, color: 'text-green-400' },
    { label: 'Prompts Sold', value: '0', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Average Rating', value: '0.0', icon: Star, color: 'text-yellow-400' },
    { label: 'Followers', value: '0', icon: User, color: 'text-purple-400' },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  
  // Follow-related state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followSuggestions, setFollowSuggestions] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [myPrompts, setMyPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  
  // Profile editing states
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Rodriguez',
    email: 'alex@example.com',
    bio: 'Digital artist and AI enthusiast specializing in cyberpunk and abstract art. Creating unique prompts that blend creativity with cutting-edge AI technology.',
    location: 'San Francisco, CA',
    website: '',
    phone: '',
    profession: 'Digital Artist',
    avatar: '👨‍💻',
    profileImage: null
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    profession: '',
    avatar: '👨‍💻',
    profileImage: null
  });

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const response = await dashboardAPI.getDashboardStats();
      if (response.success) {
        const { stats: dashboardStats, recentActivity: activity } = response;
        
        // Update stats with real data
        setStats([
          { 
            label: 'Total Earnings', 
            value: `$${dashboardStats.totalEarnings.toLocaleString()}`, 
            icon: DollarSign, 
            color: 'text-green-400' 
          },
          { 
            label: 'Prompts Sold', 
            value: dashboardStats.promptsSold.toString(), 
            icon: TrendingUp, 
            color: 'text-blue-400' 
          },
          { 
            label: 'Average Rating', 
            value: dashboardStats.averageRating.toString(), 
            icon: Star, 
            color: 'text-yellow-400' 
          },
          { 
            label: 'Followers', 
            value: dashboardStats.followers.toLocaleString(), 
            icon: User, 
            color: 'text-purple-400' 
          },
        ]);
        
        // Update recent activity
        setRecentActivity(activity || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Follow/Unfollow functions
  const handleFollow = async () => {
    if (!userProfile._id) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(userProfile._id);
        setIsFollowing(false);
      } else {
        await followAPI.followUser(userProfile._id);
        setIsFollowing(true);
      }
      
      // Refresh dashboard stats to get accurate follower count
      await loadDashboardStats();
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      alert(error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const loadFollowStatus = async () => {
    if (!userProfile._id) return;
    
    try {
      const response = await followAPI.checkFollowStatus(userProfile._id);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Failed to load follow status:', error);
    }
  };

  const loadFollowers = async () => {
    if (!userProfile._id) return;
    
    try {
      const response = await followAPI.getFollowers(userProfile._id);
      setFollowers(response.followers);
    } catch (error) {
      console.error('Failed to load followers:', error);
    }
  };

  const loadFollowing = async () => {
    if (!userProfile._id) return;
    
    try {
      const response = await followAPI.getFollowing(userProfile._id);
      setFollowing(response.following);
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  };

  const loadFollowSuggestions = async () => {
    try {
      const response = await followAPI.getFollowSuggestions();
      setFollowSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to load follow suggestions:', error);
    }
  };
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Load user's prompts and profile when component mounts
  useEffect(() => {
    loadMyPrompts();
    loadUserProfile();
    loadDashboardStats();
    loadFollowStatus();
    loadFollowSuggestions();
  }, [userProfile._id]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedProfile = event.detail;
      setUserProfile(updatedProfile);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await authAPI.getProfile();
      console.log('Loaded profile from backend:', profile);
      console.log('Profile image from backend:', profile.profileImage);
      
      // Use the profile data from backend, including profileImage
      setUserProfile(prevProfile => {
        const newProfile = {
          ...prevProfile,
          ...profile,
          // Use the profileImage from backend if it exists, otherwise keep current
          profileImage: profile.profileImage || prevProfile.profileImage
        };
        console.log('Setting user profile to:', newProfile);
        return newProfile;
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Keep default profile data if API fails
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      name: userProfile.name || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      website: userProfile.website || '',
      phone: userProfile.phone || '',
      profession: userProfile.profession || '',
      avatar: userProfile.avatar || '👨‍💻',
      profileImage: userProfile.profileImage || null
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: '',
      email: '',
      bio: '',
      location: '',
      website: '',
      phone: '',
      profession: '',
      avatar: '👨‍💻',
      profileImage: null
    });
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const updatedProfile = await authAPI.updateProfile(editForm);
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setEditForm({
        name: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        phone: '',
        profession: '',
        avatar: '👨‍💻',
        profileImage: null
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      console.log('Starting image upload...');
      // Upload to Cloudinary
      const uploadResult = await uploadAPI.uploadImage(file);
      console.log('Upload result:', uploadResult);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        console.log('Upload successful, updating profile with:', uploadResult.imageUrl);
        
        // Update profile with new image URL
        const updatedProfile = {
          ...userProfile,
          profileImage: uploadResult.imageUrl
        };
        
        setUserProfile(updatedProfile);
        
        // Save to backend
        console.log('Saving to backend...');
        const backendResult = await authAPI.updateProfile({ profileImage: uploadResult.imageUrl });
        console.log('Backend save result:', backendResult);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: updatedProfile 
        }));
        
        alert('Profile image updated successfully!');
      } else {
        throw new Error('Upload failed - no image URL returned');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };


  const loadMyPrompts = async () => {
    setLoading(true);
    try {
      const prompts = await promptAPI.getMyPrompts();
      setMyPrompts(prompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      // Fallback to mock data if API fails
      setMyPrompts([
        {
          _id: '1',
      title: 'Cyberpunk Cityscapes',
      sales: 45,
      earnings: 315.75,
      rating: 4.9,
      status: 'active',
          image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
    },
    {
          _id: '2',
      title: 'Abstract Art Collection',
      sales: 32,
      earnings: 192.40,
      rating: 4.7,
      status: 'active',
          image: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg',
    },
    {
          _id: '3',
      title: 'Nature Photography',
      sales: 28,
      earnings: 168.50,
      rating: 4.8,
      status: 'pending',
          image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptCreated = (newPrompt) => {
    // Add the new prompt to the list
    setMyPrompts(prev => [newPrompt, ...prev]);
    
    // Trigger feed refresh
    window.dispatchEvent(new CustomEvent('refreshFeed'));
  };

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    setDeletingPrompt(promptId);
    try {
      await promptAPI.deletePrompt(promptId);
      // Remove the deleted prompt from the list
      setMyPrompts(prev => prev.filter(prompt => prompt._id !== promptId && prompt.id !== promptId));
      // Trigger feed refresh
      window.dispatchEvent(new CustomEvent('refreshFeed'));
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    } finally {
      setDeletingPrompt(null);
    }
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setShowEditModal(true);
  };

  const handleViewPrompt = (prompt) => {
    setViewingPrompt(prompt);
    setShowDetailModal(true);
  };

  const handlePromptUpdated = (updatedPrompt) => {
    // Update the prompt in the list
    setMyPrompts(prev => prev.map(prompt => 
      prompt._id === updatedPrompt._id || prompt.id === updatedPrompt._id 
        ? updatedPrompt 
        : prompt
    ));
    // Trigger feed refresh
    window.dispatchEvent(new CustomEvent('refreshFeed'));
  };

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        {dashboardLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : recentActivity.length > 0 ? (
        <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
            <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.color === 'green' ? 'bg-green-400' :
                    activity.color === 'blue' ? 'bg-blue-400' :
                    activity.color === 'purple' ? 'bg-purple-400' :
                    'bg-gray-400'
                  }`}></div>
                  <p className="text-white">{activity.message}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
        {!isEditing && (
          <button
            onClick={handleEditProfile}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
                <input
                  type="text"
                  value={editForm.profession || ''}
                  onChange={(e) => handleFormChange('profession', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Digital Artist, Designer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Contact Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => handleFormChange('website', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar Emoji</label>
                <input
                  type="text"
                  value={editForm.avatar || ''}
                  onChange={(e) => handleFormChange('avatar', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="👨‍💻"
                  maxLength="2"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={editForm.bio || ''}
              onChange={(e) => handleFormChange('bio', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={handleCancelEdit}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information Display */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Basic Information</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white">{userProfile.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{userProfile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Profession</p>
                  <p className="text-white">{userProfile.profession}</p>
                </div>
              </div>
              
            <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{userProfile.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Display */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Contact Information</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{userProfile.phone || 'Not provided'}</p>
                </div>
              </div>
              
            <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="text-white">
                    {userProfile.website ? (
                      <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        {userProfile.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Bio</h4>
        <div className="bg-slate-700/30 rounded-lg p-4 border border-white/10">
          <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
        </div>
      </div>
    </div>
  );

  const PromptsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">My Prompts</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Create New Prompt
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-2">Loading prompts...</p>
        </div>
      ) : myPrompts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No prompts yet</h3>
          <p className="text-gray-400 mb-4">Create your first prompt to get started!</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Create Your First Prompt
          </button>
        </div>
      ) : (
      <div className="grid gap-6">
        {myPrompts.map((prompt) => (
            <div 
              key={prompt._id || prompt.id} 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-slate-800/70 transition-colors cursor-pointer group"
              onClick={() => handleViewPrompt(prompt)}
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                    src={prompt.image || prompt.preview || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
                  alt={prompt.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                    <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{prompt.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{prompt.sales || 0} sales</span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {prompt.rating || 0}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prompt.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                          : prompt.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {prompt.status}
                    </span>
                  </div>
                </div>
              </div>
              
                <div className="flex items-center space-x-4">
              <div className="text-right">
                    <p className="text-lg font-bold text-green-400">${prompt.earnings || 0}</p>
                <p className="text-sm text-gray-400">Total Earnings</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPrompt(prompt);
                      }}
                      className="text-gray-400 hover:text-purple-400 transition-colors p-2"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrompt(prompt);
                      }}
                      className="text-gray-400 hover:text-blue-400 transition-colors p-2"
                      title="Edit prompt"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(prompt._id || prompt.id);
                      }}
                      disabled={deletingPrompt === (prompt._id || prompt.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
                      title="Delete prompt"
                    >
                      <Trash2 className={`w-5 h-5 ${deletingPrompt === (prompt._id || prompt.id) ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl text-white overflow-hidden">
                {userProfile.profileImage ? (
                  <img 
                    src={userProfile.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Profile image loaded successfully:', userProfile.profileImage)}
                    onError={() => console.log('Profile image failed to load:', userProfile.profileImage)}
                  />
                ) : (
                  <span onClick={() => console.log('Showing default avatar, profileImage:', userProfile.profileImage)}>
                    {userProfile.avatar || '👨‍💻'}
                  </span>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading}
                />
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-full">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </label>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{userProfile.name}</h1>
                  <div className="flex items-center justify-center lg:justify-start space-x-4 text-gray-400">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userProfile.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined Dec 2023
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Pro Creator</span>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 max-w-2xl">
                {userProfile.bio}
              </p>
              
              {/* Follow Button and Stats */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2
                    ${isFollowing
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }
                    ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => {
                      loadFollowers();
                      setShowFollowersModal(true);
                    }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{stats.find(s => s.label === 'Followers')?.value || '0'}</span>
                    <span className="text-sm">Followers</span>
                  </button>
              
              <button
                    onClick={() => {
                      loadFollowing();
                      setShowFollowingModal(true);
                    }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{stats.find(s => s.label === 'Following')?.value || '0'}</span>
                    <span className="text-sm">Following</span>
              </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-800/70'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'prompts' && <PromptsTab />}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-400">Detailed analytics and insights will be available here.</p>
            </div>
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      {/* Create Prompt Modal */}
      <CreatePromptModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPromptCreated={handlePromptCreated}
      />

      {/* Edit Prompt Modal */}
      <EditPromptModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPrompt(null);
        }}
        prompt={editingPrompt}
        onPromptUpdated={handlePromptUpdated}
      />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingPrompt(null);
        }}
        prompt={viewingPrompt}
      />

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Followers</h3>
                <button
                  onClick={() => setShowFollowersModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((follower) => (
                    <div key={follower.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                        {follower.profileImage ? (
                          <img src={follower.profileImage} alt={follower.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{follower.avatar || '👤'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{follower.name}</h4>
                        <p className="text-gray-400 text-sm">{follower.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No followers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Following</h3>
                <button
                  onClick={() => setShowFollowingModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {following.length > 0 ? (
                <div className="space-y-4">
                  {following.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{user.avatar || '👤'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <p className="text-gray-400 text-sm">{user.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Not following anyone yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;