import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Section } from './Section';
import { blogs } from '../data/blogs';

interface BlogsSectionProps {
  isDarkMode: boolean;
}

export function BlogsSection({ isDarkMode }: BlogsSectionProps) {
  const navigate = useNavigate();
  const [blogsCarouselIndex, setBlogsCarouselIndex] = useState(0);

  return (
    <Section id="blogs" dark isDarkMode={isDarkMode}>
      <h3 className="font-heading text-3xl md:text-4xl">Feature Blogs</h3>
      <div className="mt-6 relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${blogsCarouselIndex * 100}%)` }}
          >
            {blogs.map((blog, index) => (
              <div key={blog.id} className="w-full flex-shrink-0 p-6">
                <motion.article
                  className={`group rounded-2xl border p-6 transition-all duration-300 card-3d h-full ${
                    isDarkMode 
                      ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 2,
                    rotateX: 1,
                    z: 20
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold text-sm">
                      {blog.category}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{blog.author}</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-white/60' : 'text-gray-500'
                      }`}>{blog.date}</div>
                    </div>
                  </div>
                  <h4 className={`text-xl font-heading mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    {blog.title}
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    {blog.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/5 text-white/70' 
                        : 'border-gray-300 bg-gray-100 text-gray-600'
                    }`}>
                      {blog.readTime} min read
                    </span>
                    <motion.button 
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode 
                          ? 'text-[#C7A667] hover:text-[#B89657]' 
                          : 'text-[#C7A667] hover:text-[#B89657]'
                      }`}
                      onClick={() => navigate(`/blog/${blog.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Read More →
                    </motion.button>
                  </div>
                </motion.article>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
          <motion.button
            className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
            }`}
            onClick={() => setBlogsCarouselIndex(Math.max(0, blogsCarouselIndex - 1))}
            disabled={blogsCarouselIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
          <motion.button
            className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
            }`}
            onClick={() => setBlogsCarouselIndex(Math.min(blogs.length - 1, blogsCarouselIndex + 1))}
            disabled={blogsCarouselIndex === blogs.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {blogs.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === blogsCarouselIndex 
                  ? 'bg-[#C7A667]' 
                  : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
              }`}
              onClick={() => setBlogsCarouselIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

