import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Zap, 
  ShoppingBag, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Sparkles,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Feed', href: '/dashboard/feed', icon: Home },
    { name: 'AI Playground', href: '/dashboard/playground', icon: Zap },
    { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
    { name: 'My Library', href: '/dashboard/library', icon: BookOpen },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: Shield }] : []),
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-white/10 text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              PromptVerse
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onToggle()}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Settings */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center px-4 py-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <Link
              to="/dashboard/settings"
              onClick={() => onToggle()}
              className="flex items-center px-4 py-2 w-full text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 w-full text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;