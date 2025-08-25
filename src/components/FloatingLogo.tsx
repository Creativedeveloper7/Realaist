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
      <div className={`border border-dashed rounded-md px-4 py-3 backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'border-white/60 bg-black/20' 
          : 'border-gray-400 bg-white/20'
      }`}>
        <span className={`font-logo tracking-[0.25em] text-sm md:text-base transition-colors duration-300 ${
          isDarkMode ? 'text-white/90' : 'text-gray-900/90'
        }`}>
          REALAIST
        </span>
      </div>
    </motion.a>
  );
}

