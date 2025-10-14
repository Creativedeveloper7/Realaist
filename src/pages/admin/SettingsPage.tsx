import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Key, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Info
} from 'lucide-react';

interface GoogleAdsConfig {
  developerToken: string;
  mccCustomerId: string;
  loginCustomerId: string;
}

export default function SettingsPage() {
  const [googleAdsConfig, setGoogleAdsConfig] = useState<GoogleAdsConfig>({
    developerToken: '',
    mccCustomerId: '',
    loginCustomerId: ''
  });
  const [showTokens, setShowTokens] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load current configuration
  useEffect(() => {
    const loadConfig = () => {
      // In a real app, this would load from your backend/API
      const currentConfig = {
        developerToken: import.meta.env.VITE_GADS_DEV_TOKEN || '',
        mccCustomerId: import.meta.env.VITE_GADS_MCC_ID || '',
        loginCustomerId: import.meta.env.VITE_GADS_LOGIN_CUSTOMER_ID || ''
      };
      setGoogleAdsConfig(currentConfig);
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // In a real app, this would save to your backend
      // For now, we'll simulate the save process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update environment variables (in a real app, this would be handled by your backend)
      console.log('Saving Google Ads configuration:', googleAdsConfig);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const maskToken = (token: string) => {
    if (!token) return '';
    if (token.length <= 8) return token;
    return token.substring(0, 4) + '•'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage admin preferences and platform configurations.</p>
      </div>

      {/* Google Ads API Configuration */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Google Ads API Configuration</h2>
              <p className="text-sm text-gray-500">Configure Google Ads API credentials for campaign management</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Developer Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Developer Token
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showTokens ? 'text' : 'password'}
                value={googleAdsConfig.developerToken}
                onChange={(e) => setGoogleAdsConfig(prev => ({ ...prev, developerToken: e.target.value }))}
                placeholder="Enter your Google Ads Developer Token"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12"
              />
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showTokens ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Your Google Ads Developer Token for API access. This is required for creating and managing campaigns.</p>
                <p className="mt-1">
                  <a 
                    href="https://developers.google.com/google-ads/api/docs/first-call/overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    Learn how to get your developer token
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* MCC Customer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              MCC Customer ID
            </label>
            <input
              type="text"
              value={googleAdsConfig.mccCustomerId}
              onChange={(e) => setGoogleAdsConfig(prev => ({ ...prev, mccCustomerId: e.target.value }))}
              placeholder="Enter your MCC Customer ID (optional)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500">Your Google Ads Manager Account (MCC) Customer ID for multi-account management.</p>
          </div>

          {/* Login Customer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Login Customer ID
            </label>
            <input
              type="text"
              value={googleAdsConfig.loginCustomerId}
              onChange={(e) => setGoogleAdsConfig(prev => ({ ...prev, loginCustomerId: e.target.value }))}
              placeholder="Enter your Login Customer ID (optional)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500">The customer ID to use for authentication when making API calls.</p>
          </div>

          {/* Current Configuration Display */}
          {googleAdsConfig.developerToken && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Developer Token:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {showTokens ? googleAdsConfig.developerToken : maskToken(googleAdsConfig.developerToken)}
                  </span>
                </div>
                {googleAdsConfig.mccCustomerId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">MCC Customer ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{googleAdsConfig.mccCustomerId}</span>
                  </div>
                )}
                {googleAdsConfig.loginCustomerId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Login Customer ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{googleAdsConfig.loginCustomerId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Configuration saved successfully!</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Failed to save configuration. Please try again.</span>
                </div>
              )}
            </div>
            <motion.button
              onClick={handleSave}
              disabled={isSaving || !googleAdsConfig.developerToken}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Test Phase Information */}
      <motion.div
        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Test Phase Configuration</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              You're currently in the test phase. Make sure to use your test developer token and configure the API properly before going live.
            </p>
            <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Next Steps:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Paste your Google Ads Developer Token above</li>
                <li>Configure MCC Customer ID if using multiple accounts</li>
                <li>Test campaign creation with a small budget</li>
                <li>Verify API connectivity and permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


