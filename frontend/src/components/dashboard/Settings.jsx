import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, Shield, Palette, Globe, Database, Trash2, Save, Eye, EyeOff, Camera } from 'lucide-react';
import { authAPI } from '../../services/api';
import { uploadAPI } from '../../services/uploadAPI';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState({
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [imageUploading, setImageUploading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await authAPI.getProfile();
      // Use the profile data from backend, including profileImage
      setUserProfile(prevProfile => ({
        ...prevProfile,
        ...profile,
        // Use the profileImage from backend if it exists, otherwise keep current
        profileImage: profile.profileImage || prevProfile.profileImage
      }));
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
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
    setSaving(true);
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
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: updatedProfile 
      }));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
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
      // Upload to Cloudinary
      const uploadResult = await uploadAPI.uploadImage(file);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        // Update profile with new image URL
        const updatedProfile = {
          ...userProfile,
          profileImage: uploadResult.imageUrl
        };
        
        setUserProfile(updatedProfile);
        
        // Update edit form if editing
        if (isEditing) {
          setEditForm(prev => ({
            ...prev,
            profileImage: uploadResult.imageUrl
          }));
        }
        
        // Save to backend
        await authAPI.updateProfile({ profileImage: uploadResult.imageUrl });
        
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      // This would need to be implemented in the backend
      await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Image Upload */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Profile Image</h4>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl text-white overflow-hidden">
              {userProfile.profileImage ? (
                <img 
                  src={userProfile.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile.avatar || '👨‍💻'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors cursor-pointer">
              <Camera className="w-3 h-3 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
              {imageUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-full">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                </div>
              )}
            </label>
          </div>
          <div>
            <p className="text-white font-medium">Upload a new profile image</p>
            <p className="text-gray-400 text-sm">JPG, PNG or GIF. Max size 5MB.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Profile Information</h3>
        {!isEditing && (
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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

            <div className="space-y-4">
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

          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <Globe className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{userProfile.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-5 h-5 text-gray-400 mr-3">📞</div>
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

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Bio</h4>
        <div className="bg-slate-700/30 rounded-lg p-4 border border-white/10">
          <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Security Settings</h3>
      
      <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none pr-10"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-white mb-2">Notification Settings</h4>
        <p className="text-gray-400">Notification preferences will be available here.</p>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Appearance Settings</h3>
      <div className="text-center py-12">
        <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-white mb-2">Appearance Settings</h4>
        <p className="text-gray-400">Theme and appearance preferences will be available here.</p>
      </div>
    </div>
  );

  const PrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Privacy Settings</h3>
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-white mb-2">Privacy Settings</h4>
        <p className="text-gray-400">Privacy and data settings will be available here.</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'privacy':
        return <PrivacyTab />;
      default:
        return <ProfileTab />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-2">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
