import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { Project } from '../data/projects';
import { getFactIcon } from '../utils/icons';

interface PropertyCarouselProps {
  title: string;
  projects: Project[];
  isDarkMode: boolean;
}

export function PropertyCarousel({ title, projects, isDarkMode }: PropertyCarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  return (
    <Section id={`${title.toLowerCase().replace(/\s+/g, '-')}-properties`} dark isDarkMode={isDarkMode}>
      <h3 className="font-heading text-3xl md:text-4xl">{title}</h3>
      <div className="mt-6 relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl">
          <motion.div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {projects.map((p, index) => (
              <div key={p.name} className="w-full flex-shrink-0">
                <motion.article 
                  className="relative grid md:grid-cols-12 gap-6 items-stretch parallax-section p-6"
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <motion.div 
                    className={`md:col-span-7 rounded-2xl overflow-hidden border card-3d transition-colors duration-300 ${
                      isDarkMode ? 'border-white/10' : 'border-gray-200'
                    }`}
                    whileHover={{ scale: 1.03, rotateY: 2 }}
                  >
                    <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition-transform duration-500" />
                  </motion.div>
                  <div className="md:col-span-5 flex flex-col">
                    <div className={`flex-1 border rounded-2xl p-6 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-heading text-2xl">{p.name}</h4>
                      <div className={`text-sm tracking-widest transition-colors duration-300 mt-1 flex items-center gap-1 ${
                        isDarkMode ? 'opacity-70' : 'text-gray-500'
                      }`}>
                        <span className="text-[#C7A667]">📍</span>
                        {p.location}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="text-lg font-medium text-[#C7A667]">{p.price}</div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                          isDarkMode 
                            ? 'border-white/20 bg-white/5 text-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-900'
                        }`}>
                          Est. Income: KES 350,000/mo
                        </div>
                      </div>
                      <p className={`mt-3 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`}>{p.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.facts.map((f, factIndex) => (
                          <span key={`${p.name}-${factIndex}-${f}`} className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 flex items-center gap-1 ${
                            isDarkMode 
                              ? 'border-white/20 bg-white/5 text-white' 
                              : 'border-gray-300 bg-gray-100 text-gray-700'
                          }`}>
                            {getFactIcon(factIndex, isDarkMode)}
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex gap-3">
                        <a 
                          href={`/property/${p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                          className="px-5 py-2.5 rounded-full bg-[#C7A667] text-black text-sm font-medium relative z-50 inline-block text-center hover:bg-[#B89657] transition-colors"
                        >
                          View Details
                        </a>
                        <motion.button 
                          className="btn-3d px-5 py-2.5 rounded-full border border-white/30 text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img 
                            src="/icons/phone.png" 
                            alt="Phone" 
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                            style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                          Contact
                        </motion.button>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {p.gallery.map((g, i) => (
                        <motion.img 
                          key={i} 
                          src={g} 
                          alt={`${p.name} ${i + 1}`} 
                          className={`rounded-xl border h-40 w-full object-cover card-3d transition-colors duration-300 ${
                            isDarkMode ? 'border-white/10' : 'border-gray-200'
                          }`}
                          whileHover={{ scale: 1.05, rotateY: 1 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.article>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-5 pointer-events-none">
          <motion.button
            className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
              isDarkMode 
                ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
            }`}
            onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
            disabled={carouselIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-5 pointer-events-none">
          <motion.button
            className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
              isDarkMode 
                ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
            }`}
            onClick={() => setCarouselIndex(Math.min(projects.length - 1, carouselIndex + 1))}
            disabled={carouselIndex === projects.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {projects.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === carouselIndex 
                  ? 'bg-[#C7A667]' 
                  : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
              }`}
              onClick={() => setCarouselIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

