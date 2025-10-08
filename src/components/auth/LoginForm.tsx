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
  const { login, signInWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    const trimmedEmail = formData.email.trim();
    const result = await login(trimmedEmail, formData.password);
    
    if (result.success) {
      onSuccess?.();
      // Prefer role from AuthContext to avoid email edge cases
      if (user?.userType === 'admin') {
        navigate('/admin');
        return;
      }
      // Fallback to email allowlist in case user hasn't propagated yet
      const adminEmails = [
        'admin@realaist.com',
        'admin@realaist.tech',
        'superadmin@realaist.com',
        'support@realaist.com'
      ];
      const isAdmin = adminEmails.includes(trimmedEmail.toLowerCase());
      navigate(isAdmin ? '/admin' : '/dashboard');
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

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    
    if (result.success) {
      onSuccess?.();
      // Prefer role from AuthContext if already available
      if (user?.userType === 'admin') {
        navigate('/admin');
        return;
      }
      // After OAuth, we may not have user immediately; try stored user
      try {
        const stored = localStorage.getItem('current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const adminEmails = [
            'admin@realaist.com',
            'admin@realaist.tech',
            'superadmin@realaist.com',
            'support@realaist.com'
          ];
          const isAdmin = parsed?.email && adminEmails.includes(String(parsed.email).toLowerCase());
          navigate(isAdmin ? '/admin' : '/dashboard');
          return;
        }
      } catch {}
      // Fallback
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error || 'Google sign-in failed' });
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
        <div className="relative">
          <motion.input 
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#C7A667] transition-colors ${
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-white/60 hover:text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isLoading}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
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
        onClick={handleGoogleSignIn}
        className="w-full px-6 py-3 rounded-full border transition-colors font-medium flex items-center justify-center gap-3 ${
          isDarkMode 
            ? 'border-white/20 hover:border-[#C7A667] hover:text-[#C7A667]' 
            : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
        }"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </motion.button>

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

    </motion.form>
  );
};
