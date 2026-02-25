import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { DeveloperSignupForm } from './DeveloperSignupForm';
import { HostSignupForm } from './HostSignupForm';
import { GoogleSignupHandler } from './GoogleSignupHandler';
import { Home } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialMode?: 'login' | 'signup';
}

type AuthStep = 'login' | 'signupChoice' | 'developerSignup' | 'hostSignup' | 'googleSignup';

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  initialMode = 'login' 
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>(
    initialMode === 'signup' ? 'signupChoice' : initialMode
  );

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'developerSignup':
      case 'hostSignup':
        setCurrentStep('signupChoice');
        break;
      case 'signupChoice':
        setCurrentStep('login');
        break;
      default:
        setCurrentStep('login');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden ${
            isDarkMode 
              ? 'bg-[#0E0E10] border border-white/10' 
              : 'bg-white border border-gray-200'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content Container */}
          <div className="overflow-y-auto max-h-[95vh] sm:max-h-[90vh] p-4 sm:p-6 md:p-8">
          {true && (
            <div className="flex justify-between items-center mb-6">
              <motion.h3 
                className={`font-heading text-2xl md:text-3xl transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} 
                style={{ 
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  fontWeight: 500,
                  letterSpacing: '0.05em'
                }}
                key={currentStep}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 'login' ? 'Welcome Back' :
                 currentStep === 'signupChoice' ? 'Create Account' :
                 currentStep === 'developerSignup' ? 'Create Realtor Account' :
                 currentStep === 'hostSignup' ? 'Create Host Account' :
                 'Create Account'}
              </motion.h3>
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
          )}
          
          {true && (
            <motion.p 
              className={`mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}
              key={`${currentStep}-description`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {currentStep === 'login'
                ? 'Sign in to your account to access your dashboard and manage your properties.'
                : currentStep === 'signupChoice'
                  ? 'Choose how you want to sign up.'
                  : currentStep === 'hostSignup'
                    ? 'Create your host account to list short stays.'
                    : 'Create your realtor account to list and manage properties.'}
            </motion.p>
          )}

          <AnimatePresence mode="wait">
          {currentStep === 'login' && (
            <LoginForm
              key="login"
              isDarkMode={isDarkMode}
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setCurrentStep('signupChoice')}
            />
          )}
          {currentStep === 'signupChoice' && (
            <div key="signupChoice" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep('hostSignup')}
                  className={`flex items-center gap-4 p-6 rounded-xl border-2 text-left transition-all ${
                    isDarkMode
                      ? 'border-white/20 hover:border-[#C7A667] bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 hover:border-[#C7A667] bg-gray-50 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-3 rounded-lg bg-amber-500 text-white">
                    <Home size={28} />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Sign up as Host
                    </h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      List short stays and manage bookings
                    </p>
                  </div>
                </motion.button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('login')}
                  className={`text-sm ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
          {currentStep === 'developerSignup' && (
            <DeveloperSignupForm
              key="developerSignup"
              isDarkMode={isDarkMode}
              onBack={handleBack}
              onSwitchToLogin={() => setCurrentStep('login')}
              onSuccess={handleSuccess}
            />
          )}
          {currentStep === 'hostSignup' && (
            <HostSignupForm
              key="hostSignup"
              isDarkMode={isDarkMode}
              onBack={handleBack}
              onSwitchToLogin={() => setCurrentStep('login')}
              onSuccess={handleSuccess}
            />
          )}
          {currentStep === 'googleSignup' && (
            <GoogleSignupHandler
              key="googleSignup"
              isDarkMode={isDarkMode}
              onComplete={handleSuccess}
            />
          )}
        </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
