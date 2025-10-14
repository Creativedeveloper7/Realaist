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
      whileHover={{ scale: 4.05 }}
      whileTap={{ scale: 2.95 }}
    >
     ,<div>
        <img 
          src="/logos/realaistlogo.png" 
          alt="Realaist Logo" 
          className="h-12 w-auto md:h-15"
        />
      </div>
    </motion.a>
  );
}

