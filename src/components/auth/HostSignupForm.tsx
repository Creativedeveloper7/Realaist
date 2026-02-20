import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignupData } from '../../contexts/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';

interface HostSignupFormProps {
  isDarkMode: boolean;
  onBack: () => void;
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export const HostSignupForm: React.FC<HostSignupFormProps> = ({
  isDarkMode,
  onBack,
  onSwitchToLogin,
  onSuccess,
}) => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const signupData: SignupData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      userType: 'host',
    };
    const result = await signup(signupData);
    if (result.success) {
      onSuccess?.();
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error || 'Signup failed' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const inputClass = (err: boolean) =>
    `w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
      err ? 'border-red-500 ' : ''
    }${
      isDarkMode
        ? 'bg-white/5 border-white/15 text-white placeholder-white/40'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;
  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white">
            <Home size={20} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Short Stay Host Signup
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
              Create your host account to list short stays
            </p>
          </div>
        </div>
      </div>

      <motion.form className="space-y-4" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className={inputClass(!!errors.firstName)}
              placeholder="Enter your first name"
              disabled={isLoading}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className={inputClass(!!errors.lastName)}
              placeholder="Enter your last name"
              disabled={isLoading}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Email Address *</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={inputClass(!!errors.email)}
            placeholder="Enter your email address"
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone Number *</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className={inputClass(!!errors.phone)}
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>Property Address *</label>
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            className={inputClass(!!errors.address)}
            placeholder="Enter your property address"
            disabled={isLoading}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className={labelClass}>Password *</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              className={`${inputClass(!!errors.password)} pr-12`}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                isDarkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading}
              aria-label="Toggle password visibility"
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
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className={labelClass}>Confirm Password *</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${inputClass(!!errors.confirmPassword)} pr-12`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                isDarkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={isLoading}
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
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
              </button>{' '}
              and{' '}
              <button type="button" className="text-[#C7A667] hover:underline">
                Privacy Policy
              </button>
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
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
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            'Create Host Account'
          )}
        </motion.button>

        <div className="relative my-6">
          <div className={`w-full border-t ${isDarkMode ? 'border-white/20' : 'border-gray-300'}`} />
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDarkMode ? 'bg-[#0E0E10] text-white/70' : 'bg-white text-gray-500'}`}>
              Already have an account?
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onSwitchToLogin}
          className={`w-full px-6 py-3 rounded-full border font-medium ${
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
    </motion.div>
  );
};
