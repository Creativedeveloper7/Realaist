import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { howItWorksSteps } from '../data/howItWorks';

interface HowItWorksSectionProps {
  isDarkMode: boolean;
  onLoginClick: () => void;
}

export function HowItWorksSection({ isDarkMode, onLoginClick }: HowItWorksSectionProps) {
  const [howItWorksCarouselIndex, setHowItWorksCarouselIndex] = useState(0);

  return (
    <motion.section
      id="how-it-works"
      className={`py-20 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className={`font-heading text-4xl md:text-5xl font-bold mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            How It Works.
          </h2>
          <p className={`text-lg max-w-3xl mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>
            Discover our streamlined process for connecting investors with premium real estate opportunities
          </p>
        </motion.div>

        {/* How It Works Carousel */}
        <div className="relative">
          {/* Desktop: Show all steps side by side */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`h-full border rounded-2xl p-8 transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-center">
                    <div className="text-sm text-[#C7A667] mb-4 font-light tracking-wider">
                      STEP {index + 1}
                    </div>
                    <motion.img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-48 object-cover rounded-xl mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <h3 className={`font-heading text-2xl font-bold mb-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                style={{ width: `${howItWorksSteps.length * 100}%` }}
                animate={{ x: `${-howItWorksCarouselIndex * (100 / howItWorksSteps.length)}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {howItWorksSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / howItWorksSteps.length}%` }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className={`h-full border rounded-2xl p-4 transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-center">
                        <div className="text-xs text-[#C7A667] mb-3 font-light tracking-wider">
                          STEP {index + 1}
                        </div>
                        <motion.img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-32 object-cover rounded-xl mb-3"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <h3 className={`font-heading text-lg font-bold mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Mobile Navigation Buttons */}
            <div className="absolute top-1/2 left-1 transform -translate-y-1/2 z-10 pointer-events-none">
              <motion.button
                className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto shadow-lg text-sm ${
                  isDarkMode 
                    ? 'bg-black/70 border-white/30 text-white hover:bg-black/90' 
                    : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setHowItWorksCarouselIndex(Math.max(0, howItWorksCarouselIndex - 1))}
                disabled={howItWorksCarouselIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </div>
            <div className="absolute top-1/2 right-1 transform -translate-y-1/2 z-10 pointer-events-none">
              <motion.button
                className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto shadow-lg text-sm ${
                  isDarkMode 
                    ? 'bg-black/70 border-white/30 text-white hover:bg-black/90' 
                    : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setHowItWorksCarouselIndex(Math.min(howItWorksSteps.length - 1, howItWorksCarouselIndex + 1))}
                disabled={howItWorksCarouselIndex === howItWorksSteps.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                →
              </motion.button>
            </div>

            {/* Mobile Dots Indicator */}
            <div className="flex justify-center mt-4 gap-1.5">
              {howItWorksSteps.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === howItWorksCarouselIndex
                      ? 'bg-[#C7A667]'
                      : isDarkMode
                      ? 'bg-white/30'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setHowItWorksCarouselIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Get Started Button */}
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button 
            onClick={onLoginClick}
            className={`px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              isDarkMode 
                ? 'bg-[#C7A667] text-black hover:bg-[#B89657] shadow-lg hover:shadow-xl' 
                : 'bg-[#C7A667] text-black hover:bg-[#B89657] shadow-lg hover:shadow-xl'
            }`}
          >
            Get Started
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

