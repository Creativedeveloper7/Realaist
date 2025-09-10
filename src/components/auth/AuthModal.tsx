import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { UserTypeSelector } from './UserTypeSelector';
import { BuyerSignupForm } from './BuyerSignupForm';
import { DeveloperSignupForm } from './DeveloperSignupForm';
import { GoogleSignupHandler } from './GoogleSignupHandler';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialMode?: 'login' | 'signup';
}

type AuthStep = 'login' | 'signup' | 'userType' | 'buyerSignup' | 'developerSignup' | 'googleSignup';

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  initialMode = 'login' 
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'buyerSignup':
      case 'developerSignup':
        setCurrentStep('userType');
        break;
      case 'userType':
        setCurrentStep('signup');
        break;
      default:
        setCurrentStep('login');
    }
  };

  const handleUserTypeSelect = (type: 'buyer' | 'developer') => {
    setCurrentStep(type === 'buyer' ? 'buyerSignup' : 'developerSignup');
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
          {currentStep !== 'userType' && (
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
                 currentStep === 'buyerSignup' ? 'Create Buyer Account' :
                 currentStep === 'developerSignup' ? 'Create Developer Account' :
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
          
          {currentStep !== 'userType' && (
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
                : currentStep === 'buyerSignup'
                ? 'Create your buyer account to start investing in properties.'
                : currentStep === 'developerSignup'
                ? 'Create your developer account to list and manage properties.'
                : 'Join Realaist to discover exclusive properties and get personalized recommendations.'
              }
            </motion.p>
          )}

          {/* Close button for user type selector */}
          {currentStep === 'userType' && (
            <div className="flex justify-end mb-4">
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
        
        <AnimatePresence mode="wait">
          {currentStep === 'login' && (
            <LoginForm
              key="login"
              isDarkMode={isDarkMode}
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setCurrentStep('userType')}
            />
          )}
          {currentStep === 'userType' && (
            <UserTypeSelector
              key="userType"
              isDarkMode={isDarkMode}
              onSelectType={handleUserTypeSelect}
              onBack={() => setCurrentStep('login')}
            />
          )}
          {currentStep === 'buyerSignup' && (
            <BuyerSignupForm
              key="buyerSignup"
              isDarkMode={isDarkMode}
              onBack={handleBack}
              onSwitchToLogin={() => setCurrentStep('login')}
              onSuccess={handleSuccess}
            />
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
