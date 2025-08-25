import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';

interface ContactSectionProps {
  isDarkMode: boolean;
}

export function ContactSection({ isDarkMode }: ContactSectionProps) {
  return (
    <Section id="contact" dark isDarkMode={isDarkMode}>
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <h3 className="font-heading text-3xl md:text-4xl text-center">Let's talk investments</h3>
          <p className={`mt-3 max-w-prose mx-auto text-center transition-colors duration-300 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>Fill the form and our team will respond within 24 hours.</p>
          <form className="mt-8 grid grid-cols-1 gap-4 max-w-lg mx-auto" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // Create mailto link with form data
            const mailtoLink = `mailto:Sales.realaist@gmail.com?subject=Contact from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`;
            window.open(mailtoLink);
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
      </div>
    </Section>
  );
}

