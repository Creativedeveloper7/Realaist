import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, User, Briefcase } from 'lucide-react';

interface UserTypeSelectorProps {
  isDarkMode: boolean;
  onSelectType: (type: 'buyer' | 'developer') => void;
  onBack: () => void;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ 
  isDarkMode, 
  onSelectType,
  onBack 
}) => {
  const [selectedType, setSelectedType] = useState<'buyer' | 'developer' | null>(null);

  const userTypes = [
    {
      id: 'buyer' as const,
      title: 'Buyer/Investor',
      description: 'Find and invest in properties',
      icon: Home,
      features: [
        'Save and favorite properties',
        'Contact property developers',
        'Share properties with others',
        'Track your investments'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'developer' as const,
      title: 'Property Developer',
      description: 'List and manage your properties',
      icon: Building2,
      features: [
        'Post property listings',
        'Upload images and videos',
        'Manage multiple properties',
        'Track property performance'
      ],
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 md:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="text-center space-y-2 sm:space-y-3">
        <motion.div
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r from-[#C7A667] to-[#B89657] flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span className="text-lg sm:text-2xl">🏠</span>
        </motion.div>
        <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Choose Your Account Type
        </h3>
        <p className={`text-sm sm:text-base max-w-md mx-auto leading-relaxed ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          Select the type of account that best describes your needs and get started with Realaist
        </p>
      </div>

      {/* User Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {userTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <motion.div
              key={type.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'transform scale-105'
                  : 'hover:scale-102'
              }`}
              onClick={() => setSelectedType(type.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className={`relative p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-[#C7A667] bg-gradient-to-br from-[#C7A667]/10 to-[#C7A667]/5 shadow-lg shadow-[#C7A667]/20'
                  : isDarkMode
                    ? 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
              }`}>
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#C7A667] rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${type.color} text-white flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon size={20} className="sm:hidden" />
                  <Icon size={28} className="hidden sm:block" />
                </motion.div>

                {/* Content */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className={`font-bold text-lg sm:text-xl mb-1 sm:mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {type.title}
                    </h4>
                    <p className={`text-sm sm:text-base leading-relaxed ${
                      isDarkMode ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {type.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 sm:space-y-3">
                    {type.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className={`flex items-center gap-2 sm:gap-3 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 + featureIndex * 0.05 }}
                      >
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          isSelected ? 'bg-[#C7A667]' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs sm:text-sm font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-[#C7A667]/5 to-transparent opacity-100'
                    : 'bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100'
                }`}></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={onBack}
          className={`flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all font-semibold text-sm sm:text-base ${
            isDarkMode 
              ? 'border-white/20 hover:border-[#C7A667] hover:text-[#C7A667] text-white' 
              : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667] text-gray-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={() => selectedType && onSelectType(selectedType)}
          disabled={!selectedType}
          className={`flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
            selectedType
              ? 'bg-[#C7A667] text-black hover:bg-[#B89657] shadow-lg shadow-[#C7A667]/25'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={{ scale: selectedType ? 1.02 : 1 }}
          whileTap={{ scale: selectedType ? 0.98 : 1 }}
        >
          {selectedType ? 'Continue' : 'Select an option'}
        </motion.button>
      </motion.div>

      {/* Help Text */}
      <motion.div
        className="text-center pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className={`text-xs sm:text-sm ${
          isDarkMode ? 'text-white/50' : 'text-gray-400'
        }`}>
          You can change your account type later in settings
        </p>
      </motion.div>
    </motion.div>
  );
};
