import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, DollarSign, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, RefreshCw, Loader } from 'lucide-react';
import adminAPI from '../../services/adminAPI';
import { useAuth } from '../../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'prompts', label: 'Prompts', icon: FileText },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0) {
      loadAllUsers();
    } else if (activeTab === 'revenue' && !revenueData) {
      loadRevenueData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, promptsData] = await Promise.all([
        adminAPI.getAdminStats(),
        adminAPI.getRecentUsers(5),
        adminAPI.getPendingPrompts(5)
      ]);

      setStats(statsData.stats);
      setRecentUsers(usersData.users);
      setPendingPrompts(promptsData.prompts);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers(1, 50);
      setAllUsers(data.users);
    } catch (err) {
      console.error('Failed to load all users:', err);
    }
  };

  const loadRevenueData = async () => {
    try {
      const data = await adminAPI.getRevenueAnalytics();
      setRevenueData(data.analytics);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (activeTab === 'users') await loadAllUsers();
    if (activeTab === 'revenue') await loadRevenueData();
    setRefreshing(false);
  };

  const handleApprovePrompt = async (promptId) => {
    try {
      await adminAPI.approvePrompt(promptId);
      setPendingPrompts(prev => prev.filter(p => p.id !== promptId));
      alert('Prompt approved successfully!');
    } catch (err) {
      console.error('Failed to approve prompt:', err);
      alert(err.message || 'Failed to approve prompt');
    }
  };

  const handleRejectPrompt = async (promptId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await adminAPI.rejectPrompt(promptId, reason);
      setPendingPrompts(prev => prev.filter(p => p.id !== promptId));
      alert('Prompt rejected successfully!');
    } catch (err) {
      console.error('Failed to reject prompt:', err);
      alert(err.message || 'Failed to reject prompt');
    }
  };

  const OverviewTab = () => {
    if (!stats) return null;

    const statsArray = [
      { label: 'Total Users', value: stats.totalUsers.value, change: stats.totalUsers.change, color: stats.totalUsers.color },
      { label: 'Active Prompts', value: stats.activePrompts.value, change: stats.activePrompts.change, color: stats.activePrompts.color },
      { label: 'Monthly Revenue', value: stats.monthlyRevenue.value, change: stats.monthlyRevenue.change, color: stats.monthlyRevenue.color },
      { label: 'Pending Reviews', value: stats.pendingReviews.value, change: stats.pendingReviews.change, color: stats.pendingReviews.color },
    ];

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsArray.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+')
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Prompts */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                Pending Reviews
              </h3>
              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-sm">
                {pendingPrompts.length}
              </span>
            </div>
            <div className="space-y-4">
              {pendingPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No pending prompts</p>
                </div>
              ) : (
                pendingPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{prompt.title}</h4>
                      <p className="text-gray-400 text-sm">By {prompt.author} • {prompt.submittedAt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprovePrompt(prompt.id)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectPrompt(prompt.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Recent Users
              </h3>
            </div>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent users</p>
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{user.name}</h4>
                      <p className="text-gray-400 text-sm">{user.email} • Joined {user.joinDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      user.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsersTab = () => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">All Users</h3>
      {allUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{user.name}</td>
                  <td className="py-3 px-4 text-gray-300">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const RevenueTab = () => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Revenue Analytics</h3>
      {!revenueData ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading revenue data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">Total Revenue</h4>
            <p className="text-3xl font-bold text-green-400">${revenueData.totalRevenue.toFixed(2)}</p>
          </div>

          {revenueData.topPrompts.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Top Selling Prompts</h4>
              <div className="space-y-3">
                {revenueData.topPrompts.slice(0, 10).map((prompt, index) => (
                  <div key={prompt.promptId || index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{prompt.title}</h5>
                      <p className="text-gray-400 text-sm">{prompt.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">${prompt.revenue.toFixed(2)}</p>
                      <p className="text-gray-400 text-sm">{prompt.sales} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-gray-400">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-red-400" />
              Admin Panel
            </h1>
            <p className="text-gray-400">
              Manage users, prompts, and platform analytics
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {loading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading admin data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'prompts' && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">All Pending Prompts</h3>
                  {pendingPrompts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No pending prompts for review</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingPrompts.map((prompt) => (
                        <div key={prompt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h4 className="text-white font-medium">{prompt.title}</h4>
                            <p className="text-gray-400 text-sm">By {prompt.author} • {prompt.category} • {prompt.submittedAt}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovePrompt(prompt.id)}
                              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPrompt(prompt.id)}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'revenue' && <RevenueTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
