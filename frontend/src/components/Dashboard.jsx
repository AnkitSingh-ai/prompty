import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './dashboard/Sidebar';
import Feed from './dashboard/Feed';
import Playground from './dashboard/Playground';
import Marketplace from './dashboard/Marketplace';
import Library from './dashboard/Library';
import Profile from './dashboard/Profile';
import Settings from './dashboard/Settings';
import AdminPanel from './dashboard/AdminPanel';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {user?.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;