import React, { useState } from 'react';
import { Shield, Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'prompts', label: 'Prompts', icon: FileText },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  const stats = [
    { label: 'Total Users', value: '12,459', change: '+12%', color: 'text-blue-400' },
    { label: 'Active Prompts', value: '3,247', change: '+8%', color: 'text-green-400' },
    { label: 'Monthly Revenue', value: '$45,678', change: '+23%', color: 'text-purple-400' },
    { label: 'Pending Reviews', value: '42', change: '-5%', color: 'text-yellow-400' },
  ];

  const pendingPrompts = [
    {
      id: '1',
      title: 'Futuristic Architecture Pack',
      author: 'John Smith',
      category: 'Digital Art',
      submittedAt: '2 hours ago',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Nature Photography Bundle',
      author: 'Sarah Chen',
      category: 'Photography',
      submittedAt: '5 hours ago',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Abstract Patterns Collection',
      author: 'Maya Patel',
      category: 'Abstract',
      submittedAt: '1 day ago',
      status: 'pending',
    },
  ];

  const recentUsers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', joinDate: 'Today', status: 'active' },
    { id: '2', name: 'Bob Wilson', email: 'bob@example.com', joinDate: 'Yesterday', status: 'active' },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', joinDate: '2 days ago', status: 'pending' },
  ];

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            {pendingPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{prompt.title}</h4>
                  <p className="text-gray-400 text-sm">By {prompt.author} • {prompt.submittedAt}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
            {recentUsers.map((user) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-red-400" />
            Admin Panel
          </h1>
          <p className="text-gray-400">
            Manage users, prompts, and platform analytics
          </p>
        </div>

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
          {activeTab === 'overview' && <OverviewTab />}
          {(activeTab === 'users' || activeTab === 'prompts' || activeTab === 'revenue') && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'prompts' && 'Prompt Management'}
                {activeTab === 'revenue' && 'Revenue Analytics'}
              </h3>
              <p className="text-gray-400">
                This section will contain detailed management tools and analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;