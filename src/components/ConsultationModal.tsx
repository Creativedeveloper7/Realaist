import React from 'react';
import { motion } from 'framer-motion';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ConsultationModal({ isOpen, onClose, isDarkMode }: ConsultationModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-2xl rounded-2xl p-8 shadow-2xl ${
          isDarkMode 
            ? 'bg-[#0E0E10] border border-white/10' 
            : 'bg-white border border-gray-200'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-heading text-2xl md:text-3xl transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{ 
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            Book Consultation
          </h3>
          <motion.button
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>
        
        <p className={`mb-6 transition-colors duration-300 ${
          isDarkMode ? 'text-white/70' : 'text-gray-600'
        }`}>
          Fill the form and our team will respond within 24 hours.
        </p>
        
        <form className="grid grid-cols-1 gap-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const name = formData.get('name');
          const email = formData.get('email');
          const phone = formData.get('phone');
          const message = formData.get('message');
          
          // Create mailto link with form data
          const mailtoLink = `mailto:Sales.realaist@gmail.com?subject=Consultation Request from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`;
          window.open(mailtoLink);
          onClose();
        }}>
          <motion.input 
            name="name"
            className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Name"
            whileFocus={{ scale: 1.02 }}
            required
          />
          <motion.input 
            name="email"
            type="email"
            className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Email"
            whileFocus={{ scale: 1.02 }}
            required
          />
          <motion.input 
            name="phone"
            className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Phone"
            whileFocus={{ scale: 1.02 }}
            required
          />
          <motion.textarea 
            name="message"
            rows={4} 
            className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none ${
              isDarkMode 
                ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Message"
            whileFocus={{ scale: 1.02 }}
            required
          />
          <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>
            <input type="checkbox" className="accent-[#C7A667]" required /> I agree to the privacy policy
          </label>
          <motion.button 
            type="submit"
            className="mt-2 w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Message
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

