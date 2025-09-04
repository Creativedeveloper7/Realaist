import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
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
  Shield
} from 'lucide-react';

interface UserProfileProps {
  isDarkMode: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isDarkMode }) => {
  const { user, updateProfile, updatePreferences } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications || true,
    darkMode: user?.preferences?.darkMode || false,
    language: user?.preferences?.language || 'en',
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const result = await updatePreferences(preferences);
      if (result.success) {
        // Preferences updated successfully
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
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
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-2xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#C7A667] rounded-full flex items-center justify-center text-black">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Shield size={16} />
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
          <motion.button
            className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium"
            onClick={() => setIsEditing(!isEditing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[#C7A667]" />
            <h3 className="text-xl font-bold">Personal Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-[#C7A667]" />
            <h3 className="text-xl font-bold">Preferences</h3>
          </div>

          <div className="space-y-6">
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
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-[#C7A667]" />
          <h3 className="text-xl font-bold">Account Security</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 className="w-5 h-5 text-[#C7A667]" />
            <span>Change Password</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-5 h-5 text-[#C7A667]" />
            <span>Two-Factor Authentication</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
