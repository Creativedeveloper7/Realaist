import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignupData } from '../../contexts/AuthContext';
import { Building2, ArrowLeft } from 'lucide-react';

interface DeveloperSignupFormProps {
  isDarkMode: boolean;
  onBack: () => void;
  onSwitchToLogin?: () => void;
}

export const DeveloperSignupForm: React.FC<DeveloperSignupFormProps> = ({ 
  isDarkMode, 
  onBack,
  onSwitchToLogin 
}) => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });
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

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    const signupData: SignupData = {
      ...formData,
      userType: 'developer'
    };

    const result = await signup(signupData);
    
    if (result.success) {
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

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500 text-white">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Developer Signup
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              Create your developer account to list properties
            </p>
          </div>
        </div>
      </div>

      <motion.form 
        className="space-y-4" 
        onSubmit={handleSubmit}
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
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              First Name *
            </label>
            <input
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
              placeholder="Enter your first name"
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              Last Name *
            </label>
            <input
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
              placeholder="Enter your last name"
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            Email Address *
          </label>
          <input
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
            placeholder="Enter your email address"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            Phone Number *
          </label>
          <input
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
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            Company Name *
          </label>
          <input
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              errors.companyName 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your company name"
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            License Number *
          </label>
          <input
            name="licenseNumber"
            type="text"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              errors.licenseNumber 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your developer license number"
            disabled={isLoading}
          />
          {errors.licenseNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            Password *
          </label>
          <input
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
            placeholder="Create a password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>
            Confirm Password *
          </label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              errors.confirmPassword 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
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
            'Create Developer Account'
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
          className="w-full px-6 py-3 rounded-full border transition-colors font-medium ${
            isDarkMode 
              ? 'border-white/20 hover:border-[#C7A667] hover:text-[#C7A667]' 
              : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
          }"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          Sign In Instead
        </motion.button>
      </motion.form>
    </motion.div>
  );
};
