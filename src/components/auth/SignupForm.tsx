import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignupData } from '../../contexts/AuthContext';

interface SignupFormProps {
  isDarkMode: boolean;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  isDarkMode, 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await signup(formData);
    
    if (result.success) {
      onSuccess?.();
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error || 'Signup failed' });
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

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <motion.input 
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              errors.firstName 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="First name"
            whileFocus={{ scale: 1.02 }}
            disabled={isLoading}
          />
          {errors.firstName && (
            <motion.p 
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {errors.firstName}
            </motion.p>
          )}
        </div>

        <div>
          <motion.input 
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              errors.lastName 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Last name"
            whileFocus={{ scale: 1.02 }}
            disabled={isLoading}
          />
          {errors.lastName && (
            <motion.p 
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {errors.lastName}
            </motion.p>
          )}
        </div>
      </div>

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
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
            errors.phone 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Phone number (optional)"
          whileFocus={{ scale: 1.02 }}
          disabled={isLoading}
        />
        {errors.phone && (
          <motion.p 
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.phone}
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

      <div>
        <motion.input 
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
            errors.confirmPassword 
              ? 'border-red-500' 
              : isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Confirm password"
          whileFocus={{ scale: 1.02 }}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <motion.p 
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </div>

      <div>
        <label className={`flex items-start gap-3 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          <input 
            type="checkbox" 
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="accent-[#C7A667] mt-0.5" 
          /> 
          <span>
            I agree to the{' '}
            <button type="button" className="text-[#C7A667] hover:underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-[#C7A667] hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.terms && (
          <motion.p 
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errors.terms}
          </motion.p>
        )}
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
            Creating Account...
          </div>
        ) : (
          'Create Account'
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
            Already have an account?
          </span>
        </div>
      </div>
      
      <motion.button 
        type="button"
        onClick={onSwitchToLogin}
        className={`w-full px-6 py-3 rounded-full border transition-colors font-medium ${
          isDarkMode 
            ? 'border-white/20 text-white hover:border-[#C7A667] hover:text-[#C7A667]' 
            : 'border-gray-300 text-gray-900 hover:border-[#C7A667] hover:text-[#C7A667]'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        Sign In Instead
      </motion.button>
    </motion.form>
  );
};
