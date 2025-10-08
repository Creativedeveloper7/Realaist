import React from 'react';
import { motion } from 'framer-motion';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function LoginModal({ isOpen, onClose, isDarkMode }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-md rounded-2xl p-8 shadow-2xl ${
          isDarkMode 
            ? 'bg-[#0E0E10] border border-white/10' 
            : 'bg-white border border-gray-200'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-heading text-2xl md:text-3xl transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{ 
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            Welcome Back
          </h3>
          <motion.button
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>
        
        <p className={`mb-6 transition-colors duration-300 ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          Sign in to your account or create a new one to get started.
        </p>
        
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get('email');
          const password = formData.get('password');
          
          // Here you would typically handle login/signup logic
          console.log('Login attempt:', { email, password });
          onClose();
        }}>
          <motion.input 
            name="email"
            type="email"
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Email"
            whileFocus={{ scale: 1.02 }}
            required
          />
          <motion.input 
            name="password"
            type="password"
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Password"
            whileFocus={{ scale: 1.02 }}
            required
          />
          
          <div className="flex items-center justify-between">
            <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              <input type="checkbox" className="accent-[#C7A667]" /> Remember me
            </label>
            <button 
              type="button"
              className={`text-sm transition-colors duration-300 hover:text-[#C7A667] ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}
            >
              Forgot password?
            </button>
          </div>
          
          <motion.button 
            type="submit"
            className="w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          
          <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center ${
              isDarkMode ? 'border-white/20' : 'border-gray-300'
            }`}>
              <div className={`w-full border-t ${
                isDarkMode ? 'border-white/20' : 'border-gray-300'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0E0E10] text-white/70' : 'bg-white text-gray-500'
              }`}>
                Or continue with
              </span>
            </div>
          </div>
          
          <motion.button 
            type="button"
            className="w-full px-6 py-3 rounded-full border transition-colors font-medium ${
              isDarkMode 
                ? 'border-white/20 hover:border-[#C7A667] hover:text-[#C7A667]' 
                : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
            }"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

