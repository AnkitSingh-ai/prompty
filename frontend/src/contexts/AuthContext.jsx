import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { googleAuth } from '../services/googleAuth';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session and validate with backend
    const checkAuth = async () => {

      const token = localStorage.getItem('promptverse_token');
      const storedUser = localStorage.getItem('promptverse_user');
      
      if (token && storedUser) {
        try {
          // Validate token with backend
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('promptverse_token');
          localStorage.removeItem('promptverse_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, ...userData } = response;
      
      setUser(userData);
      localStorage.setItem('promptverse_token', token);
      localStorage.setItem('promptverse_user', JSON.stringify(userData));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid credentials');
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const response = await authAPI.register({ email, password, name });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const { token, ...userData } = response.data;
      
      setUser(userData);
      localStorage.setItem('promptverse_token', token);
      localStorage.setItem('promptverse_user', JSON.stringify(userData));
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('promptverse_token');
    localStorage.removeItem('promptverse_user');
  };

  const signInWithGoogle = async () => {
    try {
      await googleAuth.signInWithGoogle();
    } catch (error) {
      throw new Error('Google sign-in failed');
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;