import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { partners } from '../data/constants';

interface AboutSectionProps {
  isDarkMode: boolean;
}

export function AboutSection({ isDarkMode }: AboutSectionProps) {
  return (
    <Section id="about" dark isDarkMode={isDarkMode}>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="font-heading text-3xl md:text-4xl"
            style={{ 
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}
          >
            REALAIST
          </h2>
          <p className={`mt-4 max-w-prose transition-colors duration-300 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>
            REALAIST is an AI-powered platform that connects investors with verified properties from trusted real estate developers & companies.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-8">
            {[
              { k: "77", v: "Real Estate Companies" },
              { k: "1000+", v: "Properties Listed" },
              { k: "10,000+", v: "Active Investors" },
            ].map((s, index) => (
              <motion.div 
                key={s.k} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="font-heading text-2xl text-[#C7A667] mb-1">{s.k}</div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>{s.v}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          className="relative overflow-hidden mt-10"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h4 
            className={`text-left mb-8 text-2xl font-heading transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ 
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}
          >
            Trusted by...
          </h4>
          <div 
            className="flex gap-8 animate-scroll"
            style={{
              animation: 'scroll 20s linear infinite'
            }}
          >
            {/* First set of partners */}
            {partners.map((partner, index) => (
              <motion.div 
                key={`first-${partner.name}`} 
                className="flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className={`max-w-full object-contain transition-opacity duration-300 ${
                    isDarkMode 
                      ? 'filter brightness-0 invert opacity-70 hover:opacity-100' 
                      : 'opacity-70 hover:opacity-100'
                  } ${
                    partner.name === "BlackRock" 
                      ? "max-h-14" 
                      : partner.name === "Mwangi" || partner.name === "Suva" || partner.name === "Nesh"
                      ? "max-h-20"                        
                      : "max-h-12"
                  }`}
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const textFallback = document.createElement('div');
                    textFallback.className = `text-xs tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`;
                    textFallback.textContent = partner.name;
                    target.parentElement?.appendChild(textFallback);
                  }}
                />
              </motion.div>
            ))}
            {/* Duplicate set for seamless loop */}
            {partners.map((partner, index) => (
              <motion.div 
                key={`second-${partner.name}`} 
                className="flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className={`max-w-full object-contain transition-opacity duration-300 ${
                    isDarkMode 
                      ? 'filter brightness-0 invert opacity-70 hover:opacity-100' 
                      : 'opacity-70 hover:opacity-100'
                  } ${
                    partner.name === "BlackRock" 
                      ? "max-h-14" 
                      : partner.name === "Mwangi" || partner.name === "Suva" || partner.name === "Nesh"
                      ? "max-h-16"
                      : "max-h-12"
                  }`}
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const textFallback = document.createElement('div');
                    textFallback.className = `text-xs tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`;
                    textFallback.textContent = partner.name;
                    target.parentElement?.appendChild(textFallback);
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

