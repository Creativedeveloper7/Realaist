import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionProps {
  id: string;
  children: React.ReactNode;
  dark?: boolean;
  isDarkMode?: boolean;
}

export function Section({ id, children, dark = false, isDarkMode = true }: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative transition-colors duration-300 ${
        dark 
          ? (isDarkMode ? "bg-[#0E0E10]" : "bg-gray-100") 
          : (isDarkMode ? "bg-[#111217]" : "bg-white")
      }`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut"
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">{children}</div>
    </motion.section>
  );
}

