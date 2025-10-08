import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { testimonials } from '../data/testimonials';

interface TestimonialsSectionProps {
  isDarkMode: boolean;
}

export function TestimonialsSection({ isDarkMode }: TestimonialsSectionProps) {
  const [testimonialsCarouselIndex, setTestimonialsCarouselIndex] = useState(0);

  return (
    <Section id="testimonials" dark isDarkMode={isDarkMode}>
      <h3 className="font-heading text-3xl md:text-4xl">What Our Clients Say</h3>
      <div className="mt-6 relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${testimonialsCarouselIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 p-6">
                <motion.div
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
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold">
                      {testimonial.id}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-white/60' : 'text-gray-500'
                      }`}>{testimonial.location}</div>
                    </div>
                  </div>
                  <p className={`mt-4 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    "{testimonial.testimonial}"
                  </p>
                </motion.div>
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
            onClick={() => setTestimonialsCarouselIndex(Math.max(0, testimonialsCarouselIndex - 1))}
            disabled={testimonialsCarouselIndex === 0}
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
            onClick={() => setTestimonialsCarouselIndex(Math.min(testimonials.length - 1, testimonialsCarouselIndex + 1))}
            disabled={testimonialsCarouselIndex === testimonials.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === testimonialsCarouselIndex 
                  ? 'bg-[#C7A667]' 
                  : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
              }`}
              onClick={() => setTestimonialsCarouselIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

