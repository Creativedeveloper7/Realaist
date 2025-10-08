import React from 'react';
import { motion } from 'framer-motion';

interface FloatingLogoProps {
  isDarkMode?: boolean;
}

export function FloatingLogo({ isDarkMode = true }: FloatingLogoProps) {
  return (
    <motion.a 
      href="/"
      className="fixed left-4 top-8 z-50 select-none logo-float cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`border border-dashed rounded-md p-2 backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'border-white/60 bg-black/20' 
          : 'border-gray-400 bg-white/20'
      }`}>
        <img 
          src="/logos/realaistlogo.png" 
          alt="Realaist Logo" 
          className="h-12 w-auto md:h-15"
        />
      </div>
    </motion.a>
  );
}

