import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../ThemeContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Save, 
  Edit3,
  Camera,
  Bell,
  Globe,
  Shield,
  Instagram,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfileProps {
  isDarkMode: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isDarkMode }) => {
  const { user, updateProfile, updatePreferences } = useAuth();
  const { setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    licenseNumber: user?.licenseNumber || '',
    website: user?.website || '',
    instagram: user?.instagram || '',
    x: user?.x || '',
    facebook: user?.facebook || '',
    tiktok: user?.tiktok || '',
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications || true,
    darkMode: user?.preferences?.darkMode || false,
    language: user?.preferences?.language || 'en',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        licenseNumber: user.licenseNumber || '',
        website: user.website || '',
        instagram: user.instagram || '',
        x: user.x || '',
        facebook: user.facebook || '',
        tiktok: user.tiktok || '',
      });
      // Hosts can edit without clicking "Edit Profile" – start in edit mode
      if (user.userType === 'host') {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Please upload an image smaller than 5MB.' });
      return;
    }

    try {
      setIsUploadingLogo(true);
      setMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/logos/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
        return;
      }

      const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const result = await updateProfile({ logoUrl: publicUrl });
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Failed to save logo.' });
        return;
      }

      setMessage({ type: 'success', text: 'Logo updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Unexpected error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
    } finally {
      setIsUploadingLogo(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Please upload an image smaller than 5MB.' });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const result = await updateProfile({ avatarUrl: publicUrl });
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Failed to save profile picture.' });
        return;
      }

      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Unexpected error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so the same file can be selected again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await updatePreferences(preferences);
      if (result.success) {
        setTheme(preferences.darkMode);
        setMessage({ type: 'success', text: 'Preferences saved.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save preferences.' });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPreferences(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 overflow-x-hidden">
      {/* Profile Header */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0 self-center sm:self-auto">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-xl sm:text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <button
              type="button"
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-[#C7A667] rounded-full flex items-center justify-center text-black disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Upload profile picture"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2 truncate">{user?.email}</p>
            {user?.userType === 'developer' && user?.companyName && (
              <p className="text-sm sm:text-base text-gray-600 mb-2 flex items-center justify-center sm:justify-start gap-1 truncate">
                <Globe size={14} className="flex-shrink-0" />
                <span className="truncate">{user.companyName}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center justify-center sm:justify-start gap-1 whitespace-nowrap">
                <Calendar size={14} className="flex-shrink-0" />
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-1 whitespace-nowrap">
                <Shield size={14} className="flex-shrink-0" />
                {user?.userType === 'developer' ? 'Developer' : user?.userType === 'host' ? 'Host' : 'Buyer'}
              </span>
              {user?.userType === 'developer' && user?.licenseNumber && (
                <span className="flex items-center justify-center sm:justify-start gap-1 truncate">
                  <Shield size={14} className="flex-shrink-0" />
                  <span className="truncate">Business Number: {user.licenseNumber}</span>
                </span>
              )}
            </div>
          </div>
          <motion.button
            type="button"
            className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium text-sm sm:text-base whitespace-nowrap self-center sm:self-auto"
            onClick={() => setIsEditing(!isEditing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A667]" />
            <h3 className="text-lg sm:text-xl font-bold">Personal Information</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isEditing
                      ? isDarkMode
                        ? 'bg-white/5 border-white/15 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-white/5 border-white/10 text-white/70'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isEditing
                      ? isDarkMode
                        ? 'bg-white/5 border-white/15 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-white/5 border-white/10 text-white/70'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                    isEditing
                      ? isDarkMode
                        ? 'bg-white/5 border-white/15 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-white/5 border-white/10 text-white/70'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                    isEditing
                      ? isDarkMode
                        ? 'bg-white/5 border-white/15 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-white/5 border-white/10 text-white/70'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Developer-specific fields */}
            {user?.userType === 'developer' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your company name"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                        isEditing
                          ? isDarkMode
                            ? 'bg-white/5 border-white/15 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                          : isDarkMode
                            ? 'bg-white/5 border-white/10 text-white/70'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Number</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your business number"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                        isEditing
                          ? isDarkMode
                            ? 'bg-white/5 border-white/15 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                          : isDarkMode
                            ? 'bg-white/5 border-white/10 text-white/70'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Social Links & Profile Photo – for developers and hosts */}
            {(user?.userType === 'developer' || user?.userType === 'host') && (
                <div className={`mt-6 pt-6 border-t border-white/10 dark:border-gray-200/20 ${user?.userType === 'developer' ? '' : 'mt-4 pt-4'}`}>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#C7A667]" />
                    {user?.userType === 'host' ? 'Social links & profile photo' : 'Social Links & Branding'}
                  </h4>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://yourwebsite.com"
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                            isEditing
                              ? isDarkMode
                                ? 'bg-white/5 border-white/15 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://instagram.com/yourprofile"
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                            isEditing
                              ? isDarkMode
                                ? 'bg-white/5 border-white/15 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">X (Twitter)</label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          name="x"
                          value={formData.x}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://x.com/yourprofile"
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                            isEditing
                              ? isDarkMode
                                ? 'bg-white/5 border-white/15 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://facebook.com/yourprofile"
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                            isEditing
                              ? isDarkMode
                                ? 'bg-white/5 border-white/15 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">TikTok</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          name="tiktok"
                          value={formData.tiktok}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://tiktok.com/@yourprofile"
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors ${
                            isEditing
                              ? isDarkMode
                                ? 'bg-white/5 border-white/15 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                              : isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Logo / Profile photo for listings */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{user?.userType === 'host' ? 'Profile photo (shown on your short stay listings)' : 'Company Logo'}</label>
                      <div className="flex items-center gap-4">
                        {user?.logoUrl ? (
                          <img
                            src={user.logoUrl}
                            alt="Company Logo"
                            className="w-20 h-20 object-contain rounded-lg border border-white/10 dark:border-gray-200/20"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-white/5 dark:bg-gray-100 border border-white/10 dark:border-gray-200/20 rounded-lg flex items-center justify-center">
                            <Globe className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
                              isEditing
                                ? isDarkMode
                                  ? 'border-white/20 hover:border-[#C7A667] text-white'
                                  : 'border-gray-300 hover:border-[#C7A667] text-gray-700'
                                : isDarkMode
                                  ? 'border-white/10 text-white/50 cursor-not-allowed'
                                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isUploadingLogo ? 'Uploading...' : user?.logoUrl ? 'Change' : 'Upload'}
                          </button>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Success/Error Message */}
            {message && (
              <motion.div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {message.text}
              </motion.div>
            )}

            {isEditing && (
              <motion.button
                className="w-full px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium disabled:opacity-50"
                onClick={handleSaveProfile}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save size={16} />
                    Save Changes
                  </div>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A667]" />
            <h3 className="text-lg sm:text-xl font-bold">Preferences</h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Notifications</span>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={preferences.notifications}
                  onChange={handleInputChange}
                  className="accent-[#C7A667]"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Receive updates about your properties and new listings
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={preferences.darkMode}
                  onChange={handleInputChange}
                  className="accent-[#C7A667]"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Use dark theme for better viewing in low light
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                name="language"
                value={preferences.language}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 border-white/15 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
              </select>
            </div>

            <motion.button
              className="w-full px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium disabled:opacity-50"
              onClick={handleSavePreferences}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save size={16} />
                  Save Preferences
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Account Security */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A667]" />
          <h3 className="text-lg sm:text-xl font-bold">Account Security</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <motion.button
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A667] flex-shrink-0" />
            <span className="truncate">Change Password</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A667] flex-shrink-0" />
            <span className="truncate">Two-Factor Authentication</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
