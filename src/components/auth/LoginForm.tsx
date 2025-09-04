import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  isDarkMode: boolean;
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  isDarkMode, 
  onSuccess, 
  onSwitchToSignup 
}) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onSuccess?.();
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error || 'Login failed' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.form 
      className="space-y-4" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {errors.general && (
        <motion.div
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {errors.general}
        </motion.div>
      )}

      <div>
        <motion.input 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
            errors.email 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Email address"
          whileFocus={{ scale: 1.02 }}
          disabled={isLoading}
        />
        {errors.email && (
          <motion.p 
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      <div>
        <motion.input 
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
            errors.password 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Password"
          whileFocus={{ scale: 1.02 }}
          disabled={isLoading}
        />
        {errors.password && (
          <motion.p 
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.password}
          </motion.p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-[#C7A667]" 
          /> 
          Remember me
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
        className="w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            Signing In...
          </div>
        ) : (
          'Sign In'
        )}
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
        onClick={onSwitchToSignup}
        className="w-full px-6 py-3 rounded-full border transition-colors font-medium ${
          isDarkMode 
            ? 'border-white/20 hover:border-[#C7A667] hover:text-[#C7A667]' 
            : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
        }"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        Create Account
      </motion.button>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>Demo credentials:</p>
        <div className="space-y-1 mt-2">
          <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
            <p className="font-semibold text-blue-700 dark:text-blue-300">Buyer Account:</p>
            <p className="font-mono text-xs">Email: buyer@realaist.com</p>
            <p className="font-mono text-xs">Password: password</p>
          </div>
          <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
            <p className="font-semibold text-green-700 dark:text-green-300">Developer Account:</p>
            <p className="font-mono text-xs">Email: developer@realaist.com</p>
            <p className="font-mono text-xs">Password: password</p>
          </div>
        </div>
      </div>
    </motion.form>
  );
};
