import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

// Import data
import { offPlanProjects, completedProjects } from '../data/projects';

// Import components
import { FloatingLogo } from '../components/FloatingLogo';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { SearchSection } from '../components/SearchSection';
import { AboutSection } from '../components/AboutSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { PropertyCarousel } from '../components/PropertyCarousel';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { BlogsSection } from '../components/BlogsSection';
import { ContactSection } from '../components/ContactSection';
import { ConsultationModal } from '../components/ConsultationModal';
import { ChatBot } from '../components/ChatBot';

interface HomePageProps {
  onLoginClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [themeWidgetOpen, setThemeWidgetOpen] = useState(false);

  const handleConsultationClick = () => {
    setConsultationModalOpen(true);
  };

  return (
    <>
      {/* Preload Montserrat Medium font */}
      <link 
        rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap" 
        as="style"
      />

      {/* Floating Logo - Visible across all pages */}
      <FloatingLogo isDarkMode={isDarkMode} />

      {/* Mobile Theme Widget */}
      <motion.div
        className="fixed right-2 top-1/3 transform -translate-y-1/2 z-30 md:hidden"
        initial={{ x: 80 }}
        animate={{ x: themeWidgetOpen ? 0 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className={`backdrop-blur-sm border rounded-l-xl p-3 shadow-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-black/70 border-white/10' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="space-y-3">
            <motion.button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-colors ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                  : 'bg-black/10 border-gray-300/50 hover:bg-black/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Theme Toggle Button */}
      <motion.button
        className={`fixed right-2 top-1/4 transform -translate-y-1/2 z-50 md:hidden w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg transition-all duration-300 opacity-60 hover:opacity-100 ${
          isDarkMode 
            ? 'bg-black/60 border-white/10 text-white/80' 
            : 'bg-white/60 border-gray-200/50 text-gray-600'
        }`}
        onClick={() => {
          console.log('Mobile theme toggle clicked!');
          toggleTheme();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.button>

      {/* Wrapper */}
      <div className={`grain font-body transition-colors duration-300 overflow-x-hidden ${isDarkMode ? 'text-white bg-[#111217]' : 'text-gray-900 bg-white'}`}>
        {/* Header */}
        <Header 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLoginClick={onLoginClick}
          showLogo={false}
        />

        <main>
          {/* Hero Section */}
          <Hero isDarkMode={isDarkMode} />

          {/* Search Section */}
          <SearchSection 
            isDarkMode={isDarkMode}
            onConsultationClick={handleConsultationClick}
          />

          {/* About Section */}
          <AboutSection isDarkMode={isDarkMode} />

          {/* How It Works Section */}
          <HowItWorksSection 
            isDarkMode={isDarkMode}
            onLoginClick={onLoginClick}
          />

          {/* Off-Plan Properties Carousel */}
          <PropertyCarousel 
            title="Off-Plan Properties"
            projects={offPlanProjects}
            isDarkMode={isDarkMode}
          />

          {/* Completed Properties Carousel */}
          <PropertyCarousel 
            title="Completed Properties"
            projects={completedProjects}
            isDarkMode={isDarkMode}
          />

          {/* Testimonials Section */}
          <TestimonialsSection isDarkMode={isDarkMode} />

          {/* Blogs Section */}
          <BlogsSection isDarkMode={isDarkMode} />

          {/* Contact Section */}
          <ContactSection isDarkMode={isDarkMode} />
        </main>

        {/* Consultation Modal */}
        <ConsultationModal 
          isOpen={consultationModalOpen}
          onClose={() => setConsultationModalOpen(false)}
          isDarkMode={isDarkMode}
        />

        {/* ChatBot */}
        <ChatBot isDarkMode={isDarkMode} />
      </div>
    </>
  );
};
