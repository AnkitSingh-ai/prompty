import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { googleAuth } from '../services/googleAuth';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userData = searchParams.get('user');

        if (token && userData) {
          const result = googleAuth.handleCallback(token, JSON.parse(decodeURIComponent(userData)));
          
          if (result.success) {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.error || 'Authentication failed');
          }
        } else {
          setStatus('error');
          setMessage('Invalid authentication response');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-500/10';
      case 'success':
        return 'bg-green-500/10';
      case 'error':
        return 'bg-red-500/10';
      default:
        return 'bg-blue-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`${getBgColor()} backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center`}>
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h2>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
