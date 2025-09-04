import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
}

export function Header({ isDarkMode, toggleTheme, onLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header 
      className={`fixed top-0 inset-x-0 z-30 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-black/35 border-white/10' 
          : 'bg-white/80 border-gray-200'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo removed - using FloatingLogo component instead */}
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Investors</a>
          <a href="/blogs" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
          <a href="#contact" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <motion.button
                  onClick={handleLogout}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-white/70 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login/Signup
            </motion.button>
          )}
          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all ${
              isDarkMode 
                ? 'border-white/30 hover:border-[#C7A667] hover:text-[#C7A667]' 
                : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
            <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
            <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden absolute top-16 left-0 right-0 backdrop-blur-sm border-b transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-black/95 border-white/10' 
            : 'bg-white/95 border-gray-200'
        }`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0,
          height: mobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="px-4 py-6 space-y-4">
          <a href="/houses" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Investors</a>
          <a href="/blogs" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
          <a href="#contact" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
          {isAuthenticated ? (
            <div className="space-y-3">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Dashboard
              </motion.button>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs opacity-70">{user?.email}</p>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-white/70 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={onLoginClick}
              className="w-full px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login/Signup
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
}

