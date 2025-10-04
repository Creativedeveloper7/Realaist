import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  isDarkMode: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For development: Allow any password for admin emails
      const isAdminEmail = email.toLowerCase().includes('admin') || 
                          email.toLowerCase().includes('superadmin') || 
                          email.toLowerCase().includes('support');
      
      if (!isAdminEmail) {
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
        return;
      }

      // For development: Create a mock admin user
      const mockAdminUser = {
        id: 'admin-1',
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        userType: 'admin' as const,
        companyName: 'Realaist Admin',
        licenseNumber: 'ADMIN-001'
      };

      // Store admin user in localStorage for development
      localStorage.setItem('current_user', JSON.stringify(mockAdminUser));
      
      // Simulate successful login
      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-[#111217]' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={handleBackToHome}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors mb-6 ${
              isDarkMode 
                ? 'border-white/20 text-white hover:bg-white/10' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </motion.button>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Login
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Access the administrative dashboard
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className={`p-8 rounded-2xl shadow-xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}>
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="admin@realaist.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Access Admin Dashboard
                </>
              )}
            </motion.button>
          </form>

          {/* Admin Info */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Development Mode - Admin Access:
            </h3>
            <ul className={`text-xs space-y-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <li>• Use any of these emails:</li>
              <li>• admin@realaist.com</li>
              <li>• superadmin@realaist.com</li>
              <li>• support@realaist.com</li>
              <li>• Any password will work</li>
            </ul>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Admin access is restricted to authorized personnel only.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
