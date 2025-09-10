import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleSignupHandlerProps {
  isDarkMode: boolean;
  onComplete: () => void;
}

export const GoogleSignupHandler: React.FC<GoogleSignupHandlerProps> = ({ 
  isDarkMode, 
  onComplete 
}) => {
  const [userType, setUserType] = useState<'buyer' | 'developer' | null>(null);
  const [additionalData, setAdditionalData] = useState({
    phone: '',
    companyName: '',
    licenseNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user just signed in with Google
    const checkGoogleSignIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user already has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // User already has a profile, complete the process
          onComplete();
        }
        // If no profile, show the user type selection
      }
    };

    checkGoogleSignIn();
  }, [onComplete]);

  const handleCompleteProfile = async () => {
    if (!userType) {
      setError('Please select your account type');
      return;
    }

    if (userType === 'developer' && (!additionalData.companyName || !additionalData.licenseNumber)) {
      setError('Company name and license number are required for developers');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('No active session found');
        return;
      }

      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.full_name?.split(' ')[0] || 'User',
          last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          user_type: userType,
          phone: additionalData.phone || null,
          company_name: userType === 'developer' ? additionalData.companyName : null,
          license_number: userType === 'developer' ? additionalData.licenseNumber : null,
          avatar_url: session.user.user_metadata?.avatar_url || null
        });

      if (error) {
        setError(error.message);
        return;
      }

      onComplete();
    } catch (error) {
      setError('Failed to complete profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Complete Your Profile
        </h2>
        <p className={`text-sm ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          Please select your account type to continue
        </p>
      </div>

      {error && (
        <motion.div
          className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error}
        </motion.div>
      )}

      {/* User Type Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            onClick={() => setUserType('buyer')}
            className={`p-4 rounded-lg border-2 transition-all ${
              userType === 'buyer'
                ? 'border-[#C7A667] bg-[#C7A667]/10'
                : isDarkMode
                ? 'border-white/20 hover:border-white/40'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏠</div>
              <h3 className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Buyer
              </h3>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                Looking for properties
              </p>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setUserType('developer')}
            className={`p-4 rounded-lg border-2 transition-all ${
              userType === 'developer'
                ? 'border-[#C7A667] bg-[#C7A667]/10'
                : isDarkMode
                ? 'border-white/20 hover:border-white/40'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏗️</div>
              <h3 className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Developer
              </h3>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                Selling properties
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Additional Fields */}
      {userType && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={additionalData.phone}
              onChange={(e) => setAdditionalData(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-[#C7A667]'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
              placeholder="+254 700 000 000"
            />
          </div>

          {userType === 'developer' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={additionalData.companyName}
                  onChange={(e) => setAdditionalData(prev => ({ ...prev, companyName: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-[#C7A667]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
                  } focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                  License Number *
                </label>
                <input
                  type="text"
                  value={additionalData.licenseNumber}
                  onChange={(e) => setAdditionalData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-[#C7A667]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
                  } focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                  placeholder="DEV-2024-001"
                  required
                />
              </div>
            </>
          )}
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={handleCompleteProfile}
        disabled={!userType || isLoading}
        className="w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            Setting up your account...
          </div>
        ) : (
          'Complete Setup'
        )}
      </motion.button>
    </motion.div>
  );
};

